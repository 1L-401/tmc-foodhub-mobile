import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckoutSelectionItem } from '@/components/checkout';
import { apiClient } from '@/src/api/apiClient';
import { geocodeAddress, buildRouteStaticMapUrl } from '@/src/api/geocode';
import { applyLocalOrderStatus, setLocalOrderStatus } from '@/src/features/orders/local-order-status';

const TIMELINE_LABELS = [
  'Order Placed',
  'Order Confirmed',
  'Being Prepared',
  'Picked Up',
  'Delivered',
] as const;

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatTime(dateValue: Date) {
  return dateValue.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function normalizeOrderStatus(status: unknown) {
  return String(status ?? '').trim().toLowerCase();
}

async function cancelPendingOrder(orderId: string) {
  const attempts: { endpoint: string; options: RequestInit }[] = [
    {
      endpoint: `/orders/${orderId}/cancel`,
      options: { method: 'POST' },
    },
    {
      endpoint: `/orders/${orderId}`,
      options: {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Cancelled' }),
      },
    },
    {
      endpoint: `/orders/${orderId}/status`,
      options: {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Cancelled' }),
      },
    },
  ];

  let lastError: Error | null = null;

  for (const attempt of attempts) {
    try {
      await apiClient(attempt.endpoint, attempt.options);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Failed to cancel order.');
    }
  }

  throw lastError ?? new Error('Failed to cancel order.');
}

export default function OrderTrackingScreen() {
  const params = useLocalSearchParams<{ id?: string }>();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isItemsSheetOpen, setIsItemsSheetOpen] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [restaurantCoords, setRestaurantCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await apiClient<any[]>('/orders');
      if (response && response.length > 0) {
        const foundOrder = response.find(o => String(o.id) === params.id);
        if (foundOrder) {
          setOrder(applyLocalOrderStatus(foundOrder));
          
          if (!deliveryCoords && foundOrder.delivery_address) {
            geocodeAddress(foundOrder.delivery_address).then(coords => {
              if (coords) {
                setDeliveryCoords(coords);
                setRestaurantCoords({
                  latitude: coords.latitude + 0.015,
                  longitude: coords.longitude - 0.015,
                });
              }
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [deliveryCoords, params.id]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (isLoading && !order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ marginTop: 12, color: '#888' }}>Loading tracking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.notFoundWrap}>
          <MaterialCommunityIcons
            name="clipboard-alert-outline"
            size={48}
            color="#B5B5B5"
          />
          <Text style={styles.notFoundTitle}>Order not available</Text>
          <Text style={styles.notFoundSubtitle}>
            We could not find this active order in your current session.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.notFoundButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.notFoundButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const normalizedStatus = normalizeOrderStatus(order.status);

  let statusIndex = 0;
  if (normalizedStatus === 'order confirmed') statusIndex = 1;
  else if (normalizedStatus === 'preparing') statusIndex = 2;
  else if (normalizedStatus === 'out for delivery') statusIndex = 3;
  else if (normalizedStatus === 'delivered') statusIndex = 4;
  else if (normalizedStatus.includes('cancel')) statusIndex = -1;

  const canCancelOrder = normalizedStatus === 'pending';
  const isCancelledOrder = normalizedStatus.includes('cancel');

  const placedAtDate = new Date(order.created_at);
  const stepTimes = [0, 5, 15, 25, 40].map(
    (offsetMinutes) => new Date(placedAtDate.getTime() + offsetMinutes * 60000)
  );

  const etaText =
    statusIndex >= 4 ? 'Arrived' : statusIndex >= 3 ? '10-18 mins' : '25-35 mins';
  const deliveryProgress = statusIndex === -1 ? 0 : Math.min(1, (statusIndex + 1) / TIMELINE_LABELS.length);

  const timelineRows = TIMELINE_LABELS.map((label, index) => {
    const state =
      index < statusIndex ? 'completed' : index === statusIndex ? 'active' : 'pending';
    const timestamp = index <= statusIndex ? formatTime(stepTimes[index]) : 'Pending';

    return {
      label,
      state,
      timestamp,
    };
  });

  const handleCancelOrder = () => {
    if (!canCancelOrder || isCancelling) {
      return;
    }

    setIsCancelModalOpen(true);
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/orders/history');
  };

  const confirmCancelOrder = async () => {
    try {
      setIsCancelling(true);
      setLocalOrderStatus(String(order.id), 'Cancelled');
      setOrder((currentOrder: any) => currentOrder ? { ...currentOrder, status: 'Cancelled' } : currentOrder);
      setIsCancelModalOpen(false);
      await cancelPendingOrder(String(order.id));
    } catch (error) {
      console.error('Cancel order request failed:', error);
    } finally {
      setIsCancelling(false);
      router.replace('/orders/history');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {isCancelledOrder ? (
            <View style={styles.cancelledHero}>
              <Pressable
                style={({ pressed }) => [styles.backButtonInline, pressed && styles.pressed]}
                onPress={handleBackPress}>
                <MaterialCommunityIcons name="chevron-left" size={24} color="#1A1A1A" />
              </Pressable>

              <View style={styles.cancelledIconWrap}>
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.cancelledHeroTitle}>{`Order #${order.id} was cancelled`}</Text>
              <Text style={styles.cancelledHeroSubtitle}>
                This order is no longer being processed. You can still review the order details below.
              </Text>
            </View>
          ) : (
            <View style={styles.mapHero}>
              {restaurantCoords && deliveryCoords ? (
                <Image
                  source={{
                    uri: buildRouteStaticMapUrl(
                      restaurantCoords.latitude,
                      restaurantCoords.longitude,
                      deliveryCoords.latitude,
                      deliveryCoords.longitude,
                      700,
                      420
                    ),
                  }}
                  style={styles.mapImage}
                />
              ) : (
                <Image
                  source={{
                    uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v11/static/121.0437,14.6349,13,0/700x420@2x?access_token=pk.placeholder',
                  }}
                  style={styles.mapImage}
                  defaultSource={{
                    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                  }}
                />
              )}

              <View style={styles.mapOverlay} />

              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                onPress={handleBackPress}>
                <MaterialCommunityIcons name="chevron-left" size={24} color="#1A1A1A" />
              </Pressable>

              <View style={styles.arrivalCard}>
                <Text style={styles.arrivalOverline}>ARRIVING IN</Text>
                <Text style={styles.arrivalValue}>{etaText}</Text>
                <View style={styles.arrivalProgressTrack}>
                  <View
                    style={[
                      styles.arrivalProgressFill,
                      { width: `${deliveryProgress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.arrivalCaption}>
                  {statusIndex >= 4
                    ? 'Your order has been delivered. Enjoy your meal.'
                    : 'Your order is being prepared with care.'}
                </Text>
              </View>
            </View>
          )}

          {!isCancelledOrder ? (
            <View style={styles.successWrap}>
              <View style={styles.successIconWrap}>
                <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>{`Order #${order.id} is on its way!`}</Text>
              <Text style={styles.successSubtitle}>
                Get ready for a curated culinary experience delivered to your doorstep.
              </Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.orderCardRow}>
              <View style={styles.orderCardLeft}>
                <View style={styles.foodThumbWrap}>
                  <MaterialCommunityIcons name="food" size={15} color="#AC1D10" />
                </View>
                <View>
                  <Text style={styles.orderCardTitle}>{`Order #${order.id}`}</Text>
                  <Text style={styles.orderCardSub}>{`${order.items.length} item${order.items.length === 1 ? '' : 's'} from your cart`}</Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [styles.viewItemsButton, pressed && styles.pressed]}
                onPress={() => setIsItemsSheetOpen(true)}>
                <Text style={styles.viewItemsText}>View Items</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <MaterialCommunityIcons name="home-outline" size={16} color="#AC1D10" />
              </View>
              <View style={styles.infoCopyWrap}>
                <Text style={styles.infoTitle}>Delivery Address</Text>
                <Text style={styles.infoSub}>{order.delivery_address || 'Home'}</Text>
              </View>
            </View>
          </View>

          {!isCancelledOrder ? (
            <>
              <View style={styles.card}>
                <View style={styles.riderRow}>
                  <View style={styles.riderAvatarWrap}>
                    <MaterialCommunityIcons name="account" size={22} color="#3A3A3A" />
                  </View>
                  <View style={styles.riderCopyWrap}>
                    <Text style={styles.riderName}>Ricardo Gomez</Text>
                    <Text style={styles.riderSub}>Your delivery partner</Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [styles.contactButton, pressed && styles.pressed]}
                    onPress={() => Alert.alert('Message rider', 'Messaging is not connected yet.')}>
                    <MaterialCommunityIcons name="message-outline" size={18} color="#666666" />
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.contactButton,
                      styles.callButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => Alert.alert('Call rider', 'Calling is not connected yet.')}>
                    <MaterialCommunityIcons name="phone-outline" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Order Status</Text>

              <View style={styles.timelineCard}>
                {timelineRows.map((step, index) => {
                  const isCompleted = step.state === 'completed';
                  const isActive = step.state === 'active';
                  
                  let iconName: any = 'clock-outline';
                  let iconColor = '#8E8E8E';

                  if (isCompleted) {
                    iconName = 'check-circle';
                    iconColor = '#1B9D4C';
                  } else if (isActive) {
                    if (step.label === 'Delivered') {
                      iconName = 'check-circle';
                      iconColor = '#1B9D4C';
                    } else if (step.label === 'Picked Up') {
                      iconName = 'motorbike';
                      iconColor = '#AC1D10';
                    } else {
                      iconName = 'check-circle';
                      iconColor = '#1B9D4C';
                    }
                  } else {
                    if (step.label === 'Delivered') {
                      iconName = 'home';
                    }
                  }

                  return (
                    <View
                      key={step.label}
                      style={[
                        styles.timelineRow,
                        index < timelineRows.length - 1 && styles.timelineRowBorder,
                      ]}>
                      <View style={styles.timelineLeft}>
                        <MaterialCommunityIcons name={iconName} size={15} color={iconColor} />
                        <Text
                          style={[
                            styles.timelineLabel,
                            isActive && styles.timelineLabelActive,
                            step.state === 'pending' && styles.timelineLabelPending,
                          ]}>
                          {step.label}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.timelineTime,
                          step.state === 'pending' && styles.timelinePending,
                        ]}>
                        {isActive && step.label === 'Picked Up'
                          ? 'Your rider is on the way'
                          : step.timestamp}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <View style={styles.timelineCard}>
                <View style={[styles.timelineRow, styles.timelineRowBorder]}>
                  <View style={styles.timelineLeft}>
                    <MaterialCommunityIcons name="close-circle-outline" size={15} color="#AC1D10" />
                    <Text style={styles.timelineLabel}>Status</Text>
                  </View>
                  <Text style={[styles.timelineTime, styles.cancelledStatusText]}>Cancelled</Text>
                </View>
                <View style={[styles.timelineRow, styles.timelineRowBorder]}>
                  <View style={styles.timelineLeft}>
                    <MaterialCommunityIcons name="calendar-clock-outline" size={15} color="#8E8E8E" />
                    <Text style={styles.timelineLabel}>Placed</Text>
                  </View>
                  <Text style={styles.timelineTime}>{formatTime(placedAtDate)}</Text>
                </View>
                <View style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <MaterialCommunityIcons name="information-outline" size={15} color="#8E8E8E" />
                    <Text style={styles.timelineLabel}>Update</Text>
                  </View>
                  <Text style={styles.timelineTime}>Order was cancelled before fulfillment</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Payment Summary</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Paid via</Text>
              <Text style={styles.paymentValue}>{String(order.payment_method).toUpperCase()}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Order Total</Text>
              <Text style={styles.paymentValue}>{formatPrice(Number(order.total))}</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerMuted}>Need help? </Text>
            <Text style={styles.footerLink}>Contact Support</Text>
          </View>

          {canCancelOrder ? (
            <View style={styles.cancelSection}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  (pressed || isCancelling) && styles.pressed,
                ]}
                disabled={isCancelling}
                onPress={handleCancelOrder}>
                <Text style={styles.cancelButtonText}>
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </Text>
              </Pressable>
              <Text style={styles.cancelHelperText}>
                Cancellation is only available before the restaurant confirms your order.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>

      <Modal
        visible={isItemsSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsItemsSheetOpen(false)}>
        <View style={styles.sheetRoot}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setIsItemsSheetOpen(false)}
          />

          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{`Items in #${order.id}`}</Text>
              <Pressable
                style={({ pressed }) => [styles.sheetCloseButton, pressed && styles.pressed]}
                onPress={() => setIsItemsSheetOpen(false)}>
                <MaterialCommunityIcons name="close" size={18} color="#666666" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetList}>
              {order.items.map((item: any) => {
                const imageUrl = item.image && !item.image.startsWith('http') 
                  ? `https://foodhub.tmc-innovations.com${item.image}` 
                  : item.image;
                  
                return (
                  <CheckoutSelectionItem 
                    key={item.id} 
                    item={{
                      ...item, 
                      name: item.item_name,
                      image: imageUrl
                    }} 
                  />
                );
              })}

              <View style={styles.sheetTotalsWrap}>
                <View style={styles.sheetTotalRow}>
                  <Text style={styles.sheetTotalLabel}>Subtotal</Text>
                  <Text style={styles.sheetTotalValue}>{formatPrice(Number(order.subtotal))}</Text>
                </View>
                <View style={styles.sheetTotalRow}>
                  <Text style={styles.sheetTotalLabel}>Delivery Fee</Text>
                  <Text style={styles.sheetTotalValue}>{formatPrice(Number(order.delivery_fee))}</Text>
                </View>
                <View style={styles.sheetTotalRow}>
                  <Text style={styles.sheetTotalLabel}>Discount</Text>
                  <Text style={styles.sheetTotalValue}>-{formatPrice(Number(order.discount))}</Text>
                </View>
                <View style={styles.sheetDivider} />
                <View style={styles.sheetTotalRow}>
                  <Text style={styles.sheetTotalLabelStrong}>Total</Text>
                  <Text style={styles.sheetTotalValueStrong}>{formatPrice(Number(order.total))}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCancelModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCancelModalOpen(false)}>
        <View style={styles.sheetRoot}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setIsCancelModalOpen(false)}
          />

          <View style={styles.cancelModalCard}>
            <Text style={styles.cancelModalTitle}>Cancel order?</Text>
            <Text style={styles.cancelModalText}>
              You can only cancel while the restaurant has not confirmed your order yet.
            </Text>
            <View style={styles.cancelModalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelModalSecondaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setIsCancelModalOpen(false)}>
                <Text style={styles.cancelModalSecondaryButtonText}>Keep Order</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelModalPrimaryButton,
                  (pressed || isCancelling) && styles.pressed,
                ]}
                disabled={isCancelling}
                onPress={confirmCancelOrder}>
                <Text style={styles.cancelModalPrimaryButtonText}>
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapHero: {
    height: 240,
    position: 'relative',
    marginBottom: 58,
    overflow: 'visible',
  },
  cancelledHero: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  backButtonInline: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    marginBottom: 26,
  },
  cancelledIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelledHeroTitle: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  cancelledHeroSubtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#666666',
    maxWidth: 320,
  },
  mapImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 220,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    zIndex: 2,
  },
  arrivalCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: -32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DFDFDF',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  arrivalOverline: {
    fontSize: 10,
    color: '#9A9A9A',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  arrivalValue: {
    marginTop: 3,
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 38,
  },
  arrivalProgressTrack: {
    marginTop: 10,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E3E3E3',
    overflow: 'hidden',
  },
  arrivalProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#AC1D10',
  },
  arrivalCaption: {
    marginTop: 8,
    fontSize: 12,
    color: '#6E6E6E',
  },
  successWrap: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1B9D4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 33,
    lineHeight: 38,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  successSubtitle: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: '#666666',
  },
  card: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  orderCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  foodThumbWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F7E8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  orderCardSub: {
    marginTop: 1,
    fontSize: 11,
    color: '#777777',
  },
  viewItemsButton: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D8D8',
  },
  viewItemsText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7E8E6',
  },
  infoCopyWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    color: '#9A9A9A',
    marginBottom: 1,
  },
  infoSub: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
    lineHeight: 18,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  riderAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderCopyWrap: {
    flex: 1,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  riderSub: {
    marginTop: 1,
    fontSize: 11,
    color: '#777777',
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    borderColor: '#A31B10',
    backgroundColor: '#AC1D10',
  },
  sectionTitle: {
    marginTop: 14,
    marginHorizontal: 16,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  timelineCard: {
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 9,
  },
  timelineRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  timelineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  timelineLabel: {
    fontSize: 13,
    color: '#2F2F2F',
    fontWeight: '600',
  },
  timelineLabelActive: {
    color: '#AC1D10',
  },
  timelineLabelPending: {
    color: '#8C8C8C',
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: 11,
    color: '#777777',
    textAlign: 'right',
  },
  timelinePending: {
    color: '#A4A4A4',
  },
  cancelledStatusText: {
    color: '#AC1D10',
    fontWeight: '700',
  },
  paymentCard: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 7,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  paymentLabel: {
    fontSize: 12,
    color: '#737373',
  },
  paymentValue: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  footerRow: {
    marginTop: 18,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerMuted: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  footerLink: {
    fontSize: 11,
    color: '#AC1D10',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  cancelSection: {
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cancelButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#F1C4C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AC1D10',
  },
  cancelHelperText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#7B7B7B',
    lineHeight: 18,
  },
  cancelModalCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  cancelModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  cancelModalText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#666666',
  },
  cancelModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelModalSecondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
  },
  cancelModalSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D3D3D',
  },
  cancelModalPrimaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AC1D10',
  },
  cancelModalPrimaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  sheetContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
    maxHeight: '75%',
    paddingBottom: 20,
  },
  sheetHandle: {
    alignSelf: 'center',
    marginTop: 10,
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D6D6D6',
  },
  sheetHeader: {
    marginTop: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sheetCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F1F1',
  },
  sheetList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  sheetTotalsWrap: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E3E3E3',
    paddingTop: 10,
    gap: 6,
  },
  sheetTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTotalLabel: {
    fontSize: 13,
    color: '#666666',
  },
  sheetTotalValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  sheetDivider: {
    marginTop: 2,
    marginBottom: 2,
    height: 1,
    backgroundColor: '#E2E2E2',
  },
  sheetTotalLabelStrong: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  sheetTotalValueStrong: {
    fontSize: 15,
    color: '#AC1D10',
    fontWeight: '800',
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  notFoundSubtitle: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    color: '#727272',
    lineHeight: 19,
  },
  notFoundButton: {
    marginTop: 16,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#AC1D10',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
