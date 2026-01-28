import { PropsWithChildren, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    MessageSquare,
    Users,
    FolderOpen,
    FileText,
    History,
    Settings,
    Key,
    LayoutDashboard,
    Menu,
    X,
    LogOut,
    ChevronDown,
    BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PageProps } from '@/types';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Contacts', href: '/admin/contacts', icon: Users },
    { name: 'Groupes', href: '/admin/groups', icon: FolderOpen },
    { name: 'Templates', href: '/admin/templates', icon: FileText },
    { name: 'Tokens API', href: '/admin/api-tokens', icon: Key },
    { name: 'Documentation', href: '/admin/documentation', icon: BookOpen },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentPath = window.location.pathname;

    const handleLogout = () => {
        router.post('/logout');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg">Messaging Hub</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-4rem)]">
                    <nav className="p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = item.href === '/admin'
                                ? currentPath === item.href
                                : currentPath.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </ScrollArea>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                        {auth.user
                                            ? getInitials(auth.user.name)
                                            : '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline-block">
                                    {auth.user?.name}
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/admin/settings"
                                    className="flex items-center"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Paramètres
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Page content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
