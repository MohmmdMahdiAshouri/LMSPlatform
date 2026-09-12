import z from 'zod';
import {
    emailSchema,
    passwordSchema,
    usernameSchema,
} from './common-fields.schema';

export const signUpFormSchema = z
    .object({
        email: emailSchema,
        username: usernameSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'رمز عبور با تکرار آن برابر نیست',
        path: ['confirmPassword'],
    });

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export const signUpFormDefaultValues: SignUpFormValues = {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
};
