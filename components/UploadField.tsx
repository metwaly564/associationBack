"use client";
import React, { useState } from 'react';
import { Upload, App } from 'antd';
import type { UploadProps } from 'antd';

const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const FILE_TYPES = [...IMAGE_TYPES, 'application/pdf'];

export function UploadField(props: UploadProps & { imagesOnly?: boolean }) {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isAllowed = props.imagesOnly ? IMAGE_TYPES.includes(file.type) : FILE_TYPES.includes(file.type);
    if (!isAllowed) {
      message.error('الملف غير مدعوم. الصيغ المسموحة: صور (JPG/PNG/WebP/GIF) و PDF');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_SIZE) {
      message.error('حجم الملف يتجاوز 100MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    // If action is provided, use it (for external uploads)
    if (props.action) {
      return;
    }

    // Otherwise, upload to our API
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file as File);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل رفع الملف');
      }

      const data = await response.json();
      
      // Pass the full response data back for use in forms
      onSuccess?.({
        url: data.url,
        file_url: data.url,
        filename: data.filename,
        size: data.size,
        type: data.type,
      }, file as any);
      message.success('تم رفع الملف بنجاح');
    } catch (error: any) {
      message.error(error.message || 'فشل رفع الملف');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Upload
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      {...props}
    />
  );
}

