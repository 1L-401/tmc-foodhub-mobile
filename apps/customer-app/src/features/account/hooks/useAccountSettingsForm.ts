import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type AuthUser,
  type UpdateUserProfileFieldErrors,
  type UpdateUserProfilePayload,
  useAuth,
} from '@/contexts/auth-context';

const MAX_NAME_LENGTH = 255;
const MAX_PHONE_LENGTH = 25;
const MAX_ADDRESS_LENGTH = 255;
const MAX_DELIVERY_INSTRUCTIONS_LENGTH = 500;
const PHONE_ALLOWED_CHARACTERS_REGEX = /^[+()\-\s\d]*$/;

export type AccountSettingsFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  delivery_instructions: string;
};

export type AccountSettingsFormField = keyof AccountSettingsFormValues;

function toNullableString(value: string): string | null {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function splitNameParts(user: AuthUser | null): { firstName: string; lastName: string } {
  if (!user) {
    return {
      firstName: '',
      lastName: '',
    };
  }

  const firstName = user.first_name?.trim() ?? '';
  const lastName = user.last_name?.trim() ?? '';

  if (firstName || lastName) {
    return {
      firstName,
      lastName,
    };
  }

  const fullName = user.name?.trim() ?? '';

  if (!fullName) {
    return {
      firstName: '',
      lastName: '',
    };
  }

  const parts = fullName.split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] ?? '',
      lastName: '',
    };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

function buildInitialValues(user: AuthUser | null): AccountSettingsFormValues {
  const { firstName, lastName } = splitNameParts(user);

  return {
    first_name: firstName,
    last_name: lastName,
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    delivery_instructions: user?.delivery_instructions ?? '',
  };
}

function validateAccountSettingsForm(
  values: AccountSettingsFormValues,
): UpdateUserProfileFieldErrors {
  const fieldErrors: UpdateUserProfileFieldErrors = {};
  const firstName = values.first_name.trim();
  const lastName = values.last_name.trim();
  const phone = values.phone.trim();
  const address = values.address.trim();
  const deliveryInstructions = values.delivery_instructions.trim();

  if (!firstName) {
    fieldErrors.first_name = 'First name is required.';
  } else if (firstName.length > MAX_NAME_LENGTH) {
    fieldErrors.first_name = `First name must not exceed ${MAX_NAME_LENGTH} characters.`;
  }

  if (!lastName) {
    fieldErrors.last_name = 'Last name is required.';
  } else if (lastName.length > MAX_NAME_LENGTH) {
    fieldErrors.last_name = `Last name must not exceed ${MAX_NAME_LENGTH} characters.`;
  }

  if (phone && !PHONE_ALLOWED_CHARACTERS_REGEX.test(phone)) {
    fieldErrors.phone = 'Phone number contains invalid characters.';
  } else if (phone.length > MAX_PHONE_LENGTH) {
    fieldErrors.phone = `Phone number must not exceed ${MAX_PHONE_LENGTH} characters.`;
  }

  if (address.length > MAX_ADDRESS_LENGTH) {
    fieldErrors.address = `Address must not exceed ${MAX_ADDRESS_LENGTH} characters.`;
  }

  if (deliveryInstructions.length > MAX_DELIVERY_INSTRUCTIONS_LENGTH) {
    fieldErrors.delivery_instructions =
      `Delivery instructions must not exceed ${MAX_DELIVERY_INSTRUCTIONS_LENGTH} characters.`;
  }

  return fieldErrors;
}

function hasFieldErrors(fieldErrors: UpdateUserProfileFieldErrors): boolean {
  return Object.keys(fieldErrors).length > 0;
}

function normalizeForComparison(value: string): string {
  return value.trim();
}

export function useAccountSettingsForm() {
  const { user, updateUserProfile, signOut } = useAuth();

  const initialValues = useMemo(
    () => buildInitialValues(user),
    [
      user?.id,
      user?.name,
      user?.first_name,
      user?.last_name,
      user?.phone,
      user?.address,
      user?.delivery_instructions,
    ],
  );

  const [values, setValues] = useState<AccountSettingsFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<UpdateUserProfileFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setFieldErrors({});
  }, [initialValues]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      normalizeForComparison(values.first_name) !== normalizeForComparison(initialValues.first_name)
      || normalizeForComparison(values.last_name) !== normalizeForComparison(initialValues.last_name)
      || normalizeForComparison(values.phone) !== normalizeForComparison(initialValues.phone)
      || normalizeForComparison(values.address) !== normalizeForComparison(initialValues.address)
      || normalizeForComparison(values.delivery_instructions)
      !== normalizeForComparison(initialValues.delivery_instructions)
    );
  }, [
    initialValues.address,
    initialValues.delivery_instructions,
    initialValues.first_name,
    initialValues.last_name,
    initialValues.phone,
    values.address,
    values.delivery_instructions,
    values.first_name,
    values.last_name,
    values.phone,
  ]);

  const setFieldValue = useCallback((field: AccountSettingsFormField, value: string) => {
    setValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));

    setFieldErrors((previousErrors) => {
      if (!previousErrors[field]) {
        return previousErrors;
      }

      const nextErrors = { ...previousErrors };
      delete nextErrors[field];
      return nextErrors;
    });

    if (errorMessage) {
      setErrorMessage(null);
    }

    if (successMessage) {
      setSuccessMessage(null);
    }
  }, [errorMessage, successMessage]);

  const submit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    const validationErrors = validateAccountSettingsForm(values);

    if (hasFieldErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setSuccessMessage(null);
      setErrorMessage('Please review the highlighted fields before saving.');
      return;
    }

    const payload: UpdateUserProfilePayload = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      phone: toNullableString(values.phone),
      address: toNullableString(values.address),
      delivery_instructions: toNullableString(values.delivery_instructions),
    };

    setIsSubmitting(true);
    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await updateUserProfile(payload);

    if (!result.success) {
      setIsSubmitting(false);
      setErrorMessage(result.error);
      setSuccessMessage(null);
      setFieldErrors(result.fieldErrors ?? {});

      if (result.forceLogout) {
        try {
          await signOut();
        } finally {
          router.replace('/(auth)/login');
        }
      }

      return;
    }

    setIsSubmitting(false);
    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage(result.message);
  }, [isSubmitting, signOut, updateUserProfile, values]);

  return {
    values,
    fieldErrors,
    isSubmitting,
    errorMessage,
    successMessage,
    hasUnsavedChanges,
    setFieldValue,
    submit,
  };
}
