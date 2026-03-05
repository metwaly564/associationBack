"use client";
import { Button, Form, Input, Space, App, InputNumber, Select } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/apiClient';

const TextArea = Input.TextArea;

export default function ReportEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!resolvedParams?.id) return;
    loadReport();
  }, [resolvedParams?.id]);

  const loadReport = async () => {
    if (!resolvedParams?.id) return;
    try {
      setLoadingData(true);
      const report = await api.getReport(resolvedParams.id);
      form.setFieldsValue({
        title: report.title,
        description: report.description,
        file_url: report.file_url,
        year: report.year,
        type: report.type,
      });
    } catch (error: any) {
      message.error('فشل جلب بيانات التقرير: ' + error.message);
      router.push('/governance/reports');
    } finally {
      setLoadingData(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const payload = {
        title: values.title,
        description: values.description,
        file_url: values.file_url,
        year: values.year,
        type: values.type || null,
      };
      
      await api.updateReport(resolvedParams!.id, payload);
      
      message.success('تم تحديث التقرير بنجاح');
      router.push('/governance/reports');
    } catch (error: any) {
      message.error('فشل تحديث التقرير: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!resolvedParams || loadingData) {
    return (
      <AdminLayout>
        <div className="text-center py-8">جاري التحميل...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل تقرير</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="العنوان"
          rules={[{ required: true, message: 'العنوان مطلوب' }]}
        >
          <Input placeholder="مثال: التقرير السنوي لعام 2024" />
        </Form.Item>
        <Form.Item name="description" label="الوصف (اختياري)">
          <TextArea rows={3} placeholder="وصف التقرير" />
        </Form.Item>
        <Form.Item
          name="year"
          label="السنة"
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
          <Select placeholder="اختر نوع التقرير">
            <Select.Option value="annual">سنوي</Select.Option>
            <Select.Option value="periodic">دوري</Select.Option>
            <Select.Option value="special">تخصصي</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item 
          name="file_url" 
          label="رابط الملف أو رفع ملف"
          rules={[{ required: true, message: 'الرجاء إدخال رابط الملف أو رفع ملف' }]}
        >
          <ImageInput 
            onChange={(url) => {
              form.setFieldsValue({ file_url: url });
            }}
          />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ التغييرات
          </Button>
          <Button onClick={() => router.push('/governance/reports')}>
            رجوع
          </Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
