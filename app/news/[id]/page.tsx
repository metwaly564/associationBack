"use client";
import { Button, DatePicker, Form, Input, InputNumber, Radio, Space, Switch, Tabs, App } from 'antd';
import dayjs from 'dayjs';
import { UploadField } from '@/components/UploadField';
import { rules, slugify } from '@/lib/validators';
import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';

const TextArea = Input.TextArea;

export default function NewsEditPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (params?.id) {
      api.getNews(params.id).then((d) => {
        form.setFieldsValue({
          ...d,
          metaTitle: d.meta_title,
          metaDescription: d.meta_description,
          publishedAt: d.published_at ? dayjs(d.published_at) : null,
          showOnHome: d.show_on_home || false,
          priority: d.priority || 0,
        });
      });
    }
  }, [params?.id]);

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
      await api.updateNews(params.id, payload);
      message.success('تم تحديث الخبر بنجاح');
      router.push('/news');
    } catch (error: any) {
      message.error('فشل تحديث الخبر: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل خبر</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
