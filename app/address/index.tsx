import { useEffect, useMemo, useRef, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { useAddressesStore } from '@/stores/addresses.store';
import { HeaderBar } from '@/components/address/HeaderBar';
import { MapCard } from '@/components/address/MapCard';
import { SearchBox } from '@/components/address/SearchBox';
import { SuggestionList } from '@/components/address/SuggestionList';
import { SavedAddressesList } from '@/components/address/SavedAddressesList';
import { BottomCTA } from '@/components/address/BottomCTA';
import { CurrentLocationButton } from '@/components/address/CurrentLocationButton';
import { usePlaceSuggestions } from '@/hooks/usePlaceSuggestions';
import type { Suggestion } from '@/domain/types';

const MIN_CHARS = 4;

export default function AddressBook() {
  const { addresses, add, remove, setDefault } = useAddressesStore();
  const [justAddedId, setJustAddedId] = useState<string | undefined>(undefined);

  const [region, setRegion] = useState<Region>({
    latitude: 6.5244, // Lagos default
    longitude: 3.3792,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const [mapReady, setMapReady] = useState(false);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const searchInputRef = useRef<TextInput>(null);

  const { suggestions, searching, placesKeyMissing } = usePlaceSuggestions(
    search,
    { minChars: MIN_CHARS, debounceMs: 350 }
  );

  // iOS: auto center to user once
  useEffect(() => {
    if (Platform.OS === 'android') return;
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;
        if (status !== 'granted') {
          setLocationPermissionDenied(true);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;
        setRegion({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function dismissKeyboard() {
    Keyboard.dismiss();
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  }

  async function getCurrentLocation() {
    try {
      setGettingLocation(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermissionDenied(true);
        setLocationError('Location permission denied');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Center map
      setRegion({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Reverse geocode (best effort)
      let label = 'Current Location';
      let details = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
      try {
        const rev = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const p = rev?.[0];
        if (p) {
          label = p.name || p.street || label;
          details =
            [p.street, p.district, p.city, p.region, p.country]
              .filter(Boolean)
              .join(', ') || details;
        }
      } catch {}

      // Save -> updates list instantly
      const id = add({
        label,
        details,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        isDefault: false,
      });
      setJustAddedId(id);

      // Feedback
      if (Platform.OS === 'android') {
        ToastAndroid.show('Address added', ToastAndroid.SHORT);
      } else {
        Alert.alert('Address added');
      }
    } catch {
      setLocationError('Failed to get your location. Please try again.');
    } finally {
      setGettingLocation(false);
    }
  }

  async function acceptSuggestion(s: Suggestion) {
    try {
      setSearch('');
      setShowSuggestions(false);
      dismissKeyboard();

      const id = add({
        label: s.label,
        details: s.details,
        lat: s.lat,
        lng: s.lng,
        isDefault: false,
      });
      setJustAddedId(id);

      setRegion((r) => ({ ...r, latitude: s.lat, longitude: s.lng }));
      if (Platform.OS === 'android') {
        ToastAndroid.show('Address added', ToastAndroid.SHORT);
      } else {
        Alert.alert('Address added');
      }
    } catch {
      Alert.alert('Error', 'Failed to add address. Please try again.');
    }
  }

  // Manual typed add from SearchBox (no map pin)
  async function handleAddTypedFromBox(label: string) {
    const id = add({
      label,
      details: label,
      lat: region.latitude,
      lng: region.longitude,
      isDefault: false,
    });
    setJustAddedId(id);
    return true; // lets SearchBox show the toast/alert + clear input
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return addresses;
    const q = search.toLowerCase();
    return addresses.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        (a.details ?? '').toLowerCase().includes(q)
    );
  }, [addresses, search]);

  // Keep dropdown visibility in sync as user types or results change
  useEffect(() => {
    const canShow = search.trim().length >= MIN_CHARS && suggestions.length > 0;
    setShowSuggestions(canShow);
  }, [search, suggestions]);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className='flex-1 bg-white'>
        <HeaderBar />

        {/* Search directly under header; parent manages the dropdown */}
        <SearchBox
          search={search}
          setSearch={setSearch}
          onFocus={() =>
            setShowSuggestions(
              search.trim().length >= MIN_CHARS && suggestions.length > 0
            )
          }
          searching={searching}
          placesKeyMissing={placesKeyMissing}
          inputRef={searchInputRef}
          minChars={MIN_CHARS}
          onClear={() => {
            setSearch('');
            setShowSuggestions(false);
          }}
          onAddTyped={handleAddTypedFromBox}
        >
          {showSuggestions && suggestions.length > 0 && (
            <SuggestionList
              suggestions={suggestions}
              onPick={acceptSuggestion}
            />
          )}
        </SearchBox>

        {/* Map next, aligned within safe area */}
        <MapCard
          region={region}
          setRegion={setRegion}
          onMapReady={() => setMapReady(true)}
          mapReady={mapReady}
          locationPermissionDenied={locationPermissionDenied}
          addresses={addresses}
          onMapPress={dismissKeyboard}
        />

        {/* Sheet */}
        <ScrollView
          className='mx-4 mt-4 bg-white rounded-3xl shadow-lg border border-neutral-100 flex-1'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <View className='p-5'>
            <Text className='text-lg font-bold text-neutral-900 mb-4'>
              Select Delivery Address
            </Text>

            <CurrentLocationButton
              onPress={getCurrentLocation}
              loading={gettingLocation}
            />

            {locationError && (
              <View className='mb-3 p-3 bg-red-50 border border-red-200 rounded-xl'>
                <Text className='text-red-600 text-sm'>{locationError}</Text>
              </View>
            )}

            <SavedAddressesList
              addresses={addresses}
              filtered={filtered}
              search={search}
              setDefault={setDefault}
              onChoose={(id) => {
                setDefault(id);
                router.push('/address/coverage');
              }}
              onRemove={(id) => remove(id)}
              minChars={MIN_CHARS}
              onAddTyped={(label) => {
                const newId = add({
                  label,
                  details: label,
                  lat: region.latitude,
                  lng: region.longitude,
                  isDefault: false,
                });
                setJustAddedId(newId);
              }}
              highlightId={justAddedId}
            />
          </View>
        </ScrollView>

        <BottomCTA />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
