import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import OperatorLayout from '@/layouts/OperatorLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Notification, NotificationRecipient } from '@/types';
import { formatDateTime, formatPhone } from '@/lib/utils';

interface Props {
    notification: Notification & { recipients: NotificationRecipient[] };
    stats: {
        total: number;
        sent: number;
        delivered: number;
        failed: number;
        pending: number;
    };
}

export default function HistoryShow({ notification, stats }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="success">Envoyé</Badge>;
            case 'delivered':
                return <Badge variant="success">Délivré</Badge>;
            case 'pending':
                return <Badge variant="secondary">En attente</Badge>;
            case 'failed':
                return <Badge variant="destructive">Échec</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getNotificationStatusBadge = (status: string) => {
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
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const successRate =
        stats.total > 0
            ? Math.round(((stats.sent + stats.delivered) / stats.total) * 100)
            : 0;

    return (
        <OperatorLayout>
            <Head title={notification.title || 'Détail notification'} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/history">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">
                            {notification.title || 'Notification'}
                        </h1>
                        <p className="text-muted-foreground">
                            Envoyée le {formatDateTime(notification.created_at)}
                            {notification.sender && (
                                <> par {notification.sender.name}</>
                            )}
                        </p>
                    </div>
                    {getNotificationStatusBadge(notification.status)}
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total
                            </CardTitle>
                            <Send className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                destinataire(s)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Succès
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.sent + stats.delivered}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {successRate}% de réussite
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Échecs
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.failed}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                En attente
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.pending}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Message */}
                <Card>
                    <CardHeader>
                        <CardTitle>Message</CardTitle>
                        {notification.template && (
                            <CardDescription>
                                Template : {notification.template.name}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                            {notification.content}
                        </div>
                    </CardContent>
                </Card>

                {/* Recipients */}
                <Card>
                    <CardHeader>
                        <CardTitle>Destinataires</CardTitle>
                        <CardDescription>
                            Détail des envois par destinataire
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Téléphone</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Envoyé le</TableHead>
                                    <TableHead>Erreur</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notification.recipients?.map((recipient) => (
                                    <TableRow key={recipient.id}>
                                        <TableCell className="font-medium">
                                            {recipient.contact?.name ||
                                                'Contact supprimé'}
                                        </TableCell>
                                        <TableCell>
                                            {recipient.contact
                                                ? formatPhone(
                                                      recipient.contact.phone
                                                  )
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(recipient.status)}
                                        </TableCell>
                                        <TableCell>
                                            {recipient.sent_at
                                                ? formatDateTime(
                                                      recipient.sent_at
                                                  )
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-destructive">
                                            {recipient.error_message || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </OperatorLayout>
    );
}
