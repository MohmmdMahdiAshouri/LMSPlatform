export function AuthFooter() {
    return (
        <>
            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />

                <span className="text-xs text-muted-foreground">
                    یا ادامه با
                </span>

                <div className="h-px flex-1 bg-border" />
            </div>

            {/* Social */}
            <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                className="flex items-center text-md justify-center gap-2 rounded-md border border-border bg-card py-2.5 font-medium text-foreground transition-colors hover:bg-muted"
            >
                <span className="font-bold">G</span>
                Google
            </a>

            {/* Info */}
            <div className="mt-5 rounded-lg bg-secondary/60 p-3">
                <p className="text-xs leading-relaxed text-secondary-foreground">
                    اگر عضو چند مدرسه هستید، پس از ورود می‌توانید فضای کاری
                    موردنظر خود را انتخاب کنید.
                </p>
            </div>

            {/* Trust */}
            <div className="mt-6 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span>✓ ورود امن</span>
                    <span>✓ احراز هویت دو مرحله‌ای</span>
                    <span>✓ WCAG AA</span>
                </div>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                    اطلاعات حساب شما با استفاده از مکانیزم‌های امنیتی محافظت
                    می‌شود.
                </p>
            </div>
        </>
    );
}
