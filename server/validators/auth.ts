import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
    .max(30, "Kullanıcı adı en fazla 30 karakter olabilir.")
    .regex(/^[a-zA-Z0-9_]+$/, "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.")
    .toLowerCase(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz.").toLowerCase(),
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir.")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir.")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir."),
  displayName: z.string().min(2, "Görünen ad en az 2 karakter olmalıdır.").max(50, "Görünen ad en fazla 50 karakter olabilir.")
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Kullanıcı adı veya e-posta gereklidir.").toLowerCase(),
  password: z.string().min(1, "Şifre gereklidir.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz.").toLowerCase(),
});

export const sendOtpSchema = z.object({
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
    .max(30, "Kullanıcı adı en fazla 30 karakter olabilir.")
    .regex(/^[a-zA-Z0-9_]+$/, "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.")
    .toLowerCase(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz.").toLowerCase(),
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir.")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir.")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir."),
  displayName: z.string().min(2, "Görünen ad en az 2 karakter olmalıdır.").max(50, "Görünen ad en fazla 50 karakter olabilir.")
});

export const verifyRegisterOtpSchema = z.object({
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
    .max(30, "Kullanıcı adı en fazla 30 karakter olabilir.")
    .regex(/^[a-zA-Z0-9_]+$/, "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.")
    .toLowerCase(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz.").toLowerCase(),
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir.")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir.")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir."),
  displayName: z.string().min(2, "Görünen ad en az 2 karakter olmalıdır.").max(50, "Görünen ad en fazla 50 karakter olabilir."),
  otp: z.string().length(6, "Doğrulama kodu 6 haneli olmalıdır.").regex(/^[0-9]{6}$/, "Doğrulama kodu sadece rakamlardan oluşmalıdır.")
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token gereklidir."),
  newPassword: z.string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir.")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir.")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir."),
});

export const resendOtpSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz.").toLowerCase(),
  displayName: z.string().optional()
});

export const verifyTwoFactorSchema = z.object({
  token: z.string().min(1, "2FA token gereklidir."),
  code: z.string().min(6, "Doğrulama kodu gereklidir.").optional(),
  recoveryCode: z.string().optional()
}).refine(data => data.code || data.recoveryCode, {
  message: "Doğrulama kodu veya kurtarma kodu gereklidir."
});

export const enableTwoFactorSchema = z.object({
  code: z.string().length(6, "Doğrulama kodu 6 haneli olmalıdır.").regex(/^[0-9]{6}$/, "Doğrulama kodu sadece rakamlardan oluşmalıdır.")
});

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, "Şifre gereklidir."),
  code: z.string().length(6, "Doğrulama kodu 6 haneli olmalıdır.").regex(/^[0-9]{6}$/, "Doğrulama kodu sadece rakamlardan oluşmalıdır.")
});

