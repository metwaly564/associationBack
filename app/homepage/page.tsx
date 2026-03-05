"use client";
import { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Switch, Space, App, Tabs, Card } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import { ImageInput } from '@/components/ImageInput';

const { TextArea } = Input;

export default function HomepageContentPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [homepageData, setHomepageData] = useState<any>(null);
  const { message } = App.useApp();

  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      setLoading(true);
      const data = await api.getHomepageContent();
      setHomepageData(data);
      
      // Set form values
      const formValues: any = {};
      
      // Sections - ensure section_key is set and parse metadata
      data.sections?.forEach((section: any) => {
        if (section.section_key) {
          let metadata = section.metadata;
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata);
            } catch (e) {
              metadata = null;
            }
          }
          formValues[`section_${section.section_key}`] = {
            ...section,
            section_key: section.section_key,
            metadata: metadata,
          };
        }
      });
      
      // Stats
      formValues.stats = data.stats || [];
      
      // Values
      formValues.values = data.values || [];
      
      // Partners
      formValues.partners = data.partners || [];
      
      form.setFieldsValue(formValues);
    } catch (error: any) {
      message.error('فشل جلب محتوى الصفحة الرئيسية: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = form.getFieldsValue();
      
      // Extract sections and ensure section_key is set
      const sections = Object.keys(values)
        .filter(key => key.startsWith('section_'))
        .map(key => {
          const section = values[key];
          if (section) {
            if (!section.section_key) {
              section.section_key = key.replace('section_', '');
            }
            // Ensure metadata is properly formatted
            if (section.metadata && typeof section.metadata === 'object') {
              // Already an object, keep it
            } else if (section.metadata && typeof section.metadata === 'string') {
              try {
                section.metadata = JSON.parse(section.metadata);
              } catch (e) {
                section.metadata = null;
              }
            }
          }
          return section;
        })
        .filter(Boolean);
      
      const payload = {
        sections: sections,
        stats: values.stats || [],
        values: values.values || [],
        partners: values.partners || [],
      };
      
      await api.updateHomepageContent(payload);
      message.success('تم حفظ محتوى الصفحة الرئيسية بنجاح');
      loadHomepageContent();
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const tabItems = [
    {
      key: 'hero',
      label: 'قسم البطل (Hero)',
      children: (
        <Card title="قسم البطل">
          <Form.Item name={['section_hero', 'section_key']} hidden initialValue="hero">
            <Input />
          </Form.Item>
          <Form.Item name={['section_hero', 'title']} label="العنوان الرئيسي">
            <Input placeholder="نعمل من أجل مجتمع أفضل وحياة كريمة" />
          </Form.Item>
          <Form.Item name={['section_hero', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="بمنطقة المدينة المنورة" />
          </Form.Item>
          <Form.Item name={['section_hero', 'description']} label="الوصف">
            <TextArea rows={4} placeholder="وصف الجمعية..." />
          </Form.Item>
          <Form.Item name={['section_hero', 'button_text']} label="نص الزر الأول">
            <Input placeholder="تبرّع الآن" />
          </Form.Item>
          <Form.Item name={['section_hero', 'button_link']} label="رابط الزر الأول">
            <Input placeholder="/donate" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'about',
      label: 'عن الجمعية',
      children: (
        <Card title="قسم عن الجمعية">
          <Form.Item name={['section_about', 'section_key']} hidden initialValue="about">
            <Input />
          </Form.Item>
          <Form.Item name={['section_about', 'subtitle']} label="العنوان الفرعي">
            <Input placeholder="عن الجمعية" />
          </Form.Item>
          <Form.Item name={['section_about', 'title']} label="العنوان">
            <Input placeholder="رسالتنا تقديم العون والرعاية المستدامة" />
          </Form.Item>
          <Form.Item name={['section_about', 'description']} label="الوصف الأول">
            <TextArea rows={3} placeholder="الوصف الأول..." />
          </Form.Item>
          <Form.Item name={['section_about', 'content']} label="الوصف الثاني">
            <TextArea rows={3} placeholder="الوصف الثاني..." />
          </Form.Item>
          <Form.Item name={['section_about', 'image_url']} label="صورة القسم">
            <ImageInput placeholder="أدخل رابط الصورة أو ارفع صورة من الجهاز" />
          </Form.Item>
          <Form.Item name={['section_about', 'button_text']} label="نص الزر">
            <Input placeholder="اعرف المزيد" />
          </Form.Item>
          <Form.Item name={['section_about', 'button_link']} label="رابط الزر">
            <Input placeholder="/about" />
          </Form.Item>
          <Form.Item 
            name={['section_about', 'metadata', 'years']} 
            label="سنوات العطاء"
          >
            <InputNumber placeholder="15" style={{ width: '100%' }} />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'stats',
      label: 'الإحصائيات',
      children: (
        <Card title="إحصائيات الصفحة الرئيسية">
          <Form.List name="stats">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'label']}
                        label="التسمية"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="المستفيدين" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        label="القيمة"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="15,000+" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'icon_name']}
                        label="اسم الأيقونة"
                      >
                        <Input placeholder="Users" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_index']}
                        label="الترتيب"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  إضافة إحصائية
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
    {
      key: 'values',
      label: 'القيم',
      children: (
        <Card title="قيم الجمعية">
          <Form.List name="values">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="العنوان"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="السرية التامة" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        label="الوصف"
                        rules={[{ required: true }]}
                      >
                        <TextArea rows={3} placeholder="الوصف..." />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'icon_name']}
                        label="اسم الأيقونة"
                      >
                        <Input placeholder="Shield" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_index']}
                        label="الترتيب"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  إضافة قيمة
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
    {
      key: 'partners',
      label: 'الشركاء',
      children: (
        <Card title="شركاء الجمعية">
          <Form.List name="partners">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="اسم الشريك"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="وزارة الموارد البشرية" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'image_url']}
                        label="شعار الشريك"
                      >
                        <ImageInput placeholder="أدخل رابط الشعار أو ارفع صورة من الجهاز" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'website_url']}
                        label="رابط الموقع (اختياري)"
                      >
                        <Input placeholder="https://..." />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_index']}
                        label="الترتيب"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  إضافة شريك
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
    {
      key: 'cta',
      label: 'دعوة للعمل (CTA)',
      children: (
        <Card title="قسم الدعوة للعمل">
          <Form.Item name={['section_cta', 'section_key']} hidden initialValue="cta">
            <Input />
          </Form.Item>
          <Form.Item name={['section_cta', 'title']} label="العنوان">
            <Input placeholder="كن جزءًا من التغيير" />
          </Form.Item>
          <Form.Item name={['section_cta', 'description']} label="الوصف">
            <TextArea rows={3} placeholder="تبرعك اليوم يساهم..." />
          </Form.Item>
          <Form.Item name={['section_cta', 'button_text']} label="نص الزر">
            <Input placeholder="تبرّع الآن وساهم في صنع الفرق" />
          </Form.Item>
          <Form.Item name={['section_cta', 'button_link']} label="رابط الزر">
            <Input placeholder="/donate" />
          </Form.Item>
        </Card>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 16 }}>
        <h1 className="page-title">محتوى الصفحة الرئيسية</h1>
      </div>

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
