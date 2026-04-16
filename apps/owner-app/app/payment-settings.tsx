import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentSettingsScreen() {
  const headerScale = useSharedValue(0.95);
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerScale.value = withDelay(100, withSpring(1, { damping: 12 }));
  }, []);

  const headerAnim = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  // --- Modal State ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<
    'select' | 'bank_details' | 'otp' | 'verifying' | 'wallet_select' | 'wallet_link' | 'wallet_verify' | 'wallet_success'
  >('select');

  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'wallet'>('bank');
  const [selectedBank, setSelectedBank] = useState<'BDO' | 'BPI' | 'Metrobank' | 'UnionBank'>('BDO');
  const [selectedWallet, setSelectedWallet] = useState<'GCash' | 'Maya'>('GCash');

  const openModal = () => {
    setModalStep('select');
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  // Helper for timeline indicator in modal
  const renderTimeline = (currentActiveIdx: number) => {
    return (
      <View style={modalStyles.timelineWrap}>
        {/* Bank Details */}
        <View style={modalStyles.timelineStep}>
          <View
            style={[
              modalStyles.timelineIcon,
              currentActiveIdx >= 1 ? modalStyles.timelineIconActive : {},
            ]}>
            <MaterialCommunityIcons
              name="bank-outline"
              size={12}
              color={currentActiveIdx >= 1 ? '#FFF' : '#AAA'}
            />
          </View>
          <Text
            style={[
              modalStyles.timelineText,
              currentActiveIdx >= 1 ? modalStyles.timelineTextActive : {},
            ]}>
            Bank Details
          </Text>
        </View>

        <View
          style={[
            modalStyles.timelineLine,
            currentActiveIdx >= 2 ? modalStyles.timelineLineActive : {},
          ]}
        />

        {/* Verification */}
        <View style={modalStyles.timelineStep}>
          <View
            style={[
              modalStyles.timelineIcon,
              currentActiveIdx >= 2 ? modalStyles.timelineIconActive : {},
            ]}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={12}
              color={currentActiveIdx >= 2 ? '#FFF' : '#AAA'}
            />
          </View>
          <Text
            style={[
              modalStyles.timelineText,
              currentActiveIdx >= 2 ? modalStyles.timelineTextActive : {},
            ]}>
            Verification
          </Text>
        </View>

        <View
          style={[
            modalStyles.timelineLine,
            currentActiveIdx >= 3 ? modalStyles.timelineLineActive : {},
          ]}
        />

        {/* Confirmation */}
        <View style={modalStyles.timelineStep}>
          <View
            style={[
              modalStyles.timelineIcon,
              currentActiveIdx >= 3 ? modalStyles.timelineIconActive : {},
            ]}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={12}
              color={currentActiveIdx >= 3 ? '#FFF' : '#AAA'}
            />
          </View>
          <Text
            style={[
              modalStyles.timelineText,
              currentActiveIdx >= 3 ? modalStyles.timelineTextActive : {},
            ]}>
            Confirmation
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Top Header Row with Logo */}
          <Animated.View style={[styles.topNavRow, headerAnim]}>
            <Pressable
              style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]}
              onPress={() => router.back()}>
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

            <View style={styles.topNavRight}>
              <Pressable style={styles.bellWrap}>
                <MaterialCommunityIcons name="bell-outline" size={20} color="#1A1A1A" />
                <View style={styles.bellBadge} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Global Search bar */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
            <Text style={styles.searchText}>Search items...</Text>
          </Animated.View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Header Title */}
            <Animated.View entering={FadeInLeft.delay(150).duration(400)}>
              <Text style={styles.pageTitle}>Payment Settings</Text>
              <Text style={styles.pageSubtitle}>
                Manage how you receive payments and configure your tax compliance details.
              </Text>
            </Animated.View>

            {/* Payment Method Section */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Payment Method</Text>

              <View style={styles.emptyStateCard}>
                <View style={styles.emptyStateIconWrap}>
                  <MaterialCommunityIcons name="wallet-outline" size={24} color="#AC1D10" />
                </View>
                <Text style={styles.emptyStateTitle}>No payout method connected</Text>
                <Text style={styles.emptyStateDesc}>
                  Connect a bank account or e-wallet to start receiving your automatic payouts. It
                  only takes a few minutes to set up.
                </Text>

                <Pressable style={styles.addBtn} onPress={openModal}>
                  <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                  <Text style={styles.addBtnText}>Add Payment Method</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Tax Information Section */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.sectionWrap}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Tax Information</Text>
                <Text style={styles.cardDesc}>
                  Federal regulations require us to collect tax information from all partners. Your
                  payouts will be paused until this is completed.
                </Text>

                <View style={styles.warnPill}>
                  <Text style={styles.warnText}>
                    <Text style={{ fontWeight: '700' }}>Status:</Text> Action Required
                  </Text>
                </View>

                <Pressable style={styles.outlineBtn}>
                  <Text style={styles.outlineBtnText}>Complete Tax Interview</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Payout Schedule Section */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sectionWrap}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Payout Schedule</Text>
                <Text style={styles.cardDesc}>
                  By default, your earnings are settled every Monday. You can change your frequency
                  once your first payout is processed.
                </Text>

                <View style={styles.rowBetween}>
                  <Text style={styles.rowLabel}>Current Cycle</Text>
                  <Text style={styles.rowValue}>Weekly (Mondays)</Text>
                </View>
                <View style={[styles.rowBetween, { marginTop: 12, marginBottom: 20 }]}>
                  <Text style={styles.rowLabel}>Next Payout</Text>
                  <Text style={styles.rowValue}>Pending setup</Text>
                </View>

                <Pressable style={[styles.addBtn, { alignSelf: 'stretch', width: 'auto' }]}>
                  <Text style={styles.addBtnText}>Modify Schedule</Text>
                </Pressable>
              </View>
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* --- ADD PAYMENT WIZARD MODAL --- */}
      {modalVisible && (
        <Modal transparent animationType="fade" visible={modalVisible}>
          <View style={modalStyles.overlay}>
            <View style={modalStyles.modalContainer}>
              <View style={modalStyles.modalHeader}>
                <View>
                  {modalStep !== 'select' && modalStep !== 'wallet_success' && (
                    <Text style={modalStyles.stepCountText}>
                      Step {['bank_details', 'wallet_select', 'wallet_link'].includes(modalStep) ? '1' : ['otp', 'wallet_verify'].includes(modalStep) ? '2' : '3'} of 3
                    </Text>
                  )}
                  <Text style={modalStyles.modalTitle}>
                    {modalStep === 'select' && 'Select payout method'}
                    {modalStep === 'bank_details' && 'Add Bank Account Details'}
                    {modalStep === 'otp' && 'Bank Verification'}
                    {modalStep === 'verifying' && 'Bank Verification'}
                    {modalStep === 'wallet_select' && 'Choose E-Wallet'}
                    {modalStep === 'wallet_link' && `Link ${selectedWallet} Wallet`}
                    {modalStep === 'wallet_verify' && 'Verify E-Wallet'}
                    {modalStep === 'wallet_success' && 'Linked Successfully'}
                  </Text>
                </View>
                <Pressable style={modalStyles.closeBtn} onPress={closeModal}>
                  <MaterialCommunityIcons name="close" size={20} color="#666" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {modalStep === 'select' && (
                  <Animated.View entering={FadeIn}>
                    <Text style={modalStyles.modalSubtitle}>
                      Choose how you want to receive your earnings from TMC Foodhub.
                    </Text>

                    <Pressable
                      style={[
                        modalStyles.optionCard,
                        selectedMethod === 'bank' && modalStyles.optionCardSelected,
                      ]}
                      onPress={() => setSelectedMethod('bank')}>
                      <View style={modalStyles.optionIconWrap}>
                        <MaterialCommunityIcons name="bank-outline" size={18} color="#AC1D10" />
                      </View>
                      <Text style={modalStyles.optionTitle}>Bank Transfer</Text>
                      <Text style={modalStyles.optionDesc}>
                        Secure direct deposits to any major bank. Standard processing times apply
                        (1-3 business days).
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        modalStyles.optionCard,
                        selectedMethod === 'wallet' && modalStyles.optionCardSelected,
                      ]}
                      onPress={() => setSelectedMethod('wallet')}>
                      <View style={[modalStyles.optionIconWrap, { backgroundColor: '#F0F0F0' }]}>
                        <MaterialCommunityIcons name="wallet-outline" size={18} color="#888" />
                      </View>
                      <Text style={modalStyles.optionTitle}>E-Wallet</Text>
                      <Text style={modalStyles.optionDesc}>
                        Instant payouts to GCash or Maya. Funds are available immediately after
                        processing.
                      </Text>
                    </Pressable>

                    <Pressable
                      style={modalStyles.continueBtnRight}
                      onPress={() => setModalStep(selectedMethod === 'bank' ? 'bank_details' : 'wallet_select')}>
                      <Text style={modalStyles.continueBtnText}>Continue</Text>
                    </Pressable>
                  </Animated.View>
                )}

                {modalStep === 'bank_details' && (
                  <Animated.View entering={FadeIn}>
                    <Text style={modalStyles.modalSubtitle}>
                      Set up your settlement account to start receiving payments.
                    </Text>

                    {renderTimeline(1)}

                    <View style={modalStyles.formSection}>
                      <Text style={modalStyles.inputLabel}>Select your bank</Text>

                      <Pressable
                        style={[
                          modalStyles.bankSelectRow,
                          selectedBank === 'BDO' && modalStyles.bankSelectRowActive,
                        ]}
                        onPress={() => setSelectedBank('BDO')}>
                        <MaterialCommunityIcons
                          name={selectedBank === 'BDO' ? 'radiobox-marked' : 'radiobox-blank'}
                          size={18}
                          color={selectedBank === 'BDO' ? '#AC1D10' : '#CCC'}
                        />
                        <View style={[modalStyles.bankLogoMock, { backgroundColor: '#0B4D8D' }]}>
                          <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700' }}>BDO</Text>
                        </View>
                        <Text style={modalStyles.bankNameText}>BDO</Text>
                      </Pressable>

                      <Pressable
                        style={[
                          modalStyles.bankSelectRow,
                          selectedBank === 'BPI' && modalStyles.bankSelectRowActive,
                        ]}
                        onPress={() => setSelectedBank('BPI')}>
                        <MaterialCommunityIcons
                          name={selectedBank === 'BPI' ? 'radiobox-marked' : 'radiobox-blank'}
                          size={18}
                          color={selectedBank === 'BPI' ? '#AC1D10' : '#CCC'}
                        />
                        <View style={[modalStyles.bankLogoMock, { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' }]}>
                          <Text style={{ color: '#AC1D10', fontSize: 8, fontWeight: '700' }}>BPI</Text>
                        </View>
                        <Text style={modalStyles.bankNameText}>BPI</Text>
                      </Pressable>

                      <Pressable
                        style={[
                          modalStyles.bankSelectRow,
                          selectedBank === 'Metrobank' && modalStyles.bankSelectRowActive,
                        ]}
                        onPress={() => setSelectedBank('Metrobank')}>
                        <MaterialCommunityIcons
                          name={selectedBank === 'Metrobank' ? 'radiobox-marked' : 'radiobox-blank'}
                          size={18}
                          color={selectedBank === 'Metrobank' ? '#AC1D10' : '#CCC'}
                        />
                        <View style={[modalStyles.bankLogoMock, { backgroundColor: '#0F448C' }]}>
                          <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700' }}>MB</Text>
                        </View>
                        <Text style={modalStyles.bankNameText}>Metrobank</Text>
                      </Pressable>

                      <Pressable
                        style={[
                          modalStyles.bankSelectRow,
                          selectedBank === 'UnionBank' && modalStyles.bankSelectRowActive,
                        ]}
                        onPress={() => setSelectedBank('UnionBank')}>
                        <MaterialCommunityIcons
                          name={selectedBank === 'UnionBank' ? 'radiobox-marked' : 'radiobox-blank'}
                          size={18}
                          color={selectedBank === 'UnionBank' ? '#AC1D10' : '#CCC'}
                        />
                        <View style={[modalStyles.bankLogoMock, { backgroundColor: '#E46624' }]}>
                          <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700' }}>UB</Text>
                        </View>
                        <Text style={modalStyles.bankNameText}>Union Bank</Text>
                      </Pressable>

                      <View style={{ marginTop: 16 }}>
                        <Text style={modalStyles.inputLabel}>Account Name</Text>
                        <TextInput
                          style={modalStyles.textInput}
                          placeholder="e.g. Juan Dela Cruz"
                          placeholderTextColor="#AAA"
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <MaterialCommunityIcons name="information" size={10} color="#888" />
                          <Text style={modalStyles.helperTextSmall}>
                            Must exactly match the name on your bank records.
                          </Text>
                        </View>
                      </View>

                      <View style={{ marginTop: 16 }}>
                        <Text style={modalStyles.inputLabel}>Account Number</Text>
                        <TextInput
                          style={modalStyles.textInput}
                          placeholder="0000 0000 0000"
                          placeholderTextColor="#AAA"
                          keyboardType="numeric"
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <MaterialCommunityIcons name="information" size={10} color="#888" />
                          <Text style={modalStyles.helperTextSmall}>Contains only numbers</Text>
                        </View>
                      </View>

                      <View style={modalStyles.alertBox}>
                        <MaterialCommunityIcons name="information" size={14} color="#952011" />
                        <Text style={modalStyles.alertBoxText}>
                          <Text style={{ fontWeight: '700' }}>Why we need this:</Text> We use these
                          details to process your earnings. Please double-check for accuracy to
                          avoid payment delays.
                        </Text>
                      </View>

                      <View style={modalStyles.actionsRow}>
                        <Pressable
                          style={modalStyles.actionBtnOutline}
                          onPress={() => setModalStep('select')}>
                          <Text style={modalStyles.actionBtnOutlineText}>Back</Text>
                        </Pressable>
                        <Pressable
                          style={modalStyles.actionBtnPrimary}
                          onPress={() => setModalStep('otp')}>
                          <Text style={modalStyles.actionBtnPrimaryText}>Continue</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                )}

                {modalStep === 'otp' && (
                  <Animated.View entering={FadeIn}>
                    <Text style={modalStyles.modalSubtitle}>
                      Verify your bank account to securely receive payouts and prevent payment errors.
                    </Text>
                    {renderTimeline(2)}

                    <View style={modalStyles.centralFormBox}>
                      <View style={modalStyles.verifyIconWrapBig}>
                        <MaterialCommunityIcons name="cellphone-message" size={24} color="#AC1D10" />
                      </View>

                      <Text style={modalStyles.verifyTitle}>Verify it's you</Text>
                      <Text style={modalStyles.verifySubtitleCenter}>
                        For security reasons, please verify this change. We've sent a 6-digit code
                        to your registered mobile number ending in **** 4829.
                      </Text>

                      <View style={modalStyles.otpWrap}>
                        <View style={modalStyles.otpBoxActive}>
                          <Text style={modalStyles.otpTextActive}>3</Text>
                        </View>
                        <View style={modalStyles.otpBoxActive}>
                          <Text style={modalStyles.otpTextActive}>8</Text>
                        </View>
                        <View style={modalStyles.otpBoxActive}>
                          <Text style={modalStyles.otpTextActive}>2</Text>
                        </View>
                        <View style={modalStyles.otpBox}>
                          <Text style={modalStyles.otpText}>0</Text>
                        </View>
                        <View style={modalStyles.otpBox}>
                          <Text style={modalStyles.otpText}>0</Text>
                        </View>
                        <View style={modalStyles.otpBox}>
                          <Text style={modalStyles.otpText}>0</Text>
                        </View>
                      </View>

                      <Pressable
                        style={[modalStyles.actionBtnPrimary, { alignSelf: 'stretch' }]}
                        onPress={() => setModalStep('verifying')}>
                        <Text style={modalStyles.actionBtnPrimaryText}>Verify & Connect Account</Text>
                      </Pressable>

                      <Text style={modalStyles.resendText}>
                        Didn't receive the code? <Text style={{ color: '#AC1D10', fontWeight: '700' }}>Resend OTP (1:59s)</Text>
                      </Text>
                    </View>

                    <View style={modalStyles.actionsRow}>
                      <Pressable
                        style={modalStyles.actionBtnOutline}
                        onPress={() => setModalStep('bank_details')}>
                        <Text style={modalStyles.actionBtnOutlineText}>Back</Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                )}

                {modalStep === 'verifying' && (
                  <Animated.View entering={FadeIn}>
                    <Text style={modalStyles.modalSubtitle}>
                      Verify your bank account to securely receive payouts and prevent payment errors.
                    </Text>
                    {renderTimeline(3)}

                    <View style={modalStyles.centralFormBox}>
                      <View style={modalStyles.verifyIconWrapBig}>
                        <MaterialCommunityIcons name="refresh" size={24} color="#AC1D10" />
                      </View>

                      <Text style={modalStyles.verifyTitle}>Verifying your first account...</Text>
                      <Text style={modalStyles.verifySubtitleCenter}>
                        We are confirming your ownership with the bank network.{'\n'}
                        This usually takes a few seconds.
                      </Text>

                      <View style={modalStyles.verifiedCard}>
                        <View style={modalStyles.verifiedRowLeft}>
                          <View style={[modalStyles.bankLogoMock, { backgroundColor: '#0B4D8D', width: 24, height: 24, marginRight: 8 }]}>
                            <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700' }}>BDO</Text>
                          </View>
                          <View>
                            <Text style={modalStyles.verifiedAcctName}>Patty Shack</Text>
                            <Text style={modalStyles.verifiedAcctNum}>BDO **** **** 8821</Text>
                          </View>
                        </View>
                        <View style={modalStyles.verifiedPill}>
                          <MaterialCommunityIcons name="check-circle" size={12} color="#059669" />
                          <Text style={modalStyles.verifiedPillText}>Verified</Text>
                        </View>
                      </View>

                      <View style={[modalStyles.alertBox, { marginTop: 16 }]}>
                        <MaterialCommunityIcons name="information" size={14} color="#952011" />
                        <Text style={modalStyles.alertBoxText}>
                          Once verification is complete, your first settlement will be processed on
                          the next Tuesday. Click Finish to continue.
                        </Text>
                      </View>
                    </View>

                    <View style={modalStyles.actionsRow}>
                      <Pressable
                        style={modalStyles.actionBtnOutline}
                        onPress={() => setModalStep('otp')}>
                        <Text style={modalStyles.actionBtnOutlineText}>Back</Text>
                      </Pressable>
                      <Pressable
                        style={modalStyles.actionBtnPrimary}
                        onPress={closeModal}>
                        <Text style={modalStyles.actionBtnPrimaryText}>Finish</Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                )}

                {modalStep === 'wallet_select' && (
                  <Animated.View entering={FadeIn}>
                    <Text style={modalStyles.modalSubtitle}>
                      Select your preferred account for instant payouts. TMC Foodhub partners enjoy zero-fee settlements.
                    </Text>

                    {renderTimeline(1)}

                    <View style={modalStyles.formSection}>
                      <Text style={modalStyles.inputLabel}>Select your e-wallet</Text>

                      <Pressable
                        style={[
                          modalStyles.bankSelectRow,
                          selectedWallet === 'GCash' && modalStyles.bankSelectRowActive,
                        ]}
                        onPress={() => setSelectedWallet('GCash')}>
                        <MaterialCommunityIcons
                          name={selectedWallet === 'GCash' ? 'radiobox-marked' : 'radiobox-blank'}
                          size={18}
                          color={selectedWallet === 'GCash' ? '#AC1D10' : '#CCC'}
                        />
                        <View style={[modalStyles.bankLogoMock, { backgroundColor: '#007BF3' }]}>
                          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>G</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.bankNameText}>GCash</Text>
                          <Text style={{ fontSize: 9, color: '#AC1D10', marginTop: 2 }}>Instant transfers to your GCash mobile wallet.</Text>
                        </View>
                      </Pressable>

                      <Pressable
                        style={[
                          modalStyles.bankSelectRow,
                          selectedWallet === 'Maya' && modalStyles.bankSelectRowActive,
                        ]}
                        onPress={() => setSelectedWallet('Maya')}>
                        <MaterialCommunityIcons
                          name={selectedWallet === 'Maya' ? 'radiobox-marked' : 'radiobox-blank'}
                          size={18}
                          color={selectedWallet === 'Maya' ? '#AC1D10' : '#CCC'}
                        />
                        <View style={[modalStyles.bankLogoMock, { backgroundColor: '#000000', borderRadius: 6 }]}>
                          <Text style={{ color: '#00D165', fontSize: 7, fontWeight: '800' }}>maya</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.bankNameText}>Maya</Text>
                          <Text style={{ fontSize: 9, color: '#888', marginTop: 2 }}>Receive payouts to your Maya Business account.</Text>
                        </View>
                      </Pressable>

                      <View style={modalStyles.actionsRow}>
                        <Pressable
                          style={modalStyles.actionBtnOutline}
                          onPress={() => setModalStep('select')}>
                          <Text style={modalStyles.actionBtnOutlineText}>Back</Text>
                        </Pressable>
                        <Pressable
                          style={modalStyles.actionBtnPrimary}
                          onPress={() => setModalStep('wallet_link')}>
                          <Text style={modalStyles.actionBtnPrimaryText}>Continue</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                )}

                {modalStep === 'wallet_link' && (
                  <Animated.View entering={FadeIn}>
                    <Text style={modalStyles.modalSubtitle}>
                      Secure payout connection for TMC Foodhub.
                    </Text>

                    {renderTimeline(1)}

                    <View style={modalStyles.formSection}>
                      <View style={modalStyles.alertBoxAlt}>
                        <MaterialCommunityIcons name="information" size={14} color="#952011" />
                        <Text style={modalStyles.alertBoxText}>
                          Enter your registered mobile number to receive a secure authorization code.
                        </Text>
                      </View>

                      <View style={{ marginTop: 20 }}>
                        <Text style={modalStyles.inputLabel}>Mobile Number</Text>
                        <TextInput
                          style={modalStyles.textInput}
                          placeholder="+63 9XX XXX XXXX"
                          placeholderTextColor="#AAA"
                          keyboardType="phone-pad"
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <MaterialCommunityIcons name="information" size={10} color="#888" />
                          <Text style={modalStyles.helperTextSmall}>
                            Must exactly match the name on your bank records.
                          </Text>
                        </View>
                      </View>

                      <View style={modalStyles.checkboxRow}>
                        <View style={modalStyles.checkboxChecked}>
                          <MaterialCommunityIcons name="check" size={12} color="#FFF" />
                        </View>
                        <Text style={modalStyles.checkboxLabelText}>
                          I authorize TMC Foodhub to facilitate automated payouts to my GCash account 
                          and agree to the <Text style={{ color: '#AC1D10', fontWeight: '700' }}>Terms of Service.</Text>
                        </Text>
                      </View>

                      <View style={modalStyles.actionsRow}>
                        <Pressable
                          style={modalStyles.actionBtnOutline}
                          onPress={() => setModalStep('wallet_select')}>
                          <Text style={modalStyles.actionBtnOutlineText}>Back</Text>
                        </Pressable>
                        <Pressable
                          style={modalStyles.actionBtnPrimary}
                          onPress={() => setModalStep('wallet_verify')}>
                          <Text style={modalStyles.actionBtnPrimaryText}>Continue</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                )}

                {modalStep === 'wallet_verify' && (
                  <Animated.View entering={FadeIn}>
                    <Text style={modalStyles.modalSubtitle}>
                      Verify your e-wallet to securely receive payouts and prevent payment errors.
                    </Text>
                    {renderTimeline(2)}

                    <View style={modalStyles.centralFormBox}>
                      <View style={modalStyles.verifyIconWrapBig}>
                        <MaterialCommunityIcons name="cellphone-message" size={24} color="#AC1D10" />
                      </View>

                      <Text style={modalStyles.verifyTitle}>Verify it's you</Text>
                      <Text style={modalStyles.verifySubtitleCenter}>
                        For security reasons, please verify this change. We've sent a 6-digit code
                        to your registered mobile number ending in **** 8829.
                      </Text>

                      <View style={modalStyles.otpWrap}>
                        <View style={modalStyles.otpBoxActive}>
                          <Text style={modalStyles.otpTextActive}>2</Text>
                        </View>
                        <View style={modalStyles.otpBoxActive}>
                          <Text style={modalStyles.otpTextActive}>4</Text>
                        </View>
                        <View style={modalStyles.otpBoxActive}>
                          <Text style={modalStyles.otpTextActive}>6</Text>
                        </View>
                        <View style={modalStyles.otpBox}>
                          <Text style={modalStyles.otpText}>0</Text>
                        </View>
                        <View style={modalStyles.otpBox}>
                          <Text style={modalStyles.otpText}>0</Text>
                        </View>
                        <View style={modalStyles.otpBox}>
                          <Text style={modalStyles.otpText}>0</Text>
                        </View>
                      </View>

                      <Pressable
                        style={[modalStyles.actionBtnPrimary, { alignSelf: 'stretch' }]}
                        onPress={() => setModalStep('wallet_success')}>
                        <Text style={modalStyles.actionBtnPrimaryText}>Verify & Connect Account</Text>
                      </Pressable>

                      <Text style={modalStyles.resendText}>
                        Didn't receive the code? <Text style={{ color: '#AC1D10', fontWeight: '700' }}>Resend OTP (1:59s)</Text>
                      </Text>
                    </View>

                    <View style={modalStyles.actionsRow}>
                      <Pressable
                        style={modalStyles.actionBtnOutline}
                        onPress={() => setModalStep('wallet_link')}>
                        <Text style={modalStyles.actionBtnOutlineText}>Back</Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                )}

                {modalStep === 'wallet_success' && (
                  <Animated.View entering={FadeIn}>
                    <Text style={modalStyles.modalSubtitle}>
                      Your account is now ready for seamless payouts and faster transactions.
                    </Text>

                    <View style={[modalStyles.centralFormBox, { marginBottom: 24, padding: 20 }]}>
                      <View style={[modalStyles.verifyIconWrapBig, { backgroundColor: '#ECFDF5', width: 44, height: 44, borderRadius: 22, marginTop: -32 }]}>
                        <MaterialCommunityIcons name="check" size={20} color="#059669" />
                      </View>

                      <View style={[modalStyles.verifiedCard, { marginTop: 16 }]}>
                        <View style={modalStyles.verifiedRowLeft}>
                          <View style={[modalStyles.bankLogoMock, { backgroundColor: '#007BF3', width: 28, height: 28, borderRadius: 14, marginRight: 10 }]}>
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>G</Text>
                          </View>
                          <View>
                            <Text style={modalStyles.verifiedAcctName}>GCash Account</Text>
                            <Text style={modalStyles.verifiedAcctNum}>**** **** 8829</Text>
                          </View>
                        </View>
                        <View style={modalStyles.verifiedPill}>
                          <MaterialCommunityIcons name="circle" size={6} color="#059669" />
                          <Text style={[modalStyles.verifiedPillText, { marginLeft: 2 }]}>Active</Text>
                        </View>
                      </View>

                      <View style={modalStyles.scheduleSummaryCard}>
                        <MaterialCommunityIcons name="calendar-blank" size={14} color="#AC1D10" style={{ marginTop: 2 }} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={modalStyles.scheduleSubText}>Next scheduled payout</Text>
                          <Text style={modalStyles.scheduleBoldText}>Tuesday, Mar 10</Text>
                          <Text style={modalStyles.scheduleTinyText}>Estimated arrival: 1-3 business days</Text>
                        </View>
                      </View>
                    </View>

                    <View style={[modalStyles.actionsRow, { marginTop: 0 }]}>
                      <Pressable
                        style={modalStyles.actionBtnPrimary}
                        onPress={closeModal}>
                        <Text style={modalStyles.actionBtnPrimaryText}>Done</Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FEFEFE' },
  container: { flex: 1 },
  pressed: { opacity: 0.7 },

  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuBtn: { padding: 4 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  logoTitle: { fontSize: 8, color: '#1A1A1A', fontWeight: '500', lineHeight: 10 },
  logoBold: { fontWeight: '900', color: '#AC1D10' },
  topNavRight: { flexDirection: 'row', alignItems: 'center' },
  bellWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#AC1D10',
  },

  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 20,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FDFDFD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchText: { fontSize: 14, color: '#AAA' },
  scroll: { paddingHorizontal: 16 },

  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontSize: 12, color: '#777', lineHeight: 18, marginBottom: 24, paddingRight: 20 },

  sectionWrap: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },

  emptyStateCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyStateIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  emptyStateDesc: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 18, marginBottom: 24 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#952011',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 6,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },

  card: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  cardDesc: { fontSize: 11, color: '#777', lineHeight: 16, marginBottom: 16 },

  warnPill: {
    backgroundColor: '#FCF5E3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  warnText: { fontSize: 11, color: '#B45309' },

  outlineBtn: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineBtnText: { fontSize: 12, fontWeight: '600', color: '#333' },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 11, color: '#888' },
  rowValue: { fontSize: 11, fontWeight: '700', color: '#1A1A1A' },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  stepCountText: { fontSize: 10, fontWeight: '700', color: '#AC1D10', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  closeBtn: { padding: 4 },
  modalSubtitle: { fontSize: 12, color: '#777', lineHeight: 18, marginBottom: 24, paddingRight: 20 },

  /* Step 1 Select */
  optionCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionCardSelected: { borderColor: '#AC1D10', backgroundColor: '#FFFDFD' },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  optionDesc: { fontSize: 11, color: '#777', textAlign: 'center', lineHeight: 16, paddingHorizontal: 10 },

  continueBtnRight: {
    backgroundColor: '#952011',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  continueBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },

  /* Timeline */
  timelineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  timelineStep: { alignItems: 'center', gap: 6 },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineIconActive: { borderColor: '#952011', backgroundColor: '#952011' },
  timelineText: { fontSize: 9, color: '#AAA', fontWeight: '600' },
  timelineTextActive: { color: '#952011' },
  timelineLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: -15, // visually connect
    marginTop: -15,
  },
  timelineLineActive: { backgroundColor: '#952011' },

  /* Forms */
  formSection: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 12, padding: 16 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  bankSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  bankSelectRowActive: { borderColor: '#AC1D10', backgroundColor: '#FFFDFD' },
  bankLogoMock: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankNameText: { fontSize: 12, color: '#333' },

  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#1A1A1A',
  },
  helperTextSmall: { fontSize: 9, color: '#888', marginLeft: 4 },

  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#FDF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  alertBoxText: { flex: 1, fontSize: 10, color: '#952011', lineHeight: 14 },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 24 },
  actionBtnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnOutlineText: { fontSize: 13, fontWeight: '600', color: '#333' },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: '#952011',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnPrimaryText: { fontSize: 13, fontWeight: '600', color: '#FFF' },

  /* Verifying & OTP */
  centralFormBox: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  verifyIconWrapBig: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifyTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  verifySubtitleCenter: { fontSize: 11, color: '#666', textAlign: 'center', lineHeight: 16, marginBottom: 24 },

  otpWrap: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  otpBox: { width: 36, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  otpBoxActive: { width: 36, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#AC1D10', alignItems: 'center', justifyContent: 'center' },
  otpText: { fontSize: 16, color: '#CCC' },
  otpTextActive: { fontSize: 16, fontWeight: '700', color: '#AC1D10' },

  resendText: { fontSize: 10, color: '#888', marginTop: 16 },

  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
  },
  verifiedRowLeft: { flexDirection: 'row', alignItems: 'center' },
  verifiedAcctName: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  verifiedAcctNum: { fontSize: 10, color: '#888', marginTop: 2 },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedPillText: { fontSize: 9, fontWeight: '700', color: '#059669' },

  alertBoxAlt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    padding: 0,
    marginTop: 8,
    gap: 8,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 24, gap: 10, paddingRight: 10 },
  checkboxChecked: { width: 18, height: 18, borderRadius: 4, backgroundColor: '#952011', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxLabelText: { fontSize: 10, color: '#666', lineHeight: 16, flex: 1 },

  scheduleSummaryCard: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  scheduleSubText: { fontSize: 9, color: '#888' },
  scheduleBoldText: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginVertical: 2 },
  scheduleTinyText: { fontSize: 9, color: '#AAA' },
});
