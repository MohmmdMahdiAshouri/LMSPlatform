import ChangePassword from '@/features/authentication/components/ChangePassword';
import ResendVerifyEmail from '@/features/authentication/components/ResendVerifyEmail';
import SessionsManagement from '@/features/authentication/components/SessionsManagement';


export default function page() {
    return (
        <div className="w-full mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    مدیریت حساب کاربری
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    اطلاعات حساب، امنیت و نشست‌های فعال خود را مدیریت کنید.
                </p>
            </div>

            <div className="flex gap-x-5">
                <ResendVerifyEmail />

                <ChangePassword />
            </div>

            <SessionsManagement />
        </div>
    );
}
