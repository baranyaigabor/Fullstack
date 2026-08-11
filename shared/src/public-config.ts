import { z } from 'zod';

export const SocialProviderSchema = z.enum([
  'google',
  'microsoft',
  'github',
  'facebook',
]);

export const PublicConfigSchema = z.object({
  socialProviders: z.array(SocialProviderSchema),
});

export type SocialProvider = z.infer<typeof SocialProviderSchema>;
export type PublicConfig = z.infer<typeof PublicConfigSchema>;
