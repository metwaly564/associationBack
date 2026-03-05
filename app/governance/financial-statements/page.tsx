"use client";
import { Button, Input, Space, Table, Tabs, Card, Form, App, InputNumber, Select, Popconfirm } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface FinancialStatement {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  year?: number;
  type: 'statement' | 'report';
  order_index?: number;
  is_active?: boolean;
}

export default function FinancialStatementsPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinancialStatement[]>([]);
  const [q, setQ] = useState('');
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFinancialStatements();
    loadPageContent();
  }, []);

  const loadFinancialStatements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/financial-statements', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب القوائم المالية');
      const items = await response.json();
      setData(items);
    } catch (error: any) {
      message.error('فشل جلب القوائم المالية: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPageContent = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/financial-statements-page', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب محتوى الصفحة');
      const data = await response.json();
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
          title: 'القوائم والتقارير المالية',
          subtitle: 'نؤمن بالشفافية والمساءلة في جميع أعمالنا المالية',
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
          order_index: 1,
          is_active: true,
        });
      }
      
      const response = await fetch('/api/financial-statements-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) throw new Error('فشل حفظ المحتوى');
      
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
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/financial-statements/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error('فشل حذف القائمة المالية');
      
      message.success('تم حذف القائمة المالية بنجاح');
      loadFinancialStatements();
    } catch (error: any) {
      message.error('فشل الحذف: ' + error.message);
    }
  };

  const filtered = data.filter((i) => 
    i.title.includes(q) || 
    (i.year && i.year.toString().includes(q)) ||
    (i.type && i.type.includes(q))
  );

  const tabItems = [
    {
      key: 'list',
      label: 'قائمة القوائم المالية',
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
            <Link href="/governance/financial-statements/new">
              <Button type="primary">إضافة قائمة مالية</Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filtered}
            pagination={{ pageSize: 20 }}
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
                render: (type: string) => type === 'statement' ? 'قائمة مالية' : 'تقرير مالي',
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
                render: (_: any, r: FinancialStatement) => (
                  <Space>
                    <Link href={`/governance/financial-statements/${r.id}`}>
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
              <Input placeholder="القوائم والتقارير المالية" />
            </Form.Item>
            <Form.Item name={['content_hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="نؤمن بالشفافية والمساءلة في جميع أعمالنا المالية" />
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
      <h1 className="page-title">القوائم والتقارير المالية</h1>
      <Tabs items={tabItems} />
    </AdminLayout>
  );
}
