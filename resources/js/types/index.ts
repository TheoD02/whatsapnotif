import type { User } from './models';

export * from './models';

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
    errors: Record<string, string>;
}

declare module '@inertiajs/react' {
    export interface PageProps extends PageProps {}
}
