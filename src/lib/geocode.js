/**
 * Reverse geocode lat/lng to city and state using OpenStreetMap Nominatim.
 * Requires User-Agent header per Nominatim usage policy.
 */
export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return { city: null, state: null };
  }
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lng);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "10"); // city-level detail

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "CivicBridge/1.0 (civic-issue-tracker)",
      },
    });
    if (!res.ok) return { city: null, state: null };

    const data = await res.json();
    const addr = data?.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      null;
    const state = addr.state || addr.state_district || null;

    return { city, state };
  } catch {
    return { city: null, state: null };
  }
}
