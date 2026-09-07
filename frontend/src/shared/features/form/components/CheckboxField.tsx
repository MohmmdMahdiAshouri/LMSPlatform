import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { useFieldContext } from '../hooks/use-form-context';
import { FieldErrorMessage } from './ErrorMessage';

export function CheckboxField({
    label,
    description,
}: {
    label?: string;
    description?: string;
}) {
    const { state, name, handleChange, handleBlur } =
        useFieldContext<boolean>();
    const isInvalid = state.meta.isTouched && state.meta.errors.length > 0;

    return (
        <div className="flex items-start gap-2">
            <Checkbox
                id={name}
                checked={!!state.value}
                onCheckedChange={(checked) => handleChange(checked === true)}
                onBlur={handleBlur}
                aria-invalid={isInvalid}
            />
            <div className="space-y-1 leading-none">
                {label && (
                    <Label htmlFor={name} className="font-normal">
                        {label}
                    </Label>
                )}
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
                {isInvalid && <FieldErrorMessage errors={state.meta.errors} />}
            </div>
        </div>
    );
}
