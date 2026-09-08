import z from 'zod';
import {
    PASSWORD_REGEX,
    USERNAME_REGEX,
} from '../constants/authentication.constant';

export const signinFormSchema = z.object({
    emailOrUsername: z
        .string()
        .trim()
        .min(1, 'لطفاً ایمیل یا نام کاربری را وارد کنید')
        .refine(
            (val) => {
                const isEmail = z.email().safeParse(val).success;
                const isUsername = USERNAME_REGEX.test(val);
                return isEmail || isUsername;
            },
            {
                message: 'لطفاً ایمیل معتبر یا نام کاربری صحیح وارد کنید',
            },
        ),
    password: z
        .string()
        .regex(
            PASSWORD_REGEX,
            'رمز عبور باید بین ۸ تا ۶۴ کاراکتر و شامل حرف بزرگ، حرف کوچک، عدد و کاراکتر خاص باشد',
        ),
});

export type SigninFormValues = z.infer<typeof signinFormSchema>;

export const signinFormDefaultValues: SigninFormValues = {
    emailOrUsername: '',
    password: '',
};
