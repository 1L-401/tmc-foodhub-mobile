import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TmcLogo } from '@/components/tmc-logo';

const STATS = [
  {
    label: 'Restaurants',
    value: '100+',
  },
  {
    label: 'Fast Delivery',
    value: '24/7',
  },
  {
    label: 'Hot Deals',
    value: 'Daily',
  },
] as const;

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/main_hero.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.topCard}>
            <View style={styles.brandRow}>
              <TmcLogo width={64} height={64} />
              <View style={styles.brandCopy}>
                <Text style={styles.eyebrow}>TMC Foodhub</Text>
                <Text style={styles.brandTitle}>Food delivered with local flavor.</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {STATS.map((item) => (
                <View key={item.label} style={styles.statCard}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomPanel}>
            <Text style={styles.sectionLabel}>Ready to order</Text>
            <Text style={styles.heading}>Browse nearby picks and start your next meal.</Text>

            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color="#F3B321" />
              </View>
              <Text style={styles.highlightText}>Fresh local choices, promos, and live order updates.</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#160D09',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 13, 9, 0.62)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topCard: {
    marginTop: 8,
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(17, 11, 8, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#F3B321',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  bottomPanel: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: 'rgba(172, 29, 16, 0.88)',
  },
  sectionLabel: {
    color: 'rgba(255, 244, 230, 0.82)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heading: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  highlightText: {
    flex: 1,
    color: '#FFF4E6',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
});
