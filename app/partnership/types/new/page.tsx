"use client";
import { Button, Form, Input, Space, App, InputNumber } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TextArea = Input.TextArea;

export default function PartnershipTypeCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const payload = {
        title: values.title,
        description: values.description || null,
        icon_name: values.icon_name || null,
        color: values.color || null,
        benefits: values.benefits || null,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/partnership-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء نوع الشراكة');
      }
      
      message.success('تم إنشاء نوع الشراكة بنجاح');
      router.push('/partnership');
    } catch (error: any) {
      message.error('فشل إنشاء نوع الشراكة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة نوع شراكة جديد</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="العنوان"
          rules={[{ required: true, message: 'العنوان مطلوب' }]}
        >
          <Input placeholder="مثال: شراكة استراتيجية" />
        </Form.Item>
        <Form.Item name="description" label="الوصف">
          <TextArea rows={4} placeholder="وصف نوع الشراكة..." />
        </Form.Item>
        <Form.Item name="icon_name" label="اسم الأيقونة (اختياري)">
          <Input placeholder="مثال: Handshake, DollarSign, Code" />
        </Form.Item>
        <Form.Item name="color" label="اللون (اختياري)">
          <Input placeholder="مثال: emerald, blue, purple, amber" />
        </Form.Item>
        <Form.Item name="benefits" label="المزايا">
          <TextArea rows={4} placeholder="مزايا هذا النوع من الشراكة..." />
        </Form.Item>
        <Form.Item name="order_index" label="الترتيب" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_active" label="الحالة" valuePropName="checked" initialValue={true}>
          <input type="checkbox" defaultChecked />
        </Form.Item>
        
        <Space style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
          <Button onClick={() => router.back()}>إلغاء</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
