import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type SectionCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
};

export function SectionCard({
  children,
  style,
  backgroundColor,
  borderColor,
}: SectionCardProps) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: backgroundColor ?? '#EFEFEF', borderColor: borderColor ?? '#E2E2E2' },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
});
