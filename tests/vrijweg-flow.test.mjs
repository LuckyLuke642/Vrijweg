import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pageSource = fileURLToPath(new URL("../app/page.tsx", import.meta.url));

test("keeps route planning and Google Maps fallback in the toilet flow", async () => {
  const source = await readFile(pageSource, "utf8");

  assert.match(source, /route:"Route naar toilet"/);
  assert.match(source, /function mapsDirectionsUrl/);
  assert.match(source, /function mapsSearchUrl/);
  assert.match(source, /function googleMapsQuery/);
  assert.match(source, /suitable for power wheelchair/);
  assert.match(source, /-frietwagen/);
  assert.match(source, /isUnsuitableToiletFallback/);
  assert.match(source, /className="map-route-card"/);
  assert.match(source, /className="candidate-list"/);
  assert.match(source, /className="route-secondary"/);
  assert.match(source, /className="status-card empty-search"/);
  assert.match(source, /st\.mapsVenue/);
  assert.match(source, /selected\.inferred\?googleCheck:route/);
});

test("does not stop searching after an empty OpenStreetMap response", async () => {
  const source = await readFile(pageSource, "utf8");

  assert.match(source, /openMapAnswered=true/);
  assert.match(source, /if\(items\.length===0\)continue;/);
  assert.match(source, /setError\(openMapAnswered\?"":st\.busy\)/);
});

test("keeps generic venue toilet searches near the current location", async () => {
  const source = await readFile(pageSource, "utf8");

  assert.match(source, /function intentContext/);
  assert.match(source, /restaurant/);
  assert.match(source, /tankstation of verzorgingsplaats/);
  assert.match(source, /intent&&asksForToilet\(entered\)/);
});

test("filters broad venue fallbacks so food trucks do not look like toilets", async () => {
  const source = await readFile(pageSource, "utf8");

  assert.match(source, /nwr\["amenity"="fuel"\]/);
  assert.match(source, /nwr\["highway"~"\^\(services\|rest_area\)\$"\]/);
  assert.doesNotMatch(source, /nwr\["amenity"~"\^\(fuel\|restaurant\|fast_food\|cafe\)\$"\]/);
  assert.match(source, /isUnsuitableToiletFallback\(tags\)/);
  assert.match(source, /Number\(a\.inferred\)-Number\(b\.inferred\)/);
});

test("adds an electric wheelchair first safety check to the toilet record", async () => {
  const source = await readFile(pageSource, "utf8");

  assert.match(source, /Elektrische rolstoel-check/);
  assert.match(source, /Draaicirkel/);
  assert.match(source, /Ondergrond laatste meters/);
  assert.match(source, /openbaar aangepast toilet is nog niet bevestigd/);
  assert.match(source, /electricChecks/);
});

test("keeps Google Places as an explicit paid server fallback", async () => {
  const source = await readFile(pageSource, "utf8");
  const routeSource = await readFile(
    fileURLToPath(new URL("../app/api/google-toilets/route.ts", import.meta.url)),
    "utf8",
  );

  assert.match(routeSource, /GOOGLE_PLACES_API_KEY/);
  assert.match(routeSource, /GOOGLE_PLACES_SERVER_FALLBACK/);
  assert.match(routeSource, /paidFallbackEnabled/);
  assert.doesNotMatch(source, /const loadGoogleResults=async/);
});

test("keeps the main toilet screen calm and hides coordinates", async () => {
  const source = await readFile(pageSource, "utf8");

  assert.match(source, /candidatePlaces=allPlaces\.slice\(0,4\)/);
  assert.doesNotMatch(source, /className="source-strategy"/);
  assert.doesNotMatch(source, /className="maps-task-card"/);
  assert.doesNotMatch(source, /selected\.lat\.toFixed\(5\), \{selected\.lon\.toFixed\(5\)\}/);
});
