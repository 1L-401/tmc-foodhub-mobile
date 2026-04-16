import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type PolicyItemVariant = 'default' | 'sub-card' | 'bullet';

type PolicyItemProps = {
  title: string;
  description?: string;
  variant?: PolicyItemVariant;
};

export function PolicyItem({
  title,
  description,
  variant = 'default',
}: PolicyItemProps) {
  if (variant === 'bullet') {
    return (
      <View style={styles.bulletRow}>
        <View style={styles.bulletDot} />
        <Text style={styles.bulletText}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={variant === 'sub-card' ? styles.subCard : styles.defaultWrap}>
      <Text style={styles.itemTitle}>{title}</Text>
      {description ? <Text style={styles.itemDescription}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultWrap: {
    marginTop: 10,
  },
  subCard: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#FAFAFA',
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  itemDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: '#666666',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    paddingRight: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#AC1D10',
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2B2B2B',
    lineHeight: 20,
  },
});