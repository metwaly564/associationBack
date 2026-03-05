"use client";
import { Button, Form, Input, Space, App } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { api } from '@/lib/apiClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const TextArea = Input.TextArea;

export default function LicenseEditPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params?.id) {
      api.getLicense(params.id).then((d) => {
        form.setFieldsValue({
          title: d.title,
          description: d.description,
          file_url: d.file_url,
          file_name: d.file_name,
        });
      });
    }
  }, [params?.id]);

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
        // إزالة query parameters إن وجدت
        if (fileName.includes('?')) {
          fileName = fileName.split('?')[0];
        }
      }
      
      const payload = {
        title: values.title,
        description: values.description,
        file_url: values.file_url,
        file_name: fileName,
      };
      await api.updateLicense(params.id, payload);
      message.success('تم تحديث الترخيص بنجاح');
      router.push('/licenses');
    } catch (error: any) {
      message.error('فشل تحديث الترخيص: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل ترخيص / اعتماد</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="اسم الترخيص / الاعتماد"
          rules={[{ required: true, message: 'الاسم مطلوب' }]}
        >
          <Input placeholder="مثال: ترخيص وزارة الشؤون الاجتماعية" />
        </Form.Item>
        <Form.Item name="description" label="وصف (اختياري)">
          <TextArea rows={3} placeholder="ملاحظة قصيرة حول الترخيص" />
        </Form.Item>
        <Form.Item 
          name="file_url" 
          label="رابط الملف (صورة أو PDF)"
          rules={[{ required: true, message: 'الرجاء إدخال رابط الملف أو رفع ملف' }]}
        >
          <ImageInput 
            placeholder="https://example.com/file.pdf أو ارفع ملف"
            onChange={(url) => {
              // تحديث اسم الملف تلقائياً عند تغيير رابط الملف
              if (url && !form.getFieldValue('file_name')) {
                const urlParts = url.split('/');
                let fileName = urlParts[urlParts.length - 1];
                if (fileName.includes('?')) {
                  fileName = fileName.split('?')[0];
                }
                form.setFieldsValue({ file_name: fileName });
              }
            }}
          />
        </Form.Item>
        <Form.Item 
          name="file_name" 
          label="اسم الملف (سيظهر في الواجهة الأمامية)"
          tooltip="اسم الملف الذي سيظهر للمستخدمين في الموقع"
        >
          <Input placeholder="مثال: ترخيص_الجمعية_2024.pdf" />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>حفظ</Button>
          <Button onClick={() => router.push('/licenses')}>رجوع</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
