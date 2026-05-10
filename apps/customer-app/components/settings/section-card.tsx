import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, Text } from 'react-native';

type SectionCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  backgroundColor?: string;
  borderColor?: string;
};

export function SectionCard({
  children,
  style,
  title,
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
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      )}
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
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 0.5,
  },
});
