import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import { triggerHaptic } from '../utils/haptics';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  activeScale?: number;
  haptic?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'selection' | 'success';
  disabled?: boolean;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  style,
  contentStyle,
  activeScale = 0.96,
  haptic = true,
  hapticStyle = 'light',
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: activeScale,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

    if (haptic) {
      triggerHaptic(hapticStyle);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={style}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            width: '100%',
          },
          contentStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
