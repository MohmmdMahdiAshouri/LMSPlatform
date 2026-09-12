import { Checkbox } from '@/shared/components/ui/checkbox';
import { useFieldContext } from '../hooks/use-form-context';
import { FieldWrapper } from './FormWrapper';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

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
            <div className="relative w-full min-w-0">
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

                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={
                            showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'
                        }
                        className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="size-5" />
                        ) : (
                            <Eye className="size-5" />
                        )}
                    </button>
                )}
            </div>
        </FieldWrapper>
    );
}
