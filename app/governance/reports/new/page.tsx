"use client";
import { Button, Form, Input, Space, App, InputNumber, Select } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TextArea = Input.TextArea;

export default function ReportCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (!values.file_url) {
      message.error('الرجاء إدخال رابط الملف أو رفع ملف');
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        title: values.title,
        description: values.description,
        file_url: values.file_url,
        year: values.year,
        type: values.type || null,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء التقرير');
      }
      
      message.success('تم إنشاء التقرير بنجاح');
      router.push('/governance/reports');
    } catch (error: any) {
      message.error('فشل إنشاء التقرير: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة تقرير</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="العنوان"
          rules={[{ required: true, message: 'العنوان مطلوب' }]}
        >
          <Input placeholder="مثال: التقرير السنوي لعام 2024" />
        </Form.Item>
        <Form.Item name="description" label="الوصف (اختياري)">
          <TextArea rows={3} placeholder="وصف التقرير" />
        </Form.Item>
        <Form.Item
          name="year"
          label="السنة"
        >
          <InputNumber 
            min={2000} 
            max={2100} 
            style={{ width: '100%' }} 
            placeholder="2024"
          />
        </Form.Item>
        <Form.Item
          name="type"
          label="النوع"
        >
          <Select placeholder="اختر نوع التقرير">
            <Select.Option value="annual">سنوي</Select.Option>
            <Select.Option value="periodic">دوري</Select.Option>
            <Select.Option value="special">تخصصي</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item 
          name="file_url" 
          label="رابط الملف أو رفع ملف"
          rules={[{ required: true, message: 'الرجاء إدخال رابط الملف أو رفع ملف' }]}
        >
          <ImageInput 
            onChange={(url) => {
              form.setFieldsValue({ file_url: url });
            }}
          />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
          <Button onClick={() => router.push('/governance/reports')}>
            رجوع
          </Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
