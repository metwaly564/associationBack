"use client";
import { Button, Form, Input, Space, App, InputNumber, Select } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageInput } from '@/components/ImageInput';

const TextArea = Input.TextArea;

export default function DonationMethodCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const payload = {
        name: values.name,
        type: values.type || 'bank',
        account_number: values.account_number || null,
        account_name: values.account_name || null,
        bank_name: values.bank_name || null,
        iban: values.iban || null,
        swift_code: values.swift_code || null,
        qr_code_url: values.qr_code_url || null,
        icon_name: values.icon_name || null,
        description: values.description || null,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/donation-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء طريقة التبرع');
      }
      
      message.success('تم إنشاء طريقة التبرع بنجاح');
      router.push('/donate');
    } catch (error: any) {
      message.error('فشل إنشاء طريقة التبرع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة طريقة تبرع جديدة</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="الاسم"
          rules={[{ required: true, message: 'الاسم مطلوب' }]}
        >
          <Input placeholder="مثال: البنك الأهلي السعودي" />
        </Form.Item>
        <Form.Item name="type" label="النوع" initialValue="bank">
          <Select>
            <Select.Option value="bank">بنك</Select.Option>
            <Select.Option value="electronic_wallet">محفظة إلكترونية</Select.Option>
            <Select.Option value="online">أونلاين</Select.Option>
            <Select.Option value="other">أخرى</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="account_number" label="رقم الحساب">
          <Input placeholder="مثال: 1234567890" />
        </Form.Item>
        <Form.Item name="account_name" label="اسم الحساب">
          <Input placeholder="مثال: جمعية الرعاية الخيرية" />
        </Form.Item>
        <Form.Item name="bank_name" label="اسم البنك">
          <Input placeholder="مثال: البنك الأهلي السعودي" />
        </Form.Item>
        <Form.Item name="iban" label="IBAN">
          <Input placeholder="مثال: SA1234567890123456789012" />
        </Form.Item>
        <Form.Item name="swift_code" label="SWIFT Code">
          <Input placeholder="مثال: NCBKSARI" />
        </Form.Item>
        <Form.Item name="qr_code_url" label="رابط QR Code">
          <ImageInput
            value={form.getFieldValue('qr_code_url')}
            onChange={(url) => form.setFieldValue('qr_code_url', url)}
          />
        </Form.Item>
        <Form.Item name="icon_name" label="اسم الأيقونة (اختياري)">
          <Input placeholder="مثال: CreditCard, Wallet, Building" />
        </Form.Item>
        <Form.Item name="description" label="الوصف">
          <TextArea rows={3} placeholder="وصف طريقة التبرع..." />
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
