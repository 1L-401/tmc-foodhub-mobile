import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { RESTAURANT_REVIEWS } from '@/constants/mock-data';

export default function RatingsAndFeedbacks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // For this mock, we just use the static mock data payload.
  const data = RESTAURANT_REVIEWS;

  const [reviewText, setReviewText] = useState('');

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="chevron-left" size={28} color="#1A1A1A" />
      </Pressable>
      <Text style={styles.screenTitle}>Ratings & Feedbacks</Text>
      <Text style={styles.subtitleText}>
        <Text style={styles.subtitleTag}>{data.summary.tags}</Text> • {data.summary.verifiedCount.toLocaleString()} verified reviews
      </Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.averageScore}>{data.summary.average.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star, i) => (
              <MaterialCommunityIcons 
                key={i} 
                name={i === 4 ? "star-half" : "star"} 
                size={16} 
                color="#F9A825" 
              />
            ))}
          </View>
          <Text style={styles.baseReviewsText}>Based on {data.summary.totalCount.toLocaleString()} reviews</Text>
        </View>

        <View style={styles.summaryRight}>
          {data.summary.distribution.map((dist) => (
            <View key={dist.score} style={styles.distRow}>
              <Text style={styles.distScore}>{dist.score}</Text>
              <View style={styles.distBarTrack}>
                <View style={[styles.distBarFill, { width: `${dist.percentage}%` }]} />
              </View>
              <Text style={styles.distCount}>{dist.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <Pressable style={[styles.chip, styles.chipActive]}>
          <Text style={styles.chipTextActive}>Most Recent</Text>
        </Pressable>
        <Pressable style={styles.chip}>
          <Text style={styles.chipText}>Highest Rating</Text>
        </Pressable>
        <Pressable style={styles.chip}>
          <MaterialCommunityIcons name="image-outline" size={16} color="#666" style={{ marginRight: 6 }} />
          <Text style={styles.chipText}>With Photos</Text>
        </Pressable>
        <Pressable style={styles.chip}>
          <MaterialCommunityIcons name="check-decagram-outline" size={16} color="#666" style={{ marginRight: 6 }} />
          <Text style={styles.chipText}>Verified</Text>
        </Pressable>
      </ScrollView>
    </View>
  );

  const renderReviewItem = ({ item }: { item: typeof data.reviews[0] }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewName}>{item.name}</Text>
          <Text style={styles.reviewTime}>{item.time}</Text>
        </View>
        <View style={styles.reviewStars}>
          {[...Array(item.rating)].map((_, i) => (
            <MaterialCommunityIcons key={i} name="star" size={14} color="#F9A825" />
          ))}
        </View>
      </View>

      <Text style={styles.reviewText}>{item.text}</Text>

      {item.photos && item.photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewPhotos}>
          {item.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.reviewPhoto} />
          ))}
        </ScrollView>
      )}

      <View style={styles.reviewFooterDivider} />
      
      <Pressable style={styles.helpfulBtn}>
        <MaterialCommunityIcons name="thumb-up-outline" size={16} color="#666" />
        <Text style={styles.helpfulText}>Helpful ({item.helpfulCount})</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <FlatList
        data={data.reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.inputContainer}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.inputAvatar} />
          <TextInput
            style={styles.textInput}
            placeholder="Write a review..."
            placeholderTextColor="#999"
            value={reviewText}
            onChangeText={setReviewText}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  subtitleTag: {
    fontWeight: '700',
    color: '#AC1D10',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 20,
    marginBottom: 24,
  },
  summaryLeft: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EFEFEF',
    paddingRight: 16,
  },
  averageScore: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 56,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  baseReviewsText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  summaryRight: {
    flex: 1.5,
    paddingLeft: 16,
    justifyContent: 'space-between',
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  distScore: {
    fontSize: 12,
    color: '#888',
    width: 12,
  },
  distBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    backgroundColor: '#AC1D10',
    borderRadius: 3,
  },
  distCount: {
    fontSize: 12,
    color: '#666',
    width: 28,
    textAlign: 'right',
  },
  filterScroll: {
    paddingBottom: 24,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#FDECEA',
    borderColor: '#FDECEA',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  chipTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AC1D10',
  },
  listContent: {
    paddingBottom: 100, // Make room for floating input
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  reviewMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  reviewTime: {
    fontSize: 12,
    color: '#999',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 16,
  },
  reviewPhotos: {
    marginBottom: 16,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  reviewFooterDivider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginBottom: 12,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  keyboardView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#F9F9F9',
  },
});
