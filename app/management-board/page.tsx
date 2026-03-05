"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Switch, App } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;

export default function ManagementBoardPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPageContent();
  }, []);

  const loadPageContent = async () => {
    try {
      setLoading(true);
      const data = await api.getManagementBoardPageContent();
      
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

      await api.updateManagementBoardPageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title">صفحة مجلس الإدارة</h1>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Card title="قسم Hero">
          <Form.Item name={['hero_title', 'section_key']} hidden initialValue="hero_title">
            <Input />
          </Form.Item>
          <Form.Item name={['hero_title', 'title']} label="العنوان الرئيسي">
            <Input placeholder="مجلس الإدارة" />
          </Form.Item>
          <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="قيادة متميزة لرؤية طموحة" />
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
            <TextArea rows={6} placeholder="مجلس الإدارة هو الجهة المسؤولة..." />
          </Form.Item>
          <Form.Item name={['intro_text', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
          </Form.Item>
        </Card>

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

      <Card title="ملاحظة" style={{ marginTop: 24 }}>
        <p style={{ color: '#666' }}>
          <strong>ملاحظة:</strong> أعضاء مجلس الإدارة يتم إدارتهم من صفحة <strong>"فريق العمل"</strong> في CMS.
          تأكد من إضافة أعضاء مجلس الإدارة مع تحديد <strong>type = 'board'</strong> في صفحة فريق العمل.
        </p>
      </Card>
    </AdminLayout>
  );
}
