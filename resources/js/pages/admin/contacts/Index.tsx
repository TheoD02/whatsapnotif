import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Plus,
    Upload,
    MoreHorizontal,
    Edit,
    Trash2,
    Phone,
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
import { Label } from '@/components/ui/label';
import type { Contact, Group, PaginatedData } from '@/types';
import { formatPhone } from '@/lib/utils';

interface Props {
    contacts: PaginatedData<Contact>;
    groups: Array<Group & { contacts_count: number }>;
    filters: {
        search?: string;
        group?: string;
        active?: string;
    };
}

export default function ContactsIndex({ contacts, groups, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [importOpen, setImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importGroup, setImportGroup] = useState<string>('');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            '/admin/contacts',
            { ...filters, search: value },
            { preserveState: true }
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/admin/contacts',
            { ...filters, [key]: value },
            { preserveState: true }
        );
    };

    const handleDelete = (contact: Contact) => {
        if (confirm(`Supprimer le contact ${contact.name} ?`)) {
            router.delete(`/admin/contacts/${contact.id}`);
        }
    };

    const handleImport = () => {
        if (!importFile) return;

        const formData = new FormData();
        formData.append('file', importFile);
        if (importGroup) {
            formData.append('group_id', importGroup);
        }

        router.post('/admin/contacts/import', formData, {
            onSuccess: () => {
                setImportOpen(false);
                setImportFile(null);
                setImportGroup('');
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Contacts" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Contacts</h1>
                        <p className="text-muted-foreground">
                            Gérez vos contacts WhatsApp
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setImportOpen(true)}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Importer CSV
                        </Button>
                        <Button asChild>
                            <Link href="/admin/contacts/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter
                            </Link>
                        </Button>
                    </div>
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
                        value={filters.group || 'all'}
                        onValueChange={(v) => handleFilterChange('group', v)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Groupe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les groupes</SelectItem>
                            {groups.map((group) => (
                                <SelectItem
                                    key={group.id}
                                    value={group.id.toString()}
                                >
                                    {group.name} ({group.contacts_count})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.active || 'all'}
                        onValueChange={(v) => handleFilterChange('active', v)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="true">Actifs</SelectItem>
                            <SelectItem value="false">Inactifs</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead>Groupes</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contacts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        Aucun contact trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contacts.data.map((contact) => (
                                    <TableRow key={contact.id}>
                                        <TableCell className="font-medium">
                                            {contact.name}
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {formatPhone(contact.phone)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {contact.groups?.map(
                                                    (group) => (
                                                        <Badge
                                                            key={group.id}
                                                            variant="outline"
                                                            style={{
                                                                borderColor:
                                                                    group.color,
                                                                color: group.color,
                                                            }}
                                                        >
                                                            {group.name}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    contact.is_active
                                                        ? 'success'
                                                        : 'secondary'
                                                }
                                            >
                                                {contact.is_active
                                                    ? 'Actif'
                                                    : 'Inactif'}
                                            </Badge>
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
                                                            href={`/admin/contacts/${contact.id}/edit`}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(
                                                                contact
                                                            )
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
                {contacts.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {contacts.links.map((link, i) => (
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

            {/* Import Dialog */}
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Importer des contacts</DialogTitle>
                        <DialogDescription>
                            Importez des contacts depuis un fichier CSV. Le
                            fichier doit contenir les colonnes "name" et
                            "phone".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">Fichier CSV</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".csv,.txt"
                                onChange={(e) =>
                                    setImportFile(e.target.files?.[0] || null)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group">
                                Ajouter au groupe (optionnel)
                            </Label>
                            <Select
                                value={importGroup}
                                onValueChange={setImportGroup}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un groupe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups.map((group) => (
                                        <SelectItem
                                            key={group.id}
                                            value={group.id.toString()}
                                        >
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setImportOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleImport} disabled={!importFile}>
                            Importer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
