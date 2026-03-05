"use client";
import { Button, Form, Input, Space, App, InputNumber, Select, DatePicker, Switch } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import dayjs from 'dayjs';

const TextArea = Input.TextArea;

export default function JobCreatePage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const payload = {
        title: values.title,
        department: values.department || null,
        location: values.location || null,
        employment_type: values.employment_type || 'full-time',
        description: values.description || null,
        requirements: values.requirements || null,
        responsibilities: values.responsibilities || null,
        benefits: values.benefits || null,
        salary_range: values.salary_range || null,
        application_deadline: values.application_deadline ? values.application_deadline.format('YYYY-MM-DD') : null,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء الوظيفة');
      }
      
      message.success('تم إنشاء الوظيفة بنجاح');
      router.push('/jobs');
    } catch (error: any) {
      message.error('فشل إنشاء الوظيفة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة وظيفة جديدة</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="المسمى الوظيفي"
          rules={[{ required: true, message: 'المسمى الوظيفي مطلوب' }]}
        >
          <Input placeholder="مثال: مطور برمجيات" />
        </Form.Item>
        <Form.Item name="department" label="القسم">
          <Input placeholder="مثال: تقنية المعلومات" />
        </Form.Item>
        <Form.Item name="location" label="الموقع">
          <Input placeholder="مثال: المدينة المنورة" />
        </Form.Item>
        <Form.Item name="employment_type" label="نوع التوظيف" initialValue="full-time">
          <Select>
            <Select.Option value="full-time">دوام كامل</Select.Option>
            <Select.Option value="part-time">دوام جزئي</Select.Option>
            <Select.Option value="contract">عقد</Select.Option>
            <Select.Option value="internship">تدريب</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="الوصف الوظيفي">
          <TextArea rows={6} placeholder="وصف الوظيفة..." />
        </Form.Item>
        <Form.Item name="requirements" label="المتطلبات">
          <TextArea rows={6} placeholder="متطلبات الوظيفة..." />
        </Form.Item>
        <Form.Item name="responsibilities" label="المسؤوليات">
          <TextArea rows={6} placeholder="مسؤوليات الوظيفة..." />
        </Form.Item>
        <Form.Item name="benefits" label="المزايا">
          <TextArea rows={4} placeholder="مزايا الوظيفة..." />
        </Form.Item>
        <Form.Item name="salary_range" label="نطاق الراتب">
          <Input placeholder="مثال: 5000 - 8000 ريال" />
        </Form.Item>
        <Form.Item name="application_deadline" label="آخر موعد للتقديم">
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="order_index" label="الترتيب" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_active" label="الحالة" valuePropName="checked" initialValue={true}>
          <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
        </Form.Item>
        
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '16px', 
          borderRadius: '4px', 
          marginTop: '16px',
          marginBottom: '16px'
        }}>
          <p style={{ margin: 0, color: '#666' }}>
            <strong>ملاحظة:</strong> تأكد من تفعيل "الحالة" (نشط) حتى تظهر الوظيفة في الصفحة الأمامية للمستخدمين.
          </p>
        </div>
        
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
