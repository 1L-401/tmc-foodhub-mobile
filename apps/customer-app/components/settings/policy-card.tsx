import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type PolicyCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PolicyCard({ children, style }: PolicyCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});