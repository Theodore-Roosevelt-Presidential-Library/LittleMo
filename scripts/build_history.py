#!/usr/bin/env python3
"""Build the river history files for River Watch (littlemo.labs.trlibrary.com).

Pulls the full daily-flow record and the annual peak-flow file for three USGS
gages on the Little Missouri and writes:

  data/history.json            summary: record coverage, peaks, calendar-day
                               percentiles, annual stats, records
  data/daily-<site>.json       every daily mean flow, one array per year
                               (loaded only when someone compares years)

Standard library only, so the GitHub Action needs no installs.
Run:  python3 scripts/build_history.py [out_dir]
"""
import json
import math
import sys
import time
import urllib.request
from collections import defaultdict
from datetime import date, datetime, timezone

SITES = [
    {"id": "06335500", "short": "Marmarth", "name": "Little Missouri River at Marmarth, ND", "nws": "MTHN8"},
    {"id": "06336000", "short": "Medora", "name": "Little Missouri River at Medora, ND", "nws": "MDAN8"},
    {"id": "06337000", "short": "Watford City", "name": "Little Missouri River near Watford City, ND", "nws": "WTFN8"},
]
UA = {"User-Agent": "TRPL-RiverWatch/1.0 (https://littlemo.labs.trlibrary.com)"}
OUT = sys.argv[1] if len(sys.argv) > 1 else "data"


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180) as r:
                return r.read().decode("utf-8")
        except Exception as e:  # noqa: BLE001
            if i == tries - 1:
                raise
            print("retry", url, e, file=sys.stderr)
            time.sleep(10 * (i + 1))


def rdb(text):
    rows, header = [], None
    for line in text.splitlines():
        if line.startswith("#") or not line.strip():
            continue
        parts = line.split("\t")
        if header is None:
            header = parts
            continue
        if parts[0].endswith("s") and parts[0][:-1].isdigit():  # format row (5s 15s ...)
            continue
        rows.append(dict(zip(header, parts)))
    return rows


def pct(sorted_vals, p):
    """Weibull plotting-position percentile, the method USGS uses for its daily statistics."""
    n = len(sorted_vals)
    if n == 0:
        return None
    r = p / 100 * (n + 1)
    if r <= 1:
        return sorted_vals[0]
    if r >= n:
        return sorted_vals[-1]
    lo = math.floor(r)
    return sorted_vals[lo - 1] + (r - lo) * (sorted_vals[lo] - sorted_vals[lo - 1])


def rnd(v):
    if v is None:
        return None
    if v >= 100:
        return round(v)
    if v >= 10:
        return round(v, 1)
    return round(v, 2)


def runs(years):
    out = []
    for y in sorted(years):
        if out and y == out[-1][1] + 1:
            out[-1][1] = y
        else:
            out.append([y, y])
    return out


