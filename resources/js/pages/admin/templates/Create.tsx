import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TemplateCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        content: '',
    });

    const [previewData, setPreviewData] = useState({
        nom: 'Jean Dupont',
        date: new Date().toLocaleDateString('fr-FR'),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/templates');
    };

    const getPreview = () => {
        let preview = data.content;
        Object.entries(previewData).forEach(([key, value]) => {
            preview = preview.replace(
                new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi'),
                value
            );
        });
        return preview;
    };

    const extractVariables = () => {
        const matches = data.content.match(/\{\{\s*(\w+)\s*\}\}/g) || [];
        return [...new Set(matches.map((m) => m.replace(/[{}\s]/g, '')))];
    };

    return (
        <AdminLayout>
            <Head title="Nouveau template" />

            <div className="max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/templates">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Nouveau template</h1>
                        <p className="text-muted-foreground">
                            Créez un template de message réutilisable
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contenu du template</CardTitle>
                            <CardDescription>
                                Utilisez {'{{ variable }}'} pour les variables
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Bienvenue nouveau client"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Message</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) =>
                                            setData('content', e.target.value)
                                        }
                                        placeholder="Bonjour {{ nom }}, bienvenue chez nous !"
                                        rows={8}
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-destructive">
                                            {errors.content}
                                        </p>
                                    )}
                                </div>

                                {extractVariables().length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Variables détectées</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {extractVariables().map(
                                                (variable) => (
                                                    <Badge
                                                        key={variable}
                                                        variant="secondary"
                                                    >
                                                        {variable}
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Création...' : 'Créer'}
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/admin/templates">
                                            Annuler
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Prévisualisation
                            </CardTitle>
                            <CardDescription>
                                Aperçu du message avec des données de test
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {extractVariables().map((variable) => (
                                    <div key={variable} className="space-y-1">
                                        <Label htmlFor={`preview-${variable}`}>
                                            {variable}
                                        </Label>
                                        <Input
                                            id={`preview-${variable}`}
                                            value={
                                                previewData[
                                                    variable as keyof typeof previewData
                                                ] || ''
                                            }
                                            onChange={(e) =>
                                                setPreviewData({
                                                    ...previewData,
                                                    [variable]: e.target.value,
                                                })
                                            }
                                            placeholder={`Valeur de ${variable}`}
                                        />
                                    </div>
                                ))}

                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">
                                        {getPreview() || 'Entrez du contenu...'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
