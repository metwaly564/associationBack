"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, message, Switch, Table, Space, Popconfirm, Tag } from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import Link from 'next/link';

const { TextArea } = Input;

export default function GeneralAssemblyPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
    loadMeetings();
  }, []);

  const loadPageContent = async () => {
    try {
      setLoading(true);
      const data = await api.getGeneralAssemblyPageContent();
      
      const formValues: any = {};
      if (data.content) {
        data.content.forEach((item: any) => {
          if (item.section_key) {
            formValues[item.section_key] = item;
          }
        });
      }
      
      form.setFieldsValue(formValues);
    } catch (error: any) {
      message.error('فشل جلب محتوى الصفحة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      setMeetingsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/assembly-meetings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب الاجتماعات');
      const data = await response.json();
      setMeetings(data.meetings || []);
    } catch (error: any) {
      message.error('فشل جلب الاجتماعات: ' + error.message);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = form.getFieldsValue();
      
      const content = Object.keys(values)
        .filter(key => values[key])
        .map(key => ({
          section_key: key,
          ...values[key],
        }));

      await api.updateGeneralAssemblyPageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/assembly-meetings/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل حذف الاجتماع');
      message.success('تم حذف الاجتماع بنجاح');
      loadMeetings();
    } catch (error: any) {
      message.error('فشل حذف الاجتماع: ' + error.message);
    }
  };

  const tabItems = [
    {
      key: 'content',
      label: 'محتوى الصفحة',
      children: (
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Card title="قسم Hero">
            <Form.Item name={['hero_title', 'section_key']} hidden initialValue="hero_title">
              <Input />
            </Form.Item>
            <Form.Item name={['hero_title', 'title']} label="العنوان الرئيسي">
              <Input placeholder="الجمعية العمومية" />
            </Form.Item>
            <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="أعضاء الجمعية العمومية" />
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
              <TextArea rows={6} placeholder="بموجب نظام الجمعيات..." />
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
              loading={saving}
              onClick={handleSave}
            >
              حفظ التغييرات
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'meetings',
      label: 'محاضر الاجتماعات',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <Link href="/general-assembly/meetings/new">
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة اجتماع جديد
              </Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={meetingsLoading}
            dataSource={meetings}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'العنوان', dataIndex: 'title', key: 'title' },
              {
                title: 'تاريخ الاجتماع',
                dataIndex: 'meeting_date',
                key: 'meeting_date',
                render: (date: string) => date ? new Date(date).toLocaleDateString('ar-SA') : '-',
              },
              {
                title: 'رقم الاجتماع',
                dataIndex: 'meeting_number',
                key: 'meeting_number',
              },
              {
                title: 'الملف',
                dataIndex: 'file_name',
                key: 'file_name',
                render: (name: string) => name || '-',
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
                    <Link href={`/general-assembly/meetings/${record.id}`}>
                      <Button size="small" icon={<EditOutlined />}>تعديل</Button>
                    </Link>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذا الاجتماع؟"
                      onConfirm={() => handleDeleteMeeting(record.id)}
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
      <h1 className="page-title">الجمعية العمومية</h1>
      <Tabs items={tabItems} />
    </AdminLayout>
  );
}