def build_site(s):
    sid = s["id"]
    print("site", sid, file=sys.stderr)
    dv = rdb(get(f"https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites={sid}&parameterCd=00060&statCd=00003&startDT=1890-01-01&siteStatus=all"))
    vcol = next(k for k in dv[0] if k.endswith("_00060_00003"))
    qcol = vcol + "_cd"
    series = {}
    for r in dv:
        v = r.get(vcol, "")
        try:
            series[r["datetime"]] = float(v)
        except ValueError:
            pass  # ice, equipment, etc.

    by_year = defaultdict(dict)
    for d, v in series.items():
        by_year[int(d[:4])][d] = v

    # calendar-day percentiles (Feb 29 folded into Feb 28)
    cal = defaultdict(list)
    for d, v in series.items():
        md = d[5:]
        if md == "02-29":
            md = "02-28"
        cal[md].append((v, int(d[:4])))
    days = []
    ref = date(2001, 1, 1)
    for i in range(365):
        md = date.fromordinal(ref.toordinal() + i).strftime("%m-%d")
        vals = sorted(cal.get(md, []))
        sv = [v for v, _ in vals]
        if not sv:
            days.append(None)
            continue
        days.append({
            "md": md, "n": len(sv),
            "min": rnd(sv[0]), "minY": vals[0][1],
            "p10": rnd(pct(sv, 10)), "p25": rnd(pct(sv, 25)), "p50": rnd(pct(sv, 50)),
            "p75": rnd(pct(sv, 75)), "p90": rnd(pct(sv, 90)),
            "max": rnd(sv[-1]), "maxY": vals[-1][1],
        })

    annual = []
    for y in sorted(by_year):
        vals = list(by_year[y].values())
        annual.append({
            "y": y, "n": len(vals),
            "mean": rnd(sum(vals) / len(vals)),
            "max": rnd(max(vals)), "min": rnd(min(vals)),
            "zero": sum(1 for v in vals if v == 0),
            "complete": len(vals) >= 365,
        })

    peaks = []
    for r in rdb(get(f"https://nwis.waterdata.usgs.gov/nwis/peak?site_no={sid}&agency_cd=USGS&format=rdb")):
        try:
            cfs = float(r["peak_va"])
        except ValueError:
            continue
        try:
            ft = float(r["gage_ht"])
        except ValueError:
            ft = None
        peaks.append({
            "date": r["peak_dt"], "y": int(r["peak_dt"][:4]), "cfs": cfs and round(cfs), "ft": ft,
            "codes": r.get("peak_cd", ""), "htCodes": r.get("gage_ht_cd", ""),
        })
    # water year of the peak (Oct–Sep) is how USGS files peaks; keep calendar date for display

    sd = sorted(series.items(), key=lambda kv: kv[1])
    full = [a for a in annual if a["complete"]]
    record = {
        "dailyStart": min(series), "dailyEnd": max(series),
        "dailyYears": runs(by_year.keys()),
        "dailyDays": len(series),
        "partialYears": [[a["y"], a["n"]] for a in annual if not a["complete"]],
        "peakYears": runs({p["y"] for p in peaks}),
        "historicPeaks": [p for p in peaks if "7" in p["codes"].split(",")],
    }
    best = max(peaks, key=lambda p: p["cfs"]) if peaks else None
    least = min(peaks, key=lambda p: p["cfs"]) if peaks else None
    records = {
        "peakMax": best, "peakMin": least,
        "dailyMax": {"date": sd[-1][0], "cfs": rnd(sd[-1][1])},
        "dailyMin": {"date": sd[0][0], "cfs": rnd(sd[0][1])},
        "zeroDays": sum(1 for v in series.values() if v == 0),
        "wettestYear": max(full, key=lambda a: a["mean"]) if full else None,
        "driestYear": min(full, key=lambda a: a["mean"]) if full else None,
        "medianAnnualPeak": rnd(pct(sorted(p["cfs"] for p in peaks), 50)) if peaks else None,
    }

    # compact per-year daily arrays for the compare-years chart
    daily = {}
    for y in sorted(by_year):
        arr = []
        for i in range(365):
            md = date.fromordinal(ref.toordinal() + i).strftime("%m-%d")
            v = by_year[y].get(f"{y}-{md}")
            arr.append(rnd(v) if v is not None else None)
        daily[str(y)] = arr
    with open(f"{OUT}/daily-{sid}.json", "w") as f:
        json.dump({"site": sid, "note": "Daily mean discharge, cubic feet per second. Index 0 = Jan 1, 364 = Dec 31; Feb 29 is left out. null = no record.", "years": daily}, f, separators=(",", ":"))

    return {**s, "record": record, "records": records, "days": days, "annual": annual, "peaks": peaks}


def main():
    out = {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "sites": {}}
    for s in SITES:
        out["sites"][s["id"]] = build_site(s)
    with open(f"{OUT}/history.json", "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print("wrote", OUT, file=sys.stderr)


if __name__ == "__main__":
    main()
