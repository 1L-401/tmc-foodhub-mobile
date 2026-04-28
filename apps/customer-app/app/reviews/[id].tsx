import { useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

const REVIEW_HIGHLIGHTS = ['Fresh Ingredients', 'Fast Delivery', 'Great Packaging', 'Still Warm', 'Tasty Food'];

function formatOrderMeta(orderCreatedAt?: string) {
  if (!orderCreatedAt) {
    return '';
  }

  const orderDate = new Date(orderCreatedAt);
  return orderDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ReviewStars({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          style={styles.starButton}
          disabled={disabled}
          onPress={() => onChange(star)}>
          <MaterialCommunityIcons
            name={star <= value ? 'star' : 'star-outline'}
            size={34}
            color="#F6A623"
          />
        </Pressable>
      ))}
    </View>
  );
}

export default function RatingsAndFeedbacks() {
  const {
    id,
    orderId,
    storeName,
    orderCreatedAt,
    orderNumber,
    itemImage,
  } = useLocalSearchParams<{
    id: string;
    orderId?: string;
    storeName?: string;
    orderCreatedAt?: string;
    orderNumber?: string;
    itemImage?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: reviewsData, isLoading } = useRestaurantReviews(id);

  const [foodRating, setFoodRating] = useState(4);
  const [deliveryRating, setDeliveryRating] = useState(4);
  const [reviewText, setReviewText] = useState('');
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingReviewedOrder = useMemo(() => getReviewedOrder(orderId), [orderId]);
  const hasReviewContext = !!orderId;
  const hasSubmittedReview = !!existingReviewedOrder;

  const resolvedItemImage =
    itemImage && !itemImage.startsWith('http')
      ? `https://foodhub.tmc-innovations.com${itemImage}`
      : itemImage;

  const displayedFoodRating = hasSubmittedReview ? existingReviewedOrder.rating : foodRating;
  const displayedDeliveryRating = hasSubmittedReview ? existingReviewedOrder.deliveryRating ?? existingReviewedOrder.rating : deliveryRating;
  const displayedReviewText = hasSubmittedReview ? existingReviewedOrder.review : reviewText;
  const displayedHighlights = hasSubmittedReview ? existingReviewedOrder.highlights ?? [] : selectedHighlights;
  const displayedPhotos = hasSubmittedReview
    ? (existingReviewedOrder.photoUris ?? []).map((uri) => ({ uri }))
    : selectedPhotos;

  const toggleHighlight = (highlight: string) => {
    if (hasSubmittedReview) {
      return;
    }

    setSelectedHighlights((current) =>
      current.includes(highlight)
        ? current.filter((item) => item !== highlight)
        : [...current, highlight]
    );
  };

  const handlePickPhotos = async () => {
    if (hasSubmittedReview) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos permission needed', 'Please allow photo access so you can attach review images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 4,
    });

    if (!result.canceled) {
      setSelectedPhotos(result.assets.slice(0, 4));
    }
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
        foodRating,
        deliveryRating,
        review: trimmedReview,
        highlights: selectedHighlights,
        photoAssets: selectedPhotos.map((asset) => ({
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        })),
      });

      saveReviewedOrder({
        orderId: String(orderId),
        restaurantId: String(id),
        storeName: String(storeName ?? ''),
        rating: foodRating,
        deliveryRating,
        review: trimmedReview,
        highlights: selectedHighlights,
        photoUris: selectedPhotos.map((asset) => asset.uri),
        reviewedAt: new Date().toISOString(),
      });

      await queryClient.invalidateQueries({ queryKey: ['restaurant-reviews', id] });
      Alert.alert('Review sent', 'Thanks for sharing your feedback.');
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit your review right now.';
      Alert.alert('Review not sent', message);
    } finally {
      setIsSubmitting(false);
    }
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
        <View style={styles.reviewStarsSmall}>
          {Array.from({ length: item.rating }).map((_, index) => (
            <MaterialCommunityIcons key={index} name="star" size={14} color="#F6A623" />
          ))}
        </View>
      </View>

      <Text style={styles.reviewText}>{item.review}</Text>

      {item.photos?.length ? (
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
    </View>
  );

  if (hasReviewContext) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <StatusBar style="dark" />

        <View style={styles.composeHeader}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.composeTitle}>Write A Review</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.composeContent} showsVerticalScrollIndicator={false}>
          <View style={styles.orderCard}>
            <View style={styles.orderThumb}>
              {resolvedItemImage ? (
                <Image source={{ uri: resolvedItemImage }} style={styles.orderThumbImage} />
              ) : (
                <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#AC1D10" />
              )}
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderName}>{storeName || 'Restaurant'}</Text>
              <Text style={styles.orderMeta}>
                {orderNumber || 'Order'}{formatOrderMeta(String(orderCreatedAt ?? '')) ? ` • ${formatOrderMeta(String(orderCreatedAt ?? ''))}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.ratingBlock}>
            <Text style={styles.ratingLabel}>How was the food?</Text>
            <ReviewStars value={displayedFoodRating} onChange={setFoodRating} disabled={hasSubmittedReview} />
          </View>

          <View style={styles.deliveryCard}>
            <Text style={styles.deliveryLabel}>How was the delivery?</Text>
            <ReviewStars value={displayedDeliveryRating} onChange={setDeliveryRating} disabled={hasSubmittedReview} />
          </View>

          <Text style={styles.sectionHeading}>Share your experience</Text>
          <TextInput
            style={[styles.reviewInput, hasSubmittedReview && styles.reviewInputDisabled]}
            placeholder="Share your culinary experience..."
            placeholderTextColor="#B0B0B0"
            multiline
            editable={!hasSubmittedReview}
            value={displayedReviewText}
            onChangeText={setReviewText}
          />

          <View style={styles.photosSection}>
            <Pressable
              style={({ pressed }) => [
                styles.addPhotoTile,
                (pressed || hasSubmittedReview) && styles.photoTilePressed,
              ]}
              disabled={hasSubmittedReview}
              onPress={handlePickPhotos}>
              <MaterialCommunityIcons name="camera" size={22} color="#8F8F8F" />
              <Text style={styles.addPhotoText}>Add photos</Text>
            </Pressable>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoPreviewRow}>
              {displayedPhotos.map((asset, index) => (
                <Image key={index} source={{ uri: asset.uri }} style={styles.selectedPhoto} />
              ))}
            </ScrollView>
          </View>

          <Text style={styles.sectionHeading}>Highlights</Text>
          <View style={styles.highlightsWrap}>
            {REVIEW_HIGHLIGHTS.map((highlight) => {
              const isActive = displayedHighlights.includes(highlight);
              return (
                <Pressable
                  key={highlight}
                  style={[styles.highlightChip, isActive && styles.highlightChipActive]}
                  onPress={() => toggleHighlight(highlight)}
                  disabled={hasSubmittedReview}>
                  <Text style={[styles.highlightChipText, isActive && styles.highlightChipTextActive]}>
                    {highlight}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {hasSubmittedReview ? (
            <View style={styles.submittedBanner}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#1B9D4C" />
              <Text style={styles.submittedText}>Your review has already been submitted for this order.</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.submitButton, (pressed || isSubmitting) && styles.submitPressed]}
              disabled={isSubmitting}
              onPress={handleSubmitReview}>
              <Text style={styles.submitButtonText}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</Text>
              <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <Text>Loading reviews...</Text>
        </View>
      ) : (
        <FlatList
          data={reviewsData?.reviews || []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <MaterialCommunityIcons name="chevron-left" size={24} color="#1A1A1A" />
              </Pressable>
              <Text style={styles.composeTitle}>Ratings & Feedbacks</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  composeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  composeContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
  },
  orderThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orderThumbImage: {
    width: '100%',
    height: '100%',
  },
  orderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  orderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  orderMeta: {
    marginTop: 3,
    fontSize: 13,
    color: '#8A8A8A',
  },
  ratingBlock: {
    alignItems: 'center',
    marginTop: 24,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  deliveryCard: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    paddingVertical: 14,
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  starRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  starButton: {
    marginHorizontal: 4,
  },
  sectionHeading: {
    marginTop: 22,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  reviewInput: {
    marginTop: 12,
    minHeight: 124,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  reviewInputDisabled: {
    backgroundColor: '#FAFAFA',
    color: '#555555',
  },
  photosSection: {
    marginTop: 20,
  },
  addPhotoTile: {
    width: 92,
    height: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D6D6D6',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTilePressed: {
    opacity: 0.8,
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 13,
    color: '#9A9A9A',
  },
  photoPreviewRow: {
    gap: 10,
    paddingTop: 14,
    paddingRight: 4,
  },
  selectedPhoto: {
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
  },
  highlightsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  highlightChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#FFFFFF',
  },
  highlightChipActive: {
    backgroundColor: '#FCE9E5',
    borderColor: '#F0C3B8',
  },
  highlightChipText: {
    fontSize: 14,
    color: '#474747',
  },
  highlightChipTextActive: {
    color: '#B62618',
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 26,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#AC1D10',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitPressed: {
    opacity: 0.82,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  submittedBanner: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CDEDD7',
    backgroundColor: '#F1FBF4',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  submittedText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#24623B',
    fontWeight: '600',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  reviewStarsSmall: {
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
    marginBottom: 4,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
