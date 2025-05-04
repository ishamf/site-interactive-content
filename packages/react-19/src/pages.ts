import { ComponentType } from 'react';

const testPages: Record<string, { title: string; slug: string; default: ComponentType }> =
  import.meta.glob('./posts/*/TestPage.tsx', { eager: true });

export const pages = Object.values(testPages).map(({ title, slug, default: Page }) => ({
  title,
  Page,
  slug,
}));
