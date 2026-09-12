import { ProfileImageUploadResultSchema } from '@fullstack-starter/shared';

import { getApiErrorMessage } from '../utils';

export async function uploadProfileImage(file: File) {
  const form = new FormData();
  form.append('file', file);

  const response = await fetch('/api/profile-images/optimize', {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  const result: unknown = await response.json();
  const parsedResult = ProfileImageUploadResultSchema.safeParse(result);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result, 'Could not upload profile image.'),
    );
  }

  if (!parsedResult.success) {
    throw new Error('Could not upload profile image.');
  }

  return parsedResult.data;
}
