"use client";
import { Button, Form, Input, Space, InputNumber, App } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TextArea = Input.TextArea;

export default function OfficeBranchCreatePage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const payload = {
        name: values.name,
        city: values.city,
        address: values.address,
        phone: values.phone || null,
        email: values.email || null,
        map_embed_url: values.map_embed_url || null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/offices-branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء المكتب/الفرع');
      }
      
      message.success('تم إنشاء المكتب/الفرع بنجاح');
      router.push('/offices-branches');
    } catch (error: any) {
      message.error('فشل إنشاء المكتب/الفرع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة مكتب/فرع جديد</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="اسم المكتب/الفرع"
          rules={[{ required: true, message: 'اسم المكتب/الفرع مطلوب' }]}
        >
          <Input placeholder="مثال: فرع المدينة المنورة" />
        </Form.Item>
        <Form.Item
          name="city"
          label="المدينة"
          rules={[{ required: true, message: 'المدينة مطلوبة' }]}
        >
          <Input placeholder="مثال: المدينة المنورة" />
        </Form.Item>
        <Form.Item
          name="address"
          label="العنوان"
          rules={[{ required: true, message: 'العنوان مطلوب' }]}
        >
          <TextArea rows={3} placeholder="العنوان الكامل..." />
        </Form.Item>
        <Form.Item name="phone" label="الهاتف">
          <Input placeholder="+966 14 123 4567" />
        </Form.Item>
        <Form.Item name="email" label="البريد الإلكتروني">
          <Input type="email" placeholder="example@charity-association.org" />
        </Form.Item>
        <Form.Item name="map_embed_url" label="رابط خريطة Google Maps (Embed URL)">
          <TextArea rows={2} placeholder="https://www.google.com/maps?q=...&output=embed" />
        </Form.Item>
        <Form.Item name="latitude" label="خط العرض (Latitude) - اختياري">
          <InputNumber style={{ width: '100%' }} placeholder="24.5247" />
        </Form.Item>
        <Form.Item name="longitude" label="خط الطول (Longitude) - اختياري">
          <InputNumber style={{ width: '100%' }} placeholder="39.5692" />
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
