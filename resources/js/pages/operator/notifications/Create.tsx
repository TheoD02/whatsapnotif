import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useState, useMemo } from 'react';
import { Send, Users, FileText, Eye, FlaskConical, MessageSquare } from 'lucide-react';
import OperatorLayout from '@/layouts/OperatorLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Contact, Group, MessageTemplate, PreferredChannel } from '@/types';

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
    groups: Array<Group & { contacts_count: number }>;
    contacts: Contact[];
    templates: MessageTemplate[];
}

export default function NotificationCreate({
    groups,
    contacts,
    templates,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        template_id: '',
        contact_ids: [] as number[],
        group_ids: [] as number[],
    });

    const [testDialogOpen, setTestDialogOpen] = useState(false);
    const [testPhone, setTestPhone] = useState('');
    const [testResult, setTestResult] = useState<{
        success?: boolean;
        error?: string;
    } | null>(null);
    const [testLoading, setTestLoading] = useState(false);
    const [channelFilter, setChannelFilter] = useState<
        'all' | 'whatsapp' | 'telegram'
    >('all');

    const filteredContacts = useMemo(() => {
        if (channelFilter === 'all') return contacts;
        return contacts.filter(
            (c) => (c.preferred_channel || 'whatsapp') === channelFilter
        );
    }, [contacts, channelFilter]);

    const recipientStats = useMemo(() => {
        const selectedContacts = new Set<number>();
        data.group_ids.forEach((groupId) => {
            const group = groups.find((g) => g.id === groupId);
            if (group) {
                contacts
                    .filter((c) => c.groups?.some((g) => g.id === groupId))
                    .forEach((c) => selectedContacts.add(c.id));
            }
        });
        data.contact_ids.forEach((id) => selectedContacts.add(id));

        const selectedContactsList = contacts.filter((c) =>
            selectedContacts.has(c.id)
        );
        const whatsappCount = selectedContactsList.filter(
            (c) => (c.preferred_channel || 'whatsapp') === 'whatsapp'
        ).length;
        const telegramCount = selectedContactsList.filter(
            (c) => c.preferred_channel === 'telegram'
        ).length;

        return {
            total: selectedContacts.size,
            whatsapp: whatsappCount,
            telegram: telegramCount,
        };
    }, [data.group_ids, data.contact_ids, groups, contacts]);

    const recipientCount = recipientStats.total;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/notifications');
    };

    const handleTemplateSelect = (templateId: string) => {
        const actualId = templateId === 'none' ? '' : templateId;
        setData('template_id', actualId);
        if (actualId) {
            const template = templates.find((t) => t.id === parseInt(actualId));
            if (template) {
                setData('content', template.content);
            }
        }
    };

    const toggleGroup = (groupId: number) => {
        if (data.group_ids.includes(groupId)) {
            setData(
                'group_ids',
                data.group_ids.filter((id) => id !== groupId)
            );
        } else {
            setData('group_ids', [...data.group_ids, groupId]);
        }
    };

    const toggleContact = (contactId: number) => {
        if (data.contact_ids.includes(contactId)) {
            setData(
                'contact_ids',
                data.contact_ids.filter((id) => id !== contactId)
            );
        } else {
            setData('contact_ids', [...data.contact_ids, contactId]);
        }
    };

    const handleTest = async () => {
        if (!testPhone || !data.content) return;

        setTestLoading(true);
        setTestResult(null);

        try {
            const response = await fetch('/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    phone: testPhone,
                    content: data.content,
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
        <OperatorLayout>
            <Head title="Nouvelle notification" />

            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Nouvelle notification</h1>
                    <p className="text-muted-foreground">
                        Composez et envoyez une notification WhatsApp
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Message */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Message
                                </CardTitle>
                                <CardDescription>
                                    Rédigez votre message ou utilisez un template
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Titre (optionnel)
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="Titre interne"
                                    />
                                </div>

                                {templates.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Template</Label>
                                        <Select
                                            value={data.template_id || 'none'}
                                            onValueChange={handleTemplateSelect}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Message libre
                                                </SelectItem>
                                                {templates.map((template) => (
                                                    <SelectItem
                                                        key={template.id}
                                                        value={template.id.toString()}
                                                    >
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="content">Message</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) =>
                                            setData('content', e.target.value)
                                        }
                                        placeholder="Votre message..."
                                        rows={8}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Utilisez {'{{ nom }}'} pour personnaliser
                                        avec le nom du contact
                                    </p>
                                    {errors.content && (
                                        <p className="text-sm text-destructive">
                                            {errors.content}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setTestDialogOpen(true)}
                                    disabled={!data.content}
                                >
                                    <FlaskConical className="mr-2 h-4 w-4" />
                                    Tester l'envoi
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recipients */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Destinataires
                                </CardTitle>
                                <CardDescription>
                                    Sélectionnez les groupes ou contacts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="groups">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="groups">
                                            Groupes
                                        </TabsTrigger>
                                        <TabsTrigger value="contacts">
                                            Contacts
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="groups"
                                        className="space-y-3 mt-4"
                                    >
                                        {groups.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Aucun groupe disponible
                                            </p>
                                        ) : (
                                            groups.map((group) => (
                                                <div
                                                    key={group.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`group-${group.id}`}
                                                        checked={data.group_ids.includes(
                                                            group.id
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleGroup(group.id)
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`group-${group.id}`}
                                                        className="flex items-center gap-2 font-normal flex-1"
                                                    >
                                                        <span
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    group.color,
                                                            }}
                                                        />
                                                        {group.name}
                                                        <Badge
                                                            variant="secondary"
                                                            className="ml-auto"
                                                        >
                                                            {group.contacts_count}
                                                        </Badge>
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </TabsContent>

                                    <TabsContent
                                        value="contacts"
                                        className="space-y-3 mt-4"
                                    >
                                        <div className="flex gap-1 mb-3">
                                            <Button
                                                type="button"
                                                variant={
                                                    channelFilter === 'all'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setChannelFilter('all')
                                                }
                                            >
                                                Tous
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={
                                                    channelFilter === 'whatsapp'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setChannelFilter('whatsapp')
                                                }
                                                className={
                                                    channelFilter === 'whatsapp'
                                                        ? 'bg-green-500 hover:bg-green-600'
                                                        : ''
                                                }
                                            >
                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                WhatsApp
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={
                                                    channelFilter === 'telegram'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setChannelFilter('telegram')
                                                }
                                                className={
                                                    channelFilter === 'telegram'
                                                        ? 'bg-blue-500 hover:bg-blue-600'
                                                        : ''
                                                }
                                            >
                                                <Send className="h-3 w-3 mr-1" />
                                                Telegram
                                            </Button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto space-y-3">
                                            {filteredContacts.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">
                                                    Aucun contact disponible
                                                </p>
                                            ) : (
                                                filteredContacts.map(
                                                    (contact) => (
                                                        <div
                                                            key={contact.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                id={`contact-${contact.id}`}
                                                                checked={data.contact_ids.includes(
                                                                    contact.id
                                                                )}
                                                                onCheckedChange={() =>
                                                                    toggleContact(
                                                                        contact.id
                                                                    )
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor={`contact-${contact.id}`}
                                                                className="font-normal flex items-center gap-2"
                                                            >
                                                                {contact.name}
                                                                <ChannelBadge
                                                                    channel={
                                                                        contact.preferred_channel ||
                                                                        'whatsapp'
                                                                    }
                                                                />
                                                                <span className="text-muted-foreground text-xs">
                                                                    {contact.preferred_channel ===
                                                                    'telegram'
                                                                        ? contact.telegram_chat_id
                                                                        : contact.phone}
                                                                </span>
                                                            </Label>
                                                        </div>
                                                    )
                                                )
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {(errors as Record<string, string>).recipients && (
                                    <p className="text-sm text-destructive mt-2">
                                        {(errors as Record<string, string>).recipients}
                                    </p>
                                )}

                                <div className="mt-4 pt-4 border-t space-y-1">
                                    <p className="text-sm">
                                        <strong>{recipientCount}</strong>{' '}
                                        destinataire(s) sélectionné(s)
                                    </p>
                                    {recipientCount > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {recipientStats.whatsapp > 0 && (
                                                <span className="inline-flex items-center mr-3">
                                                    <MessageSquare className="h-3 w-3 mr-1 text-green-500" />
                                                    {recipientStats.whatsapp}{' '}
                                                    WhatsApp
                                                </span>
                                            )}
                                            {recipientStats.telegram > 0 && (
                                                <span className="inline-flex items-center">
                                                    <Send className="h-3 w-3 mr-1 text-blue-500" />
                                                    {recipientStats.telegram}{' '}
                                                    Telegram
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="submit"
                            disabled={processing || recipientCount === 0}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {processing ? 'Envoi en cours...' : 'Envoyer'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Test Dialog */}
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tester l'envoi</DialogTitle>
                        <DialogDescription>
                            Envoyez un message de test à un numéro
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="test-phone">Numéro de test</Label>
                            <Input
                                id="test-phone"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                                placeholder="+33612345678"
                            />
                        </div>

                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">
                                Aperçu du message :
                            </p>
                            <p className="text-sm whitespace-pre-wrap">
                                {data.content}
                            </p>
                        </div>

                        {testResult && (
                            <div
                                className={`p-3 rounded-lg ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                                {testResult.success
                                    ? 'Message envoyé avec succès !'
                                    : `Erreur : ${testResult.error}`}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setTestDialogOpen(false)}
                        >
                            Fermer
                        </Button>
                        <Button
                            onClick={handleTest}
                            disabled={testLoading || !testPhone}
                        >
                            {testLoading ? 'Envoi...' : 'Envoyer le test'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </OperatorLayout>
    );
}
