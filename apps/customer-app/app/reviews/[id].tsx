import { useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRestaurantReviews } from '@/src/features/browse/api/useRestaurantReviews';
import { getReviewedOrder, saveReviewedOrder, submitReviewForOrder } from '@/src/features/reviews/review-flow';

export default function RatingsAndFeedbacks() {
  const { id, orderId, storeName } = useLocalSearchParams<{
    id: string;
    orderId?: string;
    storeName?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: reviewsData, isLoading } = useRestaurantReviews(id);

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingReviewedOrder = useMemo(() => getReviewedOrder(orderId), [orderId]);
  const hasReviewContext = !!orderId;
  const hasSubmittedReview = !!existingReviewedOrder;
  const displayedRating = hasSubmittedReview ? existingReviewedOrder.rating : rating;
  const displayedReviewText = hasSubmittedReview ? existingReviewedOrder.review : reviewText;

  const handleOpenRestaurant = () => {
    router.push({ pathname: '/restaurant/[id]', params: { id } });
  };

  const handleSubmitReview = async () => {
    if (!orderId) {
      return;
    }

    const trimmedReview = reviewText.trim();

    if (!trimmedReview) {
      Alert.alert('Add your feedback', 'Please write a short review before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitReviewForOrder({
        orderId: String(orderId),
        restaurantId: String(id),
        rating,
        review: trimmedReview,
      });

      saveReviewedOrder({
        orderId: String(orderId),
        restaurantId: String(id),
        storeName: String(storeName ?? ''),
        rating,
        review: trimmedReview,
        reviewedAt: new Date().toISOString(),
      });

      await queryClient.invalidateQueries({ queryKey: ['restaurant-reviews', id] });
      setReviewText('');
      Alert.alert('Review sent', 'Thanks for sharing your feedback.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit your review right now.';
      Alert.alert('Review not sent', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => {
    if (!reviewsData) {
      return null;
    }

    const { summary } = reviewsData;

    return (
      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#1A1A1A" />
        </Pressable>

        <Text style={styles.screenTitle}>Ratings & Feedbacks</Text>
        <Text style={styles.subtitleText}>
          <Text style={styles.subtitleTag}>Review Summary</Text> • {summary.total_reviews.toLocaleString()} verified reviews
        </Text>

        {hasReviewContext ? (
          <View style={styles.reviewComposerCard}>
            <View style={styles.reviewComposerHeader}>
              <View style={styles.reviewComposerCopy}>
                <Text style={styles.reviewComposerTitle}>
                  {hasSubmittedReview ? 'Your review is in' : 'Leave a review'}
                </Text>
                <Text style={styles.reviewComposerSubtitle}>
                  {hasSubmittedReview
                    ? 'You can now revisit the restaurant or check your feedback any time.'
                    : `Tell us how ${storeName || 'this restaurant'} did on your order.`}
                </Text>
              </View>

              <Pressable style={styles.viewRestaurantPill} onPress={handleOpenRestaurant}>
                <Text style={styles.viewRestaurantPillText}>View Restaurant</Text>
              </Pressable>
            </View>

            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  style={styles.starPickerButton}
                  disabled={hasSubmittedReview}
                  onPress={() => setRating(star)}>
                  <MaterialCommunityIcons
                    name={star <= displayedRating ? 'star' : 'star-outline'}
                    size={26}
                    color="#F9A825"
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[styles.reviewComposerInput, hasSubmittedReview && styles.reviewComposerInputDisabled]}
              placeholder="Share what you liked, what could improve, and what others should try."
              placeholderTextColor="#999"
              multiline
              editable={!hasSubmittedReview}
              value={displayedReviewText}
              onChangeText={setReviewText}
            />

            {!hasSubmittedReview ? (
              <Pressable
                style={({ pressed }) => [
                  styles.submitReviewButton,
                  (pressed || isSubmitting) && styles.pressed,
                ]}
                disabled={isSubmitting}
                onPress={handleSubmitReview}>
                <Text style={styles.submitReviewButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.reviewSubmittedBanner}>
                <MaterialCommunityIcons name="check-decagram" size={16} color="#1B9D4C" />
                <Text style={styles.reviewSubmittedText}>
                  Thanks, your review for this order has been saved.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.averageScore}>{summary.average_rating.toFixed(1)}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialCommunityIcons
                  key={star}
                  name={star <= Math.round(summary.average_rating) ? 'star' : 'star-outline'}
                  size={16}
                  color="#F9A825"
                />
              ))}
            </View>
            <Text style={styles.baseReviewsText}>
              Based on {summary.total_reviews.toLocaleString()} reviews
            </Text>
          </View>

          <View style={styles.summaryRight}>
            {summary.distribution.map((dist) => (
              <View key={dist.rating} style={styles.distRow}>
                <Text style={styles.distScore}>{dist.rating}</Text>
                <View style={styles.distBarTrack}>
                  <View style={[styles.distBarFill, { width: `${dist.percentage}%` }]} />
                </View>
                <Text style={styles.distCount}>{dist.count}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Pressable style={[styles.chip, styles.chipActive]}>
            <Text style={styles.chipTextActive}>Most Recent</Text>
          </Pressable>
          <Pressable style={styles.chip}>
            <Text style={styles.chipText}>Highest Rating</Text>
          </Pressable>
          <Pressable style={styles.chip}>
            <MaterialCommunityIcons name="image-outline" size={16} color="#666" style={styles.chipIcon} />
            <Text style={styles.chipText}>With Photos</Text>
          </Pressable>
          <Pressable style={styles.chip}>
            <MaterialCommunityIcons name="check-decagram-outline" size={16} color="#666" style={styles.chipIcon} />
            <Text style={styles.chipText}>Verified</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.customer_initials}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewName}>{item.customer_name}</Text>
          <Text style={styles.reviewTime}>{item.created_at_human}</Text>
        </View>
        <View style={styles.reviewStars}>
          {Array.from({ length: item.rating }).map((_, index) => (
            <MaterialCommunityIcons key={index} name="star" size={14} color="#F9A825" />
          ))}
        </View>
      </View>

      <Text style={styles.reviewText}>{item.review}</Text>

      {item.photos && item.photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewPhotos}>
          {item.photos.map((photo: string, index: number) => (
            <Image
              key={index}
              source={{ uri: `https://foodhub.tmc-innovations.com${photo}` }}
              style={styles.reviewPhoto}
            />
          ))}
        </ScrollView>
      ) : null}

      {item.owner_reply ? (
        <View style={styles.ownerReplyCard}>
          <Text style={styles.ownerReplyTitle}>Restaurant Response</Text>
          <Text style={styles.ownerReplyText}>{item.owner_reply}</Text>
        </View>
      ) : null}

      <View style={styles.reviewFooterDivider} />

      <Pressable style={styles.helpfulBtn}>
        <MaterialCommunityIcons name="thumb-up-outline" size={16} color="#666" />
        <Text style={styles.helpfulText}>Helpful ({item.helpful_count})</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {isLoading ? (
        <>
          {renderHeader()}
          <View style={styles.loadingWrap}>
            <Text>Loading reviews...</Text>
          </View>
        </>
      ) : (
        <FlatList
          data={reviewsData?.reviews || []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderReviewItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  reviewComposerCard: {
    backgroundColor: '#FFF8F2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F4E1CC',
    padding: 16,
    marginBottom: 20,
  },
  reviewComposerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewComposerCopy: {
    flex: 1,
  },
  reviewComposerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  reviewComposerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#76573B',
  },
  viewRestaurantPill: {
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECD6BE',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewRestaurantPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A4B20',
  },
  starPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 14,
  },
  starPickerButton: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewComposerInput: {
    minHeight: 112,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0DCC8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  reviewComposerInputDisabled: {
    color: '#555',
    backgroundColor: '#FFFDFB',
  },
  submitReviewButton: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reviewSubmittedBanner: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1FBF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CDEDD7',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewSubmittedText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#24623B',
    fontWeight: '600',
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
  chipIcon: {
    marginRight: 6,
  },
  listContent: {
    paddingBottom: 36,
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
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    color: '#666',
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
  ownerReplyCard: {
    backgroundColor: '#F7F7F7',
    padding: 12,
    borderRadius: 8,
    marginTop: -4,
    marginBottom: 12,
  },
  ownerReplyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ownerReplyText: {
    fontSize: 13,
    color: '#444',
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  pressed: {
    opacity: 0.8,
  },
});
