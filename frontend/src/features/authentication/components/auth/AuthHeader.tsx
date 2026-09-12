
export function AuthHeader() {
    return (
        <div className='flex flex-col items-center'>
            <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    فضای آموزشی
                </span>

                <span className="text-xs text-muted-foreground">
                    سامانه مدیریت یادگیری کلاس برتر
                </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                خوش آمدید
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                برای ادامه یادگیری، تدریس یا مدیریت مدرسه وارد حساب کاربری خود
                شوید.
            </p>
        </div>
    );
}
