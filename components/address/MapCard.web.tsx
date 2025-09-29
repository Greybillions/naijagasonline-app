import React from 'react';
import { View, Text } from 'react-native';

// Re-declare minimal types so we don't import react-native-maps on web
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
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

export default function MapCard({ children }: Props) {
  return (
    <View
      className='mx-4 rounded-3xl overflow-hidden bg-neutral-200 border border-neutral-100 relative items-center justify-center'
      style={{ height: 280 }}
    >
      <Text className='text-neutral-600'>
        Map preview unavailable on web build.
      </Text>

      {children ? (
        <View className='absolute left-3 right-3 top-3'>{children}</View>
      ) : null}
    </View>
  );
}
