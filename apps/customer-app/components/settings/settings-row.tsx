import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IndicatorType = 'chevron' | 'external' | 'none';

type SettingsRowProps = {
  icon: IconName;
  label: string;
  value?: string;
  statusLabel?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  indicator?: IndicatorType;
  showDivider?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  backgroundColor?: string;
  dividerColor?: string;
  iconColor?: string;
  labelColor?: string;
  valueColor?: string;
  indicatorColor?: string;
  statusLabelColor?: string;
  valueTextStyle?: StyleProp<TextStyle>;
};

const INDICATOR_ICON: Record<Exclude<IndicatorType, 'none'>, IconName> = {
  chevron: 'chevron-right',
  external: 'open-in-new',
};

export function SettingsRow({
  icon,
  label,
  value,
  statusLabel,
  onPress,
  trailing,
  indicator,
  showDivider = false,
  disabled = false,
  destructive = false,
  backgroundColor,
  dividerColor,
  iconColor,
  labelColor,
  valueColor,
  indicatorColor,
  statusLabelColor,
  valueTextStyle,
}: SettingsRowProps) {
  const resolvedIndicator = indicator ?? (trailing ? 'none' : 'chevron');
  const isInteractive = Boolean(onPress);
  const resolvedBackgroundColor = backgroundColor ?? '#EFEFEF';
  const resolvedDividerColor = dividerColor ?? '#D9D9D9';
  const resolvedIconColor = iconColor ?? (destructive ? '#E21B0E' : '#4A4A4A');
  const resolvedLabelColor = labelColor ?? (destructive ? '#E21B0E' : '#2B2B2B');
  const resolvedValueColor = valueColor ?? (destructive ? '#E21B0E' : '#6D6D6D');
  const resolvedIndicatorColor = indicatorColor ?? (destructive ? '#E21B0E' : '#5C5C5C');
  const resolvedStatusLabelColor = statusLabelColor ?? '#D97D19';

  const fallbackTrailing = value || statusLabel
    ? (
      <View style={styles.metaWrap}>
        {value ? (
          <Text
            style={[styles.value, { color: resolvedValueColor }, valueTextStyle]}
            numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {statusLabel ? (
          <Text style={[styles.statusLabel, { color: resolvedStatusLabelColor }]}>
            {statusLabel}
          </Text>
        ) : null}
      </View>
      )
    : null;

  const resolvedTrailing = trailing ?? fallbackTrailing;

  const rowContent = (
    <>
      <View style={styles.leftGroup}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={icon} size={20} color={resolvedIconColor} />
        </View>
        <Text style={[styles.label, { color: resolvedLabelColor }]}>{label}</Text>
      </View>

      <View style={styles.rightGroup}>
        {resolvedTrailing}
        {resolvedIndicator !== 'none' ? (
          <MaterialCommunityIcons
            name={INDICATOR_ICON[resolvedIndicator]}
            size={20}
            color={resolvedIndicatorColor}
          />
        ) : null}
      </View>
    </>
  );

  const rowStyle = [
    styles.row,
    { backgroundColor: resolvedBackgroundColor },
    showDivider && styles.rowWithDivider,
    showDivider && { borderBottomColor: resolvedDividerColor },
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
    flexShrink: 1,
  },
  metaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6D6D6D',
    maxWidth: 176,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97D19',
  },
});