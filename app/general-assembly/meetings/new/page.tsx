"use client";
import { Button, Form, Input, Space, App, InputNumber } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TextArea = Input.TextArea;

export default function AssemblyMeetingCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();  const { message } = App.useApp();  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (!values.file_url) {
      message.error('الرجاء إدخال رابط الملف أو رفع ملف');
      return;
    }
    
    try {
      setLoading(true);
      
      // استخراج اسم الملف تلقائياً إذا لم يتم إدخاله
      let fileName = values.file_name;
      if (!fileName && values.file_url) {
        const urlParts = values.file_url.split('/');
        fileName = urlParts[urlParts.length - 1];
        if (fileName.includes('?')) {
          fileName = fileName.split('?')[0];
        }
      }
      
      const payload = {
        title: values.title,
        description: values.description,
        meeting_date: values.meeting_date || null,
        file_url: values.file_url,
        file_name: fileName,
        meeting_number: values.meeting_number || null,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/assembly-meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء الاجتماع');
      }
      
      message.success('تم إنشاء الاجتماع بنجاح');
      router.push('/general-assembly');
    } catch (error: any) {
      message.error('فشل إنشاء الاجتماع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة اجتماع جديد</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="العنوان"
          rules={[{ required: true, message: 'العنوان مطلوب' }]}
        >
          <Input placeholder="مثال: اجتماع الجمعية العمومية العادي الأول" />
        </Form.Item>
        <Form.Item name="description" label="الوصف (اختياري)">
          <TextArea rows={4} placeholder="وصف الاجتماع..." />
        </Form.Item>
        <Form.Item name="meeting_date" label="تاريخ الاجتماع">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="meeting_number" label="رقم الاجتماع (اختياري)">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="مثال: 1" />
        </Form.Item>
        <Form.Item
          name="file_url"
          label="ملف المحضر (PDF)"
          rules={[{ required: true, message: 'الملف مطلوب' }]}
        >
          <ImageInput />
        </Form.Item>
        <Form.Item name="file_name" label="اسم الملف (سيتم ملؤه تلقائياً)">
          <Input placeholder="سيتم ملؤه تلقائياً من رابط الملف" />
        </Form.Item>
        <Form.Item name="order_index" label="الترتيب" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_active" label="الحالة" valuePropName="checked" initialValue={true}>
          <input type="checkbox" defaultChecked />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
          <Button onClick={() => router.back()}>إلغاء</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
