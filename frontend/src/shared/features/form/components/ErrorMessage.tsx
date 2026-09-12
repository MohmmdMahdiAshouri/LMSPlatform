export function FieldErrorMessage({ errors }: { errors: unknown[] }) {
    if (!errors.length) return null;
    const first = errors[0] as { message?: string } | string;
    const message = typeof first === 'string' ? first : first?.message;
    if (!message) return null;
    return (
        <p className="mt-1 overflow-hidden text-sm font-medium text-destructive wrap-break-word line-clamp-2">
            {message ?? ''}
        </p>
    );
}
