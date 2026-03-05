"use client";
import { Button, Form, Input, Space, App, InputNumber } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const TextArea = Input.TextArea;

export default function AssemblyMeetingEditPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadMeeting();
  }, [params.id]);

  const loadMeeting = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/assembly-meetings/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب الاجتماع');
      const data = await response.json();
      const meeting = data.meeting;
      
      form.setFieldsValue({
        title: meeting.title,
        description: meeting.description,
        meeting_date: meeting.meeting_date ? meeting.meeting_date.split('T')[0] : null,
        file_url: meeting.file_url,
        file_name: meeting.file_name,
        meeting_number: meeting.meeting_number,
        order_index: meeting.order_index || 0,
        is_active: meeting.is_active !== false,
      });
    } catch (error: any) {
      message.error('فشل جلب الاجتماع: ' + error.message);
      router.push('/general-assembly');
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
        meeting_date: values.meeting_date || null,
        file_url: values.file_url,
        file_name: fileName,
        meeting_number: values.meeting_number || null,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/assembly-meetings/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تحديث الاجتماع');
      }
      
      message.success('تم تحديث الاجتماع بنجاح');
      router.push('/general-assembly');
    } catch (error: any) {
      message.error('فشل تحديث الاجتماع: ' + error.message);
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
      <h1 className="page-title">تعديل اجتماع</h1>
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
