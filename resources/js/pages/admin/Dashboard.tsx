import { Head, Link } from '@inertiajs/react';
import {
    Users,
    UserCheck,
    Contact,
    FolderOpen,
    Send,
    TrendingUp,
    ArrowRight,
    MessageSquare,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User, Notification } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface Props {
    stats: {
        pending_users: number;
        active_users: number;
        contacts: number;
        groups: number;
        notifications_today: number;
        notifications_week: number;
    };
    recentNotifications: Notification[];
    pendingUsers: User[];
}

export default function Dashboard({
    stats,
    recentNotifications,
    pendingUsers,
}: Props) {
    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Vue d'ensemble de votre plateforme
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Espace opérateur
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Utilisateurs en attente
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.pending_users}
                            </div>
                            {stats.pending_users > 0 && (
                                <p className="text-xs text-orange-600">
                                    En attente de validation
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Utilisateurs actifs
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.active_users}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Contacts
                            </CardTitle>
                            <Contact className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.contacts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Dans {stats.groups} groupes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Notifications
                            </CardTitle>
                            <Send className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.notifications_today}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Aujourd'hui ({stats.notifications_week} cette
                                semaine)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Pending Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Utilisateurs en attente</CardTitle>
                            <CardDescription>
                                Comptes en attente de validation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Aucun utilisateur en attente
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <Badge variant="warning">
                                                En attente
                                            </Badge>
                                        </div>
                                    ))}
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link href="/admin/users?status=pending">
                                            Voir tous
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications récentes</CardTitle>
                            <CardDescription>
                                Dernières notifications envoyées
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentNotifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Aucune notification
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">
                                                    {notification.title ||
                                                        'Sans titre'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Par{' '}
                                                    {notification.sender?.name}{' '}
                                                    -{' '}
                                                    {formatDateTime(
                                                        notification.created_at
                                                    )}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    notification.status ===
                                                    'sent'
                                                        ? 'success'
                                                        : notification.status ===
                                                            'failed'
                                                          ? 'destructive'
                                                          : 'secondary'
                                                }
                                            >
                                                {notification.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
