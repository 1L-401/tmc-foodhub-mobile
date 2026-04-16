import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingsPlaceholderScreenProps = {
  title: string;
  description: string;
};

export function SettingsPlaceholderScreen({
  title,
  description,
}: SettingsPlaceholderScreenProps) {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
            </Pressable>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="hammer-wrench" size={22} color="#AC1D10" />
            </View>
            <Text style={styles.cardTitle}>Coming Soon</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  headerSpacer: {
    width: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    padding: 20,
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    textAlign: 'center',
  },
});