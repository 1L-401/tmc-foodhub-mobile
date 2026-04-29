import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ORDER_STATUS_FLOW,
  confirmOwnerOrderPayment,
  fetchOwnerOrders,
  getNextOrderStatus,
  getOrderDetailActionLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  isOnlinePayment,
  ownerOrderQueryKeys,
  updateOwnerOrderStatus,
  type OwnerOrder,
  type OwnerOrderItem,
  type OwnerOrderStatus,
  type OwnerPaymentStatus,
} from '@/services/orderService';

const formatCurrency = (amount: number) => `PHP ${Number(amount || 0).toFixed(2)}`;

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getDeliveryTypeLabel = (order: OwnerOrder) => {
  if (order.deliveryType !== 'scheduled') {
    return 'ASAP Delivery';
  }

  return [order.scheduledDate, order.scheduledTime].filter(Boolean).join(' ') || 'Scheduled';
};

const getItemVariationText = (item: OwnerOrderItem) => {
  const parts: string[] = [];

  if (item.variations?.name) {
    parts.push(`Variant: ${item.variations.name}`);
  }

  if (item.variations?.addOns?.length) {
    parts.push(`Add-ons: ${item.variations.addOns.map((addOn) => addOn.name).join(', ')}`);
  }

  return parts.join(' - ');
};

