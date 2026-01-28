import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, RefreshCw, Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Contact } from '@/types';

interface TelegramLinkData {
    token: string;
    code: string;
    deep_link: string;
    expires_at: string;
    expires_in_minutes: number;
}

interface Props {
    contact: Contact | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLinked?: () => void;
}

export default function TelegramLinkDialog({
    contact,
    open,
    onOpenChange,
    onLinked,
}: Props) {
    const [linkData, setLinkData] = useState<TelegramLinkData | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<'link' | 'code' | null>(null);
    const [isLinked, setIsLinked] = useState(false);
    const [checking, setChecking] = useState(false);

    const generateLink = useCallback(async () => {
        if (!contact) return;

        setLoading(true);
        setIsLinked(false);

        try {
            const response = await fetch(
                `/admin/contacts/${contact.id}/telegram-link`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                }
            );
            const data = await response.json();
            if (data.success) {
                setLinkData(data);
            }
        } catch (error) {
            console.error('Error generating link:', error);
        } finally {
            setLoading(false);
        }
    }, [contact]);

    const checkStatus = useCallback(async () => {
        if (!contact || !linkData) return;

        setChecking(true);
        try {
            const response = await fetch(
                `/admin/contacts/${contact.id}/telegram-link/check`
            );
            const data = await response.json();

            if (data.linked) {
                setIsLinked(true);
                onLinked?.();
            }
        } catch (error) {
            console.error('Error checking status:', error);
        } finally {
            setChecking(false);
        }
    }, [contact, linkData, onLinked]);

    useEffect(() => {
        if (open && contact) {
            generateLink();
        } else {
            setLinkData(null);
            setIsLinked(false);
        }
    }, [open, contact, generateLink]);

    // Poll for status every 2 seconds when dialog is open
    useEffect(() => {
        if (!open || !linkData || isLinked) return;

        // Check immediately, then every 2 seconds
        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, [open, linkData, isLinked, checkStatus]);

    const copyToClipboard = async (text: string, type: 'link' | 'code') => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!contact) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-blue-500" />
                        Lier Telegram - {contact.name}
                    </DialogTitle>
                    <DialogDescription>
                        Partagez le QR code ou le lien avec le contact pour
                        qu'il puisse s'enregistrer automatiquement.
                    </DialogDescription>
                </DialogHeader>

                {isLinked ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-green-600 mb-2">
                            Compte lié avec succès !
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {contact.name} recevra maintenant les notifications
                            sur Telegram.
                        </p>
                        <Button
                            className="mt-4"
                            onClick={() => onOpenChange(false)}
                        >
                            Fermer
                        </Button>
                    </div>
                ) : loading ? (
                    <div className="py-8 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            Génération du lien...
                        </p>
                    </div>
                ) : linkData ? (
                    <Tabs defaultValue="qrcode" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                            <TabsTrigger value="link">Lien</TabsTrigger>
                            <TabsTrigger value="code">Code</TabsTrigger>
                        </TabsList>

                        <TabsContent value="qrcode" className="space-y-4">
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <QRCodeSVG
                                    value={linkData.deep_link}
                                    size={200}
                                    level="M"
                                    includeMargin
                                />
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                Scannez ce QR code avec l'appareil photo du
                                contact pour ouvrir Telegram et lier le compte
                                automatiquement.
                            </p>
                        </TabsContent>

                        <TabsContent value="link" className="space-y-4">
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-3 bg-muted rounded text-xs break-all">
                                    {linkData.deep_link}
                                </code>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                        copyToClipboard(
                                            linkData.deep_link,
                                            'link'
                                        )
                                    }
                                >
                                    {copied === 'link' ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <Button asChild className="w-full">
                                <a
                                    href={linkData.deep_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ouvrir dans Telegram
                                </a>
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Partagez ce lien avec le contact. En cliquant
                                dessus, Telegram s'ouvrira et le compte sera lié
                                automatiquement.
                            </p>
                        </TabsContent>

                        <TabsContent value="code" className="space-y-4">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 p-4 bg-muted rounded-lg">
                                    <span className="text-3xl font-mono font-bold tracking-widest">
                                        {linkData.code}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                            copyToClipboard(
                                                linkData.code,
                                                'code'
                                            )
                                        }
                                    >
                                        {copied === 'code' ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                Le contact doit envoyer ce code au bot Telegram
                                pour lier son compte.
                            </p>
                        </TabsContent>

                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                {checking && (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                )}
                                En attente de liaison...
                            </span>
                            <Badge variant="outline">
                                Expire dans {linkData.expires_in_minutes} min
                            </Badge>
                        </div>
                    </Tabs>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
