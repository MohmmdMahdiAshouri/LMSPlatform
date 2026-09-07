'use client';
import type { ReactNode } from 'react';
import { useFieldContext } from '../hooks/use-form-context';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { FieldErrorMessage } from './ErrorMessage';

export function FieldWrapper({
    label,
    description,
    htmlFor,
    children,
}: {
    label?: string;
    description?: string;
    htmlFor?: string;
    children: ReactNode;
}) {
    const { state } = useFieldContext<unknown>();
    const isInvalid = state.meta.isTouched && state.meta.errors.length > 0;

    return (
        <div className="space-y-2 w-full h-full">
            {label && (
                <Label
                    htmlFor={htmlFor}
                    className={cn(isInvalid && 'text-destructive')}
                >
                    {label}
                </Label>
            )}
            {children}
            {description && !isInvalid && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {isInvalid && <FieldErrorMessage errors={state.meta.errors} />}
        </div>
    );
}
