type RequestPasswordResetBody = {
  email: string;
  redirectTo: string;
};

type ResetPasswordBody = {
  token: string;
  newPassword: string;
};

export function requestPasswordReset(
  body: RequestPasswordResetBody,
  captchaResponse?: string | null,
) {
  return fetch('/api/auth/request-password-reset', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(captchaResponse ? { 'x-captcha-response': captchaResponse } : {}),
    },
    body: JSON.stringify(body),
  });
}

export function resetPassword(body: ResetPasswordBody) {
  return fetch('/api/auth/reset-password', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
