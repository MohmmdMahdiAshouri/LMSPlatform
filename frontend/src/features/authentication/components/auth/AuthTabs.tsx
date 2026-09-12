import { Button } from '@/shared/components/ui/button';
import { AuthTabsType } from '../../types/auth.type';

interface AuthTabsProps {
    authTab: AuthTabsType;
    setAuthTab: (value: AuthTabsType) => void
}

export function AuthTabs({ authTab, setAuthTab }: AuthTabsProps) {
    return (
        <div className="mt-6 flex gap-x-1 rounded-lg bg-muted p-1">
            <Button
                onClick={() => setAuthTab('signIn')}
                className={`flex-1 text-center rounded-md px-4 py-2 text-md ${authTab === 'signUp' ? 'bg-card text-foreground hover:bg-card' : ''}`}
            >
                ورود
            </Button>

            <Button
                onClick={() => setAuthTab('signUp')}
                className={`flex-1 text-center rounded-md px-4 py-2 ${authTab === 'signIn' ? 'bg-card text-foreground hover:bg-card' : ''}`}
            >
                ایجاد حساب
            </Button>
        </div>
    );
}
