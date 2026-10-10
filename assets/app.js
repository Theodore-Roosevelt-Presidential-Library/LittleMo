/* The Little Missouri — Theodore Roosevelt Presidential Library Labs
 * Today's river at Medora, Then & Now, then-and-now maps, the gage record and paddling.
 * https://littlemo.labs.trlibrary.com
 */
(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const EMBED = params.get("embed") === "1";
  const SINGLE = EMBED && params.get("view");
  const FRAME_ID = params.get("id");
  const CANONICAL = "https://littlemo.labs.trlibrary.com/";
  const VIEWS = ["today", "then", "maps", "record", "paddle"];
  const TZ = "America/Denver"; // Medora keeps Mountain Time
  const MEDORA = "06336000";
  const SITES = {
    "06335500": { short: "Marmarth", nws: "MTHN8" },
    "06336000": { short: "Medora", nws: "MDAN8" },
    "06337000": { short: "Watford City", nws: "WTFN8" },
  };
  const ORDER = ["06335500", "06336000", "06337000"];
  const PADDLE = { fair: 699, good: 1500 }; // NPS: 2.5 ft (699 cfs) fair; 2.5–3.5 ft (699–1,500 cfs) good
  const POINTS = { medora: [46.9146, -103.5244], elkhorn: [47.241898, -103.622276] };

  const CREDITS = {
    "hero-cottonwoods": { caption: "Little Missouri River and cottonwoods, Theodore Roosevelt National Park", artist: "Acroterion", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Little_Missouri_in_Theodore_Roosevelt_NP_ND1.jpg" },
    "postcard-1930s": { caption: "Little Missouri River in N. Roosevelt Park, North Dakota Badlands. Postcard, about 1930–1945", artist: "The Hafstrom Co., Bismarck", license: "Public domain", licenseUrl: "", source: "https://commons.wikimedia.org/wiki/File:Little_Missouri_River_in_N._Roosevelt_Park,_North_Dakota_Badlands_(84322).jpg" },
  };

  // Then-and-now map layers. Bounds are the Web Mercator boxes the overlays were rendered to.
  const MAPSITES = {
    medora: {
      label: "Medora", center: [46.916, -103.528], zoom: 14,
      bounds: [[46.87, -103.575], [46.96, -103.49]],
      eras: [
        { id: "glo", label: "Survey plat", year: "1880s–1900s", file: "medora-glo.webp",
          note: "The General Land Office survey plat for the township around Medora. Surveyors walked the river's banks and drew them as they found them; the plat also shows the Northern Pacific line and the town of Medora, founded in 1883. Look for how far the drawn channel sits from today's.",
          credit: "General Land Office township plat (public domain), as georeferenced by the North Dakota Department of Water Resources. The survey year is not shown on the georeferenced copy; plat placement is approximate." },
        { id: "1939", label: "1939", year: "1939", file: "medora-1939.webp",
          note: "The oldest aerial photographs of the Medora bottoms, taken for the U.S. Department of Agriculture in 1939. Compare the open sandbars of the channel with today's.",
          credit: "Billings County, 1939, USDA aerial photography (public domain), mosaic by the North Dakota Department of Water Resources. Not orthorectified; positions can be off by tens of meters." },
        { id: "1957", label: "1957", year: "1957", file: "medora-1957.webp",
          note: "Aerial photographs from 1957, ten years after the largest flood ever measured at Medora (March 1947, 65,000 cubic feet per second).",
          credit: "Billings County, 1957, USDA aerial photography (public domain), mosaic by the North Dakota Department of Water Resources. Not orthorectified." },
        { id: "1970", label: "1970 topo", year: "1970", file: "medora-1970.webp",
          note: "The U.S. Geological Survey's 1970 Medora quadrangle, the first detailed topographic map of the area at 1:24,000. Blue lines mark the channel as mapped from aerial photographs.",
          credit: "USGS Historical Topographic Map Collection, Medora, ND, 1970, 1:24,000 (public domain)." },
      ],
      markers: [
        { at: [46.916842, -103.532283], label: "Medora gage", pop: "<b>Little Missouri River at Medora</b><br>U.S. Geological Survey gage 06336000. Daily records since 1903, with gaps." },
      ],
    },
    elkhorn: {
      label: "Elkhorn Ranch", center: [47.2405, -103.627], zoom: 15,
      bounds: [[47.2, -103.675], [47.265, -103.6]],
      eras: [
        { id: "glo", label: "Survey plat", year: "1880s–1900s", file: "elkhorn-glo.webp",
          note: "The General Land Office plat of the township that holds the Elkhorn. Roosevelt wrote in 1888 that the country was \"yet unsurveyed and unmapped.\" This is how the surveyors drew the river when they came.",
          credit: "General Land Office township plat (public domain), as georeferenced by the North Dakota Department of Water Resources. Survey year to be confirmed; plat placement is approximate." },
        { id: "1939", label: "1939", year: "1939", file: "elkhorn-1939.webp",
          note: "The Elkhorn bottom in 1939, about fifty years after Roosevelt's ranch years. The house site is marked. Compare the channel beside it with today's.",
          credit: "Billings County, 1939, USDA aerial photography (public domain), mosaic by the North Dakota Department of Water Resources. Not orthorectified; the strip at the west edge has no photo." },
        { id: "1957", label: "1957–62", year: "1957–62", file: "elkhorn-1957.webp",
          note: "Statewide aerial photographs flown between 1957 and 1962.",
          credit: "North Dakota aerial imagery 1957–1962, USDA (public domain), via the North Dakota GIS Hub. Not orthorectified." },
        { id: "1970", label: "1970s topo", year: "1970–74", file: "elkhorn-1970.webp",
          note: "U.S. Geological Survey topographic maps from 1970 and 1974 (the Roosevelt Creek quadrangles), pieced together.",
          credit: "USGS Historical Topographic Map Collection, Roosevelt Creek West (1974) and neighboring 1970 quadrangles, 1:24,000 (public domain)." },
      ],
      markers: [
        { at: [47.241898, -103.622276], label: "Elkhorn house site", pop: "<b>Elkhorn Ranch house site</b><br>Roosevelt's home ranch, built 1884–85 on the west bank. Foundation stones remain. <a href=\"https://elkhornguide.labs.trlibrary.com/\">Walking guide</a>" },
        { at: [47.234929, -103.62739], label: "Trailhead", pop: "<b>Elkhorn Ranch parking</b><br>The trail to the house site starts here." },
      ],
    },
  };

  let HIST = null, STORY = null, LIVE = null, NWS = {}, WX = null, ALERTS = [];
  const DAILY = {};
  let chartParam = "flow";
  let map, base, overlay, siteKey = params.get("site") === "elkhorn" ? "elkhorn" : "medora", eraId = params.get("era") || "1939", mode = "swipe", swipePct = 50;
  let cmpSite = MEDORA, cmpYears = null, peakScale = "lin";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- formatting ---------------- */
  function fmtCfs(v) {
    if (v == null || isNaN(v)) return "—";
    if (v >= 100) return Math.round(v).toLocaleString("en-US");
    if (v >= 10) return (Math.round(v * 10) / 10).toLocaleString("en-US");
    if (v >= 1) return v.toFixed(1);
    return v.toFixed(2);
  }
  const fmtFt = (v) => (v == null || isNaN(v) ? "—" : v.toFixed(2) + " ft");
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function fmtDate(iso, opts) {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    if (opts === "md") return `${MONTHS[m - 1]} ${d}`;
    if (opts === "short") return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
    return `${MONTHS[m - 1]} ${d}, ${y}`;
  }
  function fmtTime(t) {
    return new Date(t).toLocaleString("en-US", { timeZone: TZ, weekday: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  }
  function localParts(t) {
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(t));
    return p; // YYYY-MM-DD
  }
  function dayIndex(md) { // "MM-DD" -> 0..364 (Feb 29 -> Feb 28)
    if (md === "02-29") md = "02-28";
    const [m, d] = md.split("-").map(Number);
    const t = Date.UTC(2001, m - 1, d) - Date.UTC(2001, 0, 1);
    return Math.round(t / 86400000);
  }
  function mdOfIndex(i) {
    const d = new Date(Date.UTC(2001, 0, 1) + i * 86400000);
    return `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  const plural = (n, w, ws) => `${n.toLocaleString("en-US")} ${n === 1 ? w : ws || w + "s"}`;

  /* ---------------- fetch helpers ---------------- */
  async function getJSON(url, { timeout = 20000, tries = 2 } = {}) {
    let err;
    for (let i = 0; i < tries; i++) {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), timeout);
      try {
        const r = await fetch(url, { signal: ctl.signal });
        clearTimeout(t);
        if (!r.ok) throw new Error(r.status + " " + url);
        return await r.json();
      } catch (e) {
        clearTimeout(t);
        err = e;
        if (i < tries - 1) await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
      }
    }
    throw err;
  }

  /* ---------------- live river data ---------------- */
  // Primary: USGS Water Services instantaneous values. Fallback: the USGS Water Data OGC API.
  async function loadLive() {
    const out = {};
    ORDER.forEach((s) => (out[s] = { flow: [], stage: [], temp: [], ice: false, source: "" }));
    try {
      const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${ORDER.join(",")}&parameterCd=00060,00065,00010&period=P30D&siteStatus=all`;
      const d = await getJSON(url, { timeout: 25000, tries: 2 });
      for (const ts of d.value.timeSeries) {
        const [, site, pc] = ts.name.split(":");
        const key = pc === "00060" ? "flow" : pc === "00065" ? "stage" : pc === "00010" ? "temp" : null;
        if (!key || !out[site]) continue;
        const nd = ts.variable.noDataValue;
        for (const block of ts.values) {
          for (const v of block.value) {
            const x = parseFloat(v.value);
            const q = v.qualifiers || [];
            if (q.some((c) => /ice/i.test(c))) out[site].ice = true;
            if (isNaN(x) || x === nd || x <= -999) continue;
            out[site][key].push([Date.parse(v.dateTime), x]);
          }
        }
        out[site].source = "USGS Water Services";
      }
      if (!out[MEDORA].flow.length && !out[MEDORA].stage.length) throw new Error("empty");
    } catch (e) {
      console.warn("Water Services failed, trying the OGC API", e);
      const jobs = [];
      for (const site of ORDER) {
        for (const [pc, key] of [["00060", "flow"], ["00065", "stage"], ["00010", "temp"]]) {
          if (key === "temp" && site !== MEDORA) continue;
          const url = `https://api.waterdata.usgs.gov/ogcapi/v0/collections/continuous/items?f=json&skipGeometry=true&monitoring_location_id=USGS-${site}&parameter_code=${pc}&time=P30D&limit=5000&properties=time,value,qualifier`;
          jobs.push(getJSON(url, { timeout: 25000, tries: 2 }).then((d) => {
            for (const f of d.features || []) {
              const x = parseFloat(f.properties.value);
              const q = String(f.properties.qualifier || "");
              if (/ice/i.test(q)) out[site].ice = true;
              if (!isNaN(x) && x > -999) out[site][key].push([Date.parse(f.properties.time), x]);
            }
            out[site].source = "USGS Water Data API";
          }).catch((err) => console.warn(site, pc, err)));
        }
      }
      await Promise.all(jobs);
    }
    for (const s of ORDER) for (const k of ["flow", "stage", "temp"]) out[s][k].sort((a, b) => a[0] - b[0]);
    return out;
  }

  async function loadNWS() {
    const res = {};
    await Promise.all(ORDER.map(async (s) => {
      const lid = SITES[s].nws;
      try {
        const g = await getJSON(`https://api.water.noaa.gov/nwps/v1/gauges/${lid}`, { timeout: 15000, tries: 1 });
        res[s] = { lid, cats: g.flood && g.flood.categories, crests: (g.flood && g.flood.crests && g.flood.crests.historic) || [], status: g.status };
        if (s === MEDORA) {
          try {
            const sf = await getJSON(`https://api.water.noaa.gov/nwps/v1/gauges/${lid}/stageflow`, { timeout: 15000, tries: 1 });
            res[s].forecast = (sf.forecast && sf.forecast.data) || [];
          } catch (e) { /* no forecast */ }
        }
      } catch (e) { console.warn("NWPS", lid, e); }
    }));
    return res;
  }

  async function loadAlerts() {
    const seen = new Set(), list = [];
    await Promise.all(Object.values(POINTS).map(async (p) => {
      try {
        const d = await getJSON(`https://api.weather.gov/alerts/active?point=${p[0]},${p[1]}`, { timeout: 15000, tries: 1 });
        for (const f of d.features || []) {
          if (seen.has(f.id)) continue;
          seen.add(f.id);
          list.push(f.properties);
        }
      } catch (e) { console.warn("alerts", e); }
    }));
    return list;
  }

  async function loadWeather() {
    const [lat, lng] = POINTS.medora;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${encodeURIComponent(TZ)}&forecast_days=3`;
    return getJSON(url, { timeout: 15000, tries: 1 });
  }

  /* ---------------- conditions logic ---------------- */
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1] : null);
  function valueAt(arr, t) { // nearest reading at or before t
    let best = null;
    for (const p of arr) { if (p[0] <= t) best = p; else break; }
    return best;
  }
  function dayStats(site, iso) {
    if (!HIST) return null;
    const s = HIST.sites[site];
    return s && s.days[dayIndex(iso.slice(5, 10))];
  }
  function classify(v, st) {
    if (v == null || !st) return { key: "none", label: "No comparison" };
    if (v < st.p10) return { key: "much-below", label: "Much below normal" };
    if (v < st.p25) return { key: "below", label: "Below normal" };
    if (v <= st.p75) return { key: "normal", label: "Normal" };
    if (v <= st.p90) return { key: "above", label: "Above normal" };
    return { key: "much-above", label: "Much above normal" };
  }
  function paddleState(cfs) {
    if (cfs == null) return { dot: "", val: "No reading", text: "The Medora gage is not reporting flow right now. In winter, ice often stops the readings." };
    if (cfs < PADDLE.fair) return { dot: "bad", val: "Too low", text: `${fmtCfs(cfs)} cfs at Medora. The Park Service says fair boating needs at least ${PADDLE.fair} cfs (about 2.5 ft). Expect to walk your boat.` };
    if (cfs <= PADDLE.good) return { dot: "ok", val: cfs < 1000 ? "Fair" : "Good", text: `${fmtCfs(cfs)} cfs at Medora, inside the ${PADDLE.fair}–${PADDLE.good.toLocaleString()} cfs range the Park Service gives for fair to good boating.` };
    return { dot: "warn", val: "High water", text: `${fmtCfs(cfs)} cfs at Medora, above the range the Park Service lists as good (up to ${PADDLE.good.toLocaleString()} cfs). Fast, cold water; check with rangers before launching.` };
  }
  function trend(arr) {
    const l = last(arr);
    if (!l) return null;
    const prev = valueAt(arr, l[0] - 24 * 3600e3);
    if (!prev) return null;
    const d = l[1] - prev[1];
    const rel = prev[1] ? d / prev[1] : 0;
    let word = "steady";
    if (Math.abs(rel) >= 0.1 && Math.abs(d) >= 1) word = d > 0 ? "rising" : "falling";
    return { d, word, prev: prev[1] };
  }

  /* ---------------- TODAY ---------------- */
  function renderToday() {
    const L = LIVE && LIVE[MEDORA];
    const f = L && last(L.flow), g = L && last(L.stage), tw = L && last(L.temp);
    const tNow = (f || g || [Date.now()])[0];
    const iso = localParts(tNow);
    const st = dayStats(MEDORA, iso);
    const cls = classify(f && f[1], st);
    const tr = L && trend(L.flow);
    const stale = f && Date.now() - f[0] > 6 * 3600e3;

    // hero chip
    const hero = $("#hero-now");
    if (f) {
      const pw = { "Too low": "too low to paddle", Fair: "fair for paddling", Good: "good for paddling", "High water": "high water for paddling" }[paddleState(f[1]).val] || "";
      hero.innerHTML = `<span class="pulse" aria-hidden="true"></span><span>Medora now: <b>${fmtCfs(f[1])} cfs</b> · ${esc(cls.label.toLowerCase())} for ${fmtDate(iso, "md")}${pw ? " · " + pw : ""}</span>`;
    } else if (L && L.ice) {
      hero.innerHTML = `<span class="pulse" aria-hidden="true"></span><span>Medora now: ice on the river; flow readings paused</span>`;
    } else {
      hero.innerHTML = `<span>River readings are unavailable right now. <a href="https://waterdata.usgs.gov/monitoring-location/USGS-06336000/">Check USGS</a></span>`;
    }

    // main card
    const main = $("#now-main");
    if (!L || (!f && !g)) {
      main.innerHTML = `<h3>Little Missouri at Medora</h3><p class="err">The USGS gage readings could not be loaded. ${L && L.ice ? "Ice is affecting the gage." : ""} <a href="https://waterdata.usgs.gov/monitoring-location/USGS-06336000/">See the USGS page</a>.</p>`;
    } else {
      let verdict = "";
      if (f && st) {
        verdict = `For ${fmtDate(iso, "md")}, that is <b>${esc(cls.label.toLowerCase())}</b>. In ${plural(st.n, "year")} of records for this date, flow has ranged from ${fmtCfs(st.min)} cfs (${st.minY}) to ${fmtCfs(st.max)} cfs (${st.maxY}); the median is ${fmtCfs(st.p50)} cfs.`;
      } else if (!f && L.ice) {
        verdict = "Ice on the river is affecting the gage, so flow is not being reported. The USGS estimates winter flow later from field measurements.";
      }
      const trTxt = tr ? `${tr.word === "steady" ? "Steady" : tr.word[0].toUpperCase() + tr.word.slice(1)} · ${tr.d >= 0 ? "+" : "−"}${fmtCfs(Math.abs(tr.d))} cfs in 24 hours` : "";
      main.innerHTML = `
        <div class="eyebrow">Little Missouri River at Medora</div>
        <div class="reading">
          <div><div class="big">${f ? fmtCfs(f[1]) : "—"}</div><span class="unit">cubic feet per second</span></div>
          <div><span class="cond c-${cls.key}">${esc(cls.label)}</span><div class="trend" style="margin-top:8px">${esc(trTxt)}</div></div>
        </div>
        <p class="verdict">${verdict}</p>
        <div class="mini-facts">
          <div><b>Gage height</b><span>${g ? fmtFt(g[1]) : "—"}</span><small>minor flood stage ${NWS[MEDORA] && NWS[MEDORA].cats ? NWS[MEDORA].cats.minor.stage + " ft" : "15 ft"}</small></div>
          <div><b>Water temp</b><span>${tw && Date.now() - tw[0] < 12 * 3600e3 ? Math.round(tw[1] * 9 / 5 + 32) + "°F" : "—"}</span><small>${tw && Date.now() - tw[0] < 12 * 3600e3 ? (Math.round(tw[1] * 10) / 10) + "°C" : "sensor reports in warmer months"}</small></div>
          <div><b>Typical today</b><span>${st ? fmtCfs(st.p25) + "–" + fmtCfs(st.p75) : "—"}</span><small>normal range, cfs</small></div>
          <div><b>Record flood</b><span>${HIST ? fmtCfs(HIST.sites[MEDORA].records.peakMax.cfs) : "65,000"}</span><small>cfs, ${HIST ? fmtDate(HIST.sites[MEDORA].records.peakMax.date) : "March 23, 1947"}</small></div>
        </div>
        <div class="stamp">${f ? "Last reading " + esc(fmtTime(f[0])) : ""}${stale ? " · <b>this reading is more than six hours old</b>" : ""} · provisional data, ${esc(L.source)}</div>`;
    }

    // paddling
    const ps = paddleState(f ? f[1] : null);
    const pHTML = `<h4>Paddling</h4><div class="val"><span class="dot ${ps.dot}"></span>${esc(ps.val)}</div><p>${ps.text} <a href="#paddle" data-go="paddle">More</a></p>`;
    $("#paddle-status").innerHTML = pHTML;
    $("#paddle-big").innerHTML = `<h4>Right now at Medora</h4><div class="val"><span class="dot ${ps.dot}"></span>${esc(ps.val)}</div><p>${ps.text}</p>${f ? `<p class="small">May and June are usually the best months. Reading from ${esc(fmtTime(f[0]))}.</p>` : ""}`;

    // flood
    const nw = NWS[MEDORA];
    let flood = `<h4>Flooding</h4>`;
    if (nw && nw.cats && g) {
      const c = nw.cats, s = g[1];
      let lvl = "No flooding", dot = "ok";
      if (s >= c.major.stage) { lvl = "Major flooding"; dot = "bad"; }
      else if (s >= c.moderate.stage) { lvl = "Moderate flooding"; dot = "bad"; }
      else if (s >= c.minor.stage) { lvl = "Minor flooding"; dot = "bad"; }
      else if (s >= c.action.stage) { lvl = "Near flood stage"; dot = "warn"; }
      const fc = (nw.forecast || []).filter((p) => p.primary > -999);
      const fcMax = fc.length ? Math.max(...fc.map((p) => p.primary)) : null;
      flood += `<div class="val"><span class="dot ${dot}"></span>${lvl}</div><p>Gage height ${fmtFt(s)}. The National Weather Service sets minor flooding at ${c.minor.stage} ft, moderate at ${c.moderate.stage} ft and major at ${c.major.stage} ft. ${fcMax != null ? `Forecast crest: ${fcMax.toFixed(1)} ft.` : "No river forecast is issued for Medora at this level."} <a href="https://water.noaa.gov/gauges/${nw.lid}">NWS</a></p>`;
    } else {
      flood += `<div class="val">—</div><p>Flood stages from the <a href="https://water.noaa.gov/gauges/MDAN8">National Weather Service</a>: minor 15 ft, moderate 18 ft, major 20 ft.</p>`;
    }
    $("#flood-status").innerHTML = flood;

    renderWeather();
    renderAlerts();
    renderReach();
    renderOnThisDay(iso);
    renderChart30();
    postHeight();
  }

  const WMO = { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Cloudy", 45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle", 56: "Freezing drizzle", 57: "Freezing drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 66: "Freezing rain", 67: "Freezing rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains", 80: "Showers", 81: "Showers", 82: "Heavy showers", 85: "Snow showers", 86: "Snow showers", 95: "Thunderstorms", 96: "Thunderstorms, hail", 99: "Thunderstorms, hail" };
  function renderWeather() {
    const box = $("#weather-box");
    if (!WX || !WX.current) { box.innerHTML = `<h4>Weather in Medora</h4><p>Weather is unavailable right now.</p>`; return; }
    const c = WX.current, d = WX.daily;
    const days = d.time.map((t, i) => {
      const name = i === 0 ? "Today" : new Date(t + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
      const pr = d.precipitation_sum[i];
      return `<div><b>${name}</b>${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°<br>${esc(WMO[d.weather_code[i]] || "")}${pr >= 0.01 ? `<br>${pr.toFixed(2)} in` : ""}</div>`;
    }).join("");
    const wet = d.precipitation_sum.some((p) => p >= 0.5) || d.weather_code.some((w) => w >= 95);
    box.innerHTML = `<h4>Weather in Medora</h4><div class="val">${Math.round(c.temperature_2m)}°F</div><p>${esc(WMO[c.weather_code] || "")}, wind ${Math.round(c.wind_speed_10m)} mph.${wet ? " Heavy rain or storms in the forecast can raise the river fast." : ""}</p><div class="wx-days">${days}</div>`;
  }

  function renderAlerts() {
    const box = $("#alerts");
    const rel = ALERTS.filter((a) => a.status === "Actual");
    if (!rel.length) { box.innerHTML = ""; return; }
    box.innerHTML = rel.map((a) => {
      const flood = /flood/i.test(a.event);
      const cls = /warning/i.test(a.event) ? "" : "watch";
      return `<div class="alert ${cls}"><b>${esc(a.event)}${flood ? "" : ""}</b>${esc(a.headline || "")} <a href="https://www.weather.gov/bis/">National Weather Service, Bismarck</a></div>`;
    }).join("");
  }

  function renderReach() {
    const nodes = [
      { site: "06335500", dir: "Upstream" },
      { site: MEDORA, dir: "" },
      { site: null, name: "Elkhorn Ranch", dir: "" },
      { site: "06337000", dir: "Downstream" },
    ];
    $("#reach").innerHTML = nodes.map((n) => {
      if (!n.site) return `<div class="node nogage"><div class="pin"></div><div class="nm">${n.name}</div><div class="s">No gage. About 40 river miles below the Medora bridge.</div></div>`;
      const L = LIVE && LIVE[n.site];
      const f = L && last(L.flow), g = L && last(L.stage);
      const iso = f ? localParts(f[0]) : localParts(Date.now());
      const c = classify(f && f[1], dayStats(n.site, iso));
      return `<div class="node ${n.site === MEDORA ? "here" : ""}">${n.dir ? `<div class="dir">${n.dir}</div>` : ""}<div class="pin"></div><div class="nm">${SITES[n.site].short}</div><div class="v">${f ? fmtCfs(f[1]) + " cfs" : L && L.ice ? "Ice" : "—"}</div><div class="s">${g ? fmtFt(g[1]) + " · " : ""}${f ? esc(c.label) : ""}</div></div>`;
    }).join("");
  }

  function renderOnThisDay(iso) {
    const box = $("#onthisday");
    if (!HIST) { box.innerHTML = ""; return; }
    const md = iso.slice(5, 10);
    const s = HIST.sites[MEDORA];
    const st = s.days[dayIndex(md)];
    const peaksToday = [];
    for (const id of ORDER) for (const p of HIST.sites[id].peaks) if (p.date.slice(5, 10) === md) peaksToday.push({ site: SITES[id].short, ...p });
    const story = (STORY && STORY.chapters) || [];
    let txt = `<h3>On ${fmtDate(iso, "md")} at Medora</h3>`;
    if (st) txt += `<p>The most water ever recorded on this date: <b>${fmtCfs(st.max)} cfs in ${st.maxY}</b>. The least: <b>${fmtCfs(st.min)} cfs in ${st.minY}</b>. The record covers ${plural(st.n, "year")}.</p>`;
    if (peaksToday.length) txt += `<p>Yearly high-water mark set on this date: ${peaksToday.map((p) => `${esc(p.site)}, ${p.y} (${fmtCfs(p.cfs)} cfs)`).join("; ")}.</p>`;
    txt += `<p class="small"><a href="#then" data-go="then">See how the river compares with the one Roosevelt knew →</a></p>`;
    box.innerHTML = txt;
  }

  /* ---------------- SVG chart helpers ---------------- */
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceLogTicks(lo, hi) {
    const out = [];
    for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) for (const m of [1, 3]) { const v = m * Math.pow(10, e); if (v >= lo * 0.999 && v <= hi * 1.001) out.push(v); }
    return out;
  }
  function niceLinTicks(lo, hi, n = 5) {
    const span = hi - lo || 1, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) || 10 * mag;
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }
  function tickLabel(v) { return v >= 1000 ? (v / 1000).toLocaleString("en-US") + "k" : v >= 1 ? String(v) : String(v); }
  function chartW(host) { return Math.max(320, Math.min(1100, Math.round(host.clientWidth || 900))); }
  function makeTip(host) {
    let tip = host.querySelector(".tip");
    if (!tip) { tip = document.createElement("div"); tip.className = "tip"; tip.hidden = true; host.appendChild(tip); }
    return tip;
  }

  /* ---------------- 30-day chart ---------------- */
  function renderChart30() {
    const host = $("#chart-30");
    host.innerHTML = "";
    const L = LIVE && LIVE[MEDORA];
    const raw = L ? (chartParam === "flow" ? L.flow : L.stage) : [];
    if (!raw.length) { host.innerHTML = `<p class="small">No readings to chart${L && L.ice ? " (ice on the river)" : ""}.</p>`; return; }
    // hourly thinning
    const pts = [];
    let lastH = -1;
    for (const p of raw) { const h = Math.floor(p[0] / 3600e3); if (h !== lastH) { pts.push(p); lastH = h; } }
    const t0 = pts[0][0], t1 = pts[pts.length - 1][0];
    // normal band by day (flow only)
    const band = [];
    if (chartParam === "flow" && HIST) {
      for (let t = t0 - 12 * 3600e3; t <= t1 + 24 * 3600e3; t += 86400e3) {
        const iso = localParts(t);
        const st = dayStats(MEDORA, iso);
        if (st) band.push({ t: Date.parse(iso + "T12:00:00-06:00"), lo: st.p25, mid: st.p50, hi: st.p75 });
      }
    }
    const W = chartW(host), H = W < 600 ? 240 : 300, m = { l: 44, r: 10, t: 12, b: 30 };
    const vals = pts.map((p) => p[1]).concat(band.flatMap((b) => [b.lo, b.hi]));
    let lo = Math.min(...vals), hi = Math.max(...vals);
    const useLog = chartParam === "flow" && lo > 0 && hi / Math.max(lo, 0.01) > 12;
    if (useLog) { lo = Math.max(0.1, lo * 0.8); hi = hi * 1.25; } else { const pad = (hi - lo) * 0.12 || 1; lo = Math.max(0, lo - pad); hi = hi + pad; }
    const X = (t) => m.l + ((t - t0) / (t1 - t0 || 1)) * (W - m.l - m.r);
    const Y = useLog ? (v) => m.t + (1 - (Math.log10(Math.max(v, lo)) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (H - m.t - m.b) : (v) => m.t + (1 - (v - lo) / (hi - lo)) * (H - m.t - m.b);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });
    const grid = el("g", { class: "grid" }, svg);
    const ticks = useLog ? niceLogTicks(lo, hi) : niceLinTicks(lo, hi);
    for (const v of ticks) { el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v) }, grid); const tx = el("text", { x: m.l - 6, y: Y(v) + 4, "text-anchor": "end" }, svg); tx.textContent = chartParam === "flow" ? tickLabel(v) : v.toFixed(1); }
    // x ticks weekly
    for (let t = t0; t <= t1; t += (W < 600 ? 10 : 7) * 86400e3) {
      const tx = el("text", { x: X(t), y: H - 8, "text-anchor": "middle" }, svg);
      tx.textContent = new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TZ });
    }
    const unit = el("text", { x: 4, y: 10 }, svg); unit.textContent = chartParam === "flow" ? "cfs" : "ft";
    if (band.length) {
      const bb = band.filter((b) => b.t >= t0 - 86400e3 && b.t <= t1 + 86400e3).map((b) => ({ ...b, t: Math.min(Math.max(b.t, t0), t1) }));
      const d = "M" + bb.map((b) => `${X(b.t)},${Y(b.hi)}`).join("L") + "L" + bb.slice().reverse().map((b) => `${X(b.t)},${Y(b.lo)}`).join("L") + "Z";
      el("path", { d, fill: "rgba(47,111,134,.16)", stroke: "none" }, svg);
      el("path", { d: "M" + bb.map((b) => `${X(b.t)},${Y(b.mid)}`).join("L"), fill: "none", stroke: "#2F6F86", "stroke-width": 1.6, "stroke-dasharray": "5 4" }, svg);
    }
    if (chartParam === "stage" && NWS[MEDORA] && NWS[MEDORA].cats) {
      const fs = NWS[MEDORA].cats.minor.stage;
      if (fs <= hi * 1.5) { /* only draw if near the range */ }
    }
    el("path", { d: "M" + pts.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join("L"), fill: "none", stroke: "#E7805D", "stroke-width": 2.6, "stroke-linejoin": "round" }, svg);
    const dot = el("circle", { r: 4.5, fill: "#C9653F", stroke: "#fff", "stroke-width": 2, cx: X(t1), cy: Y(pts[pts.length - 1][1]) }, svg);
    if (useLog) { const n = el("text", { x: W - m.r, y: m.t + 10, "text-anchor": "end" }, svg); n.textContent = "log scale"; }
    host.appendChild(svg);
    // hover
    const tip = makeTip(host);
    const hover = el("line", { y1: m.t, y2: H - m.b, stroke: "#999", "stroke-dasharray": "2 3", opacity: 0 }, svg);
    svg.addEventListener("pointermove", (e) => {
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const t = t0 + ((x - m.l) / (W - m.l - m.r)) * (t1 - t0);
      if (t < t0 || t > t1) { tip.hidden = true; hover.setAttribute("opacity", 0); return; }
      let best = pts[0];
      for (const p of pts) if (Math.abs(p[0] - t) < Math.abs(best[0] - t)) best = p;
      hover.setAttribute("x1", X(best[0])); hover.setAttribute("x2", X(best[0])); hover.setAttribute("opacity", 1);
      dot.setAttribute("cx", X(best[0])); dot.setAttribute("cy", Y(best[1]));
      const st = chartParam === "flow" ? dayStats(MEDORA, localParts(best[0])) : null;
      tip.innerHTML = `<b>${chartParam === "flow" ? fmtCfs(best[1]) + " cfs" : fmtFt(best[1])}</b> · ${esc(fmtTime(best[0]))}${st ? `<br>normal ${fmtCfs(st.p25)}–${fmtCfs(st.p75)} cfs` : ""}`;
      tip.style.left = ((X(best[0]) / W) * r.width) + "px";
      tip.style.top = ((Y(best[1]) / H) * r.height) + "px";
      tip.hidden = false;
    });
    svg.addEventListener("pointerleave", () => { tip.hidden = true; hover.setAttribute("opacity", 0); dot.setAttribute("cx", X(t1)); dot.setAttribute("cy", Y(pts[pts.length - 1][1])); });
  }

  /* ---------------- THEN & NOW ---------------- */
  async function ensureDaily(site) {
    if (!DAILY[site]) DAILY[site] = await getJSON(`data/daily-${site}.json`);
    return DAILY[site];
  }
  function nowStat(key) {
    if (!HIST) return "";
    const m = HIST.sites[MEDORA], w = HIST.sites["06337000"];
    const pm = m.records.peakMax;
    if (key === "extremes") {
      const zy = m.annual.filter((a) => a.zero > 0);
      const lastZ = zy.length ? zy[zy.length - 1] : null;
      return `<span class="big-num">${m.records.zeroDays.toLocaleString("en-US")}</span><span class="big-lbl">days the gage at Medora has recorded no flow at all</span>
        <p>Both halves of Roosevelt's description still hold. The river has stopped flowing at Medora on ${plural(m.records.zeroDays, "day")} in ${zy.length} different years${lastZ ? `, most recently ${plural(lastZ.zero, "day")} in ${lastZ.y}` : ""}. On ${fmtDate(pm.date)}, the same channel carried ${fmtCfs(pm.cfs)} cubic feet per second, the most ever measured there. A typical year's high water is about ${fmtCfs(m.records.medianAnnualPeak)} cfs.</p>
        <p class="src">USGS gage 06336000, daily and peak records</p>`;
    }
    if (key === "spring") {
      const n = m.peaks.length, ma = m.peaks.filter((p) => ["03", "04"].includes(p.date.slice(5, 7)));
      const topMar = m.peaks.filter((p) => p.date.slice(5, 7) === "03").sort((a, b) => b.cfs - a.cfs).slice(0, 3);
      return `<span class="big-num">${ma.length} of ${n}</span><span class="big-lbl">yearly peaks at Medora came in March or April</span>
        <p>Spring breakup is still the river's big moment. When snowmelt lifts the ice, jams form and let go, as the Ox-bow jam did in 1886. The largest March floods on record at Medora: ${topMar.map((p) => `${fmtDate(p.date)}, ${fmtCfs(p.cfs)} cfs${/\b2\b/.test(p.codes) ? " (estimated)" : ""}`).join("; ")}.</p>
        <p class="src">USGS annual peak-flow file, gage 06336000</p>`;
    }
    if (key === "drought") {
      const pmin = m.records.peakMin;
      const ranked = w.annual.filter((a) => a.complete).sort((a, b) => a.mean - b.mean);
      const r2021 = ranked.findIndex((a) => a.y === 2021);
      const first = ranked[0];
      return `<span class="big-num">${fmtCfs(pmin.cfs)} cfs</span><span class="big-lbl">the lowest yearly peak ever measured at Medora, in ${pmin.y}</span>
        <p>In ${pmin.y} the river never rose above ${fmtCfs(pmin.cfs)} cubic feet per second at Medora. In a typical year it tops ${fmtCfs(m.records.medianAnnualPeak)}.${r2021 >= 0 ? ` Downstream at Watford City, where the record runs unbroken since 1934, 2021 ranks ${r2021 === 0 ? "as the driest year" : `as the ${ordinal(r2021 + 1)}-driest year, behind ${first.y}`}.` : ""}</p>
        <p class="src">USGS gages 06336000 and 06337000</p>`;
    }
    if (key === "breakup") {
      const wpk = w.records.peakMax;
      return `<span class="big-num">${fmtCfs(pm.cfs)}</span><span class="big-lbl">cfs at Medora, ${fmtDate(pm.date)}: the highest flow on record</span>
        <p>No instrument saw the breakup of 1887. The biggest flood ever measured there came sixty years later: on ${fmtDate(pm.date)}, the river at Medora reached ${pm.ft} ft and ${fmtCfs(pm.cfs)} cubic feet per second, and on ${fmtDate(wpk.date)}, ${fmtCfs(wpk.cfs)} cfs passed the Watford City gage downstream. Both records still stand. Most winters, the USGS has to estimate Medora's daily flow for much of November through March, when ice fouls the gage.</p>
        <p class="src">USGS peak-flow files, gages 06336000 and 06337000</p>`;
    }
    if (key === "surge") {
      const best = surgeCache;
      if (!best) return `<p>Loading the daily record…</p>`;
      return `<span class="big-num">${fmtCfs(best.a)} → ${fmtCfs(best.b)}</span><span class="big-lbl">cfs at Medora from ${fmtDate(best.prevIso, "md")} to ${fmtDate(best.iso)}</span>
        <p>Summer storms upstream still send the river up overnight. The sharpest one-day summer rise in the Medora record took the daily flow from ${fmtCfs(best.a)} to ${fmtCfs(best.b)} cubic feet per second, about ${Math.round(best.b / best.a)} times as much water. The Park Service warns paddlers that thunderstorms can raise the river "with little or no warning."</p>
        <p class="src">USGS daily values, gage 06336000; NPS canoeing guidance</p>`;
    }
    return "";
  }
  function ordinal(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  let surgeCache = null;
  async function computeSurge() {
    const d = await ensureDaily(MEDORA);
    let best = null;
    for (const [y, arr] of Object.entries(d.years)) {
      for (let i = 152; i <= 273; i++) { // Jun 2 .. Oct 1
        const a = arr[i - 1], b = arr[i];
        if (a == null || b == null || a < 20 || b < 1000) continue;
        const r = b / a;
        if (!best || r > best.r) best = { r, a, b, y, iso: `${y}-${mdOfIndex(i)}`, prevIso: `${y}-${mdOfIndex(i - 1)}` };
      }
    }
    surgeCache = best;
  }

  function renderStory() {
    const host = $("#story");
    if (!STORY) return;
    host.innerHTML = STORY.chapters.map((c) => {
      const then = c.then.map((b) => b.quote
        ? `<blockquote class="tr"><p>“${esc(b.quote)}”</p><footer>${esc(b.who)}, ${b.url ? `<a href="${esc(b.url)}">${esc(b.cite)}</a>` : esc(b.cite)}</footer></blockquote>`
        : `<p>${esc(b.text)}</p>`).join("");
      let now = "";
      if (c.nowKey) now = `<div data-now="${esc(c.nowKey)}">${nowStat(c.nowKey)}</div>`;
      if (c.now) now += `<p>${esc(c.now)}</p>${c.nowSrc ? `<p class="src">${c.nowUrl ? `<a href="${esc(c.nowUrl)}">${esc(c.nowSrc)}</a>` : esc(c.nowSrc)}</p>` : ""}`;
      if (c.nowLink) now += `<p><a class="btn on-dark small" href="?site=${esc(c.nowLink.site)}#${esc(c.nowLink.view)}" data-go="${esc(c.nowLink.view)}" data-site="${esc(c.nowLink.site)}">${esc(c.nowLink.label)} →</a></p>`;
      return `<article class="chapter" id="then-${esc(c.id)}">
        <div class="then"><div class="when">Then · ${esc(c.when)}</div><h3>${esc(c.title)}</h3>${then}<button class="share" type="button" data-share="${esc(c.id)}">Copy link to this chapter</button></div>
        <div class="now"><div class="when">Now</div><h3>The record</h3>${now}</div>
      </article>`;
    }).join("");
    $$("[data-share]", host).forEach((b) => b.addEventListener("click", () => {
      const url = `${CANONICAL}#then-${b.dataset.share}`;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => { b.textContent = "Link copied"; }).catch(() => { b.textContent = url; });
    }));
    bindGo(host);
    if (!surgeCache) computeSurge().then(() => { const n = $('[data-now="surge"]'); if (n) n.innerHTML = nowStat("surge"); postHeight(); }).catch(() => {});
  }

  /* ---------------- MAPS ---------------- */
  function initMap() {
    if (map) { map.invalidateSize(); return; }
    map = L.map("map", { zoomControl: true, attributionControl: true, minZoom: 11, maxZoom: 18 });
    base = L.tileLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
      maxNativeZoom: 16, maxZoom: 18, attribution: 'Today: <a href="https://www.usgs.gov/programs/national-geospatial-program/national-map">USGS The National Map</a>',
    }).addTo(map);
    map.attributionControl.setPrefix(false);
    map.on("move zoom resize zoomend moveend", clipOverlay);
    window.addEventListener("resize", clipOverlay);
    const range = $("#swipe-range");
    range.addEventListener("input", () => { swipePct = +range.value; clipOverlay(); });
    $("#fade").addEventListener("input", () => { if (overlay) overlay.setOpacity(1 - $("#fade").value / 100 * 0.85); });
    $$("#site-chips .chip").forEach((b) => b.addEventListener("click", () => setSite(b.dataset.site)));
    $$("#mode-chips .chip").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    setSite(siteKey, true);
  }
  let markerLayer = null;
  function setSite(key, first) {
    siteKey = key;
    const S = MAPSITES[key];
    $$("#site-chips .chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.site === key));
    $("#era-chips").innerHTML = S.eras.map((e) => `<button class="chip" data-era="${e.id}" aria-pressed="false">${esc(e.label)}</button>`).join("");
    $$("#era-chips .chip").forEach((b) => b.addEventListener("click", () => setEra(b.dataset.era)));
    map.setMaxBounds(L.latLngBounds(S.bounds).pad(0.6));
    map.setView(S.center, S.zoom, { animate: !first });
    if (markerLayer) markerLayer.remove();
    markerLayer = L.layerGroup(S.markers.map((mk) => L.circleMarker(mk.at, { radius: 7, color: "#fff", weight: 2, fillColor: "#E7805D", fillOpacity: 1 })
      .bindTooltip(mk.label, { permanent: true, direction: "right", className: "lm-label", offset: [8, 0] })
      .bindPopup(mk.pop))).addTo(map);
    setEra(S.eras.some((e) => e.id === eraId) ? eraId : "1939");
  }
  function setEra(id) {
    eraId = id;
    const S = MAPSITES[siteKey], E = S.eras.find((e) => e.id === id) || S.eras[0];
    $$("#era-chips .chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.era === E.id));
    if (overlay) overlay.remove();
    overlay = L.imageOverlay(`assets/overlays/${E.file}`, S.bounds, { interactive: false, className: "then-layer", attribution: "Then: see credits below" }).addTo(map);
    overlay.on("load", clipOverlay);
    if (mode === "fade") overlay.setOpacity(1 - $("#fade").value / 100 * 0.85);
    $("#swipe-then").textContent = E.year;
    $("#era-note").innerHTML = `<h3>${esc(S.label)}, ${esc(E.year)}</h3><p>${esc(E.note)}</p><p class="small">${esc(E.credit)} Today: USGS The National Map orthoimagery.</p>`;
    clipOverlay();
    postHeight();
    if (!EMBED) history.replaceState(null, "", `?site=${siteKey}&era=${E.id}#maps`);
  }
  function setMode(m) {
    mode = m;
    $$("#mode-chips .chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === m));
    $("#swipe").hidden = m !== "swipe";
    $("#swipe-range").hidden = m !== "swipe";
    $("#fade-ctl").hidden = m !== "fade";
    if (overlay) overlay.setOpacity(m === "fade" ? 1 - $("#fade").value / 100 * 0.85 : 1);
    clipOverlay();
  }
  function clipOverlay() {
    if (!map || !overlay) return;
    const img = overlay.getElement();
    $("#swipe").style.left = swipePct + "%";
    if (!img) return;
    if (mode !== "swipe") { img.style.clipPath = ""; return; }
    const mr = map.getContainer().getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    const x = mr.left + (swipePct / 100) * mr.width;
    const scale = img.offsetWidth ? ir.width / img.offsetWidth : 1;
    const cut = Math.max(0, (ir.right - x) / (scale || 1));
    img.style.clipPath = `inset(0 ${cut}px 0 0)`;
  }

  /* ---------------- RECORD ---------------- */
  function renderCoverage() {
    const host = $("#coverage");
    host.innerHTML = "";
    const yNow = new Date().getFullYear();
    const y0 = 1880, W = chartW(host), rowH = 30, m = { l: W < 600 ? 92 : 128, r: 12, t: 22, b: 22 };
    const rows = [
      { label: W < 600 ? "T.R. years" : "Roosevelt in the Badlands", type: "tr" },
      { label: "Medora", site: MEDORA },
      { label: "Marmarth", site: "06335500" },
      { label: "Watford City", site: "06337000" },
    ];
    const H = m.t + rows.length * rowH + m.b;
    const X = (y) => m.l + ((y - y0) / (yNow + 1 - y0)) * (W - m.l - m.r);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}` });
    for (let y = 1880; y <= yNow; y += 20) {
      el("line", { x1: X(y), x2: X(y), y1: m.t - 6, y2: H - m.b, stroke: "#ece8de" }, svg);
      const t = el("text", { x: X(y), y: H - 6, "text-anchor": "middle", class: "yr" }, svg); t.textContent = y;
    }
    rows.forEach((r, i) => {
      const cy = m.t + i * rowH + rowH / 2;
      const t = el("text", { x: m.l - 8, y: cy + 4, "text-anchor": "end" }, svg); t.textContent = r.label;
      if (r.type === "tr") {
        el("rect", { x: X(1883), y: cy - 9, width: X(1899) - X(1883), height: 18, rx: 3, fill: "#E7805D" }, svg);
        const n = el("text", { x: X(1899) + 6, y: cy + 4 }, svg); n.textContent = "1883–1898 · no gage";
        return;
      }
      const s = HIST.sites[r.site];
      for (const [a, b] of s.record.dailyYears) {
        const rect = el("rect", { x: X(a), y: cy - 9, width: Math.max(2, X(b + 1) - X(a)), height: 18, rx: 2, fill: r.site === MEDORA ? "#1B4633" : "#2F6F86" }, svg);
        el("title", {}, rect).textContent = `${r.label}: daily records ${a === b ? a : a + "–" + b}`;
      }
      const daily = new Set(); for (const [a, b] of s.record.dailyYears) for (let y = a; y <= b; y++) daily.add(y);
      for (const p of s.peaks) if (!daily.has(p.y)) {
        const tk = el("rect", { x: X(p.y) + 0.5, y: cy - 9, width: Math.max(1.5, X(p.y + 1) - X(p.y) - 1), height: 18, fill: "#8FC895" }, svg);
        el("title", {}, tk).textContent = `${r.label}: ${p.y} annual peak only`;
      }
    });
    host.appendChild(svg);
    const m0 = HIST.sites[MEDORA].record;
    const runs = m0.dailyYears.map(([a, b]) => (a === b ? a : `${a}–${b}`)).join(", ");
    const peakOnly = HIST.sites[MEDORA].peaks.filter((p) => !m0.dailyYears.some(([a, b]) => p.y >= a && p.y <= b)).map((p) => p.y);
    $("#coverage-notes").innerHTML = `<ul>
      <li><b>Medora</b>, gage 06336000: daily flow records for ${runs}. Partial years: ${m0.partialYears.map(([y, n]) => `${y} (${n} days)`).join(", ")}. Annual peak only: ${peakOnly.join(", ") || "none"}. First daily record: ${fmtDate(m0.dailyStart)}.</li>
      <li><b>Watford City</b>, gage 06337000, below the North Unit: daily records ${HIST.sites["06337000"].record.dailyYears.map(([a, b]) => `${a}–${b}`).join(", ")}, unbroken.</li>
      <li><b>Marmarth</b>, gage 06335500, upstream: daily records ${HIST.sites["06335500"].record.dailyYears.map(([a, b]) => `${a}–${b}`).join(", ")}.</li>
      <li>No USGS flow record of any kind exists for the Little Missouri during Roosevelt's years, 1883–1898. Gage heights before 1946 at Medora were read at a different site or datum, so compare old and new years by flow, not by height.</li>
    </ul>`;
  }

  function renderPeaks() {
    const host = $("#peaks");
    host.innerHTML = "";
    const pk = HIST.sites[MEDORA].peaks;
    const yNow = new Date().getFullYear();
    const y0 = 1903, W = chartW(host), H = W < 600 ? 260 : 320, m = { l: 40, r: 8, t: 14, b: 28 };
    const max = Math.max(...pk.map((p) => p.cfs));
    const log = peakScale === "log";
    const lo = 100;
    const X = (y) => m.l + ((y - y0) / (yNow + 1 - y0)) * (W - m.l - m.r);
    const Y = log ? (v) => m.t + (1 - (Math.log10(Math.max(v, lo)) - Math.log10(lo)) / (Math.log10(max * 1.2) - Math.log10(lo))) * (H - m.t - m.b) : (v) => m.t + (1 - v / (max * 1.08)) * (H - m.t - m.b);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}` });
    const ticks = log ? niceLogTicks(lo, max * 1.2) : niceLinTicks(0, max * 1.08);
    for (const v of ticks) { el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: "#ece8de" }, svg); const t = el("text", { x: m.l - 6, y: Y(v) + 4, "text-anchor": "end" }, svg); t.textContent = tickLabel(v); }
    for (let y = W < 600 ? 1920 : 1910; y <= yNow; y += W < 600 ? 20 : 10) { const t = el("text", { x: X(y), y: H - 8, "text-anchor": "middle" }, svg); t.textContent = y; }
    const top = pk.slice().sort((a, b) => b.cfs - a.cfs).slice(0, 5).map((p) => p.y);
    const low = pk.slice().sort((a, b) => a.cfs - b.cfs).slice(0, 3).map((p) => p.y);
    const bw = Math.max(2, X(y0 + 1) - X(y0) - 1.5);
    const med = HIST.sites[MEDORA].records.medianAnnualPeak;
    el("line", { x1: m.l, x2: W - m.r, y1: Y(med), y2: Y(med), stroke: "#2F6F86", "stroke-dasharray": "5 4" }, svg);
    const mt = el("text", { x: X(1938), y: Y(med) - 5, "text-anchor": "middle", style: "fill:#2F6F86" }, svg); mt.textContent = `median ${fmtCfs(med)} cfs`;
    const bars = [];
    for (const p of pk) {
      const fill = top.includes(p.y) ? "#C9653F" : low.includes(p.y) ? "#8B4A2B" : "#1B4633";
      const r = el("rect", { x: X(p.y), y: Y(p.cfs), width: bw, height: Math.max(1, H - m.b - Y(p.cfs)), fill, tabindex: 0, role: "button", "aria-label": `${p.y}: ${fmtCfs(p.cfs)} cfs` }, svg);
      r.style.cursor = "pointer";
      const pick = () => {
        bars.forEach((b) => b.setAttribute("opacity", 1));
        r.setAttribute("opacity", 0.6);
        const rank = pk.slice().sort((a, b) => b.cfs - a.cfs).findIndex((q) => q === p) + 1;
        $("#peak-detail").innerHTML = `<b>${fmtDate(p.date)}</b>: ${fmtCfs(p.cfs)} cubic feet per second${p.ft != null ? `, gage height ${p.ft} ft` : ""}. Ranks ${ordinal(rank)} of ${pk.length} yearly peaks.${/\b2\b/.test(p.codes) ? " Flow is an estimate." : ""}${/\b1\b/.test(p.codes) ? " Value is a maximum daily average." : ""}${/\b3\b/.test(p.htCodes) ? " Height read at a different site or datum." : ""}`;
      };
      r.addEventListener("click", pick);
      r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      bars.push(r);
    }
    // TR marker at left edge
    if (W >= 600) { const note = el("text", { x: m.l + 4, y: m.t + 10 }, svg); note.textContent = "Gage records begin 1903"; }
    for (const p of pk.filter((q) => top.includes(q.y))) { const t = el("text", { x: X(p.y) + bw / 2, y: Y(p.cfs) - 5, "text-anchor": "middle", style: "fill:#C9653F;font-weight:700" }, svg); t.textContent = p.y; }
    host.appendChild(svg);
  }

  const CMP_COLORS = ["#092A4D", "#2F6F86", "#1B4633", "#8B6B3E", "#7A4E8C", "#4E7A3A"];
  async function renderCompare() {
    const host = $("#compare");
    const site = cmpSite;
    let d;
    try { d = await ensureDaily(site); } catch (e) { host.innerHTML = `<p class="err">Could not load the daily record.</p>`; return; }
    const years = Object.keys(d.years).map(Number).sort((a, b) => a - b);
    const yNow = Math.max(...years);
    const presetsAll = [yNow, yNow - 1, 1947, 1952, 2011, 2019, 1934, 2021, 1988];
    const presets = presetsAll.filter((y, i, a) => years.includes(y) && a.indexOf(y) === i);
    if (!cmpYears) cmpYears = [yNow, 1947, 2021].filter((y) => years.includes(y));
    cmpYears = cmpYears.filter((y) => years.includes(y));
    if (!cmpYears.length) cmpYears = [yNow];
    const chips = $("#cmp-years");
    const extra = cmpYears.filter((y) => !presets.includes(y));
    chips.innerHTML = presets.concat(extra).map((y) => `<button class="chip" data-y="${y}" aria-pressed="${cmpYears.includes(y)}">${y === yNow ? "This year" : y}</button>`).join("") +
      `<select id="cmp-add" aria-label="Add another year"><option value="">Add a year…</option>${years.slice().reverse().map((y) => `<option>${y}</option>`).join("")}</select>`;
    $$("#cmp-years .chip").forEach((b) => b.addEventListener("click", () => {
      const y = +b.dataset.y;
      cmpYears = cmpYears.includes(y) ? cmpYears.filter((q) => q !== y) : cmpYears.concat(y).slice(-6);
      renderCompare();
    }));
    $("#cmp-add").addEventListener("change", (e) => { const y = +e.target.value; if (y && !cmpYears.includes(y)) { cmpYears = cmpYears.concat(y).slice(-6); renderCompare(); } });

    host.innerHTML = "";
    const W = chartW(host), H = W < 600 ? 280 : 330, m = { l: 40, r: 8, t: 12, b: 28 };
    const lo = 0.1;
    let hi = 10;
    const days = HIST.sites[site].days;
    for (const y of cmpYears) for (const v of d.years[y]) if (v != null && v > hi) hi = v;
    for (const s of days) if (s && s.p75 > hi) hi = s.p75;
    hi *= 1.3;
    const X = (i) => m.l + (i / 364) * (W - m.l - m.r);
    const Y = (v) => m.t + (1 - (Math.log10(Math.max(v, lo)) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (H - m.t - m.b);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}` });
    for (const v of niceLogTicks(lo, hi).filter((v) => String(v)[0] === "1")) { el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: "#ece8de" }, svg); const t = el("text", { x: m.l - 6, y: Y(v) + 4, "text-anchor": "end" }, svg); t.textContent = tickLabel(v); }
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].forEach((mn, i) => { if (W < 600 && i % 2) return; const idx = dayIndex(String(i + 1).padStart(2, "0") + "-01"); const t = el("text", { x: X(idx) + 2, y: H - 8 }, svg); t.textContent = mn; el("line", { x1: X(idx), x2: X(idx), y1: m.t, y2: H - m.b, stroke: "#f3f0e8" }, svg); });
    const u = el("text", { x: 4, y: 10 }, svg); u.textContent = "cfs (log)";
    // band
    const ok = days.map((s, i) => [i, s]).filter(([, s]) => s);
    el("path", { d: "M" + ok.map(([i, s]) => `${X(i)},${Y(s.p75)}`).join("L") + "L" + ok.slice().reverse().map(([i, s]) => `${X(i)},${Y(s.p25)}`).join("L") + "Z", fill: "rgba(47,111,134,.13)" }, svg);
    el("path", { d: "M" + ok.map(([i, s]) => `${X(i)},${Y(s.p50)}`).join("L"), fill: "none", stroke: "#2F6F86", "stroke-dasharray": "5 4", "stroke-width": 1.4 }, svg);
    const colorOf = {};
    let ci = 0;
    for (const y of cmpYears) colorOf[y] = y === yNow ? "#E7805D" : CMP_COLORS[ci++ % CMP_COLORS.length];
    for (const y of cmpYears.slice().sort((a, b) => (a === yNow) - (b === yNow))) {
      const arr = d.years[y];
      let path = "", pen = false;
      arr.forEach((v, i) => { if (v == null) { pen = false; return; } path += `${pen ? "L" : "M"}${X(i).toFixed(1)},${Y(v === 0 ? lo : v).toFixed(1)}`; pen = true; });
      el("path", { d: path, fill: "none", stroke: colorOf[y], "stroke-width": y === yNow ? 2.8 : 1.8, "stroke-linejoin": "round", opacity: y === yNow ? 1 : 0.9 }, svg);
    }
    host.appendChild(svg);
    $$("#cmp-years .chip").forEach((b) => { const y = +b.dataset.y; b.innerHTML = `${cmpYears.includes(y) ? `<span class="cdot" style="background:${colorOf[y]}"></span>` : ""}${y === yNow ? "This year" : y}`; });
    const fact = (y) => { const arr = d.years[y].filter((v) => v != null); if (!arr.length) return ""; const mx = Math.max(...arr); const n = arr.length; const z = arr.filter((v) => v === 0).length; return `${y}: peak daily ${fmtCfs(mx)} cfs${z ? `, ${plural(z, "day")} with no flow` : ""}${n < 365 ? ` (${n} days on record)` : ""}`; };
    $("#cmp-legend").innerHTML = `<span><i class="sw band"></i> Normal range, all years</span><span><i class="sw line-med"></i> Median</span>` + cmpYears.map((y) => `<span><i class="sw line-now" style="background:${colorOf[y]}"></i>${esc(fact(y))}</span>`).join("");
    // hover
    const tip = makeTip(host);
    svg.addEventListener("pointermove", (e) => {
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const i = Math.round(((x - m.l) / (W - m.l - m.r)) * 364);
      if (i < 0 || i > 364) { tip.hidden = true; return; }
      const md = mdOfIndex(i);
      tip.innerHTML = `<b>${fmtDate("2001-" + md, "md")}</b><br>` + cmpYears.map((y) => `${y}: ${d.years[y][i] == null ? "no record" : fmtCfs(d.years[y][i]) + " cfs"}`).join("<br>");
      tip.style.left = ((X(i) / W) * r.width) + "px";
      tip.style.top = "20px";
      tip.hidden = false;
    });
    svg.addEventListener("pointerleave", () => (tip.hidden = true));
    postHeight();
  }

  function renderRecords() {
    const out = [];
    for (const id of [MEDORA, "06337000", "06335500"]) {
      const s = HIST.sites[id], r = s.records;
      out.push(`<div class="rec"><b>${esc(SITES[id].short)} · highest peak</b><div class="v">${fmtCfs(r.peakMax.cfs)} cfs</div><span>${fmtDate(r.peakMax.date)}${r.peakMax.ft ? `, ${r.peakMax.ft} ft` : ""}</span></div>`);
      out.push(`<div class="rec"><b>${esc(SITES[id].short)} · lowest yearly peak</b><div class="v">${fmtCfs(r.peakMin.cfs)} cfs</div><span>${fmtDate(r.peakMin.date)}</span></div>`);
      if (r.driestYear) out.push(`<div class="rec"><b>${esc(SITES[id].short)} · driest full year</b><div class="v">${r.driestYear.y}</div><span>average ${fmtCfs(r.driestYear.mean)} cfs, of years with complete records</span></div>`);
    }
    $("#records").innerHTML = out.join("");
  }

  /* ---------------- tabs ---------------- */
  const rendered = {};
  function show(view, scroll = true) {
    if (!VIEWS.includes(view)) view = "today";
    $$(".tabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.view === view));
    $$("section.panel").forEach((p) => (p.hidden = p.dataset.panel !== view));
    if (view === "maps") initMap();
    if (view === "record" && HIST && !rendered.record) { rendered.record = true; renderCoverage(); renderPeaks(); renderRecords(); renderCompare(); }
    if (!EMBED && location.hash.slice(1) !== view && !location.hash.startsWith("#then-")) history.replaceState(null, "", (view === "maps" ? location.search : "") + "#" + view);
    if (scroll && !EMBED) $(".tabs").scrollIntoView({ behavior: "smooth" });
    if (EMBED && scroll && window.parent !== window) window.parent.postMessage({ type: "little-mo:scrolltop", id: FRAME_ID }, "*");
    postHeight();
  }
  function bindGo(root) {
    $$("[data-go]", root).forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      if (a.dataset.site && MAPSITES[a.dataset.site]) { siteKey = a.dataset.site; if (map) setSite(siteKey); }
      if (EMBED && SINGLE) { window.open(CANONICAL + (a.dataset.site ? `?site=${a.dataset.site}` : "") + "#" + a.dataset.go, "_blank"); return; }
      show(a.dataset.go);
    }));
  }

  /* ---------------- compact embed ---------------- */
  function renderCompact() {
    let card = $(".compact-card");
    if (!card) { card = document.createElement("div"); card.className = "compact-card"; document.body.appendChild(card); }
    const L = LIVE && LIVE[MEDORA];
    const f = L && last(L.flow);
    const iso = localParts(f ? f[0] : Date.now());
    const cls = classify(f && f[1], dayStats(MEDORA, iso));
    const ps = paddleState(f ? f[1] : null);
    const more = params.get("more") || CANONICAL;
    card.innerHTML = `<div class="t">Little Missouri at Medora</div>
      <div class="n">${f ? fmtCfs(f[1]) : "—"} <small>cubic feet per second</small></div>
      <span class="cond c-${cls.key}">${esc(cls.label)}</span>
      <p><span class="dot ${ps.dot}"></span><b>Paddling: ${esc(ps.val)}.</b> ${f ? "Reading from " + esc(fmtTime(f[0])) + "." : L && L.ice ? "Ice on the river." : "Readings unavailable."}</p>
      <a class="more" href="${esc(more)}" target="_top">Today's river, then and now →</a>`;
    postHeight();
  }

  /* ---------------- credits, embed sizing ---------------- */
  function buildCredits() {
    $$("[data-credit]").forEach((n) => { const c = CREDITS[n.dataset.credit]; if (c) n.textContent = `${c.caption}. ${c.artist}, ${c.license}`; });
    $("#photo-credits").innerHTML = Object.values(CREDITS).map((c) => `${esc(c.caption)}: ${esc(c.artist)}, ${c.licenseUrl ? `<a href="${esc(c.licenseUrl)}">${esc(c.license)}</a>` : esc(c.license)} (<a href="${esc(c.source)}">source</a>)`).join("<br>");
    $("#photo-credits-link").addEventListener("click", (e) => { e.preventDefault(); $("#photo-credits").hidden = !$("#photo-credits").hidden; });
  }
  function postHeight() {
    if (!EMBED || window.parent === window) return;
    requestAnimationFrame(() => {
      const target = document.body.classList.contains("compact") ? $(".compact-card") : document.body;
      window.parent.postMessage({ type: "little-mo:height", height: Math.ceil(target.getBoundingClientRect().height) + (target === document.body ? 0 : 8), id: FRAME_ID }, "*");
    });
  }

  /* ---------------- boot ---------------- */
  async function refreshLive() {
    const [live, nws, wx, al] = await Promise.all([
      loadLive().catch((e) => { console.warn(e); return null; }),
      loadNWS().catch(() => ({})),
      loadWeather().catch(() => null),
      loadAlerts().catch(() => []),
    ]);
    LIVE = live; NWS = nws; WX = wx; ALERTS = al;
    if (document.body.classList.contains("compact")) renderCompact(); else renderToday();
  }

  async function boot() {
    const view = params.get("view");
    if (EMBED) {
      document.body.classList.add("embed");
      if (SINGLE) document.body.classList.add("single");
      if (params.get("heading") === "off") document.body.classList.add("no-heading");
      if (view === "compact") document.body.classList.add("compact");
    }
    buildCredits();
    bindGo(document);
    $$(".tabs button").forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));
    $$("#chart-param .chip").forEach((b) => b.addEventListener("click", () => { chartParam = b.dataset.p; $$("#chart-param .chip").forEach((c) => c.setAttribute("aria-pressed", c === b)); renderChart30(); }));
    $$("#peak-scale .chip").forEach((b) => b.addEventListener("click", () => { peakScale = b.dataset.scale; $$("#peak-scale .chip").forEach((c) => c.setAttribute("aria-pressed", c === b)); renderPeaks(); }));
    $("#cmp-site").addEventListener("change", (e) => { cmpSite = e.target.value; renderCompare(); });
    $("#refresh").addEventListener("click", () => { $("#now-main").innerHTML = `<div class="loading">Refreshing…</div>`; refreshLive(); });
    window.addEventListener("hashchange", () => { const v = location.hash.slice(1); if (VIEWS.includes(v)) show(v, false); });
    let rz;
    window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (LIVE) renderChart30(); if (rendered.record) { renderCoverage(); renderPeaks(); renderCompare(); } postHeight(); }, 250); });

    const [h, s] = await Promise.all([
      getJSON("data/history.json").catch((e) => { console.warn(e); return null; }),
      getJSON("data/story.json").catch((e) => { console.warn(e); return null; }),
    ]);
    HIST = h; STORY = s;
    if (HIST) $("#data-stamp").textContent = `Gage history last rebuilt ${fmtDate(HIST.generated.slice(0, 10))}.`;

    if (view === "compact") { await refreshLive(); setInterval(refreshLive, 15 * 60e3); return; }

    renderStory();
    const hash = (location.hash || "").slice(1);
    let start = SINGLE || view || (VIEWS.includes(hash) ? hash : "today");
    if (hash.startsWith("then-")) start = "then";
    show(start, false);
    if (hash.startsWith("then-")) setTimeout(() => { const t = document.getElementById(hash); if (t) t.scrollIntoView(); }, 50);
    await refreshLive();
    setInterval(() => { if (!document.hidden) refreshLive(); }, 15 * 60e3);
    // re-render data-driven "now" stats once history is in
    $$("[data-now]").forEach((n) => (n.innerHTML = nowStat(n.dataset.now)));
    postHeight();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
