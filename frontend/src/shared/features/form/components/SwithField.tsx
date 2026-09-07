import { Label } from '@/shared/components/ui/label';
import { useFieldContext } from '../hooks/use-form-context';
import { Switch } from '@/shared/components/ui/switch';

export function SwitchField({
    label,
    description,
}: {
    label?: string;
    description?: string;
}) {
    const { name, state, handleChange } = useFieldContext<boolean>();

    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
                {label && <Label htmlFor={name}>{label}</Label>}
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            <Switch
                id={name}
                checked={state.value}
                onCheckedChange={(checked) => handleChange(checked)}
            />
        </div>
    );
}
