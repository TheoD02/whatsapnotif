import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Send, Check, Link as LinkIcon } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import TelegramLinkDialog from '@/components/TelegramLinkDialog';
import type { Contact, Group, PreferredChannel } from '@/types';

interface Props {
    contact: Contact;
    groups: Group[];
}

export default function ContactEdit({ contact, groups }: Props) {
    const [telegramLinkOpen, setTelegramLinkOpen] = useState(false);
    const [currentContact, setCurrentContact] = useState(contact);

    const { data, setData, put, processing, errors } = useForm({
        name: contact.name,
        phone: contact.phone,
        preferred_channel: 'telegram' as PreferredChannel,
        telegram_chat_id: contact.telegram_chat_id || '',
        is_active: contact.is_active,
        group_ids: contact.groups?.map((g) => g.id) || [],
    });

    const isLinked = !!currentContact.telegram_chat_id;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/contacts/${contact.id}`);
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

    return (
        <AdminLayout>
            <Head title={`Modifier ${contact.name}`} />

            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/contacts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Modifier le contact</h1>
                        <p className="text-muted-foreground">{contact.name}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations du contact</CardTitle>
                        <CardDescription>
                            Modifiez les informations du contact
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label>Compte Telegram</Label>
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    {isLinked ? (
                                        <>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="default"
                                                        className="bg-green-500"
                                                    >
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Lié
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        Chat ID:{' '}
                                                        {
                                                            currentContact.telegram_chat_id
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setTelegramLinkOpen(
                                                        true
                                                    )
                                                }
                                            >
                                                <LinkIcon className="h-4 w-4 mr-1" />
                                                Relier
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        Non lié
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        Aucun compte
                                                        Telegram associé
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                onClick={() =>
                                                    setTelegramLinkOpen(
                                                        true
                                                    )
                                                }
                                            >
                                                <Send className="h-4 w-4 mr-1" />
                                                Lier Telegram
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', !!checked)
                                    }
                                />
                                <Label htmlFor="is_active">Contact actif</Label>
                            </div>

                            {groups.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Groupes</Label>
                                    <div className="space-y-2">
                                        {groups.map((group) => (
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
                                                    className="flex items-center gap-2 font-normal"
                                                >
                                                    <span
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                group.color,
                                                        }}
                                                    />
                                                    {group.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Enregistrement...'
                                        : 'Enregistrer'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/admin/contacts">Annuler</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <TelegramLinkDialog
                contact={currentContact}
                open={telegramLinkOpen}
                onOpenChange={setTelegramLinkOpen}
                onLinked={() => {
                    router.reload({ only: ['contact'] });
                    setCurrentContact({
                        ...currentContact,
                        telegram_chat_id: 'linked',
                    });
                }}
            />
        </AdminLayout>
    );
}
