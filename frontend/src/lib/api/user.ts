import {
  UpdateUserProfileBodySchema,
  UserProfileSchema,
  type UpdateUserProfileBody,
} from '@fullstack-starter/shared';
import { getApiErrorMessage } from '../utils';

export async function updateCurrentUserProfile(body: UpdateUserProfileBody) {
  const parsedBody = UpdateUserProfileBodySchema.safeParse(body);

  if (!parsedBody.success) {
    throw new Error('Could not update profile.');
  }

  const response = await fetch('/api/users/me', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parsedBody.data),
  });

  const result: unknown = await response.json();
  const parsedResult = UserProfileSchema.safeParse(result);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, 'Could not update profile.'));
  }

  if (!parsedResult.success) {
    throw new Error('Could not update profile.');
  }

  return parsedResult.data;
}

export async function getCurrentUserProfile() {
  const response = await fetch('/api/users/me', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Could not load profile.');
  }

  const profile: unknown = await response.json();
  const parsedProfile = UserProfileSchema.safeParse(profile);

  if (!parsedProfile.success) {
    throw new Error('Could not load profile.');
  }

  return parsedProfile.data;
}
