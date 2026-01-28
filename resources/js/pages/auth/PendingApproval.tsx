import { Head, router } from '@inertiajs/react';
import { Clock, LogOut } from 'lucide-react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function PendingApproval() {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <GuestLayout>
            <Head title="En attente de validation" />
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle>Compte en attente</CardTitle>
                    <CardDescription>
                        Votre compte est en attente de validation par un
                        administrateur.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Vous recevrez un email une fois que votre compte aura
                        été validé. Cela peut prendre quelques heures.
                    </p>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
