import Link from 'next/link';

export default function SuccessPage() {
    return (
        <div>
            <h1>ایمیل شما با موفقیت تأیید شد ✅</h1>
            <Link href="/auth">ورود به حساب</Link>
        </div>
    );
}
