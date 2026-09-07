import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { FieldWrapper } from './FormWrapper';
import { useFieldContext } from '../hooks/use-form-context';

export function SelectField({
    label,
    description,
    placeholder = 'انتخاب کنید',
    options,
}: {
    label?: string;
    description?: string;
    placeholder?: string;
    options: { label: string; value: string }[];
}) {
    const { name, state, handleChange, handleBlur } = useFieldContext<string>();
    const isInvalid = state.meta.isTouched && state.meta.errors.length > 0;

    return (
        <FieldWrapper label={label} description={description} htmlFor={name}>
            <Select
                value={state.value}
                onValueChange={(value) => handleChange(value!)}
            >
                <SelectTrigger
                    id={name}
                    aria-invalid={isInvalid}
                    onBlur={handleBlur}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FieldWrapper>
    );
}
