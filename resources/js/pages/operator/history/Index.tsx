import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Calendar, Eye } from 'lucide-react';
import OperatorLayout from '@/layouts/OperatorLayout';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Notification, PaginatedData } from '@/types';
import { formatDateTime, truncate } from '@/lib/utils';

interface Props {
    notifications: PaginatedData<Notification & { recipients_count: number }>;
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function HistoryIndex({ notifications, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/history', { ...filters, search: value }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/history', { ...filters, [key]: value }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="success">Envoyé</Badge>;
            case 'sending':
                return <Badge variant="warning">En cours</Badge>;
            case 'partial':
                return <Badge variant="warning">Partiel</Badge>;
            case 'failed':
                return <Badge variant="destructive">Échec</Badge>;
            case 'queued':
                return <Badge variant="secondary">En file</Badge>;
            case 'draft':
                return <Badge variant="outline">Brouillon</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <OperatorLayout>
            <Head title="Historique" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Historique</h1>
                    <p className="text-muted-foreground">
                        Consultez l'historique de vos notifications
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
                            <SelectItem value="sent">Envoyé</SelectItem>
                            <SelectItem value="sending">En cours</SelectItem>
                            <SelectItem value="partial">Partiel</SelectItem>
                            <SelectItem value="failed">Échec</SelectItem>
                            <SelectItem value="queued">En file</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={filters.date_from || ''}
                            onChange={(e) =>
                                handleFilterChange('date_from', e.target.value)
                            }
                            className="w-[150px]"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="date"
                            value={filters.date_to || ''}
                            onChange={(e) =>
                                handleFilterChange('date_to', e.target.value)
                            }
                            className="w-[150px]"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Titre / Message</TableHead>
                                <TableHead>Destinataires</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notifications.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        Aucune notification trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                notifications.data.map((notification) => (
                                    <TableRow key={notification.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDateTime(
                                                notification.created_at
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {notification.title && (
                                                    <p className="font-medium">
                                                        {notification.title}
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    {truncate(
                                                        notification.content,
                                                        60
                                                    )}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {notification.recipients_count}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(notification.status)}
                                        </TableCell>
                                        <TableCell>
                                            <Button asChild variant="ghost" size="icon">
                                                <Link
                                                    href={`/history/${notification.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {notifications.links.map((link, i) => (
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
        </OperatorLayout>
    );
}
