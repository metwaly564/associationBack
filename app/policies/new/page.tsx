"use client";
import { Button, Form, Input, Space, App } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { UploadField } from '@/components/UploadField';
import { api } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TextArea = Input.TextArea;

export default function PolicyCreatePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const router = useRouter();

  const onFinish = async (values: any) => {
    if (!values.fileUrl) {
      message.error('الرجاء إدخال رابط الملف');
      return;
    }
    try {
      setLoading(true);
      await api.createPolicy({
        title: values.title,
        description: values.description || '',
        file_url: values.fileUrl,
      });
      message.success('تم إنشاء اللائحة بنجاح');
      router.push('/policies');
    } catch (error: any) {
      message.error('فشل إنشاء اللائحة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة لائحة / سياسة</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="اسم اللائحة / السياسة"
          rules={[{ required: true, message: 'الاسم مطلوب' }]}
        >
          <Input placeholder="مثال: لائحة الحوكمة" />
        </Form.Item>
        <Form.Item name="description" label="وصف (اختياري)">
          <TextArea rows={3} placeholder="ملاحظة قصيرة حول اللائحة" />
        </Form.Item>
        <Form.Item name="fileUrl" label="رابط الملف (اختياري)">
          <Input placeholder="https://example.com/file.pdf" />
        </Form.Item>
        <Form.Item
          name="file"
          label="رفع ملف (صورة أو PDF)"
        >
          <UploadField />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>حفظ</Button>
          <Button href="/policies">رجوع</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}

