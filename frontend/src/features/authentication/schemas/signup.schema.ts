import { z } from 'zod';
import { PASSWORD_REGEX, USERNAME_REGEX } from '../constants/authentication.constant';

export const signupFormSchema = z
    .object({
        email: z.email('ایمیل معتبر نیست').trim().toLowerCase(),
        username: z
            .string()
            .trim()
            .regex(
                USERNAME_REGEX,
                'نام‌کاربری باید ۳ تا ۳۰ کاراکتر، شروع با حرف، و بدون آندرلاین متوالی یا انتهایی باشد',
            ),
        password: z
            .string()
            .regex(
                PASSWORD_REGEX,
                'رمز عبور باید بین ۸ تا ۶۴ کاراکتر و شامل حرف بزرگ، حرف کوچک، عدد و کاراکتر خاص باشد',
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'رمز عبور با تکرار آن برابر نیست',
        path: ['confirmPassword'],
    });

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const signupFormDefaultValues: SignupFormValues = {
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
};
