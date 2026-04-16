import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutLeft, FadeOutRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleLogo } from '@/components/google-logo';
import { TmcLogo } from '@/components/tmc-logo';
import { CustomerSignupPayload, OwnerSignupPayload, useAuth } from '@/contexts/auth-context';

export default function SignUpScreen() {
  const { signUpCustomer, signUpOwner, sendSignupOtp, signUpWithGoogleCredential } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 State
  const [userType, setUserType] = useState<'customer' | 'partner'>('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2 State
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessContactNumber, setBusinessContactNumber] = useState('');
  const [businessPermit, setBusinessPermit] = useState('');

  // Step 3 State
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptMerchantAgreement, setAcceptMerchantAgreement] = useState(false);
  const [optInNews, setOptInNews] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState('');

  // Social Signup State
  const [googleCredential, setGoogleCredential] = useState('');

  // Request State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpStatusMessage, setOtpStatusMessage] = useState<string | null>(null);

  const handleBack = () => {
    if (isSubmitting) {
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const isValidEmail = (value: string) => {
    return /^\S+@\S+\.\S+$/.test(value);
  };

  const validateStep1 = () => {
    if (!firstName.trim()) {
      return 'Please enter your first name.';
    }

    if (!lastName.trim()) {
      return 'Please enter your last name.';
    }

    if (!email.trim()) {
      return 'Please enter your email.';
    }

    if (!isValidEmail(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (!password) {
      return 'Please enter a password.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    if (password !== confirmPassword) {
      return 'Password confirmation does not match.';
    }

    return null;
  };

  const validateStep2 = () => {
    if (userType === 'customer') {
      if (!address.trim()) {
        return 'Please enter your address.';
      }

      if (!contactNumber.trim()) {
        return 'Please enter your contact number.';
      }

      return null;
    }

    if (!restaurantName.trim()) {
      return 'Please enter your restaurant name.';
    }

    if (!businessAddress.trim()) {
      return 'Please enter your business address.';
    }

    if (!businessContactNumber.trim()) {
      return 'Please enter your business contact number.';
    }

    if (!businessPermit.trim()) {
      return 'Please enter your business permit number.';
    }

    return null;
  };

  const validateStep3 = () => {
    if (!emailVerificationToken.trim()) {
      return 'Please enter your email verification token.';
    }

    if (!acceptTerms) {
      return 'You need to accept Terms & Conditions to continue.';
    }

    if (!acceptPrivacy) {
      return 'You need to accept Privacy Policy to continue.';
    }

    if (userType === 'partner' && !acceptMerchantAgreement) {
      return 'You need to accept the Merchant Agreement to continue.';
    }

    return null;
  };

  const handleStep1Next = () => {
    const validationMessage = validateStep1();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    const validationMessage = validateStep2();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage(null);
    setCurrentStep(3);
  };

  const handleFacebookSignup = () => {
    setErrorMessage('Facebook signup is not available yet.');
  };

  const handleGoogleSignup = async () => {
    const credential = googleCredential.trim();

    if (!credential) {
      setErrorMessage('Please paste your Google credential token to continue with Google signup.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await signUpWithGoogleCredential(credential);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    router.replace(result.authenticated ? '/(tabs)' : '/(auth)/login');
  };

  const handleSendSignupOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage('Please enter your email on Step 1 before requesting OTP.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address before requesting OTP.');
      return;
    }

    if (Platform.OS === 'web') {
      const endpoint = userType === 'partner'
        ? 'https://foodhub.tmc-innovations.com/api/owner/send-otp'
        : 'https://foodhub.tmc-innovations.com/api/send-otp';

      setErrorMessage(null);
      setOtpStatusMessage(null);
      setIsSendingOtp(true);

      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `email=${encodeURIComponent(normalizedEmail)}`,
          mode: 'no-cors',
        } as RequestInit);

        setOtpStatusMessage('OTP request submitted. If your email is eligible, check your inbox.');
      } catch {
        setErrorMessage('Unable to send OTP from web right now. Please try Android/iOS.');
      } finally {
        setIsSendingOtp(false);
      }

      return;
    }

    setErrorMessage(null);
    setOtpStatusMessage(null);
    setIsSendingOtp(true);

    const result = await sendSignupOtp(normalizedEmail, userType);

    setIsSendingOtp(false);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setOtpStatusMessage(result.message);
  };

  const handleFinishSignup = async () => {
    const validationMessage = validateStep3();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    if (Platform.OS === 'web') {
      const trimmedBusinessAddress = businessAddress.trim();
      const trimmedBusinessContact = businessContactNumber.trim();

      const endpoint = userType === 'partner'
        ? 'https://foodhub.tmc-innovations.com/api/owner/register'
        : 'https://foodhub.tmc-innovations.com/api/register';

      const formPayload: Record<string, string> = userType === 'partner'
        ? {
            email_verification_token: emailVerificationToken.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            password,
            password_confirmation: confirmPassword,
            restaurant_name: restaurantName.trim(),
            business_address: trimmedBusinessAddress,
            business_contact_number: trimmedBusinessContact,
            business_permit: businessPermit.trim(),
            terms_accepted: acceptTerms ? '1' : '0',
            privacy_accepted: acceptPrivacy ? '1' : '0',
            merchant_agreement_accepted: acceptMerchantAgreement ? '1' : '0',
            phone: trimmedBusinessContact,
            address: trimmedBusinessAddress,
          }
        : {
            email_verification_token: emailVerificationToken.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            password,
            password_confirmation: confirmPassword,
            terms_accepted: acceptTerms ? '1' : '0',
            privacy_accepted: acceptPrivacy ? '1' : '0',
            address: address.trim(),
            phone: contactNumber.trim(),
            delivery_instructions: deliveryInstructions.trim(),
          };

      const encodedBody = Object.entries(formPayload)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      setErrorMessage(null);
      setOtpStatusMessage(null);
      setIsSubmitting(true);

      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: encodedBody,
          mode: 'no-cors',
        } as RequestInit);

        setOtpStatusMessage('Signup request submitted. If your details are valid, proceed to login.');
      } catch {
        setErrorMessage('Unable to submit signup from web right now. Please try Android/iOS.');
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    if (userType === 'customer') {
      const payload: CustomerSignupPayload = {
        email_verification_token: emailVerificationToken.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        terms_accepted: acceptTerms,
        privacy_accepted: acceptPrivacy,
        address: address.trim(),
        phone: contactNumber.trim(),
        delivery_instructions: deliveryInstructions.trim(),
      };

      const result = await signUpCustomer(payload);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      router.replace(result.authenticated ? '/(tabs)' : '/(auth)/login');
      return;
    }

    const trimmedBusinessAddress = businessAddress.trim();
    const trimmedBusinessContact = businessContactNumber.trim();

    const payload: OwnerSignupPayload = {
      email_verification_token: emailVerificationToken.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password,
      password_confirmation: confirmPassword,
      restaurant_name: restaurantName.trim(),
      business_address: trimmedBusinessAddress,
      business_contact_number: trimmedBusinessContact,
      business_permit: businessPermit.trim(),
      terms_accepted: acceptTerms,
      privacy_accepted: acceptPrivacy,
      merchant_agreement_accepted: acceptMerchantAgreement,
      phone: trimmedBusinessContact,
      address: trimmedBusinessAddress,
    };

    const result = await signUpOwner(payload);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    router.replace(result.authenticated ? '/(tabs)' : '/(auth)/login');
  };

  const getProgressDetails = () => {
    if (currentStep === 1) {
      return { width: '33%', text: 'Step 1 of 3: Personal Information', percent: '33% Complete' };
    }

    if (currentStep === 2) {
      return {
        width: '66%',
        text: userType === 'partner'
          ? 'Step 2 of 3: Business Information'
          : 'Step 2 of 3: Delivery Information',
        percent: '66% Complete',
      };
    }

    return { width: '100%', text: 'Step 3 of 3: Confirmation', percent: '100% Complete' };
  };

  const { width, text, percent } = getProgressDetails();

  // --------------------------------------------------------
  // RENDER STEP 1
  // --------------------------------------------------------
  const renderStep1 = () => (
    <Animated.View key="step1" entering={FadeInDown.springify()} exiting={FadeOutLeft} style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>I am a...</Text>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.segmentButton, userType === 'customer' && styles.segmentButtonActive]}
            onPress={() => {
              setUserType('customer');
              setOtpStatusMessage(null);
              clearError();
            }}
          >
            <Text style={[styles.segmentText, userType === 'customer' && styles.segmentTextActive]}>
              Customer
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentButton, userType === 'partner' && styles.segmentButtonActive]}
            onPress={() => {
              setUserType('partner');
              setOtpStatusMessage(null);
              clearError();
            }}
          >
            <Text style={[styles.segmentText, userType === 'partner' && styles.segmentTextActive]}>
              Restaurant Partner
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.nameRow}>
          <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#A0A0A0"
              value={firstName}
              onChangeText={(value) => {
                setFirstName(value);
                clearError();
              }}
            />
          </View>
          <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#A0A0A0"
              value={lastName}
              onChangeText={(value) => {
                setLastName(value);
                clearError();
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. you@example.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setOtpStatusMessage(null);
              clearError();
            }}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearError();
            }}
          />
          <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A0A0A0" />
          </Pressable>
        </View>
        <Text style={styles.helperText}>Must be at least 8 characters with a symbol & number</Text>
      </View>

      <View style={[styles.inputContainer, { marginBottom: 32 }]}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              clearError();
            }}
          />
          <Pressable style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <MaterialCommunityIcons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A0A0A0" />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.nextButton} onPress={handleStep1Next}>
        <Text style={styles.nextButtonText}>Next Step</Text>
      </Pressable>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Google Credential Token (for Google signup)</Text>
        <View style={[styles.inputWrapper, styles.multiLineWrapper]}>
          <TextInput
            style={styles.multiLineInput}
            placeholder="Paste Google ID token credential"
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={googleCredential}
            onChangeText={(value) => {
              setGoogleCredential(value);
              clearError();
            }}
          />
        </View>
      </View>

      <View style={styles.socialSection}>
        <Pressable
          style={[styles.socialButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleGoogleSignup}
          disabled={isSubmitting}
        >
          <GoogleLogo />
          <Text style={styles.socialButtonText}>{isSubmitting ? 'Connecting...' : 'Continue with Google'}</Text>
        </Pressable>
        <Pressable style={styles.socialButton} onPress={handleFacebookSignup}>
          <MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </Pressable>
      </View>

      <View style={styles.loginLinkContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.loginLinkText}>Log in</Text>
        </Pressable>
      </View>
    </Animated.View>
  );

  // --------------------------------------------------------
  // RENDER STEP 2
  // --------------------------------------------------------
  const renderStep2 = () => (
    <Animated.View key="step2" entering={FadeInUp.springify()} exiting={FadeOutLeft} style={styles.formSection}>
      <Text style={styles.sectionHeader}>
        {userType === 'partner'
          ? 'Set up your business information'
          : 'Set up your delivery information'}
      </Text>

      {userType === 'customer' ? (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Default Address</Text>
            <View style={[styles.inputWrapper, styles.multiLineWrapper]}>
              <TextInput
                style={styles.multiLineInput}
                placeholder="Enter full unit/building number, street, and barangay"
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={address}
                onChangeText={(value) => {
                  setAddress(value);
                  clearError();
                }}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="phone-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+63 000 000 0000"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                value={contactNumber}
                onChangeText={(value) => {
                  setContactNumber(value);
                  clearError();
                }}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Delivery Instructions</Text>
            <View style={[styles.inputWrapper, styles.multiLineWrapper]}>
              <TextInput
                style={styles.multiLineInput}
                placeholder="Gate codes, drop-off preferences, or landmarks..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={deliveryInstructions}
                onChangeText={(value) => {
                  setDeliveryInstructions(value);
                  clearError();
                }}
              />
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Restaurant Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="store-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Maria Kitchen"
                placeholderTextColor="#A0A0A0"
                value={restaurantName}
                onChangeText={(value) => {
                  setRestaurantName(value);
                  clearError();
                }}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Address</Text>
            <View style={[styles.inputWrapper, styles.multiLineWrapper]}>
              <TextInput
                style={styles.multiLineInput}
                placeholder="Enter complete business address"
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={businessAddress}
                onChangeText={(value) => {
                  setBusinessAddress(value);
                  clearError();
                }}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Contact Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="phone-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 09179876543"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                value={businessContactNumber}
                onChangeText={(value) => {
                  setBusinessContactNumber(value);
                  clearError();
                }}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Permit</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. BP-2026-00123"
                placeholderTextColor="#A0A0A0"
                value={businessPermit}
                onChangeText={(value) => {
                  setBusinessPermit(value);
                  clearError();
                }}
              />
            </View>
          </View>
        </>
      )}

      {/* Footer Navigation */}
      <View style={styles.footerRowNavigation}>
        <Pressable style={styles.backButtonOutline} onPress={() => setCurrentStep(1)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#1A1A1A" />
          <Text style={styles.backButtonOutlineText}>Back</Text>
        </Pressable>
        <Pressable style={styles.nextButtonFlex} onPress={handleStep2Next}>
          <Text style={styles.nextButtonFlexText}>Next Step</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
        </Pressable>
      </View>
    </Animated.View>
  );

  // --------------------------------------------------------
  // RENDER STEP 3
  // --------------------------------------------------------
  const renderStep3 = () => (
    <Animated.View key="step3" entering={FadeInUp.springify()} exiting={FadeOutRight} style={styles.formSection}>
      <Text style={styles.sectionHeader}>Almost there!</Text>
      <Text style={styles.sectionSubtitle}>
        Please review and accept our legal agreements to complete your registration and start ordering.
      </Text>
      
      <Pressable 
        style={[styles.checkboxCard, acceptTerms && styles.checkboxCardActive]}
        onPress={() => {
          setAcceptTerms(!acceptTerms);
          clearError();
        }}
      >
        <MaterialCommunityIcons 
          name={acceptTerms ? "circle" : "circle-outline"} 
          size={24} 
          color={acceptTerms ? "#AC1D10" : "#D4D4D4"}
          style={styles.cardIcon}
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Accept Terms & Conditions</Text>
          <Text style={styles.cardSubtitle}>
            I have read and agree to the <Text style={styles.redLink}>Terms of Service</Text> and usage guidelines.
          </Text>
        </View>
      </Pressable>

      <Pressable 
        style={[styles.checkboxCard, acceptPrivacy && styles.checkboxCardActive]}
        onPress={() => {
          setAcceptPrivacy(!acceptPrivacy);
          clearError();
        }}
      >
        <MaterialCommunityIcons 
          name={acceptPrivacy ? "circle" : "circle-outline"} 
          size={24} 
          color={acceptPrivacy ? "#AC1D10" : "#D4D4D4"}
          style={styles.cardIcon}
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Accept Privacy Policy</Text>
          <Text style={styles.cardSubtitle}>
            I agree to the processing of my personal data as described in the <Text style={styles.redLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </Pressable>

      {userType === 'partner' ? (
        <Pressable
          style={[styles.checkboxCard, acceptMerchantAgreement && styles.checkboxCardActive]}
          onPress={() => {
            setAcceptMerchantAgreement(!acceptMerchantAgreement);
            clearError();
          }}
        >
          <MaterialCommunityIcons
            name={acceptMerchantAgreement ? 'circle' : 'circle-outline'}
            size={24}
            color={acceptMerchantAgreement ? '#AC1D10' : '#D4D4D4'}
            style={styles.cardIcon}
          />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Accept Merchant Agreement</Text>
            <Text style={styles.cardSubtitle}>
              I agree to the merchant onboarding and operations terms.
            </Text>
          </View>
        </Pressable>
      ) : null}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Verification Token</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="shield-key-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={userType === 'partner' ? 'token_from_owner_verify_otp' : 'token_from_verify_otp'}
            placeholderTextColor="#A0A0A0"
            autoCapitalize="none"
            autoCorrect={false}
            value={emailVerificationToken}
            onChangeText={(value) => {
              setEmailVerificationToken(value);
              clearError();
            }}
          />
        </View>

        <Pressable
          style={[styles.sendOtpButton, (isSendingOtp || isSubmitting) && styles.buttonDisabled]}
          onPress={handleSendSignupOtp}
          disabled={isSendingOtp || isSubmitting}
        >
          <MaterialCommunityIcons name="send-outline" size={18} color="#AC1D10" />
          <Text style={styles.sendOtpButtonText}>{isSendingOtp ? 'Sending OTP...' : 'Send OTP'}</Text>
        </Pressable>

        {otpStatusMessage ? <Text style={styles.otpStatusText}>{otpStatusMessage}</Text> : null}
      </View>

      <Pressable style={styles.simpleCheckboxRow} onPress={() => setOptInNews(!optInNews)}>
        <MaterialCommunityIcons 
          name={optInNews ? "checkbox-marked" : "checkbox-blank-outline"} 
          size={22} 
          color={optInNews ? "#AC1D10" : "#A0A0A0"}
          style={styles.simpleCheckboxIcon}
        />
        <Text style={styles.simpleCheckboxText}>
          Keep me updated with exclusive offers and food news (optional)
        </Text>
      </Pressable>

      {/* Footer Navigation */}
      <View style={styles.footerRowNavigation}>
        <Pressable style={styles.backButtonOutline} onPress={() => setCurrentStep(2)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#1A1A1A" />
          <Text style={styles.backButtonOutlineText}>Back</Text>
        </Pressable>
        <Pressable
          style={[
            styles.nextButtonFlex,
            { justifyContent: 'center', paddingHorizontal: 0 },
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleFinishSignup}
          disabled={isSubmitting}
        >
          <Text style={[styles.nextButtonFlexText, { marginLeft: 0 }]}>
            {isSubmitting ? 'Creating account...' : 'Finish!'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.topBackButton} onPress={handleBack}>
              <MaterialCommunityIcons name="chevron-left" size={32} color="#000" />
            </Pressable>
            <View style={styles.logoContainer}>
              <TmcLogo width={60} height={60} />
            </View>
          </View>

          {/* Title & Progress */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              {currentStep === 1
                ? 'Sign up as a Customer or Restaurant Partner'
                : userType === 'partner'
                  ? 'Sign up as a Restaurant Partner'
                  : 'Sign up as a Customer'}
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBarFill, { width }]} />
              </View>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressStepText}>{text}</Text>
                <Text style={styles.progressPercentageText}>{percent}</Text>
              </View>
            </View>
            
            <View style={styles.titleDivider} />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Dynamically rendering Steps */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Bottom padding for floating elements or tall screens */}
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
    height: 70,
  },
  topBackButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    padding: 4,
    marginLeft: -4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 28,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    marginBottom: 8,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#AC1D10',
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStepText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  progressPercentageText: {
    fontSize: 13,
    color: '#AC1D10',
    fontWeight: '700',
  },
  titleDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  errorText: {
    color: '#C83B2D',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  formSection: {
    width: '100%',
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 26,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A0A0A0',
  },
  segmentTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    height: 52,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
  },
  multiLineWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  multiLineInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    width: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 6,
  },
  nextButton: {
    backgroundColor: '#AC1D10',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  sendOtpButton: {
    marginTop: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#AC1D10',
    borderRadius: 12,
    backgroundColor: '#FFF5F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOtpButtonText: {
    marginLeft: 8,
    color: '#AC1D10',
    fontSize: 14,
    fontWeight: '700',
  },
  otpStatusText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#1D7A35',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    color: '#A0A0A0',
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  socialSection: {
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    height: 52,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#666666',
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AC1D10',
  },
  footerRowNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 32,
    gap: 16,
  },
  backButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  backButtonOutlineText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButtonFlex: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#AC1D10',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  nextButtonFlexText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  checkboxCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  checkboxCardActive: {
    borderColor: '#AC1D10',
  },
  cardIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 20,
  },
  simpleCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 24,
  },
  simpleCheckboxIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  simpleCheckboxText: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  redLink: {
    color: '#AC1D10',
    fontWeight: '600',
  },
});
