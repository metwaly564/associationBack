"use client";
import { Button, Form, Input, Space, App, Popconfirm } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { UploadField } from '@/components/UploadField';
import { api } from '@/lib/apiClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DeleteOutlined } from '@ant-design/icons';

const TextArea = Input.TextArea;

export default function PolicyEditPage() {
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (params?.id) {
      api.getPolicy(params.id).then((d) => {
        form.setFieldsValue(d);
      }).catch(() => {
        message.error('فشل جلب السياسة');
        router.push('/policies');
      });
    }
  }, [params?.id]);

  const onFinish = async (values: any) => {
    if (!values.fileUrl) {
      message.error('الرجاء إدخال رابط الملف');
      return;
    }
    try {
      setLoading(true);
      await api.updatePolicy(params?.id!, {
        title: values.title,
        description: values.description || '',
        file_url: values.fileUrl,
      });
      message.success('تم تحديث اللائحة بنجاح');
      router.push('/policies');
    } catch (error: any) {
      message.error('فشل تحديث اللائحة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.deletePolicy(params?.id!);
      message.success('تم حذف اللائحة بنجاح');
      router.push('/policies');
    } catch (error: any) {
      message.error('فشل حذف اللائحة: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل لائحة / سياسة</h1>
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
          <Popconfirm
            title="حذف اللائحة"
            description="هل أنت متأكد من حذف هذه اللائحة؟"
            onConfirm={handleDelete}
            okText="نعم"
            cancelText="لا"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} loading={deleting}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      </Form>
    </AdminLayout>
  );
}

