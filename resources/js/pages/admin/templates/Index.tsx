import { Head, Link, router } from '@inertiajs/react';
import { Plus, MoreHorizontal, Edit, Trash2, FileText } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
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
import type { MessageTemplate, PaginatedData } from '@/types';
import { formatDateTime, truncate } from '@/lib/utils';

interface Props {
    templates: PaginatedData<MessageTemplate>;
}

export default function TemplatesIndex({ templates }: Props) {
    const handleDelete = (template: MessageTemplate) => {
        if (confirm(`Supprimer le template "${template.name}" ?`)) {
            router.delete(`/admin/templates/${template.id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Templates" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Templates</h1>
                        <p className="text-muted-foreground">
                            Gérez vos templates de messages
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/templates/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau template
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Contenu</TableHead>
                                <TableHead>Créé par</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground"
                                    >
                                        Aucun template créé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templates.data.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">
                                            <span className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {template.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <span className="text-sm text-muted-foreground">
                                                {truncate(template.content, 60)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {template.creator?.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    template.is_active
                                                        ? 'success'
                                                        : 'secondary'
                                                }
                                            >
                                                {template.is_active
                                                    ? 'Actif'
                                                    : 'Inactif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatDateTime(template.created_at)}
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
                                                            href={`/admin/templates/${template.id}/edit`}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(
                                                                template
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

                {templates.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {templates.links.map((link, i) => (
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
        </AdminLayout>
    );
}
