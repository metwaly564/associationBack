"use client";
import { Button, Checkbox, Input, Select, Space, Table, Tag, message, Tabs, Card, Form, InputNumber, Switch } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, type StaticPage } from '@/lib/apiClient';
import { AdminLayout } from '@/components/AdminLayout';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const typeLabels: Record<StaticPage['type'], string> = {
  default: 'عادية',
  home: 'الرئيسية',
  about: 'من نحن',
  contact: 'تواصل معنا',
  custom: 'مخصصة',
};

export default function StaticPagesListPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StaticPage[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'pages' | 'about-sections'>('pages');
  const [q, setQ] = useState('');
  const [type, setType] = useState<string | undefined>();
  
  // About sections form state
  const [aboutForm] = Form.useForm();
  const [aboutLoading, setAboutLoading] = useState(true);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutData, setAboutData] = useState<any>(null);
  const [aboutLoaded, setAboutLoaded] = useState(false);

  useEffect(() => {
    loadPages(1, 10);
  }, []);

  const loadPages = async (pageNumber: number = 1, pageLimit: number = 10) => {
    try {
      setLoading(true);
      const result = await api.listPages({ page: pageNumber, limit: pageLimit });
      setData(result.items);
      setPage(result.page);
      setPageSize(result.limit);
      setTotal(result.total);
    } catch (error: any) {
      message.error('فشل جلب الصفحات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAboutSections = async () => {
    try {
      setAboutLoading(true);
      const data = await api.getAboutSections();
      setAboutData(data);
      
      // Set form values
      const formValues: any = {};
      
      // Sections
      data.sections?.forEach((section: any) => {
        if (section.section_key) {
          formValues[`section_${section.section_key}`] = {
            ...section,
            section_key: section.section_key,
          };
        }
      });
      
      // Goals
      formValues.goals = data.goals || [];
      
      // Values
      formValues.values = data.values || [];
      
      aboutForm.setFieldsValue(formValues);
      setAboutLoaded(true);
    } catch (error: any) {
      message.error('فشل جلب أقسام صفحة "من نحن": ' + error.message);
    } finally {
      setAboutLoading(false);
    }
  };

  const handleSaveAboutSections = async () => {
    try {
      setAboutSaving(true);
      const values = aboutForm.getFieldsValue();
      
      // Extract sections
      const sections = Object.keys(values)
        .filter(key => key.startsWith('section_'))
        .map(key => {
          const section = values[key];
          if (section) {
            if (!section.section_key) {
              section.section_key = key.replace('section_', '');
            }
          }
          return section;
        })
        .filter(Boolean);
      
      const payload = {
        sections: sections,
        goals: values.goals || [],
        values: values.values || [],
      };
      
      await api.updateAboutSections(payload);
      message.success('تم حفظ أقسام صفحة "من نحن" بنجاح');
      loadAboutSections();
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setAboutSaving(false);
    }
  };

  const filtered = data.filter((i) => {
    const matchText = i.title.includes(q) || i.slug.includes(q);
    const matchType = !type || i.type === type;
    return matchText && matchType;
  });

  const handleMainTabChange = (key: string) => {
    const typedKey = key as 'pages' | 'about-sections';
    setActiveTab(typedKey);

    if (typedKey === 'about-sections' && !aboutLoaded) {
      loadAboutSections();
    }
  };

  const aboutTabItems = [
    {
      key: 'vision',
      label: 'رؤيتنا',
      children: (
        <Card title="رؤيتنا">
          <Form.Item name={['section_vision', 'section_key']} hidden initialValue="vision">
            <Input />
          </Form.Item>
          <Form.Item name={['section_vision', 'title']} label="العنوان">
            <Input placeholder="رؤيتنا" />
          </Form.Item>
          <Form.Item name={['section_vision', 'content']} label="المحتوى">
            <TextArea rows={6} placeholder="أن نكون الجمعية الرائدة..." />
          </Form.Item>
          <Form.Item name={['section_vision', 'icon_name']} label="اسم الأيقونة">
            <Input placeholder="Eye" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'mission',
      label: 'رسالتنا',
      children: (
        <Card title="رسالتنا">
          <Form.Item name={['section_mission', 'section_key']} hidden initialValue="mission">
            <Input />
          </Form.Item>
          <Form.Item name={['section_mission', 'title']} label="العنوان">
            <Input placeholder="رسالتنا" />
          </Form.Item>
          <Form.Item name={['section_mission', 'content']} label="المحتوى">
            <TextArea rows={6} placeholder="تقديم الدعم الشامل..." />
          </Form.Item>
          <Form.Item name={['section_mission', 'icon_name']} label="اسم الأيقونة">
            <Input placeholder="Target" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'goals',
      label: 'أهدافنا الاستراتيجية',
      children: (
        <Card title="الأهداف الاستراتيجية">
          <Form.List name="goals">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="الهدف"
                        rules={[{ required: true }]}
                      >
                        <TextArea rows={2} placeholder="تقديم الدعم المادي..." />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_index']}
                        label="الترتيب"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'is_active']}
                        label="الحالة"
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
                      </Form.Item>
                      <Button type="link" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  إضافة هدف
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
    {
      key: 'values',
      label: 'قيمنا',
      children: (
        <Card title="قيمنا">
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
                        <Input placeholder="مثال: الشفافية" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        label="الوصف"
                      >
                        <TextArea rows={2} placeholder="وصف القيمة..." />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'icon_name']}
                        label="اسم الأيقونة"
                      >
                        <Input placeholder="مثال: Eye, Shield, Award" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_index']}
                        label="الترتيب"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'is_active']}
                        label="الحالة"
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
                      </Form.Item>
                      <Button type="link" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>
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
  ];

  const mainTabs = [
    {
      key: 'pages',
      label: 'قائمة الصفحات',
      children: (
        <>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <Space style={{ flex: 1 }} wrap>
              <Input placeholder="بحث بالعنوان أو الرابط" value={q} onChange={(e) => setQ(e.target.value)} />
              <Select
                allowClear
                placeholder="نوع الصفحة"
                style={{ minWidth: 160 }}
                value={type}
                onChange={(v) => setType(v)}
                options={[
                  { value: 'home', label: 'الرئيسية' },
                  { value: 'about', label: 'من نحن' },
                  { value: 'contact', label: 'تواصل معنا' },
                  { value: 'default', label: 'عادية' },
                  { value: 'custom', label: 'مخصصة' },
                ]}
              />
            </Space>
            <Link href="/pages/new"><Button type="primary">إنشاء صفحة</Button></Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filtered}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (current, size) => {
                loadPages(current, size);
              },
            }}
            columns={[
              { title: 'العنوان', dataIndex: 'title' },
              { title: 'الرابط', dataIndex: 'slug' },
              {
                title: 'النوع',
                dataIndex: 'type',
                render: (t: StaticPage['type']) => typeLabels[t] || t,
              },
              {
                title: 'في القائمة',
                dataIndex: 'showInMenu',
                render: (v: boolean) => (v ? <Tag color="blue">نعم</Tag> : <Tag>لا</Tag>),
              },
              { title: 'ترتيب', dataIndex: 'order' },
              {
                title: 'الحالة',
                dataIndex: 'status',
                render: (s: string) => (s === 'published' ? <Tag color="green">منشورة</Tag> : <Tag>مسودة</Tag>),
              },
              {
                title: 'إجراءات',
                render: (_, r) => (
                  <Space>
                    <Link href={`/pages/${r.id}`}><Button size="small">تعديل</Button></Link>
                    <Button 
                      size="small" 
                      danger 
                      onClick={async () => {
                        if (confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
                          try {
                            await api.deletePage(r.id);
                            message.success('تم الحذف بنجاح');
                            await loadPages(page, pageSize);
                          } catch (error: any) {
                            message.error('فشل الحذف: ' + error.message);
                          }
                        }
                      }}
                    >
                      حذف
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      key: 'about-sections',
      label: 'أقسام صفحة "من نحن"',
      children: (
        <Form form={aboutForm} layout="vertical" onFinish={handleSaveAboutSections}>
          <Tabs items={aboutTabItems} />
          
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={aboutSaving}
              onClick={handleSaveAboutSections}
            >
              حفظ جميع التغييرات
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">الصفحات الثابتة</h1>
      <Tabs
        items={mainTabs}
        activeKey={activeTab}
        onChange={handleMainTabChange}
      />
    </AdminLayout>
  );
}
