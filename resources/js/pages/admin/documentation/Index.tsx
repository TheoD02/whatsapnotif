import { Head, Link } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Home, Download, MessageCircle, Send, Code } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocPage {
    key: string;
    title: string;
    icon: string;
}

interface Props {
    content: string;
    currentPage: string;
    pages: DocPage[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    home: Home,
    download: Download,
    'message-circle': MessageCircle,
    send: Send,
    code: Code,
};

export default function Documentation({ content, currentPage, pages }: Props) {
    return (
        <AdminLayout>
            <Head title="Documentation" />

            <div className="flex gap-6">
                {/* Sidebar navigation */}
                <aside className="w-56 flex-shrink-0">
                    <div className="sticky top-24">
                        <h2 className="font-semibold text-lg mb-4">Documentation</h2>
                        <nav className="space-y-1">
                            {pages.map((page) => {
                                const Icon = iconMap[page.icon] || Home;
                                const isActive = currentPage === page.key;
                                return (
                                    <Link
                                        key={page.key}
                                        href={`/admin/documentation/${page.key}`}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {page.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0">
                    <ScrollArea className="h-[calc(100vh-10rem)]">
                        <article className="prose prose-slate dark:prose-invert max-w-none pr-4">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Style code blocks
                                    pre: ({ children }) => (
                                        <pre className="bg-slate-900 text-slate-50 rounded-lg p-4 overflow-x-auto">
                                            {children}
                                        </pre>
                                    ),
                                    code: ({ className, children, ...props }) => {
                                        const isInline = !className;
                                        if (isInline) {
                                            return (
                                                <code
                                                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    // Style tables
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-border">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    th: ({ children }) => (
                                        <th className="px-4 py-2 text-left text-sm font-semibold bg-muted">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="px-4 py-2 text-sm border-t">
                                            {children}
                                        </td>
                                    ),
                                    // Style links
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            className="text-primary hover:underline"
                                            target={href?.startsWith('http') ? '_blank' : undefined}
                                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        >
                                            {children}
                                        </a>
                                    ),
                                    // Style headings
                                    h1: ({ children }) => (
                                        <h1 className="text-3xl font-bold tracking-tight border-b pb-4 mb-6">
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4 border-b pb-2">
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-xl font-semibold tracking-tight mt-8 mb-3">
                                            {children}
                                        </h3>
                                    ),
                                    h4: ({ children }) => (
                                        <h4 className="text-lg font-semibold tracking-tight mt-6 mb-2">
                                            {children}
                                        </h4>
                                    ),
                                    // Style blockquotes
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                                            {children}
                                        </blockquote>
                                    ),
                                    // Style lists
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside space-y-1 ml-2">
                                            {children}
                                        </ol>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </article>
                    </ScrollArea>
                </main>
            </div>
        </AdminLayout>
    );
}
