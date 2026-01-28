import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    MoreHorizontal,
    Check,
    X,
    Eye,
    Trash2,
    UserCog,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { User, Group, PaginatedData } from '@/types';
import { formatDateTime, cn } from '@/lib/utils';

interface Props {
    users: PaginatedData<User & { allowed_groups: Group[] }>;
    groups: Group[];
    filters: {
        status?: string;
        role?: string;
        search?: string;
    };
}

export default function UsersIndex({ users, groups, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [groupsDialogUser, setGroupsDialogUser] = useState<
        (User & { allowed_groups: Group[] }) | null
    >(null);
    const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            '/admin/users',
            { ...filters, search: value },
            { preserveState: true }
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/admin/users',
            { ...filters, [key]: value },
            { preserveState: true }
        );
    };

    const handleApprove = (user: User) => {
        router.post(`/admin/users/${user.id}/approve`);
    };

    const handleReject = (user: User) => {
        router.post(`/admin/users/${user.id}/reject`);
    };

    const handleDelete = (user: User) => {
        if (confirm(`Supprimer l'utilisateur ${user.name} ?`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    };

    const openGroupsDialog = (user: User & { allowed_groups: Group[] }) => {
        setGroupsDialogUser(user);
        setSelectedGroups(user.allowed_groups.map((g) => g.id));
    };

    const handleUpdateGroups = () => {
        if (!groupsDialogUser) return;
        router.put(
            `/admin/users/${groupsDialogUser.id}/groups`,
            { group_ids: selectedGroups },
            {
                onSuccess: () => setGroupsDialogUser(null),
            }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="success">Actif</Badge>;
            case 'pending':
                return <Badge variant="warning">En attente</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejeté</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge>Admin</Badge>;
            case 'operator':
                return <Badge variant="secondary">Opérateur</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Head title="Utilisateurs" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Utilisateurs</h1>
                    <p className="text-muted-foreground">
                        Gérez les utilisateurs de la plateforme
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="active">Actifs</SelectItem>
                            <SelectItem value="rejected">Rejetés</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.role || 'all'}
                        onValueChange={(v) => handleFilterChange('role', v)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Rôle" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="operator">Opérateur</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Groupes</TableHead>
                                <TableHead>Inscrit le</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-muted-foreground"
                                    >
                                        Aucun utilisateur trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {getRoleBadge(user.role)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(user.status)}
                                        </TableCell>
                                        <TableCell>
                                            {user.allowed_groups.length > 0 ? (
                                                <span className="text-sm">
                                                    {user.allowed_groups.length}{' '}
                                                    groupe(s)
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    Aucun
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatDateTime(user.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/admin/users/${user.id}`}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Voir
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {user.status ===
                                                        'pending' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                <Check className="mr-2 h-4 w-4" />
                                                                Approuver
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleReject(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                <X className="mr-2 h-4 w-4" />
                                                                Rejeter
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openGroupsDialog(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        <UserCog className="mr-2 h-4 w-4" />
                                                        Permissions
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(user)
                                                        }
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {users.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.get(link.url)
                                }
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Groups Permission Dialog */}
            <Dialog
                open={!!groupsDialogUser}
                onOpenChange={() => setGroupsDialogUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Permissions de groupe - {groupsDialogUser?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Sélectionnez les groupes auxquels cet utilisateur
                            peut envoyer des notifications.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        {groups.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Aucun groupe créé
                            </p>
                        ) : (
                            groups.map((group) => (
                                <div
                                    key={group.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`group-${group.id}`}
                                        checked={selectedGroups.includes(
                                            group.id
                                        )}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedGroups([
                                                    ...selectedGroups,
                                                    group.id,
                                                ]);
                                            } else {
                                                setSelectedGroups(
                                                    selectedGroups.filter(
                                                        (id) => id !== group.id
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor={`group-${group.id}`}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: group.color,
                                            }}
                                        />
                                        {group.name}
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setGroupsDialogUser(null)}
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleUpdateGroups}>
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
