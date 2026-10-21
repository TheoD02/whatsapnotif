import type { User } from './models';

export * from './models';

export type PageProps = {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
    errors: Record<string, string>;
};
