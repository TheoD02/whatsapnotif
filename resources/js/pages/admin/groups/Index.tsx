import { Head, Link, router } from '@inertiajs/react';
import { Plus, MoreHorizontal, Edit, Trash2, Users } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Group } from '@/types';

interface Props {
    groups: Array<Group & { contacts_count: number; authorized_users_count: number }>;
}

export default function GroupsIndex({ groups }: Props) {
    const handleDelete = (group: Group) => {
        if (confirm(`Supprimer le groupe ${group.name} ?`)) {
            router.delete(`/admin/groups/${group.id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Groupes" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Groupes</h1>
                        <p className="text-muted-foreground">
                            Organisez vos contacts en groupes
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/groups/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau groupe
                        </Link>
                    </Button>
                </div>

                {groups.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center">
                            <p className="text-muted-foreground">
                                Aucun groupe créé
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/admin/groups/create">
                                    Créer un groupe
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group) => (
                            <Card key={group.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor: group.color,
                                            }}
                                        />
                                        <div>
                                            <CardTitle className="text-lg">
                                                {group.name}
                                            </CardTitle>
                                            {group.description && (
                                                <CardDescription className="mt-1">
                                                    {group.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={`/admin/groups/${group.id}/edit`}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Modifier
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDelete(group)
                                                }
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {group.contacts_count} contact(s)
                                        </span>
                                        <span>
                                            {group.authorized_users_count} opérateur(s)
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
