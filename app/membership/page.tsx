"use client";
import { useState, useEffect } from 'react';
import { Button, Form, Input, Tabs, Card, Space, Switch, InputNumber, App } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;

export default function MembershipPageManagement() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMembershipPageContent();
  }, []);

  const loadMembershipPageContent = async () => {
    try {
      setLoading(true);
      const data = await api.getMembershipPageContent();
      
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
          title: 'العضوية',
          subtitle: 'انضم إلى عائلة الجمعية وكن شريكًا في رحلة العطاء',
        };
      }
      if (!formValues.content_why_title) {
        formValues.content_why_title = {
          title: 'لماذا تصبح عضوًا؟',
          description: 'العضوية في جمعية الرعاية الخيرية تمنحك فرصة المشاركة الفعالة في خدمة المجتمع والمساهمة في صنع القرارات المهمة. كما توفر لك فرصة التواصل مع أشخاص يشاركونك نفس الاهتمامات والقيم.',
        };
      }
      if (!formValues.content_types_title) {
        formValues.content_types_title = {
          title: 'أنواع العضويات',
        };
      }
      if (!formValues.content_form_title) {
        formValues.content_form_title = {
          title: 'قدّم طلب عضوية',
          subtitle: 'املأ النموذج أدناه للانضمام إلى عائلة الجمعية',
        };
      }
      
      // Membership types - convert features array to newline-separated string for TextArea
      formValues.types = (data.types || []).map((type: any) => {
        let features: string[] = [];
        if (Array.isArray(type.features)) {
          features = type.features;
        } else if (typeof type.features === 'string') {
          try {
            features = JSON.parse(type.features);
          } catch {
            features = [];
          }
        }
        let requirements: string[] = [];
        if (Array.isArray(type.requirements)) {
          requirements = type.requirements;
        } else if (typeof type.requirements === 'string') {
          try {
            requirements = JSON.parse(type.requirements);
          } catch {
            requirements = type.requirements.split('\n').filter((f: string) => f.trim());
          }
        }
        return {
          ...type,
          features: Array.isArray(features) ? features.join('\n') : '',
          requirements: Array.isArray(requirements) ? requirements.join('\n') : type.requirements || '',
        };
      });
      
      form.setFieldsValue(formValues);
    } catch (error: any) {
      message.error('فشل جلب محتوى صفحة العضوية: ' + error.message);
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
      if (values.content_types_title) {
        content.push({
          section_key: 'types_title',
          title: values.content_types_title.title,
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
      
      // Process membership types
      const types = (values.types || []).map((type: any, index: number) => {
        // Convert features and requirements from string (newline-separated) to array
        let features: string[] = [];
        if (typeof type.features === 'string') {
          features = type.features.split('\n').filter((f: string) => f.trim());
        } else if (Array.isArray(type.features)) {
          features = type.features;
        }
        let requirements: string[] = [];
        if (typeof type.requirements === 'string') {
          requirements = type.requirements.split('\n').filter((f: string) => f.trim());
        } else if (Array.isArray(type.requirements)) {
          requirements = type.requirements;
        }
        
        return {
          title: type.title,
          icon_name: type.icon_name,
          color: type.color || 'emerald',
          features: features,
          requirements: requirements,
        };
      });
      
      const payload = {
        content: content,
        types: types,
      };
      
      await api.updateMembershipPageContent(payload);
      message.success('تم حفظ محتوى صفحة العضوية بنجاح');
      loadMembershipPageContent();
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
            <Input placeholder="العضوية" />
          </Form.Item>
          <Form.Item name={['content_hero_title', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="انضم إلى عائلة الجمعية وكن شريكًا في رحلة العطاء" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'why',
      label: 'قسم "لماذا تصبح عضوًا"',
      children: (
        <Card>
          <Form.Item name={['content_why_title', 'title']} label="العنوان">
            <Input placeholder="لماذا تصبح عضوًا؟" />
          </Form.Item>
          <Form.Item name={['content_why_title', 'description']} label="الوصف">
            <TextArea rows={4} placeholder="وصف عن العضوية..." />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'types',
      label: 'أنواع العضويات',
      children: (
        <Card>
          <Form.List name="types">
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
                        <Input placeholder="مثال: العضوية العادية" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'icon_name']}
                        label="اسم الأيقونة"
                      >
                        <Input placeholder="مثال: Users, Star, Award" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'color']}
                        label="اللون"
                      >
                        <Input placeholder="emerald, amber, purple, blue, etc." />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'requirements']}
                        label="(سطر واحد لكل شرط)الشروط"
                      >
                        <TextArea  rows={5} placeholder="مثال:\nمفتوحة لجميع المواطنين\nوالمقيمين" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'features']}
                        label="المزايا (سطر واحد لكل ميزة)"
                      >
                        <TextArea 
                          rows={5} 
                          placeholder="مثال:&#10;حضور الجمعية العمومية&#10;التصويت على القرارات&#10;المشاركة في الفعاليات"
                        />
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
                  إضافة نوع عضوية
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
            <Input placeholder="قدّم طلب عضوية" />
          </Form.Item>
          <Form.Item name={['content_form_title', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="املأ النموذج أدناه للانضمام إلى عائلة الجمعية" />
          </Form.Item>
        </Card>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">صفحة العضوية</h1>
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
