"use client";
import { Button, DatePicker, Form, Input, InputNumber, Radio, Select, Space, Switch, App } from 'antd';
import dayjs from 'dayjs';
import { AdminLayout } from '@/components/AdminLayout';
import { UploadField } from '@/components/UploadField';
import { rules, slugify } from '@/lib/validators';
import { api } from '@/lib/apiClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const TextArea = Input.TextArea;

export default function ProjectEditPage() {
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
    if (params?.id) {
      api.getProject(params.id).then((d) => {
        form.setFieldsValue({
          ...d,
          shortDescription: d.short_description,
          startDate: d.start_date ? dayjs(d.start_date) : null,
          endDate: d.end_date ? dayjs(d.end_date) : null,
          showOnHome: d.show_on_home || false,
          priority: d.priority || 0,
          categoryId: d.category_id || null,
          projectFile: d.file_url ? [{ uid: '-1', name: d.file_name || 'ملف', status: 'done', url: d.file_url }] : undefined,
        });
      });
    }
  }, [params?.id]);

  const loadCategories = async () => {
    try {
      const data = await api.listProjectCategories();
      setCategories(data.filter((c: any) => c.is_active !== false));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onTitleChange = (v: string) => {
    const currentSlug = form.getFieldValue('slug');
    if (!currentSlug) form.setFieldsValue({ slug: slugify(v) });
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      let file_url: string | null = values.fileUrl || null;
      let file_name: string | null = null;
      if (values.projectFile && values.projectFile.length > 0) {
        const f = values.projectFile[0];
        const res = f.response || f;
        file_url = res?.url || res?.file_url || f.url || null;
        file_name = res?.filename || f.name || null;
      }
      const payload = {
        title: values.title,
        slug: values.slug,
        short_description: values.shortDescription,
        body: values.body,
        category_id: values.categoryId || null,
        status: values.status,
        location: values.location,
        start_date: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        end_date: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        show_on_home: values.showOnHome || false,
        priority: values.priority || 0,
        file_url,
        file_name,
      };
      await api.updateProject(params.id, payload);
      message.success('تم تحديث المشروع بنجاح');
      router.push('/projects');
    } catch (error: any) {
      message.error('فشل تحديث المشروع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل مشروع / برنامج</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="title" label="عنوان المشروع" rules={rules.title}>
          <Input placeholder="عنوان المشروع" onChange={(e) => onTitleChange(e.target.value)} />
        </Form.Item>
        <Form.Item name="slug" label="الرابط (Slug)" rules={rules.slug}>
          <Input placeholder="مثال: orphan-support" />
        </Form.Item>
        <Form.Item name="shortDescription" label="وصف مختصر" rules={rules.excerpt}>
          <TextArea rows={3} placeholder="وصف مختصر للمشروع" />
        </Form.Item>
        <Form.Item name="body" label="التفاصيل">
          <TextArea rows={8} placeholder="تفاصيل المشروع..." />
        </Form.Item>
        <Form.Item name="categoryId" label="التصنيف">
          <Select
            placeholder="اختر التصنيف"
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={categories.map((cat: any) => ({
              value: cat.id,
              label: cat.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="status" label="الحالة">
          <Radio.Group>
            <Radio value="ongoing">جارٍ</Radio>
            <Radio value="upcoming">قادم</Radio>
            <Radio value="completed">مكتمل</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="location" label="الموقع (اختياري)">
          <Input placeholder="المدينة / المنطقة" />
        </Form.Item>
        <Form.Item label="التواريخ">
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="startDate" noStyle>
              <DatePicker style={{ width: '50%' }} placeholder="تاريخ البداية" />
            </Form.Item>
            <Form.Item name="endDate" noStyle>
              <DatePicker style={{ width: '50%' }} placeholder="تاريخ النهاية" />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item name="coverImage" label="الصورة الرئيسية">
          <UploadField listType="picture-card" maxCount={1} imagesOnly />
        </Form.Item>
        <Form.Item name="gallery" label="معرض الصور (اختياري)">
          <UploadField listType="picture-card" imagesOnly />
        </Form.Item>
        <Form.Item name="attachments" label="مرفقات (صور / PDF)">
          <UploadField />
        </Form.Item>
        <Form.Item
          name="projectFile"
          label="ملف مرفق (PDF أو صورة)"
          valuePropName="fileList"
          getValueFromEvent={(e) => (e?.fileList ?? e) || []}
        >


          
          <UploadField maxCount={1} >
            تحميل 
          </UploadField>  
        </Form.Item>
        <Form.Item name="showOnHome" label="إظهار في الرئيسية" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="priority" label="أولوية العرض">
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>حفظ</Button>
          <Button onClick={() => router.push('/projects')}>رجوع</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}

