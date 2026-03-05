"use client";
import { Button, Form, Input, Space, App, Card, Tabs, Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import { useEffect, useState } from 'react';
import { ImageInput } from '@/components/ImageInput';

const TextArea = Input.TextArea;

export default function OrgStructurePage() {
  const [form] = Form.useForm();
  const [contentForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load structure items
      const structureData = await api.getOrgStructure();
      if (structureData?.items) {
        form.setFieldsValue({ items: structureData.items });
      }
      
      // Load page content
      try {
        const contentData = await api.getOrgStructurePageContent();
        const formValues: any = {};
        if (contentData.content) {
          contentData.content.forEach((item: any) => {
            if (item.section_key) {
              formValues[item.section_key] = item;
            }
          });
        }
        contentForm.setFieldsValue(formValues);
      } catch (error: any) {
        // Content table might not exist yet
        console.log('Page content not available yet');
      }
    } catch (error: any) {
      message.error('فشل جلب البيانات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    // allow empty list - clear existing structure if none provided
    const items = Array.isArray(values.items) ? values.items : [];
    try {
      setSaving(true);
      await api.saveOrgStructure({ items });
      message.success('تم حفظ الهيكل التنظيمي');
      // reload so that UI reflects removals/additions immediately
      loadData();
    } catch (error: any) {
      message.error('فشل حفظ الهيكل التنظيمي: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      setSavingContent(true);
      const values = contentForm.getFieldsValue();
      
      const content = Object.keys(values)
        .filter(key => values[key])
        .map(key => ({
          section_key: key,
          ...values[key],
        }));

      await api.updateOrgStructurePageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
      // refresh just in case some defaults were filled
      loadData();
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSavingContent(false);
    }
  };

  const tabItems = [
    {
      key: 'items',
      label: 'عناصر الهيكل',
      children: (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <div
                    key={field.key}
                    style={{
                      border: '1px solid #f0f0f0',
                      padding: 16,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'title']}
                        label="عنوان المرحلة"
                        rules={[{ required: true, message: 'العنوان مطلوب' }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="مثال: الجمعية العمومية" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} style={{ marginInlineStart: 8 }} />
                    </Space>
                    <Form.Item
                      {...field}
                      name={[field.name, 'description']}
                      label="الوصف"
                      rules={[{ required: true, message: 'الوصف مطلوب' }]}
                    >
                      <TextArea rows={3} placeholder="الوصف لهذه المرحلة في الهيكل" />
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    إضافة مرحلة جديدة
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              حفظ
            </Button>
          </Space>
        </Form>
      ),
    },
    {
      key: 'content',
      label: 'محتوى الصفحة',
      children: (
        <Form form={contentForm} layout="vertical" onFinish={handleSaveContent}>
          <Card title="قسم Hero">
            <Form.Item name={['hero_title', 'section_key']} hidden initialValue="hero_title">
              <Input />
            </Form.Item>
            <Form.Item name={['hero_title', 'title']} label="العنوان الرئيسي">
              <Input placeholder="الهيكل التنظيمي" />
            </Form.Item>
            <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="نظام إداري متكامل لتحقيق أهدافنا" />
            </Form.Item>
            <Form.Item name={['hero_title', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
            </Form.Item>
          </Card>

          <Card title="النص التمهيدي" style={{ marginTop: 16 }}>
            <Form.Item name={['intro_text', 'section_key']} hidden initialValue="intro_text">
              <Input />
            </Form.Item>
            <Form.Item name={['intro_text', 'description']} label="النص التمهيدي">
              <TextArea rows={6} placeholder="يتميز الهيكل التنظيمي..." />
            </Form.Item>
            <Form.Item name={['intro_text', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
            </Form.Item>
          </Card>

          <Card title="صورة الهيكل التنظيمي" style={{ marginTop: 16 }}>
            <Form.Item name={['structure_image', 'section_key']} hidden initialValue="structure_image">
              <Input />
            </Form.Item>
            <Form.Item name={['structure_image', 'image_url']} label="صورة/مخطط الهيكل التنظيمي">
              <ImageInput />
            </Form.Item>
            <Form.Item name={['structure_image', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
            </Form.Item>
          </Card>

          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={savingContent}
              onClick={handleSaveContent}
            >
              حفظ التغييرات
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">الهيكل التنظيمي</h1>
      <Tabs items={tabItems} />
    </AdminLayout>
  );
}

