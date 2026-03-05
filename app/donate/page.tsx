"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, App, Switch, Table, Space, Popconfirm, Select, Tag } from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import Link from 'next/link';
import { ImageInput } from '@/components/ImageInput';

const { TextArea } = Input;

export default function DonatePage() {
  const [contentForm] = Form.useForm();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load donation methods
      const token = localStorage.getItem('auth_token');
      const methodsResponse = await fetch('/api/donation-methods', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (methodsResponse.ok) {
        const methodsData = await methodsResponse.json();
        setMethods(methodsData.methods || []);
      }
      
      // Load page content
      try {
        const contentData = await api.getDonatePageContent();
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

      await api.updateDonatePageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/donation-methods/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل حذف طريقة التبرع');
      message.success('تم حذف طريقة التبرع بنجاح');
      loadData();
    } catch (error: any) {
      message.error('فشل حذف طريقة التبرع: ' + error.message);
    }
  };

  const getMethodTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'bank': 'بنك',
      'electronic_wallet': 'محفظة إلكترونية',
      'online': 'أونلاين',
      'other': 'أخرى',
    };
    return labels[type] || type;
  };

  const tabItems = [
    {
      key: 'methods',
      label: 'طرق التبرع',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <Link href="/donate/methods/new">
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة طريقة تبرع جديدة
              </Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={methods}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'الاسم', dataIndex: 'name', key: 'name' },
              { 
                title: 'النوع', 
                dataIndex: 'type', 
                key: 'type',
                render: (type: string) => <Tag>{getMethodTypeLabel(type)}</Tag>
              },
              { title: 'رقم الحساب', dataIndex: 'account_number', key: 'account_number' },
              { title: 'اسم الحساب', dataIndex: 'account_name', key: 'account_name' },
              { title: 'اسم البنك', dataIndex: 'bank_name', key: 'bank_name' },
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
                    <Link href={`/donate/methods/${record.id}`}>
                      <Button size="small" icon={<EditOutlined />}>تعديل</Button>
                    </Link>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذه الطريقة؟"
                      onConfirm={() => handleDeleteMethod(record.id)}
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
              <Input placeholder="التبرع" />
            </Form.Item>
            <Form.Item name={['hero_subtitle', 'section_key']} hidden initialValue="hero_subtitle">
              <Input />
            </Form.Item>
            <Form.Item name={['hero_subtitle', 'description']} label="الوصف">
              <TextArea rows={3} placeholder="تبرعك يساهم في تغيير حياة المحتاجين..." />
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
              <TextArea rows={4} placeholder="نؤمن بقوة التبرع..." />
            </Form.Item>
            <Form.Item name={['intro_text', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
            </Form.Item>
          </Card>

          <Card title="عناوين الأقسام" style={{ marginTop: 16 }}>
            <Form.Item name={['products_title', 'section_key']} hidden initialValue="products_title">
              <Input />
            </Form.Item>
            <Form.Item name={['products_title', 'title']} label="عنوان قسم منتجات التبرع">
              <Input placeholder="منتجات التبرع" />
            </Form.Item>
            
            <Form.Item name={['zakat_title', 'section_key']} hidden initialValue="zakat_title">
              <Input />
            </Form.Item>
            <Form.Item name={['zakat_title', 'title']} label="عنوان قسم الزكاة">
              <Input placeholder="الزكاة" />
            </Form.Item>
            
            <Form.Item name={['daily_charity_title', 'section_key']} hidden initialValue="daily_charity_title">
              <Input />
            </Form.Item>
            <Form.Item name={['daily_charity_title', 'title']} label="عنوان قسم الصدقة اليومية">
              <Input placeholder="الصدقة اليومية" />
            </Form.Item>
            
            <Form.Item name={['programs_title', 'section_key']} hidden initialValue="programs_title">
              <Input />
            </Form.Item>
            <Form.Item name={['programs_title', 'title']} label="عنوان قسم دعم البرامج والمشاريع">
              <Input placeholder="دعم البرامج والمشاريع" />
            </Form.Item>
            
            <Form.Item name={['endowments_title', 'section_key']} hidden initialValue="endowments_title">
              <Input />
            </Form.Item>
            <Form.Item name={['endowments_title', 'title']} label="عنوان قسم الأوقاف الخيرية">
              <Input placeholder="الأوقاف الخيرية" />
            </Form.Item>
            
            <Form.Item name={['gifts_title', 'section_key']} hidden initialValue="gifts_title">
              <Input />
            </Form.Item>
            <Form.Item name={['gifts_title', 'title']} label="عنوان قسم الإهداءات الوقفية">
              <Input placeholder="الإهداءات الوقفية" />
            </Form.Item>
          </Card>

          <Card title="قسم طرق التبرع" style={{ marginTop: 16 }}>
            <Form.Item name={['methods_title', 'section_key']} hidden initialValue="methods_title">
              <Input />
            </Form.Item>
            <Form.Item name={['methods_title', 'title']} label="عنوان قسم طرق التبرع">
              <Input placeholder="طرق التبرع" />
            </Form.Item>
            <Form.Item name={['methods_description', 'section_key']} hidden initialValue="methods_description">
              <Input />
            </Form.Item>
            <Form.Item name={['methods_description', 'description']} label="وصف قسم طرق التبرع">
              <TextArea rows={2} placeholder="يمكنك التبرع من خلال أي من الطرق التالية" />
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
      <h1 className="page-title">التبرع</h1>
      <Tabs items={tabItems} />
    </AdminLayout>
  );
}
