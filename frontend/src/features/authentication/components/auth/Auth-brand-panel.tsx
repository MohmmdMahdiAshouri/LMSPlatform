import { Building2, MonitorPlay, Sparkles, User } from 'lucide-react';
import Image from 'next/image';

const features = [
    {
        icon: Building2,
        title: 'متمرکز بر مدرسه',
        description: 'مدیریت نقش‌ها، دسترسی‌ها و مالکیت',
    },
    {
        icon: MonitorPlay,
        title: 'از دوره تا کلاس',
        description: 'ساخت دوره، ویدئو، آزمون و کلاس آنلاین',
    },
    {
        icon: Sparkles,
        title: 'دستیار هوشمند',
        description: 'دستیار مخصوص دانش‌آموز، مدرس و مدیر',
    },
];

export function AuthBrandPanel() {
    return (
        <aside className="hidden w-130 shrink-0 p-4 pl-0 lg:block">
            <div className="h-full overflow-hidden rounded-xl">
                <div className="flex h-full min-h-[calc(100vh-2rem)] flex-col justify-between bg-ink p-10 text-white">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-full overflow-hidden">
                            <Image
                                src="/images/icon.png"
                                alt=""
                                width={600}
                                height={600}
                                quality={95}
                                sizes="(max-width: 768px) 100vw, 600px"
                                className="w-full h-full object-cover scale-110"
                            />
                        </div>

                        <div>
                            <div className="text-md font-bold tracking-tight">
                                کلاس برتر
                            </div>

                            <div className="text-xs text-white/50">
                                سامانه مدیریت یادگیری
                            </div>
                        </div>

                        <div className="mr-auto flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1">
                            <span className="size-1.5 rounded-full bg-emerald-400" />

                            <span className="text-xs text-white/80">
                                همه سیستم‌ها فعال هستند
                            </span>
                        </div>
                    </div>

                    {/* Main content */}
                    <div>
                        <h1 className="max-w-[420px] text-4xl font-semibold leading-[1.2] tracking-tight">
                            یادگیری، سازمان‌یافته و آماده رشد.
                        </h1>

                        <p className="mt-4 max-w-[420px] text-base leading-8 text-white/70">
                            یک فضای یکپارچه برای دانش‌آموزان، مدرسان و مدیران
                            مدرسه؛ از دوره و کلاس آنلاین گرفته تا فروش و
                            گزارش‌های آموزشی.
                        </p>

                        {/* Stats */}
                        <div className="mt-8 grid grid-cols-3 gap-3">
                            <Stat value="۲۴۸" label="مدرسه فعال" />

                            <Stat value="۱۲.۴k" label="دوره منتشر شده" />

                            <Stat value="۹۸٪" label="افزایش تکمیل دوره" />
                        </div>

                        {/* Features */}
                        <div className="mt-6 space-y-3">
                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.title}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                                            <Icon size={16} />
                                        </div>

                                        <div className="text-sm font-medium text-white">
                                            {feature.title}
                                        </div>

                                        <div className="text-sm text-white/55">
                                            {feature.description}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
                            <User />
                        </div>

                        <div className="flex-1">
                            <p className="text-sm leading-6 text-white/90">
                                «سه مدرسه را در یک هفته منتقل کردیم. مدیریت
                                دسترسی‌ها بالاخره ساده و قابل فهم شده است.»
                            </p>

                            <p className="mt-1 text-xs text-white/55">
                                میلاد لواسانی — مدیر آکادمی نخبگان اول
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex flex-col items-center rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <div className="text-xl font-semibold">{value}</div>

            <div className="mt-1 text-xs text-white/60">{label}</div>
        </div>
    );
}
