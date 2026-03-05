import React from 'react';
import './globals.css';
import { AntdProvider } from '@/components/AntdProvider';
import { AuthProvider } from '@/lib/authContext';
import { App as AntdApp } from 'antd';

export const metadata = {
  title: 'لوحة الإدارة',
  description: 'لوحة إدارة المحتوى',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      </head>
      <body>
           <AntdApp>
        <AuthProvider>
          <AntdProvider>{children}</AntdProvider>
        </AuthProvider>
        </AntdApp>
      </body>
    </html>
  );
}
