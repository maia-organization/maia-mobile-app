import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, type } from '../theme';

export function BrandButton({
  accessibilityLabel,
  children,
  compact = false,
  disabled = false,
  onPress,
  testID,
  variant = 'primary'
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const animateTo = (toValue) => {
    Animated.spring(scale, {
      damping: 14,
      mass: 0.7,
      stiffness: 220,
      toValue,
      useNativeDriver: true
    }).start();
  };

  return (
    <Animated.View
      style={[styles.wrapper, compact && styles.wrapperCompact, { transform: [{ scale }] }]}
    >
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPressIn={() => {
          setIsPressed(true);
          animateTo(0.97);
        }}
        onPressOut={() => {
          setIsPressed(false);
          animateTo(1);
        }}
        onPress={onPress}
        testID={testID}
        style={[
          styles.button,
          variant === 'primary' && styles.primary,
          variant === 'secondary' && styles.secondary,
          variant === 'ghost' && styles.ghost,
          isPressed && variant === 'primary' && styles.primaryPressed,
          isPressed && variant === 'secondary' && styles.secondaryPressed,
          isPressed && variant === 'ghost' && styles.ghostPressed,
          disabled && styles.disabled
        ]}
      >
        <Text
          style={[
            styles.label,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'ghost' && styles.ghostLabel,
            disabled && styles.disabledLabel
          ]}
        >
          {children}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 14
  },
  label: {
    ...type.action,
    color: colors.white,
    textAlign: 'center'
  },
  primary: {
    backgroundColor: colors.rose
  },
  primaryPressed: {
    backgroundColor: colors.roseDeep
  },
  secondary: {
    backgroundColor: colors.honey
  },
  secondaryLabel: {
    color: colors.ink
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.honey,
    borderWidth: 1
  },
  ghostLabel: {
    color: colors.white
  },
  disabled: {
    opacity: 0.42
  },
  disabledLabel: {
    color: colors.muted
  },
  ghostPressed: {
    backgroundColor: colors.honeySoft
  },
  secondaryPressed: {
    opacity: 0.78
  },
  wrapper: {
    alignSelf: 'stretch'
  },
  wrapperCompact: {
    alignSelf: 'auto'
  }
});
