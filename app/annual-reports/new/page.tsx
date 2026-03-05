"use client";
import { Button, Form, Input, Space, App, InputNumber, Checkbox } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TextArea = Input.TextArea;

export default function AnnualReportCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    console.log('📋 Form submitted with values:', values);
    
    if (!values.file_url) {
      console.error('❌ file_url is missing:', values);
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

      console.log('📤 Sending payload:', payload);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/annual-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Error response:', error);
        throw new Error(error.error || error.details || 'فشل إنشاء التقرير السنوي');
      }
      
      const result = await response.json();
      console.log('✅ Success:', result);
      
      message.success('تم إنشاء التقرير السنوي بنجاح');
      router.push('/annual-reports');
    } catch (error: any) {
      console.error('❌ Error:', error);
      message.error('فشل إنشاء التقرير السنوي: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة تقرير سنوي جديد</h1>
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        onValuesChange={(changedValues, allValues) => {
          console.log('🔄 Form values changed:', { changedValues, allValues });
        }}
      >
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
              console.log('📎 File URL updated in ImageInput:', url);
              if (url) {
                form.setFieldsValue({ file_url: url });
                // استخراج اسم الملف تلقائياً
                if (!form.getFieldValue('file_name')) {
                  const urlParts = url.split('/');
                  let fileName = urlParts[urlParts.length - 1];
                  if (fileName.includes('?')) {
                    fileName = fileName.split('?')[0];
                  }
                  console.log('📝 File name auto-set:', fileName);
                  form.setFieldsValue({ file_name: fileName });
                }
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
          <Checkbox>مفعّل</Checkbox>
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
