import { Head, Link } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function Welcome() {
    return (
        <>
            <Head title="Bienvenue" />
            <div className="min-h-screen flex flex-col justify-center items-center bg-muted/40 py-12 px-4">
                <div className="text-center max-w-2xl">
                    <div className="flex justify-center mb-6">
                        <MessageSquare className="h-16 w-16 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">WhatsApp Hub</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Envoyez des notifications WhatsApp à vos contacts et
                        groupes de contacts en toute simplicité.
                    </p>

                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Commencer</CardTitle>
                            <CardDescription>
                                Connectez-vous ou créez un compte pour accéder à
                                la plateforme.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Button asChild className="w-full">
                                <Link href="/login">Se connecter</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/register">Créer un compte</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
