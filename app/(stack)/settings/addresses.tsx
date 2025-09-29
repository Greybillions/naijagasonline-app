import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddressesStore } from '@/stores/addresses.store';

export default function Addresses() {
  const { addresses, add, remove, setDefault, getDefault } = useAddressesStore(
    (s) => ({
      addresses: s.addresses,
      add: s.add,
      remove: s.remove,
      setDefault: s.setDefault,
      getDefault: s.getDefault,
    })
  );

  const [label, setLabel] = useState('Home');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');

  function onAdd() {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return;
    const isFirst = addresses.length === 0;
    add({ label, lat: latNum, lng: lngNum, isDefault: isFirst });
    setLat('');
    setLng('');
  }

  const def = getDefault();

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='px-4 py-3 border-b border-neutral-200'>
        <Text className='text-xl font-extrabold text-emerald-900'>
          Addresses
        </Text>
        <Text className='text-neutral-500 mt-1'>
          Default: {def ? `${def.label}` : '—'}
        </Text>
      </View>

      {/* Add form */}
      <View className='p-4 gap-3'>
        <Text className='text-neutral-700 font-semibold'>Add New</Text>
        <TextInput
          placeholder='Label (Home, Office)'
          value={label}
          onChangeText={setLabel}
          className='border border-neutral-300 rounded-lg px-3 py-2'
        />
        <TextInput
          placeholder='Latitude'
          value={lat}
          onChangeText={setLat}
          keyboardType='numbers-and-punctuation'
          className='border border-neutral-300 rounded-lg px-3 py-2'
        />
        <TextInput
          placeholder='Longitude'
          value={lng}
          onChangeText={setLng}
          keyboardType='numbers-and-punctuation'
          className='border border-neutral-300 rounded-lg px-3 py-2'
        />
        <Pressable
          onPress={onAdd}
          className='bg-emerald-900 rounded-xl h-11 items-center justify-center'
        >
          <Text className='text-white font-semibold'>Save Address</Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={addresses}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View className='border border-neutral-200 rounded-xl p-3'>
            <Text className='font-bold text-neutral-900'>
              {item.label} {item.isDefault ? '⭐' : ''}
            </Text>
            <Text className='text-neutral-600 mt-1'>
              {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
            </Text>
            <View className='flex-row gap-3 mt-3'>
              {!item.isDefault && (
                <Pressable
                  onPress={() => setDefault(item.id)}
                  className='px-3 py-2 rounded-lg bg-emerald-100'
                >
                  <Text className='text-emerald-900 font-semibold'>
                    Make Default
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => remove(item.id)}
                className='px-3 py-2 rounded-lg bg-red-100'
              >
                <Text className='text-red-700 font-semibold'>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
