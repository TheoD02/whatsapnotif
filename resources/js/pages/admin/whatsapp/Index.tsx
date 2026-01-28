import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Smartphone,
    Wifi,
    WifiOff,
    RefreshCw,
    LogOut,
    QrCode,
    CheckCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';

interface Props {
    status: {
        status: string;
        hasQR?: boolean;
        error?: string;
    };
    qrCode: string | null;
}

export default function WhatsAppIndex({ status: initialStatus, qrCode: initialQrCode }: Props) {
    const [status, setStatus] = useState(initialStatus);
    const [qrCode, setQrCode] = useState(initialQrCode);
    const [polling, setPolling] = useState(true);

    useEffect(() => {
        if (!polling) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch('/admin/whatsapp/status');
                const data = await response.json();
                setStatus(data.status);
                setQrCode(data.qrCode);

                // Stop polling if connected
                if (data.status.status === 'connected') {
                    setPolling(false);
                }
            } catch (error) {
                console.error('Error polling status:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [polling]);

    const getStatusBadge = () => {
        switch (status.status) {
            case 'connected':
                return (
                    <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Connecté
                    </Badge>
                );
            case 'qr_ready':
                return (
                    <Badge variant="warning" className="gap-1">
                        <QrCode className="h-3 w-3" />
                        En attente du scan
                    </Badge>
                );
            case 'connecting':
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Connexion...
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Erreur
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="gap-1">
                        <WifiOff className="h-3 w-3" />
                        Déconnecté
                    </Badge>
                );
        }
    };

    const handleLogout = () => {
        router.post('/admin/whatsapp/logout');
        setPolling(true);
    };

    const handleReconnect = () => {
        router.post('/admin/whatsapp/reconnect');
        setPolling(true);
    };

    return (
        <AdminLayout>
            <Head title="Connexion WhatsApp" />

            <div className="max-w-2xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Connexion WhatsApp</h1>
                    <p className="text-muted-foreground">
                        Gérez la connexion au service WhatsApp
                    </p>
                </div>

                <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Attention</AlertTitle>
                    <AlertDescription>
                        Cette méthode utilise une connexion non-officielle à WhatsApp.
                        Il existe un risque de bannissement du numéro si WhatsApp détecte
                        une utilisation automatisée. Utilisez un numéro dédié.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-6 w-6" />
                                <div>
                                    <CardTitle>Statut de connexion</CardTitle>
                                    <CardDescription>
                                        Service WhatsApp Baileys
                                    </CardDescription>
                                </div>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {status.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{status.error}</AlertDescription>
                            </Alert>
                        )}

                        {status.status === 'qr_ready' && qrCode && (
                            <div className="flex flex-col items-center space-y-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    Scannez ce QR code avec WhatsApp sur votre téléphone
                                    <br />
                                    (Paramètres &gt; Appareils connectés &gt; Connecter un appareil)
                                </p>
                                <div className="p-4 bg-white rounded-lg shadow-sm">
                                    <img
                                        src={qrCode}
                                        alt="WhatsApp QR Code"
                                        className="w-64 h-64"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Le QR code se rafraîchit automatiquement
                                </p>
                            </div>
                        )}

                        {status.status === 'connected' && (
                            <div className="flex flex-col items-center space-y-4 py-8">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <Wifi className="h-8 w-8 text-green-600" />
                                </div>
                                <p className="text-lg font-medium text-green-600">
                                    WhatsApp est connecté
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Vous pouvez maintenant envoyer des notifications
                                </p>
                            </div>
                        )}

                        {status.status === 'connecting' && (
                            <div className="flex flex-col items-center space-y-4 py-8">
                                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Connexion en cours...
                                </p>
                            </div>
                        )}

                        {(status.status === 'disconnected' || status.status === 'error') && !status.hasQR && (
                            <div className="flex flex-col items-center space-y-4 py-8">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                    <WifiOff className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">
                                    WhatsApp n'est pas connecté
                                </p>
                            </div>
                        )}

                        <div className="flex justify-center gap-2 pt-4 border-t">
                            {status.status === 'connected' && (
                                <Button
                                    variant="destructive"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Déconnecter
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleReconnect}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reconnecter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                            <li>
                                Assurez-vous que le service WhatsApp est lancé
                                <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                                    cd whatsapp-service && npm start
                                </code>
                            </li>
                            <li>
                                Ouvrez WhatsApp sur votre téléphone
                            </li>
                            <li>
                                Allez dans Paramètres &gt; Appareils connectés
                            </li>
                            <li>
                                Appuyez sur "Connecter un appareil"
                            </li>
                            <li>
                                Scannez le QR code affiché ci-dessus
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
