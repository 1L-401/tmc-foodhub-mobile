import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IndicatorType = 'chevron' | 'external' | 'none';

type SettingsRowProps = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  indicator?: IndicatorType;
  showDivider?: boolean;
  disabled?: boolean;
};

const INDICATOR_ICON: Record<Exclude<IndicatorType, 'none'>, IconName> = {
  chevron: 'chevron-right',
  external: 'open-in-new',
};

export function SettingsRow({
  icon,
  label,
  onPress,
  trailing,
  indicator,
  showDivider = false,
  disabled = false,
}: SettingsRowProps) {
  const resolvedIndicator = indicator ?? (trailing ? 'none' : 'chevron');
  const isInteractive = Boolean(onPress);

  const rowContent = (
    <>
      <View style={styles.leftGroup}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={icon} size={20} color="#4A4A4A" />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.rightGroup}>
        {trailing}
        {resolvedIndicator !== 'none' ? (
          <MaterialCommunityIcons
            name={INDICATOR_ICON[resolvedIndicator]}
            size={20}
            color="#5C5C5C"
          />
        ) : null}
      </View>
    </>
  );

  const rowStyle = [
    styles.row,
    showDivider && styles.rowWithDivider,
    disabled && styles.rowDisabled,
  ];

  if (!isInteractive) {
    return <View style={rowStyle}>{rowContent}</View>;
  }

  return (
    <Pressable
      style={({ pressed }) => [rowStyle, pressed && styles.rowPressed]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button">
      {rowContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#EFEFEF',
  },
  rowWithDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  rowPressed: {
    opacity: 0.78,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2B2B2B',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});