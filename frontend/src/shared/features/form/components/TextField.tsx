import { Checkbox } from '@/shared/components/ui/checkbox';
import { useFieldContext } from '../hooks/use-form-context';
import { FieldWrapper } from './FormWrapper';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useState } from 'react';

interface TextFieldProps {
    label: string;
    description: string;
    placeholder: string;
    type: string;
    dir: 'rtl' | 'ltr';
}

export function TextField({
    label,
    description,
    placeholder,
    type = 'text',
    dir = 'rtl',
}: Partial<TextFieldProps>) {
    const { name, state, handleChange, handleBlur } = useFieldContext<string>();
    const isInvalid = state.meta.isTouched && state.meta.errors.length > 0;
        const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <FieldWrapper label={label} description={description} htmlFor={name}>
            <Input
                id={name}
                name={name}
                type={showPassword ? 'text' : type}
                placeholder={placeholder}
                value={state.value ?? ''}
                onBlur={handleBlur}
                onChange={(e) => handleChange(e.target.value)}
                aria-invalid={isInvalid}
                dir={dir}
            />
            {type === 'password' ? (
                <div className='flex items-center gap-x-2'>
                    <Checkbox
                        checked={showPassword}
                        onCheckedChange={(c) => setShowPassword!(c === true)}
                    />
                    <Label>نمایش رمز عبور</Label>
                </div>
            ) : null}
        </FieldWrapper>
    );
}
