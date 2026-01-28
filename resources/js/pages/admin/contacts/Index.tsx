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
    Send,
    MessageSquare,
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
import { Textarea } from '@/components/ui/textarea';
import type { Contact, Group, PaginatedData, PreferredChannel } from '@/types';
import { formatPhone } from '@/lib/utils';

const ChannelBadge = ({ channel }: { channel: PreferredChannel }) => (
    <Badge
        variant={channel === 'telegram' ? 'default' : 'secondary'}
        className={
            channel === 'telegram'
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-green-500 hover:bg-green-600 text-white'
        }
    >
        {channel === 'telegram' ? (
            <Send className="h-3 w-3 mr-1" />
        ) : (
            <MessageSquare className="h-3 w-3 mr-1" />
        )}
        {channel === 'telegram' ? 'Telegram' : 'WhatsApp'}
    </Badge>
);

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
    const [testContact, setTestContact] = useState<Contact | null>(null);
    const [testMessage, setTestMessage] = useState('');
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<{
        success?: boolean;
        error?: string;
    } | null>(null);

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

    const openTestDialog = (contact: Contact) => {
        setTestContact(contact);
        setTestMessage(`Bonjour ${contact.name}, ceci est un message de test.`);
        setTestResult(null);
    };

    const closeTestDialog = () => {
        setTestContact(null);
        setTestMessage('');
        setTestResult(null);
    };

    const handleSendTest = async () => {
        if (!testContact || !testMessage) return;

        setTestLoading(true);
        setTestResult(null);

        const identifier =
            testContact.preferred_channel === 'telegram'
                ? testContact.telegram_chat_id
                : testContact.phone;

        try {
            const response = await fetch('/admin/contacts/test-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    identifier,
                    message: testMessage,
                    channel: testContact.preferred_channel || 'whatsapp',
                }),
            });
            const result = await response.json();
            setTestResult(result);
        } catch {
            setTestResult({ success: false, error: 'Erreur de connexion' });
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Contacts" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Contacts</h1>
                        <p className="text-muted-foreground">
                            Gérez vos contacts WhatsApp et Telegram
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
                                <TableHead>Canal</TableHead>
                                <TableHead>Identifiant</TableHead>
                                <TableHead>Groupes</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contacts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
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
                                            <ChannelBadge
                                                channel={
                                                    contact.preferred_channel ||
                                                    'whatsapp'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {contact.preferred_channel ===
                                                'telegram' ? (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        {contact.telegram_chat_id}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Phone className="h-4 w-4" />
                                                        {formatPhone(
                                                            contact.phone
                                                        )}
                                                    </>
                                                )}
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
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openTestDialog(
                                                                contact
                                                            )
                                                        }
                                                    >
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Envoyer un test
                                                    </DropdownMenuItem>
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

            {/* Test Message Dialog */}
            <Dialog
                open={!!testContact}
                onOpenChange={(open) => !open && closeTestDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Envoyer un message test</DialogTitle>
                        <DialogDescription>
                            Envoyez un message de test à {testContact?.name} via{' '}
                            {testContact?.preferred_channel === 'telegram'
                                ? 'Telegram'
                                : 'WhatsApp'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {testContact?.preferred_channel === 'telegram' ? (
                                <>
                                    <Send className="h-4 w-4" />
                                    Chat ID: {testContact?.telegram_chat_id}
                                </>
                            ) : (
                                <>
                                    <Phone className="h-4 w-4" />
                                    {formatPhone(testContact?.phone || '')}
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="test-message">Message</Label>
                            <Textarea
                                id="test-message"
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                rows={4}
                            />
                        </div>

                        {testResult && (
                            <div
                                className={`p-3 rounded-lg ${
                                    testResult.success
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {testResult.success
                                    ? 'Message envoyé avec succès !'
                                    : `Erreur : ${testResult.error}`}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeTestDialog}>
                            Fermer
                        </Button>
                        <Button
                            onClick={handleSendTest}
                            disabled={testLoading || !testMessage}
                        >
                            {testLoading ? 'Envoi...' : 'Envoyer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
