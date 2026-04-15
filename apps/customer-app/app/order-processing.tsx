import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '@/components/cart';

type ProcessingStage = 'contacting-kitchen' | 'kitchen-confirmed' | 'preparing';

interface StageState {
  progress: number;
  title: string;
  subtitle: string;
  kitchenTitle: string;
  kitchenTag: 'WORKING' | 'VERIFIED';
  kitchenTagColor: string;
}

const STAGE_STATES: Record<ProcessingStage, StageState> = {
  'contacting-kitchen': {
    progress: 0.55,
    title: 'Placing your order...',
    subtitle: "We're curating the finest ingredients and notifying the chef at Patty Shack.",
    kitchenTitle: 'Contacting Kitchen',
    kitchenTag: 'WORKING',
    kitchenTagColor: '#AC1D10',
  },
  'kitchen-confirmed': {
    progress: 0.8,
    title: 'Order received by kitchen',
    subtitle: 'Great news. The kitchen has acknowledged your order and is lining up preparation.',
    kitchenTitle: 'Kitchen Confirmed',
    kitchenTag: 'VERIFIED',
    kitchenTagColor: '#AC1D10',
  },
  preparing: {
    progress: 1,
    title: 'Order now in preparation',
    subtitle: 'Our chefs are now preparing your meal. We will keep you updated on the next steps.',
    kitchenTitle: 'Preparing Order',
    kitchenTag: 'VERIFIED',
    kitchenTagColor: '#AC1D10',
  },
};

export default function OrderProcessingScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const { activeOrder, clearActiveOrder } = useCart();
  const [stage, setStage] = useState<ProcessingStage>('contacting-kitchen');
  const progressAnim = useRef(new Animated.Value(STAGE_STATES['contacting-kitchen'].progress)).current;
  const timeoutRefOne = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRefTwo = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedOrderId = params.orderId ?? activeOrder?.id ?? '';

  useEffect(() => {
    if (!resolvedOrderId) {
      router.replace('/(tabs)/cart');
    }
  }, [resolvedOrderId]);

  useEffect(() => {
    timeoutRefOne.current = setTimeout(() => {
      setStage('kitchen-confirmed');
    }, 2500);

    timeoutRefTwo.current = setTimeout(() => {
      setStage('preparing');
    }, 5200);

    return () => {
      if (timeoutRefOne.current) {
        clearTimeout(timeoutRefOne.current);
      }

      if (timeoutRefTwo.current) {
        clearTimeout(timeoutRefTwo.current);
      }

      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (stage !== 'preparing' || !resolvedOrderId) {
      return;
    }

    completionTimeoutRef.current = setTimeout(() => {
      router.replace({
        pathname: '/order-tracking/[id]',
        params: { id: resolvedOrderId },
      });
    }, 1100);

    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [resolvedOrderId, stage]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: STAGE_STATES[stage].progress,
      duration: 650,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, stage]);

  const stageState = STAGE_STATES[stage];

  const progressWidth = useMemo(
    () =>
      progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      }),
    [progressAnim]
  );

  const clearTimers = () => {
    if (timeoutRefOne.current) {
      clearTimeout(timeoutRefOne.current);
    }

    if (timeoutRefTwo.current) {
      clearTimeout(timeoutRefTwo.current);
    }

    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert('Cancel order?', 'Are you sure you want to cancel this order while processing?', [
      {
        text: 'Keep Order',
        style: 'cancel',
      },
      {
        text: 'Cancel Order',
        style: 'destructive',
        onPress: () => {
          clearTimers();
          clearActiveOrder();
          router.replace('/(tabs)/cart');
        },
      },
    ]);
  };

  if (!resolvedOrderId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.contentWrap}>
          <View style={styles.topIconWrap}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={18}
              color="#D7962F"
            />
          </View>

          <Text style={styles.title}>{stageState.title}</Text>
          <Text style={styles.subtitle}>{stageState.subtitle}</Text>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusCard}>
              <View style={styles.tagRow}>
                <View style={styles.tagDot} />
                <Text style={styles.tagText}>VERIFIED</Text>
              </View>
              <Text style={styles.cardTitle}>Payment Confirmed</Text>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.tagRow}>
                <View style={[styles.tagDot, { backgroundColor: stageState.kitchenTagColor }]} />
                <Text style={styles.tagText}>{stageState.kitchenTag}</Text>
              </View>
              <Text style={styles.cardTitle}>{stageState.kitchenTitle}</Text>
              <MaterialCommunityIcons
                name="hand-wave-outline"
                size={26}
                color="#E9D6CC"
                style={styles.cardWatermark}
              />
            </View>
          </View>

          <Text style={styles.helperText}>Next: kitchen prep and cooking updates will follow.</Text>
        </View>

        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelPressed,
            ]}
            onPress={handleCancelOrder}>
            <Text style={styles.cancelText}>Cancel Order</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentWrap: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  topIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2E8DA',
  },
  title: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13,
    color: '#6F6F6F',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 330,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E2E2E2',
    marginTop: 22,
    overflow: 'hidden',
    maxWidth: 350,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#AC1D10',
  },
  statusRow: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
    maxWidth: 350,
  },
  statusCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 88,
    position: 'relative',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AC1D10',
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#AC1D10',
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 28,
    maxWidth: 130,
  },
  cardWatermark: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: '#868686',
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 14,
    paddingBottom: 18,
    paddingTop: 12,
  },
  cancelButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    backgroundColor: '#E9E9E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2A2A2A',
  },
  cancelPressed: {
    opacity: 0.78,
  },
});
