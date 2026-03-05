"use client";
import { Button, DatePicker, Form, Input, Radio, Space, App, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { AdminLayout } from '@/components/AdminLayout';
import { UploadField } from '@/components/UploadField';
import { api } from '@/lib/apiClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DeleteOutlined } from '@ant-design/icons';

const TextArea = Input.TextArea;

export default function AssociationMemberEditPage() {
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (params?.id) {
      api.getAssociationMember(params.id).then((m) => {
        // تجهيز الصورة القديمة لعرضها في UploadField
        const initialPhoto = m.photo_url ? [{
          uid: '-1',
          name: 'الصورة القديمة',
          status: 'done',
          url: m.photo_url,
        }] : [];

        form.setFieldsValue({
          ...m,
          joinDate: m.joinDate ? dayjs(m.joinDate) : undefined,
          photoUrl: m.photo_url || '',
          photo: initialPhoto, // تمرير الصورة القديمة للفورم
        });
      }).catch(() => {
        message.error('فشل جلب بيانات العضو');
        router.push('/members');
      });
    }
  }, [params?.id]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      let photoUrl = values.photoUrl || '';

      // إذا تم رفع ملف جديد، استخدمه بدل الرابط القديم
      if (values.photo && values.photo.length > 0) {
        const file = values.photo[0];
        photoUrl = file.response?.url || file.response?.file_url || file.url || '';
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

      await api.updateAssociationMember(params?.id!, payload);
      message.success('تم تحديث بيانات العضو بنجاح');
      router.push('/members');
    } catch (error: any) {
      message.error('فشل تحديث العضو: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.deleteAssociationMember(params?.id!);
      message.success('تم حذف العضو بنجاح');
      router.push('/members');
    } catch (error: any) {
      message.error('فشل حذف العضو: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل عضو جمعية</h1>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ photo: [] }}>
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
  <UploadField
    listType="picture-card"
    maxCount={1}
    imagesOnly
    fileList={
      form.getFieldValue('photoUrl')
        ? [{
            uid: '-1',
            name: form.getFieldValue('photoUrl').split('/').pop(),
            status: 'done',
            url: form.getFieldValue('photoUrl')
          }]
        : []
    }
  />
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
          <Popconfirm
            title="حذف العضو"
            description="هل أنت متأكد من حذف هذا العضو؟"
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