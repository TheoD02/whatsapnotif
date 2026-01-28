import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DevUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    devUsers?: DevUser[];
}

export default function Login({ devUsers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const handleFastLogin = (userId: number) => {
        router.post(`/login/fast/${userId}`);
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />

            {devUsers && devUsers.length > 0 && (
                <Card className="mb-4 border-dashed border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <span className="text-amber-600">⚡</span>
                            Fast Login
                            <Badge variant="outline" className="ml-auto text-xs font-normal text-amber-600 border-amber-300">
                                DEV
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                            {devUsers.map((user) => (
                                <Button
                                    key={user.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFastLogin(user.id)}
                                    className="h-auto py-1.5 px-3"
                                >
                                    <span className="font-medium">{user.name}</span>
                                    <Badge
                                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                                        className="ml-2 text-[10px] px-1.5"
                                    >
                                        {user.role}
                                    </Badge>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Connexion</CardTitle>
                    <CardDescription>
                        Entrez vos identifiants pour accéder à votre compte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                autoFocus
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
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData('remember', checked as boolean)
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="text-sm font-normal"
                            >
                                Se souvenir de moi
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? 'Connexion...' : 'Se connecter'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Pas encore de compte ?{' '}
                            <Link
                                href="/register"
                                className="text-primary hover:underline"
                            >
                                Créer un compte
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
