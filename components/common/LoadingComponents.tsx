// ui/Loading.tsx
import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Animated,
  Dimensions,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/** Allow only valid percentage strings like '100%', '70%', etc. */
type Percent = `${number}%`;

/* ===================== 1) SKELETONS ===================== */
type SkeletonBoxProps = {
  width?: number | Percent;
  height?: number | Percent;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
  style,
}) => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) loop();
      });
    };
    loop();
    return () => {
      mounted = false;
      opacity.stopAnimation();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#e5e7eb', opacity },
        style,
      ]}
      className={className}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <View className='bg-white rounded-2xl p-4 mb-3 border border-neutral-100'>
    <View className='flex-row items-center gap-4'>
      <SkeletonBox width={60} height={60} borderRadius={12} />
      <View className='flex-1'>
        <SkeletonBox width='70%' height={18} className='mb-2' />
        <SkeletonBox width='50%' height={14} className='mb-3' />
        <SkeletonBox width='40%' height={16} />
      </View>
    </View>
  </View>
);

export const AddressCardSkeleton: React.FC = () => (
  <View className='bg-white rounded-2xl p-4 mb-2 border border-neutral-100'>
    <View className='flex-row items-center gap-3'>
      <SkeletonBox width={40} height={40} borderRadius={20} />
      <View className='flex-1'>
        <SkeletonBox width='60%' height={16} className='mb-2' />
        <SkeletonBox width='80%' height={14} />
      </View>
      <SkeletonBox width={60} height={32} borderRadius={8} />
    </View>
  </View>
);

