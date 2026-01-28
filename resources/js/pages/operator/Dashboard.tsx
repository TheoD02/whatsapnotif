import { Head, Link, usePage } from '@inertiajs/react';
import { Send, History, TrendingUp, MessageSquare, Settings } from 'lucide-react';
import OperatorLayout from '@/layouts/OperatorLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Notification, PageProps } from '@/types';
import { formatDateTime, truncate } from '@/lib/utils';

interface Props {
    stats: {
        notifications_sent: number;
        notifications_today: number;
        notifications_week: number;
    };
    recentNotifications: Array<Notification & { recipients_count: number }>;
}

export default function Dashboard({ stats, recentNotifications }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user?.role === 'admin';

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
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <OperatorLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Bienvenue sur votre espace de notifications
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <Button asChild variant="outline">
                                <Link href="/admin">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Administration
                                </Link>
                            </Button>
                        )}
                        <Button asChild>
                            <Link href="/notifications/create">
                                <Send className="mr-2 h-4 w-4" />
                                Nouvelle notification
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Aujourd'hui
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.notifications_today}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                notification(s) envoyée(s)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Cette semaine
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.notifications_week}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                notification(s)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total
                            </CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.notifications_sent}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                notification(s) envoyée(s)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Notifications récentes</CardTitle>
                        <CardDescription>
                            Vos dernières notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentNotifications.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground">
                                    Aucune notification envoyée
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/notifications/create">
                                        Envoyer ma première notification
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentNotifications.map((notification) => (
                                    <Link
                                        key={notification.id}
                                        href={`/history/${notification.id}`}
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">
                                                    {notification.title ||
                                                        truncate(
                                                            notification.content,
                                                            40
                                                        )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {notification.recipients_count}{' '}
                                                    destinataire(s) -{' '}
                                                    {formatDateTime(
                                                        notification.created_at
                                                    )}
                                                </p>
                                            </div>
                                            {getStatusBadge(notification.status)}
                                        </div>
                                    </Link>
                                ))}

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/history">
                                        Voir tout l'historique
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </OperatorLayout>
    );
}
