"use client";
import { Button, Checkbox, Form, Input, InputNumber, Radio, Select, Space, Tabs, App } from 'antd';
import { ImageInput } from '@/components/ImageInput';
import { rules, slugify } from '@/lib/validators';
import { api } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';

const TextArea = Input.TextArea;

export default function StaticPageCreatePage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const onTitleChange = (v: string) => {
    form.setFieldsValue({ slug: slugify(v) });
  };

  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      await api.createPage({
        title: values.title,
        slug: values.slug,
        type: values.type,
        summary: values.summary,
        body: values.body,
        status: values.status,
        show_in_menu: values.showInMenu,
        menu_label: values.menuLabel,
        menu_order: values.order,
        seo_title: values.seoTitle,
        seo_description: values.seoDescription,
      });
      message.success('تم إنشاء الصفحة بنجاح');
      router.push('/pages');
    } catch (error: any) {
      message.error('فشل إنشاء الصفحة: ' + error.message);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">إنشاء صفحة ثابتة</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ type: 'default', status: 'draft', showInMenu: true }}
      >
        <Tabs
          defaultActiveKey="content"
          items={[
            {
              key: 'content',
              label: 'المحتوى',
              children: (
                <>
                  <Form.Item name="title" label="العنوان" rules={rules.title}>
                    <Input placeholder="عنوان الصفحة" onChange={(e) => onTitleChange(e.target.value)} />
                  </Form.Item>
                  <Form.Item name="slug" label="الرابط (Slug)" rules={rules.slug}>
                    <Input placeholder="مثال: about" />
                  </Form.Item>
                  <Form.Item name="type" label="نوع الصفحة">
                    <Select
                      options={[
                        { value: 'home', label: 'الرئيسية' },
                        { value: 'about', label: 'من نحن' },
                        { value: 'contact', label: 'تواصل معنا' },
                        { value: 'default', label: 'عادية' },
                        { value: 'custom', label: 'مخصصة' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name="summary" label="الملخص" rules={rules.excerpt}>
                    <TextArea rows={3} placeholder="ملخص قصير عن الصفحة" />
                  </Form.Item>
                  <Form.Item name="body" label="المحتوى (HTML)">
                    <TextArea 
                      rows={15} 
                      placeholder="محتوى الصفحة... يمكنك استخدام HTML" 
                      style={{ fontFamily: 'monospace' }}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      💡 يمكنك استخدام HTML لتنسيق المحتوى. مثال: &lt;p&gt;نص&lt;/p&gt;، &lt;h2&gt;عنوان&lt;/h2&gt;
                    </div>
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'media',
              label: 'الوسائط',
              children: (
                <>
                  <Form.Item name="bannerImage" label="صورة البانر">
                    <ImageInput placeholder="أدخل رابط الصورة أو ارفع صورة من الجهاز" />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'menu',
              label: 'الظهور في القائمة',
              children: (
                <>
                  <Form.Item name="showInMenu" valuePropName="checked">
                    <Checkbox>إظهار في القائمة الرئيسية</Checkbox>
                  </Form.Item>
                  <Form.Item name="menuLabel" label="نص القائمة (اختياري)">
                    <Input placeholder="إذا كان مختلفاً عن العنوان" />
                  </Form.Item>
                  <Form.Item name="order" label="ترتيب في القائمة">
                    <InputNumber min={1} style={{ width: '100%' }} />
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
                      <Radio value="published">منشوشة</Radio>
                    </Radio.Group>
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'seo',
              label: 'SEO',
              children: (
                <>
                  <Form.Item name="seoTitle" label="عنوان الميتا للصفحة">
                    <Input placeholder="عنوان يظهر في نتائج البحث" />
                  </Form.Item>
                  <Form.Item name="seoDescription" label="وصف الميتا للصفحة">
                    <TextArea rows={3} placeholder="وصف قصير لتحسين نتائج البحث" />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
        <Space>
          <Button type="primary" htmlType="submit">حفظ</Button>
          <Button href="/pages">رجوع</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
