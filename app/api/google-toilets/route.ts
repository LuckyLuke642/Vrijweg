import { NextResponse } from "next/server";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
  formattedAddress?: string;
  googleMapsUri?: string;
  accessibilityOptions?: { wheelchairAccessibleRestroom?: boolean };
};

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const paidFallbackEnabled = process.env.GOOGLE_PLACES_SERVER_FALLBACK === "true";
  if (!key || !paidFallbackEnabled) return NextResponse.json({ available: false, places: [] }, { status: 503 });

  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const radius = Math.min(10000, Math.max(500, Number(url.searchParams.get("radius")) || 5000));
  const languageCode = ["nl", "en", "de", "fr"].includes(url.searchParams.get("lang") || "") ? url.searchParams.get("lang")! : "nl";
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return NextResponse.json({ error: "invalid_location" }, { status: 400 });

  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.formattedAddress,places.googleMapsUri,places.accessibilityOptions",
    },
    body: JSON.stringify({
      includedTypes: ["public_bathroom"],
      maxResultCount: 20,
      rankPreference: "DISTANCE",
      languageCode,
      locationRestriction: { circle: { center: { latitude: lat, longitude: lon }, radius } },
    }),
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ available: false, places: [] }, { status: 502 });
  const data = await response.json() as { places?: GooglePlace[] };
  return NextResponse.json({ available: true, places: data.places || [] }, { headers: { "cache-control": "private, max-age=300" } });
}
