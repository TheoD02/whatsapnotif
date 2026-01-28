import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash2, Key, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { ApiToken } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface Props {
    tokens: ApiToken[];
}

interface FlashProps {
    newToken?: {
        name: string;
        token: string;
    };
}

export default function ApiTokensIndex({ tokens }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const [createOpen, setCreateOpen] = useState(false);
    const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
    const [newToken, setNewToken] = useState<{ name: string; token: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    // Show token dialog when a new token is created
    useEffect(() => {
        if (props.flash?.newToken) {
            setNewToken(props.flash.newToken);
            setTokenDialogOpen(true);
        }
    }, [props.flash?.newToken]);

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/api-tokens', {
            onSuccess: () => {
                reset();
                setCreateOpen(false);
            },
        });
    };

    const handleDelete = (token: ApiToken) => {
        if (confirm(`Supprimer le token "${token.name}" ?`)) {
            router.delete(`/admin/api-tokens/${token.id}`);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AdminLayout>
            <Head title="Tokens API" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tokens API</h1>
                        <p className="text-muted-foreground">
                            Gérez les tokens d'accès à l'API
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau token
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tokens actifs</CardTitle>
                        <CardDescription>
                            Les tokens permettent d'accéder à l'API depuis des
                            applications tierces
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Préfixe</TableHead>
                                    <TableHead>Créé par</TableHead>
                                    <TableHead>Dernière utilisation</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            Aucun token créé
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tokens.map((token) => (
                                        <TableRow key={token.id}>
                                            <TableCell className="font-medium">
                                                <span className="flex items-center gap-2">
                                                    <Key className="h-4 w-4 text-muted-foreground" />
                                                    {token.name}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                                    {token.token_prefix}...
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {token.creator?.name}
                                            </TableCell>
                                            <TableCell>
                                                {token.last_used_at
                                                    ? formatDateTime(
                                                          token.last_used_at
                                                      )
                                                    : 'Jamais'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        token.is_active
                                                            ? 'success'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {token.is_active
                                                        ? 'Actif'
                                                        : 'Inactif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(token)
                                                    }
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Documentation API</CardTitle>
                        <CardDescription>
                            Comment utiliser l'API
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Authentification</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                                Incluez le token dans l'en-tête Authorization :
                            </p>
                            <code className="block bg-muted p-3 rounded text-sm">
                                Authorization: Bearer votre_token
                            </code>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">
                                Documentation interactive (OpenAPI)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Consultez la documentation complète de l'API avec des exemples interactifs.
                            </p>
                            <Button asChild>
                                <a href="/docs/api" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ouvrir la documentation API
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Token Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un token API</DialogTitle>
                        <DialogDescription>
                            Le token sera affiché une seule fois. Copiez-le
                            immédiatement.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom du token</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Application mobile"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Création...' : 'Créer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* New Token Display Dialog */}
            <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-green-500" />
                            Token créé avec succès
                        </DialogTitle>
                        <DialogDescription>
                            Copiez ce token maintenant. Il ne sera plus jamais affiché.
                        </DialogDescription>
                    </DialogHeader>

                    {newToken && (
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-800 dark:text-amber-200">
                                        <p className="font-medium">Important</p>
                                        <p>Ce token ne sera affiché qu'une seule fois. Copiez-le et conservez-le en lieu sûr.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Nom</Label>
                                <p className="text-sm font-medium">{newToken.name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Token</Label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-3 bg-muted rounded text-sm font-mono break-all select-all">
                                        {newToken.token}
                                    </code>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => copyToClipboard(newToken.token)}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setTokenDialogOpen(false)}>
                            J'ai copié le token
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
