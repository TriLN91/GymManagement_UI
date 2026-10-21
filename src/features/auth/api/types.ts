export interface AuthResponseDto {
  userId: string;
  fullName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  roles: string[];
}

export interface OtpSentResponse {
  email: string;
  expiryMinutes: number;
  message: string;
  isEmailSent: boolean;
  debugOtpCode?: string;
}

export interface RegisterOtpSentResponse {
  email: string;
  expiryMinutes: number;
  message: string;
  isEmailSent: boolean;
  debugOtpCode?: string;
}

export interface VerifyRegisterOtpPayload {
  email: string;
  otpCode: string;
}

export interface VerifyOtpResponse {
  isValid: boolean;
  resetToken: string;
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otpCode: string;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
