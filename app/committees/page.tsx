"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, Switch, Table, Space, Popconfirm, Tag, Modal, InputNumber, Alert, App } from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import { ImageInput } from '@/components/ImageInput';
import Link from 'next/link';

const { TextArea } = Input;

export default function CommitteesPage() {
  const { message } = App.useApp();
  const [contentForm] = Form.useForm();
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  
  // Supervising authorities state
  const [supervisingAuthorities, setSupervisingAuthorities] = useState<any[]>([]);
  const [authoritiesLoading, setAuthoritiesLoading] = useState(false);
  const [authorityModalVisible, setAuthorityModalVisible] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<any>(null);
  const [authorityForm] = Form.useForm();

  useEffect(() => {
    loadData();
    loadSupervisingAuthorities();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load committees
      const token = localStorage.getItem('auth_token');
      const committeesResponse = await fetch('/api/committees', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!committeesResponse.ok) throw new Error('فشل جلب اللجان');
      const committeesData = await committeesResponse.json();
      setCommittees(committeesData.committees || []);
      
      // Load page content
      try {
        const contentData = await api.getCommitteesPageContent();
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

  const loadSupervisingAuthorities = async () => {
    try {
      setAuthoritiesLoading(true);
      const data = await api.listSupervisingAuthorities();
      setSupervisingAuthorities(data);
    } catch (error: any) {
      message.error('فشل جلب الجهات المشرفة: ' + error.message);
    } finally {
      setAuthoritiesLoading(false);
    }
  };

  const handleAddAuthority = () => {
    setEditingAuthority(null);
    authorityForm.resetFields();
    setAuthorityModalVisible(true);
  };

  const handleEditAuthority = (authority: any) => {
    setEditingAuthority(authority);
    authorityForm.setFieldsValue({
      name: authority.name,
      image_url: authority.image_url,
      icon_name: authority.icon_name,
      website_url: authority.website_url,
      order_index: authority.order_index || 0,
      is_active: authority.is_active !== false,
    });
    setAuthorityModalVisible(true);
  };

  const handleSaveAuthority = async () => {
    try {
      const values = await authorityForm.validateFields();
      
      // Ensure order_index is a number and is_active is boolean
      const payload = {
        name: values.name,
        image_url: values.image_url || null,
        icon_name: values.icon_name || null,
        website_url: values.website_url || null,
        order_index: Number(values.order_index) || 0,
        is_active: values.is_active !== false,
      };
      
      if (editingAuthority) {
        await api.updateSupervisingAuthority(editingAuthority.id, payload);
        message.success('تم تحديث الجهة المشرفة بنجاح');
      } else {
        await api.createSupervisingAuthority(payload);
        message.success('تم إضافة الجهة المشرفة بنجاح');
      }
      
      setAuthorityModalVisible(false);
      authorityForm.resetFields();
      loadSupervisingAuthorities();
    } catch (error: any) {
      console.error('Error saving authority:', error);
      const errorMessage = error.message || 'حدث خطأ غير معروف';
      message.error('فشل حفظ الجهة المشرفة: ' + errorMessage);
    }
  };

  const handleDeleteAuthority = async (id: string) => {
    try {
      await api.deleteSupervisingAuthority(id);
      message.success('تم حذف الجهة المشرفة بنجاح');
      loadSupervisingAuthorities();
    } catch (error: any) {
      message.error('فشل حذف الجهة المشرفة: ' + error.message);
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

      await api.updateCommitteesPageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleDeleteCommittee = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/committees/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل حذف اللجنة');
      message.success('تم حذف اللجنة بنجاح');
      loadData();
    } catch (error: any) {
      message.error('فشل حذف اللجنة: ' + error.message);
    }
  };

  const tabItems = [
    {
      key: 'committees',
      label: 'قائمة اللجان',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <Link href="/committees/new">
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة لجنة جديدة
              </Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={committees}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'اسم اللجنة', dataIndex: 'name', key: 'name' },
              {
                title: 'النوع',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => {
                  let color = 'purple';
                  let label = type;
                  if (type === 'permanent') {
                    color = 'blue';
                    label = 'دائمة';
                  } else if (type === 'temporary') {
                    color = 'orange';
                    label = 'مؤقتة';
                  } else if (type === 'both') {
                    color = 'green';
                    label = 'دائمة ومؤقته';
                  }
                  return <Tag color={color}>{label}</Tag>;
                },
              },
              {
                title: 'عدد الأعضاء',
                dataIndex: 'members_count',
                key: 'members_count',
                render: (count: number) => count || 0,
              },
              {
                title: 'عدد المهام',
                dataIndex: 'tasks_count',
                key: 'tasks_count',
                render: (count: number) => count || 0,
              },
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
                    <Link href={`/committees/${record.id}`}>
                      <Button size="small" icon={<EditOutlined />}>تعديل</Button>
                    </Link>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذه اللجنة؟"
                      onConfirm={() => handleDeleteCommittee(record.id)}
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
              <Input placeholder="اللجان" />
            </Form.Item>
            <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="لجان متخصصة لتحقيق أهدافنا" />
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
              <TextArea rows={6} placeholder="نستعرض هنا اللجان الدائمة والمؤقتة..." />
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
    {
      key: 'supervising-authorities',
      label: 'الجهات المشرفة',
      children: (
        <div>
          {supervisingAuthorities.length === 0 && !authoritiesLoading && (
            <Card style={{ marginBottom: 16, backgroundColor: '#fff7e6', borderColor: '#ffd591' }}>
              <div style={{ color: '#d46b08' }}>
                <strong>ملاحظة:</strong> إذا كان الجدول غير موجود، يرجى تشغيل ملف SQL التالي:
                <br />
                <code style={{ display: 'block', marginTop: 8, padding: 8, backgroundColor: '#fff', borderRadius: 4 }}>
                  psql -U postgres -d association_db -f admin-cms/database/add_supervising_authorities_table.sql
                </code>
              </div>
            </Card>
          )}
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAuthority}>
              إضافة جهة مشرفة جديدة
            </Button>
          </div>
          <Table
            rowKey="id"
            loading={authoritiesLoading}
            dataSource={supervisingAuthorities}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'اسم الجهة', dataIndex: 'name', key: 'name' },
              {
                title: 'الصورة',
                dataIndex: 'image_url',
                key: 'image_url',
                render: (url: string) => url ? (
                  <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                ) : '-',
              },
              {
                title: 'الأيقونة',
                dataIndex: 'icon_name',
                key: 'icon_name',
                render: (icon: string) => icon || '-',
              },
              {
                title: 'الموقع الإلكتروني',
                dataIndex: 'website_url',
                key: 'website_url',
                render: (url: string) => url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                ) : '-',
              },
              {
                title: 'الترتيب',
                dataIndex: 'order_index',
                key: 'order_index',
              },
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
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEditAuthority(record)}>
                      تعديل
                    </Button>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذه الجهة المشرفة؟"
                      onConfirm={() => handleDeleteAuthority(record.id)}
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
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">اللجان</h1>
      <Tabs items={tabItems} />
      
      {/* Authority Modal */}
      <Modal
        title={editingAuthority ? 'تعديل جهة مشرفة' : 'إضافة جهة مشرفة جديدة'}
        open={authorityModalVisible}
        onCancel={() => setAuthorityModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAuthorityModalVisible(false)}>
            إلغاء
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveAuthority}>
            حفظ
          </Button>,
        ]}
        width={600}
      >
        <Form form={authorityForm} layout="vertical">
          <Form.Item
            name="name"
            label="اسم الجهة المشرفة"
            rules={[{ required: true, message: 'اسم الجهة المشرفة مطلوب' }]}
          >
            <Input placeholder="مثال: وزارة الموارد البشرية" />
          </Form.Item>
          
          <Form.Item name="image_url" label="رابط الصورة">
            <ImageInput />
          </Form.Item>
          
          <Form.Item name="icon_name" label="اسم الأيقونة">
            <Input placeholder="مثال: Building2" />
          </Form.Item>
          
          <Form.Item name="website_url" label="الموقع الإلكتروني">
            <Input placeholder="https://example.com" />
          </Form.Item>
          
          <Form.Item name="order_index" label="ترتيب الظهور">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="is_active" label="الحالة" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
