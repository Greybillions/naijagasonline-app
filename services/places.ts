import { Platform } from 'react-native';
import * as Location from 'expo-location';
import type { Suggestion } from '@/domain/types';

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

/** ANDROID: Google Places Autocomplete + Details */
export async function fetchAndroidPlaces(q: string): Promise<Suggestion[]> {
  if (Platform.OS !== 'android') return [];
  if (!GOOGLE_KEY) return [];

  const autoRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      q
    )}&types=geocode&components=country:ng&key=${GOOGLE_KEY}`
  );
  const autoJson = await autoRes.json();
  if (!autoJson?.predictions?.length) return [];

  const detailPromises = autoJson.predictions
    .slice(0, 5)
    .map(async (p: any) => {
      const detRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=geometry,name,formatted_address&key=${GOOGLE_KEY}`
      );
      const detJson = await detRes.json();
      const loc = detJson?.result?.geometry?.location;
      if (!loc) return null;

      return {
        label: detJson?.result?.name || p.structured_formatting?.main_text || q,
        details: detJson?.result?.formatted_address || p.description,
        lat: loc.lat,
        lng: loc.lng,
        placeId: detJson?.result?.place_id,
      } as Suggestion;
    });

  return (await Promise.all(detailPromises)).filter(Boolean) as Suggestion[];
}

/** Cross-platform geocoder: iOS = Apple via expo-location, Android = Google Places */
export async function geocodeCrossPlatform(q: string): Promise<Suggestion[]> {
  if (Platform.OS === 'android') return fetchAndroidPlaces(q);

  const results: any[] = await Location.geocodeAsync(q);
  return results.slice(0, 5).map((r) => ({
    label: r.name || q,
    details: [r.street, r.district, r.city, r.region, r.country]
      .filter(Boolean)
      .join(', '),
    lat: r.latitude!,
    lng: r.longitude!,
  }));
}
