import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';



type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
};

const colors = {
  label: '#1A1A1A',
  text: '#1A1A1A',
  border: '#E5E5E5',
  inputBackground: '#FAFAFA',
  placeholder: '#A0A0A0',
  error: '#C83B2D',
};

function AuthInputComponent({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...textInputProps
}: AuthInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.label }]}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.inputBackground,
          },
        ]}>
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          {...textInputProps}
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.placeholder}
        />

        {rightIcon ? (
          <Pressable hitSlop={8} onPress={onRightIconPress} style={styles.rightIconButton}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

export const AuthInput = memo(AuthInputComponent);

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  rightIconButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
  },
});