/* ===================== 2) BUTTON (with loading) ===================== */
type LoadingButtonProps = PressableProps & {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'default' | 'large';
  className?: string;
  children: React.ReactNode;
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onPress,
  loading = false,
  disabled,
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  ...props
}) => {
  const variants: Record<NonNullable<LoadingButtonProps['variant']>, string> = {
    primary: 'bg-emerald-600 active:bg-emerald-700',
    secondary: 'bg-neutral-100 active:bg-neutral-200',
    danger: 'bg-red-600 active:bg-red-700',
  };

  const textColors: Record<
    NonNullable<LoadingButtonProps['variant']>,
    string
  > = {
    primary: 'text-white',
    secondary: 'text-neutral-800',
    danger: 'text-white',
  };

  const sizes: Record<NonNullable<LoadingButtonProps['size']>, string> = {
    small: 'h-10 px-4',
    default: 'h-12 px-6',
    large: 'h-14 px-8',
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      disabled={isDisabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-60' : ''}
        rounded-2xl flex-row items-center justify-center
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <View className='flex-row items-center gap-2'>
          <ActivityIndicator
            size='small'
            color={variant === 'secondary' ? '#374151' : '#ffffff'}
          />
          <Text className={`font-semibold ${textColors[variant]}`}>
            Loading...
          </Text>
        </View>
      ) : (
        <Text className={`font-semibold ${textColors[variant]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
};

/* ===================== 3) FULL PAGE LOADER ===================== */
export const PageLoader: React.FC<{ message?: string; showLogo?: boolean }> = ({
  message = 'Loading...',
  showLogo = false,
}) => (
  <View className='flex-1 bg-white items-center justify-center px-8'>
    {showLogo && (
      <View className='w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-6'>
        <Ionicons name='flame' size={32} color='#059669' />
      </View>
    )}
    <ActivityIndicator size='large' color='#059669' />
    <Text className='text-neutral-600 mt-4 text-center text-base'>
      {message}
    </Text>
  </View>
);

/* ===================== 4) INLINE LOADER ===================== */
export const InlineLoader: React.FC<{
  message?: string;
  size?: 'small' | 'large';
}> = ({ message = 'Loading...', size = 'small' }) => (
  <View className='flex-row items-center justify-center py-4'>
    <ActivityIndicator size={size} color='#059669' />
    <Text className='text-neutral-600 ml-3 text-sm'>{message}</Text>
  </View>
);

/* ===================== 5) PULL TO REFRESH ===================== */
export const PullToRefreshLoader: React.FC = () => (
  <View className='items-center py-6'>
    <View className='w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mb-2'>
      <ActivityIndicator size='small' color='#059669' />
    </View>
    <Text className='text-neutral-500 text-sm'>Refreshing...</Text>
  </View>
);

/* ===================== 6) EMPTY STATE ===================== */
type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  loading?: boolean;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'cube-outline',
  title,
  description,
  actionText,
  onAction,
  loading = false,
}) => (
  <View className='flex-1 items-center justify-center px-8 py-12'>
    <View className='w-20 h-20 rounded-full bg-neutral-100 items-center justify-center mb-6'>
      <Ionicons name={icon} size={40} color='#9ca3af' />
    </View>

    <Text className='text-xl font-bold text-neutral-900 text-center mb-2'>
      {title}
    </Text>

    {!!description && (
      <Text className='text-neutral-600 text-center mb-8 leading-6'>
        {description}
      </Text>
    )}

    {actionText && onAction && (
      <LoadingButton
        onPress={onAction}
        loading={loading}
        className='min-w-[120px]'
      >
        {actionText}
      </LoadingButton>
    )}
  </View>
);

/* ===================== 7) SHIMMER (alt skeleton) ===================== */
type ShimmerViewProps = {
  width?: number | Percent;
  height?: number | Percent;
  borderRadius?: number;
};

export const ShimmerView: React.FC<ShimmerViewProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
}) => {
  const screenW = Dimensions.get('window').width;

  // convert percentages to px for animation travel
  const toPx = (w: number | Percent) =>
    typeof w === 'number' ? w : (screenW * parseFloat(w)) / 100;

  const travel = Math.max(toPx(width), 240);
  const translateX = React.useRef(new Animated.Value(-travel)).current;

  React.useEffect(() => {
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      translateX.setValue(-travel);
      Animated.timing(translateX, {
        toValue: travel,
        duration: 1500,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) loop();
      });
    };
    loop();
    return () => {
      mounted = false;
      translateX.stopAnimation();
    };
  }, [travel, translateX]);

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          width: '30%',
          height: '100%',
          backgroundColor: '#ffffff',
          opacity: 0.7,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

/* ===================== 8) MAP LOADER ===================== */
export const MapLoader: React.FC<{ message?: string }> = ({
  message = 'Loading map...',
}) => (
  <View className='flex-1 bg-neutral-200 items-center justify-center'>
    <View className='bg-white rounded-2xl p-6 items-center shadow-lg'>
      <View className='w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mb-4'>
        <Ionicons name='map' size={24} color='#059669' />
      </View>
      <ActivityIndicator size='large' color='#059669' />
      <Text className='text-neutral-700 mt-3 font-medium'>{message}</Text>
    </View>
  </View>
);

/* ===================== 9) SEARCH LOADER ===================== */
export const SearchLoader: React.FC = () => (
  <View className='flex-row items-center px-4 py-3 bg-white border-t border-neutral-200'>
    <View className='w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-3'>
      <ActivityIndicator size='small' color='#059669' />
    </View>
    <Text className='text-emerald-600 font-medium'>Searching...</Text>
  </View>
);

/* ===================== 10) LIST ITEM LOADERS ===================== */
export const CartItemLoader: React.FC = () => (
  <View className='bg-white rounded-2xl p-4 mb-2 border border-neutral-100'>
    <View className='flex-row items-center gap-4'>
      <SkeletonBox width={50} height={50} borderRadius={8} />
      <View className='flex-1'>
        <SkeletonBox width='60%' height={16} className='mb-2' />
        <SkeletonBox width='40%' height={14} />
      </View>
      <View className='items-end'>
        <SkeletonBox width={60} height={16} className='mb-2' />
        <SkeletonBox width={40} height={14} />
      </View>
    </View>
  </View>
);

export const OrderItemLoader: React.FC = () => (
  <View className='bg-white rounded-2xl p-4 mb-3 border border-neutral-100'>
    <View className='flex-row items-start justify-between mb-3'>
      <View className='flex-1'>
        <SkeletonBox width='70%' height={18} className='mb-2' />
        <SkeletonBox width='50%' height={14} />
      </View>
      <SkeletonBox width={80} height={24} borderRadius={12} />
    </View>
    <View className='border-t border-neutral-100 pt-3'>
      <SkeletonBox width='40%' height={14} />
    </View>
  </View>
);
