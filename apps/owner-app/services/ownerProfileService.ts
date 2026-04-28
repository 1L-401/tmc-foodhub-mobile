import type { OwnerUser } from '@/services/authService';
import { apiClient } from '@/src/api/apiClient';

const OWNER_PROFILE_ENDPOINT = '/owner/user';

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const buildOwnerName = (user: OwnerUser | null): string | null => {
  if (!user) {
    return null;
  }

  const directName = toTrimmedString(user.name);
  if (directName) {
    return directName;
  }

  const firstName = toTrimmedString(user.first_name) ?? '';
  const lastName = toTrimmedString(user.last_name) ?? '';
  const combined = `${firstName} ${lastName}`.trim();

  if (combined) {
    return combined;
  }

  return toTrimmedString(user.email);
};

export const normalizeOwnerProfile = (profile: OwnerUser): OwnerUser => {
  const resolvedName = buildOwnerName(profile);

  if (!resolvedName || profile.name) {
    return profile;
  }

  return {
    ...profile,
    name: resolvedName,
  };
};

export const fetchOwnerProfile = async (tokenOverride?: string): Promise<OwnerUser> => {
  const options = tokenOverride
    ? {
        headers: {
          Authorization: `Bearer ${tokenOverride}`,
        },
      }
    : undefined;

  const profile = await apiClient<OwnerUser>(OWNER_PROFILE_ENDPOINT, options);
  return normalizeOwnerProfile(profile);
};
