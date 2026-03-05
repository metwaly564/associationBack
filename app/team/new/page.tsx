"use client";
import { Button, Form, Input, InputNumber, Radio, Space, App } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { api } from '@/lib/apiClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TextArea = Input.TextArea;

export default function TeamCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name,
        role: values.role,
        type: values.type || 'board',
        bio: values.bio,
        image_url: values.image_url,
        order_index: values.order_index || 0,
      };
      await api.createTeamMember(payload);
      message.success('تم إنشاء العضو بنجاح');
      router.push('/team');
    } catch (error: any) {
      message.error('فشل إنشاء العضو: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة عضو جديد</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ type: 'board' }}
      >
        <Form.Item name="name" label="الاسم" rules={[{ required: true, message: 'الاسم مطلوب' }]}>
          <Input placeholder="اسم العضو" />
        </Form.Item>
        <Form.Item name="role" label="المسمى الوظيفي / الصفة" rules={[{ required: true, message: 'المسمى مطلوب' }]}>
          <Input placeholder="مثال: رئيس مجلس الإدارة، مدير تنفيذي" />
        </Form.Item>
        <Form.Item name="type" label="النوع">
          <Radio.Group>
            <Radio value="board">مجلس الإدارة</Radio>
            <Radio value="staff">فريق العمل</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="image_url" label="الصورة الشخصية">
          <ImageInput />
        </Form.Item>
        <Form.Item name="bio" label="نبذة قصيرة (اختياري)">
          <TextArea rows={4} placeholder="نبذة مختصرة عن العضو" />
        </Form.Item>
        <Form.Item name="order_index" label="ترتيب الظهور">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>حفظ</Button>
          <Button onClick={() => router.push('/team')}>رجوع</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}

