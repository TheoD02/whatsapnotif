import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
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
import type { Group } from '@/types';

const COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#14b8a6',
    '#06b6d4',
    '#3b82f6',
];

interface Props {
    group: Group;
}

export default function GroupEdit({ group }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: group.name,
        description: group.description || '',
        color: group.color,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/groups/${group.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Modifier ${group.name}`} />

            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/groups">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Modifier le groupe</h1>
                        <p className="text-muted-foreground">{group.name}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations du groupe</CardTitle>
                        <CardDescription>
                            Modifiez les informations du groupe
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
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (optionnel)
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Couleur</Label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                                                data.color === color
                                                    ? 'border-foreground scale-110'
                                                    : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() =>
                                                setData('color', color)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Enregistrement...'
                                        : 'Enregistrer'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/admin/groups">Annuler</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
