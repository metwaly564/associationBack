"use client";
import { Button, Form, Input, Space, App, InputNumber, Select } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const TextArea = Input.TextArea;

export default function FinancialStatementEditPage() {
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (params?.id) {
      loadFinancialStatement();
    }
  }, [params?.id]);

  const loadFinancialStatement = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/financial-statements/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب القائمة المالية');
      const data = await response.json();
      
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        file_url: data.file_url,
        file_name: data.file_name,
        year: data.year,
        type: data.type || 'statement',
        order_index: data.order_index || 0,
        is_active: data.is_active !== false,
      });
    } catch (error: any) {
      message.error('فشل جلب القائمة المالية: ' + error.message);
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
        file_url: values.file_url,
        file_name: fileName,
        year: values.year,
        type: values.type || 'statement',
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/financial-statements/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تحديث القائمة المالية');
      }
      
      message.success('تم تحديث القائمة المالية بنجاح');
      router.push('/governance/financial-statements');
    } catch (error: any) {
      message.error('فشل تحديث القائمة المالية: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل قائمة مالية</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="العنوان"
          rules={[{ required: true, message: 'العنوان مطلوب' }]}
        >
          <Input placeholder="مثال: القائمة المالية لعام 2024" />
        </Form.Item>
        <Form.Item name="description" label="الوصف (اختياري)">
          <TextArea rows={3} placeholder="وصف القائمة المالية" />
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
          name="type"
          label="النوع"
        >
          <Select>
            <Select.Option value="statement">قائمة مالية</Select.Option>
            <Select.Option value="report">تقرير مالي</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="order_index" label="ترتيب العرض">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item 
          name="file_url" 
          label="رابط الملف أو رفع ملف"
          rules={[{ required: true, message: 'الرجاء إدخال رابط الملف أو رفع ملف' }]}
        >
          <ImageInput 
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
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
          <Button onClick={() => router.push('/governance/financial-statements')}>
            رجوع
          </Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
