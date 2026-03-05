"use client";
import { Button, Input, Space, Table, Tabs, Card, Form, App, Popconfirm } from 'antd';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api, type PolicyItem } from '@/lib/apiClient';
import { SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const DEFAULT_PAGE_SIZE = 20;

export default function PoliciesListPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PolicyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [q, setQ] = useState('');
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const contentTabLoaded = useRef(false);

  const loadPolicies = async (p: number = page, size: number = pageSize) => {
    try {
      setLoading(true);
      const result = await api.listPolicies({ page: p, limit: size });
      setData(result.items ?? []);
      setTotal(result.total ?? 0);
      setPage(p);
      setPageSize(size);
    } catch (error: any) {
      message.error('فشل جلب السياسات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies(1, DEFAULT_PAGE_SIZE);
  }, []);

  useEffect(() => {
    if (activeTab === 'content' && !contentTabLoaded.current) {
      contentTabLoaded.current = true;
      loadPageContent();
    }
  }, [activeTab]);

  const loadPageContent = async () => {
    try {
      const response = await api.getPoliciesPageContent();
      const formValues: any = {};
      
      response.content?.forEach((item: any) => {
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
          title: 'الأنظمة واللوائح والسياسات',
          subtitle: 'نؤمن بالشفافية والحوكمة الرشيدة في جميع أعمالنا',
        };
      }
      
      form.setFieldsValue(formValues);
    } catch (error: any) {
      // Ignore if API doesn't exist yet
      console.log('Page content not available yet');
    }
  };

  const handleSavePageContent = async () => {
    try {
      setSaving(true);
      const values = form.getFieldsValue();
      
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
      
      await api.updatePoliciesPageContent({ content });
      message.success('تم حفظ محتوى الصفحة بنجاح');
      loadPageContent();
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await api.deletePolicy(id);
      message.success('تم حذف اللائحة بنجاح');
      loadPolicies(page, pageSize);
    } catch (error: any) {
      message.error('فشل حذف اللائحة: ' + error.message);
    }
  };

  const filtered = data.filter((i) => i.title.includes(q));
  const paginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t: number) => `الإجمالي: ${t}`,
    onChange: (p: number, size: number) => loadPolicies(p, size || pageSize),
  };

  const tabItems = [
    {
      key: 'list',
      label: 'قائمة السياسات',
      children: (
        <>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <Space style={{ flex: 1 }} wrap>
              <Input
                placeholder="بحث باسم اللائحة / السياسة"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Space>
            <Link href="/policies/new"><Button type="primary">إضافة لائحة</Button></Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filtered}
            pagination={paginationConfig}
            columns={[
              { title: 'اسم اللائحة / السياسة', dataIndex: 'title' },
              {
                title: 'الملف',
                dataIndex: 'fileUrl',
                render: (url?: string) =>
                  url ? (
                    <a href={url} target="_blank" rel="noreferrer">
                      عرض / تحميل
                    </a>
                  ) : (
                    '—'
                  ),
              },
              {
                title: 'إجراءات',
                render: (_, r) => (
                  <Space>
                    <Link href={`/policies/${r.id}`}><Button size="small">تعديل</Button></Link>
                    <Popconfirm
                      title="حذف اللائحة"
                      description="هل أنت متأكد من حذف هذه اللائحة؟"
                      onConfirm={() => handleDeletePolicy(r.id)}
                      okText="نعم"
                      cancelText="لا"
                    >
                      <Button size="small" danger>حذف</Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      key: 'content',
      label: 'محتوى الصفحة',
      children: (
        <Card>
          <Form form={form} layout="vertical">
            <Form.Item name={['content_hero_title', 'title']} label="العنوان الرئيسي">
              <Input placeholder="الأنظمة واللوائح والسياسات" />
            </Form.Item>
            <Form.Item name={['content_hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="نؤمن بالشفافية والحوكمة الرشيدة في جميع أعمالنا" />
            </Form.Item>
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="large"
                loading={saving}
                onClick={handleSavePageContent}
              >
                حفظ التغييرات
              </Button>
            </div>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">اللوائح والسياسات</h1>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </AdminLayout>
  );
}

