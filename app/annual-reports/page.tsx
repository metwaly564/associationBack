"use client";
import { Button, Input, Space, Table, Tabs, Card, Form, App, InputNumber, Popconfirm, Checkbox } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface AnnualReport {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  year?: number;
  cover_image_url?: string;
  order_index?: number;
  is_active?: boolean;
}

export default function AnnualReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnnualReport[]>([]);
  const { message } = App.useApp();
  const [q, setQ] = useState('');
  const [contentForm] = Form.useForm();
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => {
    loadAnnualReports();
    loadPageContent();
  }, []);

  const loadAnnualReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/annual-reports', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب التقارير السنوية');
      const result = await response.json();
      setData(result.reports || []);
    } catch (error: any) {
      message.error('فشل جلب التقارير السنوية: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPageContent = async () => {
    try {
      const contentData = await api.getAnnualReportsPageContent();
      const formValues: any = {};
      if (contentData.content) {
        contentData.content.forEach((item: any) => {
          if (item.section_key) {
            formValues[item.section_key] = item;
          }
        });
      }
      contentForm.setFieldsValue(formValues);
    } catch (error: any) {
      console.log('Page content not available yet');
    }
  };

  const handleSavePageContent = async () => {
    try {
      setSavingContent(true);
      const values = contentForm.getFieldsValue();
      
      console.log('📝 Form values:', values);
      
      const content = Object.keys(values)
        .filter(key => values[key])
        .map(key => values[key]);

      console.log('📤 Sending content:', content);

      await api.updateAnnualReportsPageContent({ content });
      message.success('تم حفظ محتوى الصفحة بنجاح');
    } catch (error: any) {
      console.error('❌ Error:', error);
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/annual-reports/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error('فشل حذف التقرير السنوي');
      
      message.success('تم حذف التقرير السنوي بنجاح');
      loadAnnualReports();
    } catch (error: any) {
      message.error('فشل الحذف: ' + error.message);
    }
  };

  const filtered = data.filter((i) => 
    i.title.includes(q) || 
    (i.year && i.year.toString().includes(q)) ||
    (i.description && i.description.includes(q))
  );

  const tabItems = [
    {
      key: 'list',
      label: 'قائمة التقارير السنوية',
      children: (
        <>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <Space style={{ flex: 1 }} wrap>
              <Input
                placeholder="بحث..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ width: 200 }}
              />
            </Space>
            <Link href="/annual-reports/new">
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة تقرير سنوي جديد
              </Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filtered}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'العنوان', dataIndex: 'title', key: 'title' },
              { title: 'السنة', dataIndex: 'year', key: 'year' },
              { 
                title: 'الوصف', 
                dataIndex: 'description', 
                key: 'description',
                ellipsis: true,
                render: (text: string) => text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '-'
              },
              {
                title: 'الحالة',
                dataIndex: 'is_active',
                key: 'is_active',
                render: (active: boolean) => (
                  <span style={{ color: active ? 'green' : 'red' }}>
                    {active ? 'نشط' : 'غير نشط'}
                  </span>
                ),
              },
              {
                title: 'إجراءات',
                key: 'actions',
                render: (_: any, record: AnnualReport) => (
                  <Space>
                    <Link href={`/annual-reports/${record.id}`}>
                      <Button size="small" icon={<EditOutlined />}>تعديل</Button>
                    </Link>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذا التقرير السنوي؟"
                      onConfirm={() => handleDelete(record.id)}
                      okText="نعم"
                      cancelText="لا"
                    >
                      <Button size="small" danger icon={<DeleteOutlined />}>حذف</Button>
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
        <Form form={contentForm} layout="vertical" onFinish={handleSavePageContent}>
          <Card title="قسم Hero">
            <Form.Item name={['hero_title', 'section_key']} hidden initialValue="hero_title">
              <Input />
            </Form.Item>
            <Form.Item name={['hero_title', 'title']} label="العنوان الرئيسي">
              <Input placeholder="التقارير السنوية" />
            </Form.Item>
            <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="نستعرض إنجازاتنا وإسهاماتنا على مدار السنوات" />
            </Form.Item>
            <Form.Item name={['hero_title', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
              <Checkbox>مفعّل</Checkbox>
            </Form.Item>
          </Card>

          <Card title="النص التمهيدي" style={{ marginTop: 16 }}>
            <Form.Item name={['intro_text', 'section_key']} hidden initialValue="intro_text">
              <Input />
            </Form.Item>
            <Form.Item name={['intro_text', 'description']} label="النص التمهيدي">
              <TextArea rows={4} placeholder="نقدم لكم تقاريرنا السنوية..." />
            </Form.Item>
            <Form.Item name={['intro_text', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
              <Checkbox>مفعّل</Checkbox>
            </Form.Item>
          </Card>

          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={savingContent}
              onClick={handleSavePageContent}
            >
              حفظ التغييرات
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">التقارير السنوية</h1>
      <Tabs items={tabItems} />
    </AdminLayout>
  );
}
