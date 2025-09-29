import React from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';

type Addr = {
  id: string;
  label: string;
  details?: string | null;
  lat: number;
  lng: number;
  isDefault?: boolean;
};

type Props = {
  region: Region;
  setRegion: (r: Region) => void;
  onMapReady: () => void;
  mapReady: boolean;
  locationPermissionDenied: boolean;
  addresses: Addr[];
  onMapPress?: () => void;
  children?: React.ReactNode;
};

export default function MapCard({
  region,
  setRegion,
  onMapReady,
  mapReady,
  locationPermissionDenied,
  addresses,
  onMapPress,
  children,
}: Props) {
  return (
    <View
      className='mx-4 rounded-3xl overflow-hidden bg-neutral-200 shadow-lg relative'
      style={{ height: 280 }}
    >
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={setRegion}
        onMapReady={onMapReady}
        showsUserLocation={!locationPermissionDenied}
        showsMyLocationButton
        onPress={onMapPress}
        loadingEnabled
        loadingIndicatorColor='#059669'
        loadingBackgroundColor='#f3f4f6'
        mapType='standard'
        showsCompass={false}
        showsScale
        showsBuildings
        showsTraffic={false}
        showsIndoors
        rotateEnabled
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title='Selected Location'
          description={'Tap "Select Map Location" to use this spot'}
          pinColor='#059669'
        />
        {addresses.map((addr) => (
          <Marker
            key={addr.id}
            coordinate={{ latitude: addr.lat, longitude: addr.lng }}
            title={addr.label}
            description={addr.details ?? undefined}
            pinColor={addr.isDefault ? '#0C6B4A' : '#6B7280'}
          />
        ))}
      </MapView>

      {children ? (
        <View className='absolute left-3 right-3 top-3'>{children}</View>
      ) : null}

      {!mapReady && (
        <View className='absolute inset-0 bg-neutral-200 items-center justify-center'>
          <ActivityIndicator size='large' color='#059669' />
          <Text className='text-neutral-600 mt-2'>Loading map...</Text>
        </View>
      )}
    </View>
  );
}
