"use client";
import React from 'react';
import { ConfigProvider, theme } from 'antd';
import arEG from 'antd/locale/ar_EG';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={arEG} direction="rtl" theme={{ algorithm: theme.defaultAlgorithm }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {children}
      </div>
    </ConfigProvider>
  );
}

