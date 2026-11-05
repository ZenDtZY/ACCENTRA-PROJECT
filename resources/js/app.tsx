import { createInertiaApp } from '@inertiajs/react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import AppStartupAnimation from './components/pwa/appStartupAnimation';
import InstallAppButton from './components/pwa/installAppButton';

import type { ComponentType } from 'react';

type InertiaPageModule = {
    default: ComponentType<any>;
};

const pages = import.meta.glob<InertiaPageModule>('./pages/**/*.{jsx,tsx}');

void createInertiaApp({
    title: (title) => title || 'ACCENTRA',

    resolve: async (name) => {
        const pagePathJsx = `./pages/${name}.jsx`;
        const pagePathTsx = `./pages/${name}.tsx`;

        const page = pages[pagePathJsx] || pages[pagePathTsx];

        if (!page) {
            console.error('Page not found:', name);
            console.error('Available pages:', Object.keys(pages));
            throw new Error(`Page not found: ${name}`);
        }

        const module = await page();

        if (!module.default) {
            throw new Error(`Default export not found for page: ${name}`);
        }

        const Page = module.default;

        return function BrandedPage(props: Record<string, unknown>) {
            const branding = (
                props as { branding?: { logoUrl?: string | null } }
            ).branding;

            useEffect(() => {
                const logoUrl = branding?.logoUrl || '/favicon.svg';

                for (const selector of [
                    'link[rel="icon"]',
                    'link[rel="shortcut icon"]',
                    'link[rel="apple-touch-icon"]',
                ]) {
                    let link =
                        document.head.querySelector<HTMLLinkElement>(selector);

                    if (!link) {
                        link = document.createElement('link');
                        link.rel = selector.includes('apple-touch-icon')
                            ? 'apple-touch-icon'
                            : 'icon';
                        document.head.appendChild(link);
                    }

                    link.href = logoUrl;
                }

                const manifest = document.head.querySelector<HTMLLinkElement>(
                    'link[rel="manifest"]',
                );
                if (manifest) {
                    manifest.href = '/system/manifest.webmanifest';
                }
            }, [branding?.logoUrl]);

            return <Page {...props} />;
        };
    },

    setup({ el, App, props }) {
        if (!el) {
            return;
        }

        createRoot(el).render(
            <>
                <App {...props} />
                <AppStartupAnimation />
                <InstallAppButton />
            </>,
        );
    },

    progress: {
        color: '#36534E',
    },
});
