"use client";
import { Button, DatePicker, Form, Input, Radio, Space, App } from 'antd';
import dayjs from 'dayjs';
import { AdminLayout } from '@/components/AdminLayout';
import { UploadField } from '@/components/UploadField';
import { api } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TextArea = Input.TextArea;

export default function AssociationMemberCreatePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      let photoUrl = values.photoUrl || '';

      if (values.photo && values.photo.length > 0) {
        // استخدم اسم الملف المرفوع مباشرة
        const file = values.photo[0].originFileObj;
        photoUrl = `/uploads/${file.name}`;
      }
      const payload = {
        name: values.name,
        position: values.position,
        category: values.category || 'member',
        email: values.email || '',
        join_date: values.joinDate ? values.joinDate.format('YYYY-MM-DD') : null,
        membership_number: values.membershipNumber || '',
        photo_url: photoUrl,
      };
      await api.createAssociationMember(payload);
      message.success('تم إضافة عضو الجمعية بنجاح');
      router.push('/members');
    } catch (error: any) {
      message.error('فشل إضافة العضو: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إضافة عضو جمعية</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ category: 'member', photo: [] }}
      >
        <Form.Item
          name="name"
          label="الاسم الكامل"
          rules={[{ required: true, message: 'الاسم مطلوب' }]}
        >
          <Input placeholder="مثال: معالي الدكتور عبدالعزيز بن قبلان السراني" />
        </Form.Item>
        <Form.Item
          name="position"
          label="الصفة / المسمى"
          rules={[{ required: true, message: 'الصفة مطلوبة' }]}
        >
          <Input placeholder="مثال: رئيس مجلس الإدارة" />
        </Form.Item>
        <Form.Item name="category" label="التصنيف">
          <Radio.Group>
            <Radio value="chairman">رئيس</Radio>
            <Radio value="member">عضو</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="photo" label="رفع صورة شخصية">
  <UploadField listType="picture-card" maxCount={1} imagesOnly>
    <div>
      + رفع صورة
    </div>
  </UploadField>
</Form.Item>
        <Form.Item name="photoUrl" label="أو أدخل رابط الصورة (اختياري)">
          <Input placeholder="https://example.com/photo.jpg" />
        </Form.Item>
        <Form.Item name="email" label="البريد الإلكتروني">
          <Input type="email" placeholder="example@domain.com" />
        </Form.Item>
        <Form.Item name="joinDate" label="تاريخ الانضمام">
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="membershipNumber" label="رقم العضوية">
          <Input placeholder="مثال: 01" />
        </Form.Item>
        <Form.Item name="notes" label="ملاحظات (اختياري)">
          <TextArea rows={3} />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>حفظ</Button>
          <Button href="/members">رجوع</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}

