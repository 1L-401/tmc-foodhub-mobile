import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

/**
 * iOS-style toggle switch that renders identically on Android and iOS.
 * Pill-shaped track with a smooth sliding white thumb.
 */
export function CustomToggle({
  value,
  onValueChange,
  activeColor = '#AC1D10',
  size = 'normal',
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
  activeColor?: string;
  size?: 'small' | 'normal';
}) {
  const animVal = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const isSmall = size === 'small';
  const trackW = isSmall ? 40 : 48;
  const trackH = isSmall ? 22 : 26;
  const thumbSize = isSmall ? 18 : 22;
  const thumbMargin = 2;

  const trackBg = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0E0E0', activeColor],
  });

  const thumbTranslate = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [thumbMargin, trackW - thumbSize - thumbMargin],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View
        style={{
          width: trackW,
          height: trackH,
          borderRadius: trackH / 2,
          backgroundColor: trackBg,
          justifyContent: 'center',
        }}>
        <Animated.View
          style={{
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: '#FFF',
            transform: [{ translateX: thumbTranslate }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
