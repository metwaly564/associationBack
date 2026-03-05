"use client";
import { Button, Form, Input, Space, App, InputNumber } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const TextArea = Input.TextArea;

export default function AnnualReportEditPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadAnnualReport();
  }, [params.id]);

  const loadAnnualReport = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/annual-reports/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب التقرير السنوي');
      const data = await response.json();
      const report = data.report;
      
      form.setFieldsValue({
        title: report.title,
        description: report.description,
        year: report.year,
        file_url: report.file_url,
        file_name: report.file_name,
        cover_image_url: report.cover_image_url,
        order_index: report.order_index || 0,
        is_active: report.is_active !== false,
      });
    } catch (error: any) {
      message.error('فشل جلب التقرير السنوي: ' + error.message);
      router.push('/annual-reports');
    } finally {
      setLoadingData(false);
    }
  };

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
        year: values.year,
        file_url: values.file_url,
        file_name: fileName,
        cover_image_url: values.cover_image_url || null,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/annual-reports/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تحديث التقرير السنوي');
      }
      
      message.success('تم تحديث التقرير السنوي بنجاح');
      router.push('/annual-reports');
    } catch (error: any) {
      message.error('فشل تحديث التقرير السنوي: ' + error.message);
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
      <h1 className="page-title">تعديل تقرير سنوي</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="العنوان"
          rules={[{ required: true, message: 'العنوان مطلوب' }]}
        >
          <Input placeholder="مثال: التقرير السنوي لعام 2024" />
        </Form.Item>
        <Form.Item name="description" label="الوصف (اختياري)">
          <TextArea rows={3} placeholder="وصف التقرير السنوي" />
        </Form.Item>
        <Form.Item
          name="year"
          label="السنة"
          rules={[{ required: true, message: 'السنة مطلوبة' }]}
        >
          <InputNumber 
            min={2000} 
            max={2100} 
            style={{ width: '100%' }} 
            placeholder="2024"
          />
        </Form.Item>
        <Form.Item 
          name="file_url" 
          label="رابط ملف PDF أو رفع ملف (الحد الأقصى 100MB)"
          extra="يمكنك رفع صور أو ملفات PDF حتى 100 ميغابايت"
          rules={[{ required: true, message: 'الرجاء إدخال رابط الملف أو رفع ملف' }]}
        >
          <ImageInput 
            maxFileSizeBytes={100 * 1024 * 1024}
            onChange={(url) => {
              form.setFieldsValue({ file_url: url });
              // استخراج اسم الملف تلقائياً
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
          label="اسم الملف (اختياري)"
          tooltip="سيتم استخراجه تلقائياً من رابط الملف إذا لم يتم إدخاله"
        >
          <Input placeholder="اسم الملف" />
        </Form.Item>
        <Form.Item name="cover_image_url" label="صورة الغلاف (اختياري)">
          <ImageInput 
            onChange={(url) => {
              form.setFieldsValue({ cover_image_url: url });
            }}
          />
        </Form.Item>
        <Form.Item name="order_index" label="ترتيب العرض">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_active" label="الحالة" valuePropName="checked" initialValue={true}>
          <input type="checkbox" defaultChecked />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
          <Button onClick={() => router.push('/annual-reports')}>
            رجوع
          </Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
