# PujaMate public-launch data notes (2026)

## Durga Puja / pandal directory

The 2026 seed is based on the current public Kolkata 2026 pandal directory and its map/directions links. The directory currently lists 227 pandals and says 166 have map locations.

Source: https://kolkatakhoj.com/pandals/

PujaMate's verification script only updates records that were created by PujaMate's own 2026 seed description. It does not overwrite unrelated user/admin records.

## Kolkata Metro

The route data covers the currently used 58-station snapshot across Blue, Green, Purple, Yellow and Orange lines. Orange Line coordinates for VIP Bazar, Ritwik Ghatak, Barun Sengupta and Beleghata were corrected using current map/OSM-backed station references.

Reference sources:
- https://mtp.indianrailways.gov.in/
- https://kolkatametro.org/lines/

The app's Metro Route page is a fixed Kolkata network browser; it does not require device GPS.

## Kolkata buses

Bus route/stage names are based on the WBTC intra-city route list. PujaMate uses map-matched coordinates for the stop points used in radius calculations; these coordinates are not claimed to be official WBTC GPS telemetry.

Reference: https://wbtconline.in/assets/pdf/INTRA_CITY_RTS_Latest-small.pdf

The route page does not require device GPS.

## Crowd data

PujaMate does not invent live crowd reports. A crowd badge is shown only when a recent community report exists; otherwise the UI says "No recent report".

## Product data policy

- Static pandal fields are only seeded from public 2026 directory/map information that can be attributed to a source.
- PujaMate does not invent live crowd values. With no recent community report, the app shows "No recent report".
- Next Pandal is a user-derived feature: it unlocks after a real check-in and excludes already visited pandals.
- Bus data is route/stage reference data only. It is not live vehicle telemetry or an arrival-time prediction.
- Device GPS is used only where the user chooses a location-aware feature such as Near Me, check-in, or current-location Next Pandal. Explore Metro/Bus mode does not require GPS.
