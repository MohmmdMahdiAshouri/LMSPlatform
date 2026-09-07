import { Textarea } from '@/shared/components/ui/textarea';
import { FieldWrapper } from './FormWrapper';
import { useFieldContext } from '../hooks/use-form-context';

export function TextareaField({
    label,
    description,
    placeholder,
    rows = 4,
}: {
    label?: string;
    description?: string;
    placeholder?: string;
    rows?: number;
}) {
    const { name, state, handleChange, handleBlur } = useFieldContext<string>();
    const isInvalid = state.meta.isTouched && state.meta.errors.length > 0;

    return (
        <FieldWrapper label={label} description={description} htmlFor={name}>
            <Textarea
                id={name}
                name={name}
                rows={rows}
                placeholder={placeholder}
                value={state.value ?? ''}
                onBlur={handleBlur}
                onChange={(e) => handleChange(e.target.value)}
                aria-invalid={isInvalid}
            />
        </FieldWrapper>
    );
}
