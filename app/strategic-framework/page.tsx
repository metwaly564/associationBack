"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, App, Switch } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;

export default function StrategicFrameworkPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    loadPageContent();
  }, []);

  const loadPageContent = async () => {
    try {
      setLoading(true);
      const data = await api.getStrategicFrameworkPageContent();
      
      const formValues: any = {};
      if (data.content) {
        data.content.forEach((item: any) => {
          if (item.section_key) {
            formValues[item.section_key] = item;
          }
        });
      }
      
      form.setFieldsValue(formValues);
    } catch (error: any) {
      message.error('فشل جلب محتوى الصفحة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = form.getFieldsValue();
      
      const content = Object.keys(values)
        .filter(key => values[key])
        .map(key => ({
          section_key: key,
          ...values[key],
        }));

      await api.updateStrategicFrameworkPageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const tabItems = [
    {
      key: 'hero',
      label: 'قسم Hero',
      children: (
        <Card title="قسم Hero">
          <Form.Item name={['hero_title', 'section_key']} hidden initialValue="hero_title">
            <Input />
          </Form.Item>
          <Form.Item name={['hero_title', 'title']} label="العنوان الرئيسي">
            <Input placeholder="الإطار الاستراتيجي" />
          </Form.Item>
          <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="رؤيتنا ورسالتنا وقيمنا وأهدافنا" />
          </Form.Item>
          <Form.Item name={['hero_title', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
          </Form.Item>
        </Card>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">صفحة الإطار الاستراتيجي</h1>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Tabs items={tabItems} />
        
        <div style={{ marginTop: 24, textAlign: 'left' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            loading={saving}
            onClick={handleSave}
          >
            حفظ التغييرات
          </Button>
        </div>
      </Form>
    </AdminLayout>
  );
}
