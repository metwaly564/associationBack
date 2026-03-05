"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, message, Switch, Table, Space, Popconfirm, Tag } from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import Link from 'next/link';

const { TextArea } = Input;

export default function OfficesBranchesPage() {
  const [contentForm] = Form.useForm();
  const [offices, setOffices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load offices
      const token = localStorage.getItem('auth_token');
      const officesResponse = await fetch('/api/offices-branches', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!officesResponse.ok) throw new Error('فشل جلب المكاتب والفروع');
      const officesData = await officesResponse.json();
      setOffices(officesData.offices || []);
      
      // Load page content
      try {
        const contentData = await api.getOfficesBranchesPageContent();
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
    } catch (error: any) {
      message.error('فشل جلب البيانات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      setSavingContent(true);
      const values = contentForm.getFieldsValue();
      
      const content = Object.keys(values)
        .filter(key => values[key])
        .map(key => ({
          section_key: key,
          ...values[key],
        }));

      await api.updateOfficesBranchesPageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleDeleteOffice = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/offices-branches/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل حذف المكتب/الفرع');
      message.success('تم حذف المكتب/الفرع بنجاح');
      loadData();
    } catch (error: any) {
      message.error('فشل حذف المكتب/الفرع: ' + error.message);
    }
  };

  const tabItems = [
    {
      key: 'offices',
      label: 'قائمة المكاتب والفروع',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <Link href="/offices-branches/new">
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة مكتب/فرع جديد
              </Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={offices}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'الاسم', dataIndex: 'name', key: 'name' },
              { title: 'المدينة', dataIndex: 'city', key: 'city' },
              { title: 'العنوان', dataIndex: 'address', key: 'address', ellipsis: true },
              { title: 'الهاتف', dataIndex: 'phone', key: 'phone' },
              { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
              {
                title: 'الحالة',
                dataIndex: 'is_active',
                key: 'is_active',
                render: (active: boolean) => (
                  <Tag color={active ? 'green' : 'red'}>
                    {active ? 'نشط' : 'غير نشط'}
                  </Tag>
                ),
              },
              {
                title: 'إجراءات',
                key: 'actions',
                render: (_: any, record: any) => (
                  <Space>
                    <Link href={`/offices-branches/${record.id}`}>
                      <Button size="small" icon={<EditOutlined />}>تعديل</Button>
                    </Link>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذا المكتب/الفرع؟"
                      onConfirm={() => handleDeleteOffice(record.id)}
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
        </div>
      ),
    },
    {
      key: 'content',
      label: 'محتوى الصفحة',
      children: (
        <Form form={contentForm} layout="vertical" onFinish={handleSaveContent}>
          <Card title="قسم Hero">
            <Form.Item name={['hero_title', 'section_key']} hidden initialValue="hero_title">
              <Input />
            </Form.Item>
            <Form.Item name={['hero_title', 'title']} label="العنوان الرئيسي">
              <Input placeholder="المكاتب والفروع" />
            </Form.Item>
            <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="نخدم مجتمعنا عبر شبكة من المكاتب والفروع" />
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
              <TextArea rows={4} placeholder="تعرف على مواقعنا ووسائل التواصل" />
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
              loading={savingContent}
              onClick={handleSaveContent}
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
      <h1 className="page-title">المكاتب والفروع</h1>
      <Tabs items={tabItems} />
    </AdminLayout>
  );
}
