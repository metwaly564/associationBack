"use client";
import { Button, Form, Input, InputNumber, Radio, Space, App } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { api } from '@/lib/apiClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const TextArea = Input.TextArea;

export default function TeamEditPage() {
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params?.id) {
      api.getTeamMember(params.id).then((d) => {
        form.setFieldsValue({
          ...d,
          image_url: d.image_url,
          order_index: d.order_index || 0,
        });
      });
    }
  }, [params?.id]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name,
        role: values.role,
        type: values.type,
        bio: values.bio,
        image_url: values.image_url,
        order_index: values.order_index || 0,
      };
      await api.updateTeamMember(params.id, payload);
      message.success('تم تحديث العضو بنجاح');
      router.push('/team');
    } catch (error: any) {
      message.error('فشل تحديث العضو: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل عضو</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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

