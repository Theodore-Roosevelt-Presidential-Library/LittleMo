# The Little Missouri (LittleMo)

Today's river at Medora beside the river Theodore Roosevelt knew. A Theodore Roosevelt Presidential Library Labs tool.

**Live:** https://littlemo.labs.trlibrary.com (GitHub Pages)

## What's in it

| Section | What it does | Data |
|---|---|---|
| Today's River | Live flow and gage height at Medora, compared with every year on record for the date (much below normal through much above normal, the USGS convention). Paddling status from the NPS thresholds, NWS flood stages, Medora weather, active NWS alerts, a 30-day chart against the normal range, the Marmarth → Medora → Elkhorn → Watford City reach, and "on this date" records. Refreshes every 15 minutes. | USGS instantaneous values (browser), `data/history.json`, NWS NWPS and alerts API, Open-Meteo |
| Then & Now | Eight chapters, 1805 to today. Roosevelt's own words (verbatim, cited) on the left; what the gages have measured since on the right. The "now" numbers are computed from the record, so they update themselves. Each chapter has a share link (`#then-1886-ice`). | `data/story.json`, `data/history.json`, `data/daily-06336000.json` |
| Maps | Swipe or fade between an old layer and today's USGS imagery, at Medora and at the Elkhorn: GLO survey plats, 1939 and 1957 aerials, 1970s USGS topo. | `assets/overlays/*.webp` |
| The Record | Exactly which years exist at each gage, every yearly peak at Medora, any past year laid over this one, and the records. | `data/history.json`, `data/daily-*.json` |
| Paddle It | NPS guidance, distances and rules, with live status. | NPS canoeing page |

## Which years exist (Medora, gage 06336000)

- Daily flow: 1903–1908, 1921–1924, 1928–1934, 1945–1975, 2001–present. First daily value May 1, 1903. Partial years: 1903, 1908, 1921–1924, 1928, 1934, 1945, 1975, 2001.
- Annual peak only: 1909–1912, 1914–1916, 1976. No record at all for 1913, 1917–1920, 1925–1927, 1935–1944, 1977–2000.
- Nothing before 1903. USGS lists no historic (pre-gage) peaks for the site, so Roosevelt's years (1883–1898) have no measurements. The page says so and uses his writing instead.
- Watford City (06337000, below the North Unit) is unbroken since 1934; Marmarth (06335500, upstream) since 1938.
- Gage heights before 1946 were read at a different site or datum. Compare old and new years by flow, not height.

## Embedding

Drop this into a Drupal Full HTML block. Each `div` becomes a self-sizing widget.

```html
<div data-little-mo="today"></div>
<script src="https://littlemo.labs.trlibrary.com/embed.js" async></script>
```

Views: `today`, `then`, `maps`, `record`, `paddle`, `compact` (a small live card for a sidebar or the homepage), or `all` (tabs included).
Options: `data-site="elkhorn"` and `data-era="glo|1939|1957|1970"` for maps, `data-heading="off"`, `data-more="https://www.trlibrary.com/..."` for the compact card's link, `data-min-height="900"`.

Links: `?site=elkhorn&era=1939#maps`, `#record`, `#then-1887`.

## Data

- **Live:** USGS Water Services instantaneous values (`waterservices.usgs.gov/nwis/iv`), falling back to the USGS Water Data OGC API (`api.waterdata.usgs.gov/ogcapi/v0/collections/continuous`) if the older service is down. Both allow browser requests. Provisional.
- **History:** `scripts/build_history.py` pulls the full daily record and the annual peak-flow file for all three gages and computes calendar-day percentiles (Weibull plotting position, as USGS does). A GitHub Action reruns it every Monday (`.github/workflows/refresh-history.yml`, shipped as `scripts/refresh-history.yml` until moved); run it by hand from the Actions tab any time.
- **Flood stages:** NWS National Water Prediction Service gauges MDAN8, WTFN8, MTHN8. Medora: action 13 ft, minor 15, moderate 18, major 20. NWS issues no routine forecast for Medora.
- **Alerts:** api.weather.gov, points at Medora and the Elkhorn.
- **Weather:** Open-Meteo (CC BY 4.0), Mountain Time.
- **Paddling thresholds:** NPS, Theodore Roosevelt National Park Canoeing & Kayaking: 699 cfs (2.5 ft) fair, 699–1,500 cfs (2.5–3.5 ft) good.
- **Map layers:** rendered once from the ND Department of Water Resources aerial WMS (`aerial.dwr.nd.gov/dwrwms`: `GeneralLandOfficePlats_maps_air`, `BillingsCounty_1939_bw_air`, `BillingsCounty_1957_bw_air`), the ND GIS Hub 1957–62 ImageServer, and USGS historical topo GeoTIFFs (Medora 1970; Roosevelt Creek West 1974 and neighbors 1970), reprojected to Web Mercator. Bounds: Medora `[[46.87,-103.575],[46.96,-103.49]]`, Elkhorn `[[47.2,-103.675],[47.265,-103.6]]`. Base imagery: USGS The National Map. Old photos are not orthorectified.
- **Photos:** Wikimedia Commons, credits in `assets/app.js` (`CREDITS`). To use Acquia DAM photos instead, replace a file in `assets/photos/` with the same name and update its credit.

## Editing content

- Then & Now chapters, quotes and citations: `data/story.json`. Keep quotes verbatim; `nowKey` chapters get their numbers from the record (`nowStat()` in `assets/app.js`).
- Map layer notes and credits: `MAPSITES` in `assets/app.js`.

Fonts load from trlibrary.com (Clearface, Dharma Gothic E, Frutiger).

## Setup checklist

1. Settings → Pages: deploy from `main`, root folder. Custom domain `littlemo.labs.trlibrary.com` (the `CNAME` file is included); enforce HTTPS. Wildcard DNS for `*.labs.trlibrary.com` already points at GitHub Pages.
2. Move `scripts/refresh-history.yml` to `.github/workflows/refresh-history.yml` (it couldn't be written there from Claude's side). In GitHub you can also add it under Actions → New workflow and paste it.
3. Settings → Actions → General: allow read and write permissions for workflows, so the weekly rebuild can commit.

See `docs/fact-check.md` for sources and items to verify before the trlibrary.com page goes live, and `docs/trlibrary-page-draft.md` for draft page copy.