function StatusBadge({ status }: { status: OwnerOrderStatus }) {
  const cfg = {
    Pending: { bg: '#FEF3C7', text: '#B45309', label: 'Pending' },
    'Order Confirmed': { bg: '#DBEAFE', text: '#1D4ED8', label: 'Confirmed' },
    'Out for Delivery': { bg: '#CFFAFE', text: '#0891B2', label: 'Out for Delivery' },
    Delivered: { bg: '#D1FAE5', text: '#047857', label: 'Delivered' },
    Cancelled: { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' },
  }[status];

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function PaymentBadge({ status }: { status: OwnerPaymentStatus }) {
  const cfg = {
    paid: { bg: '#D1FAE5', text: '#047857', label: 'Confirmed' },
    rejected: { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' },
    awaiting_confirmation: { bg: '#FEF3C7', text: '#B45309', label: 'Awaiting' },
    pending_verification: { bg: '#FEF3C7', text: '#B45309', label: 'Pending' },
    unpaid: { bg: '#F3F4F6', text: '#6B7280', label: 'Unpaid' },
  }[status];

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function TimelineStep({
  icon,
  title,
  subtitle,
  isActive,
  isCompleted,
  isLast,
}: {
  icon: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}) {
  const dotColor = isCompleted ? '#047857' : isActive ? '#AC1D10' : '#D0D0D0';
  const lineColor = isCompleted ? '#047857' : '#E8E8E8';

  return (
    <View style={timelineStyles.step}>
      <View style={timelineStyles.dotCol}>
        <View
          style={[
            timelineStyles.dot,
            { backgroundColor: dotColor },
            isActive && timelineStyles.dotActive,
          ]}>
          <MaterialCommunityIcons
            name={isCompleted ? 'check' : (icon as any)}
            size={12}
            color="#FFF"
          />
        </View>
        {!isLast && (
          <View style={[timelineStyles.line, { backgroundColor: lineColor }]} />
        )}
      </View>

      <View style={timelineStyles.content}>
        <Text
          style={[
            timelineStyles.title,
            (isActive || isCompleted) && timelineStyles.titleActive,
          ]}>
          {title}
        </Text>
        <Text style={timelineStyles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function OrderTimeline({ status }: { status: OwnerOrderStatus }) {
  if (status === 'Cancelled') {
    return (
      <View style={timelineStyles.container}>
        <TimelineStep
          icon="close-circle-outline"
          title="Cancelled"
          subtitle="This order was cancelled"
          isActive
          isCompleted={false}
          isLast
        />
      </View>
    );
  }

  const statusIndex = ORDER_STATUS_FLOW.indexOf(status);
  const steps = [
    {
      icon: 'bell-outline',
      title: 'Order Placed',
      subtitle: 'Customer submitted the order',
    },
    {
      icon: 'check-circle-outline',
      title: 'Confirmed',
      subtitle: 'Restaurant accepted the order',
    },
    {
      icon: 'truck-delivery-outline',
      title: 'Out for Delivery',
      subtitle: 'Order is on the way',
    },
    {
      icon: 'check-decagram-outline',
      title: 'Delivered',
      subtitle: 'Order has been completed',
    },
  ];

  return (
    <View style={timelineStyles.container}>
      {steps.map((step, index) => (
        <TimelineStep
          key={step.title}
          icon={step.icon}
          title={step.title}
          subtitle={step.subtitle}
          isActive={index === statusIndex}
          isCompleted={index < statusIndex}
          isLast={index === steps.length - 1}
        />
      ))}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconWrap}>
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color="#999"
        />
      </View>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

function OrderActionButton({
  status,
  isLoading,
  onPress,
}: {
  status: OwnerOrderStatus;
  isLoading: boolean;
  onPress: () => void;
}) {
  const label = getOrderDetailActionLabel(status);

  if (!label) {
    return null;
  }

  const cfgByStatus: Partial<Record<OwnerOrderStatus, { bg: string; text: string; icon: string }>> = {
    Pending: {
      bg: '#AC1D10',
      text: '#FFF',
      icon: 'check-circle-outline',
    },
    'Order Confirmed': {
      bg: '#1D4ED8',
      text: '#FFF',
      icon: 'truck-delivery-outline',
    },
    'Out for Delivery': {
      bg: '#047857',
      text: '#FFF',
      icon: 'check-decagram-outline',
    },
  };
  const cfg = cfgByStatus[status] ?? {
    bg: '#E5E7EB',
    text: '#374151',
    icon: 'check-circle-outline',
  };

  return (
    <Pressable
      disabled={isLoading}
      onPress={onPress}
      style={({ pressed }) => [
        actionBtnStyles.primary,
        { backgroundColor: cfg.bg },
        pressed && actionBtnStyles.pressed,
        isLoading && actionBtnStyles.disabled,
      ]}>
      {isLoading ? (
        <ActivityIndicator size="small" color={cfg.text} />
      ) : (
        <>
          <MaterialCommunityIcons
            name={cfg.icon as any}
            size={18}
            color={cfg.text}
          />
          <Text style={[actionBtnStyles.primaryText, { color: cfg.text }]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function CenterState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  isLoading,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.centered}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#AC1D10" />
        ) : (
          <MaterialCommunityIcons
            name={icon as any}
            size={48}
            color="#CCC"
          />
        )}
        <Text style={styles.notFoundText}>{title}</Text>
        {subtitle ? <Text style={styles.centerSubtitle}>{subtitle}</Text> : null}
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.7 },
            ]}>
            <Text style={styles.backBtnText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const orderId = typeof id === 'string' ? id : '';

  const ordersQuery = useQuery({
    queryKey: ownerOrderQueryKeys.all,
    queryFn: fetchOwnerOrders,
    refetchInterval: 5000,
  });

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const order = useMemo(
    () => orders.find((candidate) => String(candidate.id) === String(orderId)),
    [orderId, orders],
  );

  const replaceCachedOrder = (updatedOrder: OwnerOrder) => {
    queryClient.setQueryData<OwnerOrder[]>(ownerOrderQueryKeys.all, (currentOrders) =>
      currentOrders?.map((candidate) =>
        String(candidate.id) === String(updatedOrder.id) ? updatedOrder : candidate,
      ) ?? [updatedOrder],
    );
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: OwnerOrderStatus }) => {
      if (!order) {
        throw new Error('Order not found.');
      }

      return updateOwnerOrderStatus(order.id, status);
    },
    onSuccess: (updatedOrder) => {
      replaceCachedOrder(updatedOrder);
      void queryClient.invalidateQueries({ queryKey: ownerOrderQueryKeys.all });
    },
    onError: (error) => {
      Alert.alert(
        'Unable to update order',
        error instanceof Error ? error.message : 'Please try again.',
      );
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ action }: { action: 'confirm' | 'reject' }) => {
      if (!order) {
        throw new Error('Order not found.');
      }

      return confirmOwnerOrderPayment(order.id, action);
    },
    onSuccess: (result) => {
      if (order) {
        replaceCachedOrder({ ...order, paymentStatus: result.payment_status });
      }
      void queryClient.invalidateQueries({ queryKey: ownerOrderQueryKeys.all });
    },
    onError: (error) => {
      Alert.alert(
        'Unable to update payment',
        error instanceof Error ? error.message : 'Please try again.',
      );
    },
  });

  if (ordersQuery.isLoading) {
    return (
      <CenterState
        icon="clipboard-text-search-outline"
        title="Loading order..."
        isLoading
      />
    );
  }

  if (ordersQuery.isError && !order) {
    return (
      <CenterState
        icon="alert-circle-outline"
        title="Unable to load order"
        subtitle={
          ordersQuery.error instanceof Error
            ? ordersQuery.error.message
            : 'Please check your connection and try again.'
        }
        actionLabel="Retry"
        onAction={() => {
          void ordersQuery.refetch();
        }}
      />
    );
  }

  if (!order) {
    return (
      <CenterState
        icon="alert-circle-outline"
        title="Order not found"
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  const nextStatus = getNextOrderStatus(order.status);
  const isStatusUpdating = updateStatusMutation.isPending;
  const isPaymentUpdating = paymentMutation.isPending;
  const hasOnlinePayment = isOnlinePayment(order.paymentMethod);
  const canReviewPayment =
    hasOnlinePayment &&
    Boolean(order.paymentReceipt) &&
    order.paymentStatus !== 'paid' &&
    order.paymentStatus !== 'rejected';

  const handleStatusChange = (status: OwnerOrderStatus) => {
    updateStatusMutation.mutate({ status });
  };

  const handleDecline = () => {
    Alert.alert('Decline order?', 'This will cancel the order and notify the customer.', [
      { text: 'Keep Order', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => handleStatusChange('Cancelled'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Animated.View
          entering={FadeInDown.delay(50).duration(350)}
          style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && { opacity: 0.6 },
            ]}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#1A1A1A"
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerSubtitle}>{order.orderNumber}</Text>
          </View>

          <Pressable
            onPress={() => {
              void ordersQuery.refetch();
            }}
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && { opacity: 0.6 },
            ]}>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color="#1A1A1A"
            />
          </Pressable>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.statusCard}>
            <View style={styles.statusTop}>
              <View style={styles.statusTitleWrap}>
                <Text style={styles.orderNum}>{order.orderNumber}</Text>
                <Text style={styles.orderDate}>{formatDateTime(order.placedAt)}</Text>
              </View>
              <StatusBadge status={order.status} />
            </View>

            <OrderTimeline status={order.status} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color="#AC1D10"
              />
              <Text style={styles.cardTitle}>Customer Information</Text>
            </View>

            <InfoRow icon="account" label="Name" value={order.customerName} />
            <InfoRow icon="phone-outline" label="Phone" value={order.customerPhone} />
            <InfoRow icon="map-marker-outline" label="Address" value={order.deliveryAddress} />
            <InfoRow icon="truck-delivery-outline" label="Type" value={getDeliveryTypeLabel(order)} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={18}
                color="#AC1D10"
              />
              <Text style={styles.cardTitle}>
                Order Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})
              </Text>
            </View>

            {order.items.map((item, index) => {
              const variationText = getItemVariationText(item);

              return (
                <Animated.View
                  key={`${item.id}-${index}`}
                  entering={FadeInRight.delay(350 + index * 60).duration(350)}
                  style={[
                    itemStyles.row,
                    index < order.items.length - 1 && itemStyles.rowBorder,
                  ]}>
                  <View style={itemStyles.qtyBadge}>
                    <Text style={itemStyles.qtyText}>{item.quantity}x</Text>
                  </View>
                  <View style={itemStyles.info}>
                    <Text style={itemStyles.name}>{item.name}</Text>
                    {variationText ? (
                      <Text style={itemStyles.notes}>{variationText}</Text>
                    ) : null}
                  </View>
                  <Text style={itemStyles.price}>
                    {formatCurrency(item.quantity * item.price)}
                  </Text>
                </Animated.View>
              );
            })}

            {order.specialInstructions ? (
              <View style={itemStyles.instructions}>
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={14}
                  color="#B45309"
                />
                <Text style={itemStyles.instructionsText}>
                  {order.specialInstructions}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="credit-card-outline"
                size={18}
                color="#AC1D10"
              />
              <Text style={styles.cardTitle}>Payment Summary</Text>
              <PaymentBadge status={order.paymentStatus} />
            </View>

            <View style={summaryStyles.row}>
              <Text style={summaryStyles.label}>Subtotal</Text>
              <Text style={summaryStyles.value}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
            <View style={summaryStyles.row}>
              <Text style={summaryStyles.label}>Delivery Fee</Text>
              <Text style={summaryStyles.value}>
                {formatCurrency(order.deliveryFee)}
              </Text>
            </View>
            {order.discount > 0 && (
              <View style={summaryStyles.row}>
                <Text style={summaryStyles.label}>Discount</Text>
                <Text style={[summaryStyles.value, { color: '#047857' }]}>
                  -{formatCurrency(order.discount)}
                </Text>
              </View>
            )}
            <View style={summaryStyles.divider} />
            <View style={summaryStyles.row}>
              <Text style={summaryStyles.totalLabel}>Total</Text>
              <Text style={summaryStyles.totalValue}>
                {formatCurrency(order.total)}
              </Text>
            </View>

            <View style={summaryStyles.paymentMethod}>
              <MaterialCommunityIcons
                name={order.paymentMethod === 'gcash' ? 'cellphone' : 'cash'}
                size={16}
                color="#666"
              />
              <Text style={summaryStyles.paymentText}>
                {getPaymentMethodLabel(order.paymentMethod)} - {getPaymentStatusLabel(order.paymentStatus)}
              </Text>
            </View>
          </Animated.View>

          {hasOnlinePayment ? (
            <Animated.View
              entering={FadeInDown.delay(450).duration(400)}
              style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="receipt-text-outline"
                  size={18}
                  color="#AC1D10"
                />
                <Text style={styles.cardTitle}>Proof of Payment</Text>
              </View>

              <View style={paymentStyles.detailBox}>
                <View style={summaryStyles.row}>
                  <Text style={summaryStyles.label}>Method</Text>
                  <Text style={summaryStyles.value}>
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </Text>
                </View>
                {order.paymentSenderName ? (
                  <View style={summaryStyles.row}>
                    <Text style={summaryStyles.label}>Sender</Text>
                    <Text style={summaryStyles.value}>{order.paymentSenderName}</Text>
                  </View>
                ) : null}
                {order.paymentTransactionId ? (
                  <View style={summaryStyles.row}>
                    <Text style={summaryStyles.label}>Reference</Text>
                    <Text style={[summaryStyles.value, paymentStyles.reference]}>
                      {order.paymentTransactionId}
                    </Text>
                  </View>
                ) : null}
              </View>

              {order.paymentReceipt ? (
                <Image
                  source={{ uri: order.paymentReceipt }}
                  style={paymentStyles.receipt}
                  resizeMode="contain"
                />
              ) : (
                <View style={paymentStyles.emptyReceipt}>
                  <MaterialCommunityIcons name="image-off-outline" size={28} color="#BBB" />
                  <Text style={paymentStyles.emptyReceiptTitle}>No receipt uploaded yet</Text>
                  <Text style={paymentStyles.emptyReceiptText}>
                    The customer has not uploaded a payment screenshot.
                  </Text>
                </View>
              )}

              {canReviewPayment ? (
                <View style={paymentStyles.actions}>
                  <Pressable
                    disabled={isPaymentUpdating}
                    onPress={() => paymentMutation.mutate({ action: 'confirm' })}
                    style={({ pressed }) => [
                      paymentStyles.confirmBtn,
                      pressed && actionBtnStyles.pressed,
                      isPaymentUpdating && actionBtnStyles.disabled,
                    ]}>
                    <Text style={paymentStyles.confirmText}>Confirm Payment</Text>
                  </Pressable>
                  <Pressable
                    disabled={isPaymentUpdating}
                    onPress={() => paymentMutation.mutate({ action: 'reject' })}
                    style={({ pressed }) => [
                      paymentStyles.rejectBtn,
                      pressed && actionBtnStyles.pressed,
                      isPaymentUpdating && actionBtnStyles.disabled,
                    ]}>
                    <Text style={paymentStyles.rejectText}>Reject</Text>
                  </Pressable>
                </View>
              ) : null}
            </Animated.View>
          ) : null}

          <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
            style={styles.actionsCard}>
            {nextStatus ? (
              <OrderActionButton
                status={order.status}
                isLoading={isStatusUpdating}
                onPress={() => handleStatusChange(nextStatus)}
              />
            ) : (
              <View style={actionBtnStyles.completeState}>
                <MaterialCommunityIcons
                  name={order.status === 'Cancelled' ? 'close-circle-outline' : 'check-circle-outline'}
                  size={18}
                  color={order.status === 'Cancelled' ? '#DC2626' : '#047857'}
                />
                <Text
                  style={[
                    actionBtnStyles.completeText,
                    { color: order.status === 'Cancelled' ? '#DC2626' : '#047857' },
                  ]}>
                  {order.status === 'Cancelled' ? 'Order Cancelled' : 'Order Completed'}
                </Text>
              </View>
            )}

            {order.status === 'Pending' && (
              <Pressable
                disabled={isStatusUpdating}
                onPress={handleDecline}
                style={({ pressed }) => [
                  actionBtnStyles.secondary,
                  pressed && actionBtnStyles.pressed,
                  isStatusUpdating && actionBtnStyles.disabled,
                ]}>
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={18}
                  color="#DC2626"
                />
                <Text style={actionBtnStyles.secondaryText}>
                  Decline Order
                </Text>
              </Pressable>
            )}
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F8F8' },
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  notFoundText: { fontSize: 16, fontWeight: '600', color: '#999', textAlign: 'center' },
  centerSubtitle: { fontSize: 13, color: '#AAA', lineHeight: 18, textAlign: 'center' },
  backBtn: {
    marginTop: 8,
    backgroundColor: '#AC1D10',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 11, color: '#999', marginTop: 1 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  statusTitleWrap: { flex: 1 },
  orderNum: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  orderDate: { fontSize: 12, color: '#999', marginTop: 2 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },

  actionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
});

const badgeStyles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: { fontSize: 11, fontWeight: '700' },
});

const timelineStyles = StyleSheet.create({
  container: { gap: 0 },
  step: { flexDirection: 'row', minHeight: 48 },
  dotCol: { alignItems: 'center', width: 32 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    shadowColor: '#AC1D10',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  line: { flex: 1, width: 2, marginVertical: 3, borderRadius: 1 },
  content: { flex: 1, paddingLeft: 10, paddingBottom: 12 },
  title: { fontSize: 13, fontWeight: '600', color: '#BBB' },
  titleActive: { color: '#1A1A1A' },
  subtitle: { fontSize: 11, color: '#CCC', marginTop: 1 },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  iconWrap: { width: 28, alignItems: 'center' },
  label: { fontSize: 12, color: '#999', width: 64, fontWeight: '500' },
  value: { flex: 1, fontSize: 13, color: '#1A1A1A', fontWeight: '600' },
});

const itemStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  qtyBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 12, fontWeight: '800', color: '#AC1D10' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  notes: { fontSize: 11, color: '#B45309', marginTop: 2, lineHeight: 16 },
  price: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  instructionsText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },
});

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  label: { fontSize: 13, color: '#888' },
  value: { flex: 1, fontSize: 13, color: '#1A1A1A', fontWeight: '500', textAlign: 'right' },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#AC1D10' },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 10,
  },
  paymentText: { flex: 1, fontSize: 12, color: '#666', fontWeight: '500' },
});

const paymentStyles = StyleSheet.create({
  detailBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  reference: { maxWidth: '60%' },
  receipt: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  emptyReceipt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  emptyReceiptTitle: { fontSize: 13, fontWeight: '700', color: '#777' },
  emptyReceiptText: { fontSize: 12, color: '#AAA', textAlign: 'center', lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#047857',
  },
  confirmText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  rejectBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectText: { color: '#DC2626', fontSize: 13, fontWeight: '700' },
});

const actionBtnStyles = StyleSheet.create({
  primary: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryText: { fontSize: 15, fontWeight: '700' },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  secondaryText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  completeState: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
  },
  completeText: { fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.7 },
});
