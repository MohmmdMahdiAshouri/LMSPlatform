import z from 'zod';
import {
    emailSchema,
    passwordSchema,
    usernameSchema,
} from './common-fields.schema';

export const signInFormSchema = z.object({
    emailOrUsername: z
        .string()
        .trim()
        .min(1, 'لطفاً ایمیل یا نام کاربری را وارد کنید')
        .refine(
            (value) => {
                const isEmail = emailSchema.safeParse(value).success;
                const isUsername = usernameSchema.safeParse(value).success;

                return isEmail || isUsername;
            },
            {
                message: 'لطفاً ایمیل معتبر یا نام کاربری صحیح وارد کنید',
            },
        ),

    password: passwordSchema,
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;

export const signInFormDefaultValues: SignInFormValues = {
    emailOrUsername: '',
    password: '',
};
