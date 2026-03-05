"use client";
import { Button, DatePicker, Form, Input, InputNumber, Radio, Space, Switch, Tabs, App } from 'antd';
import { UploadField } from '@/components/UploadField';
import { rules, slugify } from '@/lib/validators';
import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

const TextArea = Input.TextArea;

export default function NewsCreatePage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onTitleChange = (v: string) => {
    if (!slugTouched) form.setFieldsValue({ slug: slugify(v) });
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        title: values.title,
        slug: values.slug,
        body: values.body,
        excerpt: values.excerpt,
        category: values.category || 'events',
        status: values.status || 'draft',
        meta_title: values.metaTitle,
        meta_description: values.metaDescription,
        published_at: values.publishedAt ? values.publishedAt.toISOString() : null,
        show_on_home: values.showOnHome || false,
        priority: values.priority || 0,
      };
      await api.createNews(payload);
      message.success('تم إنشاء الخبر بنجاح');
      router.push('/news');
    } catch (error: any) {
      message.error('فشل إنشاء الخبر: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إنشاء خبر</h1>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'draft', category: 'events' }}>
        <Tabs
          defaultActiveKey="content"
          items={[
            {
              key: 'content',
              label: 'المحتوى',
              children: (
                <>
                  <Form.Item name="title" label="العنوان" rules={rules.title}>
                    <Input placeholder="عنوان الخبر" onChange={(e) => onTitleChange(e.target.value)} />
                  </Form.Item>
                  <Form.Item name="slug" label="الرابط (Slug)" rules={rules.slug}>
                    <Input placeholder="onwan-alkhabar" onChange={() => setSlugTouched(true)} />
                  </Form.Item>
                  <Form.Item name="category" label="التصنيف" rules={[{ required: true, message: 'الرجاء اختيار التصنيف' }]}>
                    <Radio.Group>
                      <Radio value="events">الفعاليات</Radio>
                      <Radio value="programs">البرامج</Radio>
                      <Radio value="achievements">الإنجازات</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item name="excerpt" label="الملخص" rules={rules.excerpt}>
                    <TextArea rows={3} placeholder="ملخص قصير" />
                  </Form.Item>
                  <Form.Item name="body" label="المحتوى">
                    <TextArea rows={8} placeholder="نص الخبر..." />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'media',
              label: 'الوسائط',
              children: (
                <>
                  <Form.Item name="coverImage" label="صورة الغلاف">
                    <UploadField listType="picture-card" maxCount={1} imagesOnly />
                  </Form.Item>
                  <Form.Item name="gallery" label="معرض الصور (اختياري)">
                    <UploadField listType="picture-card" imagesOnly />
                  </Form.Item>
                  <Form.Item name="attachments" label="مرفقات (PDF/صور)">
                    <UploadField />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'publish',
              label: 'النشر',
              children: (
                <>
                  <Form.Item name="status" label="الحالة">
                    <Radio.Group>
                      <Radio value="draft">مسودة</Radio>
                      <Radio value="published">منشور</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item name="publishedAt" label="تاريخ النشر">
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="showOnHome" label="إظهار في الصفحة الرئيسية" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="priority" label="أولوية العرض (كلما زاد الرقم، كلما ظهر أولاً)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'seo',
              label: 'SEO',
              children: (
                <>
                  <Form.Item name="metaTitle" label="عنوان الميتا (Meta Title)">
                    <Input placeholder="عنوان يظهر في نتائج البحث" />
                  </Form.Item>
                  <Form.Item name="metaDescription" label="وصف الميتا (Meta Description)">
                    <TextArea rows={3} placeholder="وصف قصير لتحسين نتائج البحث" />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>حفظ</Button>
          <Button onClick={() => router.push('/news')}>رجوع</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
