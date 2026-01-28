import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    invitationCode: string | null;
    hasValidCode: boolean;
}

export default function Register({ invitationCode, hasValidCode }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        invitation_code: invitationCode || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <Head title="Inscription" />
            <Card>
                <CardHeader>
                    <CardTitle>Créer un compte</CardTitle>
                    <CardDescription>
                        {hasValidCode ? (
                            <span className="flex items-center gap-2">
                                <Badge variant="success">Code valide</Badge>
                                Votre compte sera activé immédiatement.
                            </span>
                        ) : (
                            'Votre compte devra être validé par un administrateur.'
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Votre nom"
                                autoComplete="name"
                                autoFocus
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="vous@exemple.com"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                autoComplete="new-password"
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirmer le mot de passe
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value
                                    )
                                }
                                autoComplete="new-password"
                            />
                        </div>

                        {!hasValidCode && (
                            <div className="space-y-2">
                                <Label htmlFor="invitation_code">
                                    Code d'invitation (optionnel)
                                </Label>
                                <Input
                                    id="invitation_code"
                                    type="text"
                                    value={data.invitation_code}
                                    onChange={(e) =>
                                        setData(
                                            'invitation_code',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Code d'invitation"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Si vous avez un code d'invitation, votre
                                    compte sera activé immédiatement.
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? 'Inscription...' : "S'inscrire"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Déjà un compte ?{' '}
                            <Link
                                href="/login"
                                className="text-primary hover:underline"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
