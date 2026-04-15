import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Mock Data ─── */
const REVIEWS = [
  {
    id: '1',
    name: 'Maria L.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    orderInfo: 'Order #TMC-8821 • 2 hours ago',
    items: ['Lumpiang Shanghai'],
    text: 'The food arrived hot and the portions were great for the price. The adobo was perfectly seasoned, just like home cooking. I also love the Lumpiang Shanghai. It was crispy and delicious. Highly recommended for busy workdays! P240 well spent.',
    image: 'https://images.unsplash.com/photo-1288046425391-443b784ab753?w=200&h=200&fit=crop', // Mock food img
    helpfulCount: 8,
    isReplyingInitial: false,
  },
  {
    id: '2',
    name: 'James T.',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    rating: 5,
    orderInfo: 'Order #TMC-8794 • 4 hours ago',
    items: ['Grilled Steak', 'Leche Flan'],
    text: 'Lacks a bit of salt but the meat was very tender. The Leche Flan is amazing though. Will definitely order again soon.',
    helpfulCount: 19,
    isReplyingInitial: false,
  },
];

/* ─── Shared Components ─── */
function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialCommunityIcons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  valueComponent,
  index,
}: {
  label: string;
  value?: string;
  sublabel: string;
  valueComponent?: React.ReactNode;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInRight.delay(200 + index * 80).duration(400)}
      style={statsStyles.card}>
      <Text style={statsStyles.label}>{label}</Text>
      {value ? <Text style={statsStyles.value}>{value}</Text> : null}
      {valueComponent}
      <Text style={statsStyles.sub}>{sublabel}</Text>
    </Animated.View>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ review, index }: { review: typeof REVIEWS[0]; index: number }) {
  const [isReplying, setIsReplying] = useState(review.isReplyingInitial);
  const [replyText, setReplyText] = useState('');

  return (
    <Animated.View entering={FadeInDown.delay(350 + index * 100).duration(400)} style={reviewStyles.container}>
      {/* Header */}
      <View style={reviewStyles.header}>
        <Image source={{ uri: review.avatar }} style={reviewStyles.avatar} />
        <View style={reviewStyles.headerInfo}>
          <Text style={reviewStyles.name}>{review.name}</Text>
          <Text style={reviewStyles.orderInfo}>{review.orderInfo}</Text>
        </View>
        <StarRating rating={review.rating} size={14} />
      </View>

      {/* Item Tags */}
      <View style={reviewStyles.tagsRow}>
        {review.items.map((item, idx) => (
          <View key={idx} style={reviewStyles.tag}>
            <Text style={reviewStyles.tagText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Text Content */}
      <Text style={reviewStyles.text}>{review.text}</Text>

      {/* Image if available */}
      {review.image && (
        <Image source={{ uri: review.image }} style={reviewStyles.image} />
      )}

      {/* Actions */}
      <View style={reviewStyles.actionsRow}>
        <Pressable style={reviewStyles.actionBtn} onPress={() => setIsReplying(!isReplying)}>
          <MaterialCommunityIcons name="reply" size={16} color={isReplying ? '#AC1D10' : '#888'} />
          <Text style={[reviewStyles.actionText, isReplying && { color: '#AC1D10' }]}>Reply</Text>
        </Pressable>
        <View style={reviewStyles.actionBtn}>
          <MaterialCommunityIcons name="thumb-up-outline" size={16} color="#888" />
          <Text style={reviewStyles.actionText}>Helpful ({review.helpfulCount})</Text>
        </View>
      </View>

      {/* Reply Form */}
      {isReplying && (
        <Animated.View entering={FadeInDown.duration(300)} style={replyStyles.container}>
          <Text style={replyStyles.label}>Write a Reply</Text>
          <TextInput
            style={replyStyles.input}
            placeholder={`Respond to ${review.name.split(' ')[0]} for their feedback...`}
            placeholderTextColor="#AAA"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={replyText}
            onChangeText={setReplyText}
          />
          <View style={replyStyles.buttons}>
            <Pressable
              style={({ pressed }) => [replyStyles.cancelBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setIsReplying(false)}>
              <Text style={replyStyles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [replyStyles.postBtn, pressed && { opacity: 0.8 }]}>
              <Text style={replyStyles.postBtnText}>Post Reply</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

/* ─── Main Screen ─── */
export default function ReviewsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* ── Top Bar ── */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.topBar}>
          <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={() => router.back()}>
            <MaterialCommunityIcons name="menu" size={24} color="#1A1A1A" />
          </Pressable>

          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>TMC</Text>
            </View>
            <Text style={styles.logoTitle}>
              FOOD{'\n'}
              <Text style={styles.logoBold}>HUB</Text>
            </Text>
          </View>

          <View style={styles.topBarRight}>
            <Pressable style={styles.avatarWrap}>
              <MaterialCommunityIcons name="account-circle" size={32} color="#AC1D10" />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Search ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ratings..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* ── Title ── */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={styles.pageTitle}>Reviews</Text>
            <Text style={styles.pageSubtitle}>
              Read and respond to customer feedback to maintain your restaurant's reputation.
            </Text>
          </Animated.View>

          {/* ── Stats Carousel ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={statsStyles.scroll}
            style={{ marginBottom: 12 }}>
            <StatCard
              index={0}
              label="Average Rating"
              sublabel="Based on last 30 days"
              valueComponent={
                <View>
                  <Text style={statsStyles.value}>4.6/5.0</Text>
                  <StarRating rating={4.6} />
                </View>
              }
            />
            <StatCard
              index={1}
              label="Total Reviews"
              value="1,240"
              sublabel="+12% this month"
            />
            <StatCard
              index={2}
              label="5 Star Reviews"
              value="850"
              sublabel="vs. 27% last month"
            />
          </ScrollView>

          {/* ── Filters ── */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={filtersStyles.container}>
            <View style={filtersStyles.dropdowns}>
              <Pressable style={filtersStyles.dropdown}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={14} color="#555" />
                <Text style={filtersStyles.dropdownText}>Last 30 days</Text>
              </Pressable>
              <Pressable style={filtersStyles.dropdown}>
                <Text style={filtersStyles.dropdownText}>All Rating</Text>
                <MaterialCommunityIcons name="chevron-down" size={16} color="#555" />
              </Pressable>
            </View>
            <Pressable style={({ pressed }) => [filtersStyles.exportBtn, pressed && { opacity: 0.8 }]}>
              <MaterialCommunityIcons name="download" size={14} color="#FFF" />
              <Text style={filtersStyles.exportBtnText}>Export</Text>
            </Pressable>
          </Animated.View>

          {/* ── Rating Summary Component ── */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={summaryStyles.container}>
            <View style={summaryStyles.leftBlock}>
              <Text style={summaryStyles.bigScore}>4.6</Text>
              <StarRating rating={5} size={14} />
              <Text style={summaryStyles.reviewCount}>Based on 1,240 reviews</Text>
            </View>
            
            <View style={summaryStyles.barsBlock}>
              {[
                { star: 5, count: 804, barW: '75%' },
                { star: 4, count: 142, barW: '35%' },
                { star: 3, count: 99, barW: '15%' },
                { star: 2, count: 30, barW: '8%' },
                { star: 1, count: 94, barW: '12%' },
              ].map((row) => (
                <View key={row.star} style={summaryStyles.barRow}>
                  <Text style={summaryStyles.barStarText}>{row.star}</Text>
                  <View style={summaryStyles.barTrack}>
                    <View style={[summaryStyles.barFill, { width: row.barW as any }]} />
                  </View>
                  <Text style={summaryStyles.barCountText}>{row.count}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* ── Reviews List ── */}
          {REVIEWS.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ══════════════════════════════════════════════
   Styles
   ══════════════════════════════════════════════ */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  pressed: { opacity: 0.7 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoIcon: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#AC1D10', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  logoTitle: { fontSize: 8, color: '#1A1A1A', fontWeight: '500', lineHeight: 10 },
  logoBold: { fontWeight: '900', color: '#AC1D10' },
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FBE7E4', alignItems: 'center', justifyContent: 'center' },

  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },

  scrollContent: { paddingHorizontal: 16 },

  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  pageSubtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16, lineHeight: 20 },
});

/* Stats Cards */
const statsStyles = StyleSheet.create({
  scroll: { gap: 10, paddingRight: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#FFF',
    padding: 12,
    minWidth: 140,
  },
  label: { fontSize: 11, color: '#999', fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  sub: { fontSize: 10, color: '#888', marginTop: 4 },
});

/* Filters */
const filtersStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dropdowns: { flexDirection: 'row', gap: 8 },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  dropdownText: { fontSize: 12, color: '#555', fontWeight: '500' },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9E1C1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  exportBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
});

/* Rating Summary */
const summaryStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    gap: 16,
  },
  leftBlock: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E8E8E8',
    minWidth: 110,
  },
  bigScore: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  reviewCount: { fontSize: 9, color: '#999', marginTop: 4 },

  barsBlock: { flex: 1, gap: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barStarText: { fontSize: 10, color: '#555', width: 10 },
  barTrack: { flex: 1, height: 4, backgroundColor: '#F0F0F0', borderRadius: 2 },
  barFill: { height: 4, backgroundColor: '#9E1C1A', borderRadius: 2 },
  barCountText: { fontSize: 10, color: '#999', width: 24, textAlign: 'right' },
});

/* Review Card */
const reviewStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E5E5', marginRight: 12 },
  headerInfo: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  orderInfo: { fontSize: 11, color: '#888' },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: '#FCECEC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, color: '#9E1C1A', fontWeight: '500' },
  
  text: { fontSize: 13, color: '#444', lineHeight: 20, marginBottom: 12 },
  
  image: { width: 80, height: 80, borderRadius: 8, marginBottom: 12 },
  
  actionsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 12, fontWeight: '600', color: '#888' },
});

/* Inline Reply Form */
const replyStyles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  label: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  buttons: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 24, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, backgroundColor: '#FFF' },
  cancelBtnText: { fontSize: 12, fontWeight: '600', color: '#555' },
  postBtn: { paddingVertical: 8, paddingHorizontal: 24, backgroundColor: '#9E1C1A', borderRadius: 8 },
  postBtnText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
});
