import type { Metadata, Viewport } from 'next';
import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'NutriRace — eat well together', template: '%s · NutriRace' },
  description:
    'NutriRace is a social diet-planning and healthy-habit platform where friends plan meals, build routines and race each other to better habits. Early development.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#166534',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
