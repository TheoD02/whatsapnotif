import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <MessageSquare className="h-10 w-10 text-primary" />
                        <span className="text-2xl font-bold">
                            WhatsApp Hub
                        </span>
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}
