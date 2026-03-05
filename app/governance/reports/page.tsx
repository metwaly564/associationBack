"use client";
import { Button, Input, Space, Table, Tabs, Card, Form, App, Popconfirm } from 'antd';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const DEFAULT_PAGE_SIZE = 20;

interface Report {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  year?: number;
  type?: string;
  created_at?: string;
}

export default function GovernanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [q, setQ] = useState('');
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const contentTabLoaded = useRef(false);
  const { message } = App.useApp();

  const loadReports = async (p: number = page, size: number = pageSize) => {
    try {
      setLoading(true);
      const result = await api.listReports({ page: p, limit: size });
      setData(result.items ?? []);
      setTotal(result.total ?? 0);
      setPage(p);
      setPageSize(size);
    } catch (error: any) {
      message.error('فشل جلب التقارير: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(1, DEFAULT_PAGE_SIZE);
  }, []);

  useEffect(() => {
    if (activeTab === 'content' && !contentTabLoaded.current) {
      contentTabLoaded.current = true;
      loadPageContent();
    }
  }, [activeTab]);

  const loadPageContent = async () => {
    try {
      const data = await api.getReportsPageContent();
      const formValues: any = {};
      
      data.content?.forEach((item: any) => {
        if (item.section_key) {
          formValues[`content_${item.section_key}`] = {
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
          };
        }
      });
      
      if (!formValues.content_hero_title) {
        formValues.content_hero_title = {
          title: 'التقارير',
          subtitle: 'نقدم لكم تقاريرنا الدورية والسنوية',
          description: 'نقدم لكم تقاريرنا الدورية والسنوية التي توثق إنجازاتنا وبرامجنا ومشاريعنا',
        };
      }
      
      form.setFieldsValue(formValues);
    } catch (error: any) {
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
          description: values.content_hero_title.description,
          order_index: 1,
          is_active: true,
        });
      }
      await api.updateReportsPageContent({ content });
      message.success('تم حفظ محتوى الصفحة بنجاح');
      loadPageContent();
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReport(id);
      message.success('تم حذف التقرير بنجاح');
      loadReports(page, pageSize);
    } catch (error: any) {
      message.error('فشل الحذف: ' + error.message);
    }
  };

  const filtered = data.filter((i) => 
    i.title?.includes(q) || 
    (i.year && i.year.toString().includes(q)) ||
    (i.type && i.type.includes(q))
  );
  const paginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t: number) => `الإجمالي: ${t}`,
    onChange: (p: number, size: number) => loadReports(p, size || pageSize),
  };

  const tabItems = [
    {
      key: 'list',
      label: 'قائمة التقارير',
      children: (
        <>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <Space style={{ flex: 1 }} wrap>
              <Input
                placeholder="بحث بالعنوان أو السنة أو النوع"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ width: 300 }}
              />
            </Space>
            <Link href="/governance/reports/new">
              <Button type="primary">إضافة تقرير</Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filtered}
            pagination={paginationConfig}
            columns={[
              { title: 'العنوان', dataIndex: 'title', width: 300 },
              { 
                title: 'السنة', 
                dataIndex: 'year',
                width: 100,
                sorter: (a, b) => (a.year || 0) - (b.year || 0),
              },
              {
                title: 'النوع',
                dataIndex: 'type',
                width: 120,
                render: (type?: string) => {
                  const typeMap: Record<string, string> = {
                    'annual': 'سنوي',
                    'periodic': 'دوري',
                    'special': 'تخصصي',
                  };
                  return type ? (typeMap[type] || type) : '—';
                },
              },
              {
                title: 'الملف',
                dataIndex: 'file_url',
                width: 150,
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
                width: 150,
                render: (_: any, r: Report) => (
                  <Space>
                    <Link href={`/governance/reports/${r.id}`}>
                      <Button size="small">تعديل</Button>
                    </Link>
                    <Popconfirm
                      title="هل أنت متأكد من الحذف؟"
                      onConfirm={() => handleDelete(r.id)}
                      okText="نعم"
                      cancelText="لا"
                    >
                      <Button size="small" danger icon={<DeleteOutlined />}>
                        حذف
                      </Button>
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
              <Input placeholder="التقارير" />
            </Form.Item>
            <Form.Item name={['content_hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="نقدم لكم تقاريرنا الدورية والسنوية" />
            </Form.Item>
            <Form.Item name={['content_hero_title', 'description']} label="الوصف">
              <TextArea rows={4} placeholder="نقدم لكم تقاريرنا الدورية والسنوية التي توثق إنجازاتنا وبرامجنا ومشاريعنا" />
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
      <h1 className="page-title">التقارير</h1>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </AdminLayout>
  );
}
