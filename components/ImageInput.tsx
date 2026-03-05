"use client";
import React, { useState, useEffect } from 'react';
import { Upload, Input, Button, Space, message, Image, App } from 'antd';
import { UploadOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { TextArea } = Input;

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** الحد الأقصى لحجم الملف بالبايت. الافتراضي 5MB. للتقارير السنوية (PDF) يمكن استخدام 100MB مثلاً */
  maxFileSizeBytes?: number;
}

export function ImageInput({ value, onChange, placeholder, label, maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE }: ImageInputProps) {
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [localValue, setLocalValue] = useState<string>(value ?? '');
  const { message } = App.useApp();
  const maxSizeMb = Math.round(maxFileSizeBytes / (1024 * 1024));

  // القيمة المعروضة: استخدم value من الـ Form إن وُجد حتى يبقى الحقل متزامناً مع Form.Item ويُحفظ في DB
  const displayValue = value !== undefined && value !== null ? String(value) : localValue;

  // تحديث localValue عند تغيير value من الخارج (مثلاً عند تحميل البيانات في النموذج)
  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const fileObj = file as File;
      setLoading(true);
      // client side size limit check just before sending
      if (fileObj.size > maxFileSizeBytes) {
        message.error(`حجم الملف يتجاوز ${maxSizeMb}MB`);
        onError?.(new Error(`حجم الملف يتجاوز ${maxSizeMb}MB`));
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', fileObj);

      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('📡 Sending to /api/upload...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Upload API error:', error);
        throw new Error(error.error || 'فشل رفع الملف');
      }

      const data = await response.json();

      // تحديث الحالة المحلية وقيمة النموذج (ضروري لربط Form.Item حتى تُحفظ في DB)
      setLocalValue(data.url);
      onChange?.(data.url);

      onSuccess?.(data);
      message.success('تم رفع الملف بنجاح');
    } catch (error: any) {
      message.error(error.message || 'فشل رفع الملف');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleRemove = () => {
    setLocalValue('');
    onChange?.('');
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Mode selector */}
        <Space>
          <Button
            type={inputMode === 'upload' ? 'primary' : 'default'}
            icon={<UploadOutlined />}
            onClick={() => setInputMode('upload')}
          >
            رفع من الجهاز
          </Button>
          <Button
            type={inputMode === 'url' ? 'primary' : 'default'}
            icon={<LinkOutlined />}
            onClick={() => setInputMode('url')}
          >
            رابط خارجي
          </Button>
        </Space>

        {/* Upload mode */}
        {inputMode === 'upload' && (
          <div>
            {!displayValue ? (
              <Upload
                customRequest={handleUpload}
                showUploadList={false}
                accept="image/*,.pdf"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} loading={loading}>
                  اختر ملف (صورة أو PDF)
                </Button>
              </Upload>
            ) : (
              <div style={{ marginTop: 16 }}>
                {displayValue.toLowerCase().endsWith('.pdf') ? (
                  <div>
                    <a href={displayValue} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: 8 }}>
                      <Button icon={<LinkOutlined />}>فتح ملف PDF</Button>
                    </a>
                    <span style={{ color: '#666', fontSize: 12, display: 'block', marginBottom: 8 }}>
                      {displayValue}
                    </span>
                  </div>
                ) : (
                  <Image
                    src={displayValue.startsWith('http') ? displayValue : displayValue}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                    preview={{
                      mask: 'معاينة',
                    }}
                  />
                )}
                <div style={{ marginTop: 8 }}>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemove}
                    size="small"
                  >
                    حذف الملف
                  </Button>
                  {!displayValue.toLowerCase().endsWith('.pdf') && (
                    <span style={{ marginRight: 8, color: '#666', fontSize: 12 }}>
                      {displayValue}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL mode */}
        {inputMode === 'url' && (
          <div>
            <Input
              value={displayValue}
              onChange={handleUrlChange}
              placeholder={placeholder || 'أدخل رابط الصورة (https://...)'}
              prefix={<LinkOutlined />}
            />
            {displayValue && (
              <div style={{ marginTop: 16 }}>
                {displayValue.toLowerCase().endsWith('.pdf') ? (
                  <div>
                    <a href={displayValue} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: 8 }}>
                      <Button icon={<LinkOutlined />}>فتح ملف PDF</Button>
                    </a>
                    <span style={{ color: '#666', fontSize: 12, display: 'block', marginBottom: 8 }}>
                      {displayValue}
                    </span>
                  </div>
                ) : (
                  <Image
                    src={displayValue}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                    preview={{
                      mask: 'معاينة',
                    }}
                  />
                )}
                <div style={{ marginTop: 8 }}>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemove}
                    size="small"
                  >
                    حذف الملف
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Space>
    </div>
  );
}
