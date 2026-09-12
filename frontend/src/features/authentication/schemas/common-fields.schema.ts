import z from 'zod';
import {
    PASSWORD_REGEX,
    USERNAME_REGEX,
} from '../constants/authentication.constant';

export const emailSchema = z.email('ایمیل معتبر نیست').trim().toLowerCase();

export const usernameSchema = z
    .string()
    .trim()
    .regex(
        USERNAME_REGEX,
        'نام‌کاربری باید ۳ تا ۳۰ کاراکتر، شروع با حرف، و بدون آندرلاین متوالی یا انتهایی باشد',
    );

export const passwordSchema = z
    .string()
    .regex(
        PASSWORD_REGEX,
        'رمز عبور باید بین ۸ تا ۶۴ کاراکتر و شامل حرف بزرگ، حرف کوچک، عدد و کاراکتر خاص باشد',
    );
