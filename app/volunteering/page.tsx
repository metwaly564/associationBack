"use client";
import { useState, useEffect } from 'react';
 import { Button, Form, Input, Tabs, Card, App, Space, Select, Switch, InputNumber } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;

export default function VolunteeringPageManagement() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVolunteeringPageContent();
  }, []);

  const loadVolunteeringPageContent = async () => {
    try {
      setLoading(true);
      const data = await api.getVolunteeringPageContent();
      
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
      
      // Set defaults if not found
      if (!formValues.content_hero_title) {
        formValues.content_hero_title = {
          title: 'التطوع معنا',
          subtitle: 'كن جزءًا من فريقنا وساهم في صنع التغيير الإيجابي',
        };
      }
      if (!formValues.content_why_title) {
        formValues.content_why_title = {
          title: 'لماذا التطوع معنا؟',
          description: 'التطوع هو فرصة رائعة لإحداث تأثير إيجابي في المجتمع، واكتساب مهارات جديدة، والتواصل مع أشخاص ملهمين. نحن نقدر وقتك وجهدك ونوفر لك بيئة داعمة ومشجعة.',
        };
      }
      if (!formValues.content_opportunities_title) {
        formValues.content_opportunities_title = {
          title: 'فرص التطوع المتاحة',
        };
      }
      if (!formValues.content_form_title) {
        formValues.content_form_title = {
          title: 'قدّم طلب تطوع',
          subtitle: 'املأ النموذج أدناه وسنتواصل معك لمناقشة فرص التطوع المناسبة',
        };
      }
      
      // Benefits
      formValues.benefits = data.benefits || [];
      
      // Opportunities
      formValues.opportunities = data.opportunities || [];
      
      form.setFieldsValue(formValues);
    } catch (error: any) {
      message.error('فشل جلب محتوى صفحة التطوع: ' + error.message);
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
      if (values.content_why_title) {
        content.push({
          section_key: 'why_title',
          title: values.content_why_title.title,
          description: values.content_why_title.description,
          order_index: 2,
          is_active: true,
        });
      }
      if (values.content_opportunities_title) {
        content.push({
          section_key: 'opportunities_title',
          title: values.content_opportunities_title.title,
          order_index: 3,
          is_active: true,
        });
      }
      if (values.content_form_title) {
        content.push({
          section_key: 'form_title',
          title: values.content_form_title.title,
          subtitle: values.content_form_title.subtitle,
          order_index: 4,
          is_active: true,
        });
      }
      
      const payload = {
        content: content,
        benefits: values.benefits || [],
        opportunities: values.opportunities || [],
      };
      
      await api.updateVolunteeringPageContent(payload);
      message.success('تم حفظ محتوى صفحة التطوع بنجاح');
      loadVolunteeringPageContent();
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
            <Input placeholder="التطوع معنا" />
          </Form.Item>
          <Form.Item name={['content_hero_title', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="كن جزءًا من فريقنا وساهم في صنع التغيير الإيجابي" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'why',
      label: 'قسم "لماذا التطوع"',
      children: (
        <Card>
          <Form.Item name={['content_why_title', 'title']} label="العنوان">
            <Input placeholder="لماذا التطوع معنا؟" />
          </Form.Item>
          <Form.Item name={['content_why_title', 'description']} label="الوصف">
            <TextArea rows={4} placeholder="وصف عن التطوع..." />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'benefits',
      label: 'فوائد التطوع',
      children: (
        <Card>
          <Form.List name="benefits">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card key={field.key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Form.Item
                        {...field}
                        name={[field.name, 'title']}
                        label="العنوان"
                        rules={[{ required: true, message: 'الرجاء إدخال العنوان' }]}
                      >
                        <Input placeholder="مثال: أثر حقيقي" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'description']}
                        label="الوصف"
                      >
                        <Input placeholder="مثال: ساهم في تحسين حياة الآخرين" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'icon_name']}
                        label="اسم الأيقونة"
                      >
                        <Input placeholder="مثال: Heart, Users, CheckCircle" />
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
                  إضافة فائدة
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
    {
      key: 'opportunities',
      label: 'فرص التطوع',
      children: (
        <Card>
          <Form.List name="opportunities">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card key={field.key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Form.Item
                        {...field}
                        name={[field.name, 'title']}
                        label="العنوان"
                        rules={[{ required: true, message: 'الرجاء إدخال العنوان' }]}
                      >
                        <Input placeholder="مثال: تنظيم الفعاليات الخيرية" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'description']}
                        label="الوصف"
                      >
                        <TextArea rows={2} placeholder="وصف فرصة التطوع..." />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'duration']}
                        label="المدة"
                      >
                        <Input placeholder="مثال: 10 ساعات/شهر" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'icon_name']}
                        label="اسم الأيقونة"
                      >
                        <Input placeholder="مثال: Users, Heart, CheckCircle" />
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
                  إضافة فرصة تطوع
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
    {
      key: 'form',
      label: 'قسم النموذج',
      children: (
        <Card>
          <Form.Item name={['content_form_title', 'title']} label="العنوان">
            <Input placeholder="قدّم طلب تطوع" />
          </Form.Item>
          <Form.Item name={['content_form_title', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="املأ النموذج أدناه وسنتواصل معك..." />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'opportunities-title',
      label: 'عنوان فرص التطوع',
      children: (
        <Card>
          <Form.Item name={['content_opportunities_title', 'title']} label="العنوان">
            <Input placeholder="فرص التطوع المتاحة" />
          </Form.Item>
        </Card>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">صفحة التطوع</h1>
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
