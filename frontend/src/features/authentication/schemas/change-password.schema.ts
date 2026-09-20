import z from 'zod';
import { passwordSchema } from './common-fields.schema';

export const changePasswordSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const changePasswordDefaultValues: ChangePasswordValues = {
    currentPassword: '',
    newPassword: '',
};
