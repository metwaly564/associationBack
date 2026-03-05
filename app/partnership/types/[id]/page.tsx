"use client";
import { Button, Form, Input, Space, App, InputNumber } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const TextArea = Input.TextArea;

export default function PartnershipTypeEditPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadPartnershipType();
  }, [params.id]);

  const loadPartnershipType = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/partnership-types/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب نوع الشراكة');
      const data = await response.json();
      const type = data.type;
      
      form.setFieldsValue({
        title: type.title,
        description: type.description,
        icon_name: type.icon_name,
        color: type.color,
        benefits: type.benefits,
        order_index: type.order_index || 0,
        is_active: type.is_active !== false,
      });
    } catch (error: any) {
      message.error('فشل جلب نوع الشراكة: ' + error.message);
      router.push('/partnership');
    } finally {
      setLoadingData(false);
    }
  };

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
      const response = await fetch(`/api/partnership-types/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تحديث نوع الشراكة');
      }
      
      message.success('تم تحديث نوع الشراكة بنجاح');
      router.push('/partnership');
    } catch (error: any) {
      message.error('فشل تحديث نوع الشراكة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          جاري التحميل...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل نوع شراكة</h1>
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
