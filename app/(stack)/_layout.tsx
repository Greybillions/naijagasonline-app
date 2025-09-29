// app/(stack)/_layout.tsx
import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // you’re using your own headers
        animation: 'slide_from_right',
      }}
    />
  );
}
