import { Button, type ButtonProps } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useFormContext } from '../hooks/use-form-context';
import type { ReactNode } from 'react';

export function SubmitButton({
    children,
    isLoading,
    ...props
}: ButtonProps & { children: ReactNode, isLoading: boolean }) {
    const {Subscribe} = useFormContext();

    return (
        <Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
                <Button
                    type="submit"
                    disabled={isLoading || !canSubmit || isSubmitting}
                    {...props}
                >
                    {(isSubmitting || isLoading) ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                    {children}
                </Button>
            )}
        </Subscribe>
    );
}
