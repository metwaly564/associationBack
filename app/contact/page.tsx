"use client";
import { useState, useEffect } from 'react';
import { Button, Form, Input, Tabs, Card, App, Space, Select, Switch, InputNumber } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;

export default function ContactPageManagement() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    loadContactPageContent();
  }, []);

  const loadContactPageContent = async () => {
    try {
      setLoading(true);
      const data = await api.getContactPageContent();
      
      const formValues: any = {};
      
      // Content sections
      data.content?.forEach((item: any) => {
        if (item.section_key) {
          formValues[`content_${item.section_key}`] = {
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
          };
        }
      });
      
      // Set default hero title if not found
      if (!formValues.content_hero_title) {
        formValues.content_hero_title = {
          title: 'تواصل معنا',
          subtitle: 'نحن هنا للإجابة على استفساراتك ومساعدتك',
        };
      }
      
      // Contact info
      formValues.contactInfo = data.contactInfo || [];
      
      // Working hours
      formValues.workingHours = data.workingHours || [];
      
      form.setFieldsValue(formValues);
    } catch (error: any) {
      message.error('فشل جلب محتوى صفحة التواصل: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = form.getFieldsValue();
      
      // Extract content sections
      const content: any[] = [];
      
      if (values.content_hero_title) {
        content.push({
          section_key: 'hero_title',
          title: values.content_hero_title.title,
          subtitle: values.content_hero_title.subtitle,
          order_index: 1,
          is_active: true,
        });
      }
      
      const payload = {
        content: content,
        contactInfo: values.contactInfo || [],
        workingHours: values.workingHours || [],
      };
      
      await api.updateContactPageContent(payload);
      message.success('تم حفظ محتوى صفحة التواصل بنجاح');
      loadContactPageContent();
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
        <Card>
          <Form.Item name={['content_hero_title', 'title']} label="العنوان الرئيسي">
            <Input placeholder="تواصل معنا" />
          </Form.Item>
          <Form.Item name={['content_hero_title', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="نحن هنا للإجابة على استفساراتك ومساعدتك" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'info',
      label: 'معلومات الاتصال',
      children: (
        <Card>
          <Form.List name="contactInfo">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card key={field.key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Form.Item
                        {...field}
                        name={[field.name, 'info_type']}
                        label="نوع المعلومات"
                        rules={[{ required: true, message: 'الرجاء اختيار النوع' }]}
                      >
                        <Select>
                          <Select.Option value="phone">هاتف</Select.Option>
                          <Select.Option value="email">بريد إلكتروني</Select.Option>
                          <Select.Option value="address">عنوان</Select.Option>
                          <Select.Option value="social">وسائل التواصل</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'label']}
                        label="التسمية (اختياري)"
                      >
                        <Input placeholder="مثال: اتصل بنا" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        label="القيمة"
                        rules={[{ required: true, message: 'الرجاء إدخال القيمة' }]}
                      >
                        <Input placeholder="مثال: +966 11 234 5678" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'icon_name']}
                        label="اسم الأيقونة (اختياري)"
                      >
                        <Input placeholder="مثال: Phone, Mail, MapPin" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'order_index']}
                        label="ترتيب العرض"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'is_active']}
                        label="الحالة"
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
                      </Form.Item>
                      <Button danger onClick={() => remove(field.name)} icon={<DeleteOutlined />}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  إضافة معلومات اتصال
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
    {
      key: 'hours',
      label: 'ساعات العمل',
      children: (
        <Card>
          <Form.List name="workingHours">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card key={field.key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Form.Item
                        {...field}
                        name={[field.name, 'day_label']}
                        label="اليوم/الأيام"
                        rules={[{ required: true, message: 'الرجاء إدخال اليوم' }]}
                      >
                        <Input placeholder="مثال: السبت - الأربعاء" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'time_range']}
                        label="الوقت"
                        rules={[{ required: true, message: 'الرجاء إدخال الوقت' }]}
                      >
                        <Input placeholder="مثال: 8:00 ص - 4:00 م" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'is_closed']}
                        label="مغلق"
                        valuePropName="checked"
                        initialValue={false}
                      >
                        <Switch checkedChildren="مغلق" unCheckedChildren="مفتوح" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'order_index']}
                        label="ترتيب العرض"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Button danger onClick={() => remove(field.name)} icon={<DeleteOutlined />}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  إضافة ساعات عمل
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">صفحة التواصل</h1>
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
            حفظ جميع التغييرات
          </Button>
        </div>
      </Form>
    </AdminLayout>
  );
}
