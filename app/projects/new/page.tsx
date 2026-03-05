"use client";
import { Button, DatePicker, Form, Input, InputNumber, Radio, Select, Space, Switch, App } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { UploadField } from '@/components/UploadField';
import { rules, slugify } from '@/lib/validators';
import { api } from '@/lib/apiClient';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TextArea = Input.TextArea;

export default function ProjectCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.listProjectCategories();
      setCategories(data.filter((c: any) => c.is_active !== false));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onTitleChange = (v: string) => {
    let s = slugify(v);
    if (!s) {
      // if title contains only non-latin chars (e.g. Arabic), generate a safe fallback
      s = `project-${Date.now()}`;
    }
    form.setFieldsValue({ slug: s });
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      let slugValue = values.slug;
      if (!slugValue) {
        slugValue = slugify(values.title || '') || `project-${Date.now()}`;
      }
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
        slug: slugValue,
        short_description: values.shortDescription,
        body: values.body,
        category_id: values.categoryId || null,
        status: values.status || 'ongoing',
        location: values.location,
        start_date: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        end_date: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        show_on_home: values.showOnHome || false,
        priority: values.priority || 0,
        file_url,
        file_name,
      };
      await api.createProject(payload);
      message.success('تم إنشاء المشروع بنجاح');
      router.push('/projects');
    } catch (error: any) {
      message.error('فشل إنشاء المشروع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إنشاء مشروع / برنامج</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: 'ongoing', showOnHome: false }}
      >
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
          <UploadField maxCount={1} >تتتتت </UploadField>
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

