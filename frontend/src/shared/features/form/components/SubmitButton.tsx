import { Button, type ButtonProps } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useFormContext } from '../hooks/use-form-context';
import type { ReactNode } from 'react';

export function SubmitButton({
    children,
    ...props
}: ButtonProps & { children: ReactNode }) {
    const {Subscribe} = useFormContext();

    return (
        <Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
                <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    {...props}
                >
                    {isSubmitting && (
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    )}
                    {children}
                </Button>
            )}
        </Subscribe>
    );
}
