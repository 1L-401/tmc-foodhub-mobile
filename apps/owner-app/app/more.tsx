import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROFILE = {
  name: 'Juan Dela Cruz',
  role: 'Restaurant Owner',
  avatar: 'https://via.placeholder.com/80/E8E8E8/999?text=JD',
};

interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function MenuItem({ icon, label, onPress, rightElement }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [menuStyles.row, pressed && menuStyles.pressed]}
      onPress={onPress}>
      <MaterialCommunityIcons
        name={icon as any}
        size={20}
        color="#555"
      />
      <Text style={menuStyles.label}>{label}</Text>
      {rightElement && <View style={menuStyles.right}>{rightElement}</View>}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={menuStyles.sectionHeader}>{title}</Text>;
}

export default function MoreScreen() {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View
          entering={FadeInLeft.delay(50).duration(350)}
          style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={26}
              color="#1A1A1A"
            />
          </Pressable>
          <Text style={styles.headerTitle}>More</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          {/* Profile */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.profileCard}>
            <Image
              source={{ uri: PROFILE.avatar }}
              style={styles.profileAvatar}
            />
            <View>
              <Text style={styles.profileName}>{PROFILE.name}</Text>
              <Text style={styles.profileRole}>{PROFILE.role}</Text>
            </View>
          </Animated.View>

          <View style={styles.divider} />

          {/* General */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <MenuItem
              icon="store-outline"
              label="View Restaurant Profile"
            />
            <MenuItem
              icon="cog-outline"
              label="Account Settings"
            />
            <MenuItem
              icon="weather-night"
              label="Dark Mode"
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#E5E5E5', true: '#FCDCD8' }}
                  thumbColor={darkMode ? '#AC1D10' : '#FFFFFF'}
                />
              }
            />
          </Animated.View>

          <View style={styles.divider} />

          {/* Operations */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <SectionHeader title="Operations" />
            <MenuItem icon="view-dashboard-outline" label="Dashboard" />
            <MenuItem icon="clipboard-text-outline" label="Orders" />
            <MenuItem
              icon="package-variant-closed"
              label="Inventory"
              onPress={() => router.push('/inventory')}
            />
          </Animated.View>

          <View style={styles.divider} />

          {/* Menu */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <SectionHeader title="Menu" />
            <MenuItem icon="silverware-fork-knife" label="Menu" />
            <MenuItem icon="view-grid-outline" label="Categories" />
            <MenuItem icon="tag-outline" label="Promotions" />
          </Animated.View>

          <View style={styles.divider} />

          {/* Engagement */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <SectionHeader title="Engagement" />
            <MenuItem icon="star-outline" label="Reviews" />
          </Animated.View>

          <View style={styles.divider} />

          {/* Finance */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <SectionHeader title="Finance" />
            <MenuItem icon="chart-bar" label="Analytics" />
            <MenuItem icon="cash-multiple" label="Earnings" />
          </Animated.View>

          <View style={styles.divider} />

          {/* System */}
          <Animated.View entering={FadeInDown.delay(700).duration(400)}>
            <SectionHeader title="System" />
            <MenuItem icon="cog-outline" label="Settings" />
          </Animated.View>

          {/* Logout */}
          <Animated.View entering={FadeInDown.delay(800).duration(400)}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && styles.logoutPressed,
              ]}>
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color="#AC1D10"
              />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  headerSpacer: { width: 32 },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F0F0',
  },
  profileName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  profileRole: { fontSize: 13, color: '#999', marginTop: 2 },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#AC1D10',
  },
  logoutPressed: { opacity: 0.7 },
});

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  label: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  right: { marginLeft: 'auto' },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  pressed: { opacity: 0.6 },
});
