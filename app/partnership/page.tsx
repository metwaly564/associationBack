"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, App, Switch, Table, Space, Popconfirm, Tag, Modal, Select } from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import Link from 'next/link';

const { TextArea } = Input;
const { Option } = Select;

export default function PartnershipPage() {
  const [contentForm] = Form.useForm();
  const [requestForm] = Form.useForm();
  const [types, setTypes] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { message } = App.useApp();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load partnership types
      const token = localStorage.getItem('auth_token');
      const typesResponse = await fetch('/api/partnership-types', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!typesResponse.ok) throw new Error('فشل جلب أنواع الشراكة');
      const typesData = await typesResponse.json();
      setTypes(typesData.types || []);
      
      // Load partnership requests
      await loadRequests();
      
      // Load page content
      try {
        const contentData = await api.getPartnershipPageContent();
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

      await api.updatePartnershipPageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSavingContent(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await api.listPartnershipRequests(statusFilter || undefined);
      setRequests(data.requests || []);
    } catch (error: any) {
      console.error('Error loading requests:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      loadRequests();
    }
  }, [statusFilter]);

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    requestForm.setFieldsValue({
      status: request.status || 'pending',
      notes: request.notes || '',
    });
    setRequestModalVisible(true);
  };

  const handleUpdateRequest = async () => {
    try {
      const values = await requestForm.validateFields();
      await api.updatePartnershipRequest(selectedRequest.id, values);
      message.success('تم تحديث حالة الطلب بنجاح');
      setRequestModalVisible(false);
      loadRequests();
    } catch (error: any) {
      message.error('فشل تحديث الطلب: ' + error.message);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await api.deletePartnershipRequest(id);
      message.success('تم حذف الطلب بنجاح');
      loadRequests();
    } catch (error: any) {
      message.error('فشل حذف الطلب: ' + error.message);
    }
  };

  const handleDeleteType = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/partnership-types/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل حذف نوع الشراكة');
      message.success('تم حذف نوع الشراكة بنجاح');
      loadData();
    } catch (error: any) {
      message.error('فشل حذف نوع الشراكة: ' + error.message);
    }
  };

  const tabItems = [
    {
      key: 'types',
      label: 'أنواع الشراكة',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <Link href="/partnership/types/new">
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة نوع شراكة جديد
              </Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={types}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'العنوان', dataIndex: 'title', key: 'title' },
              { 
                title: 'الوصف', 
                dataIndex: 'description', 
                key: 'description',
                ellipsis: true,
                render: (text: string) => text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '-'
              },
              { title: 'الأيقونة', dataIndex: 'icon_name', key: 'icon_name' },
              { title: 'اللون', dataIndex: 'color', key: 'color' },
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
                    <Link href={`/partnership/types/${record.id}`}>
                      <Button size="small" icon={<EditOutlined />}>تعديل</Button>
                    </Link>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذا النوع؟"
                      onConfirm={() => handleDeleteType(record.id)}
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
      key: 'requests',
      label: 'طلبات الشراكة',
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <Select
              placeholder="فلترة حسب الحالة"
              allowClear
              style={{ width: 200 }}
              value={statusFilter || undefined}
              onChange={(value) => setStatusFilter(value || '')}
            >
              <Option value="pending">قيد المراجعة</Option>
              <Option value="reviewed">تمت المراجعة</Option>
              <Option value="approved">مقبول</Option>
              <Option value="rejected">مرفوض</Option>
            </Select>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={requests}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'اسم المنظمة', dataIndex: 'organization_name', key: 'organization_name' },
              { title: 'اسم المسؤول', dataIndex: 'contact_name', key: 'contact_name' },
              { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
              { title: 'الهاتف', dataIndex: 'phone', key: 'phone', render: (phone: string) => phone || '-' },
              { title: 'نوع الشراكة', dataIndex: 'partnership_type_title', key: 'partnership_type_title', render: (title: string) => title || '-' },
              {
                title: 'الحالة',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => {
                  const colors: Record<string, string> = {
                    'pending': 'orange',
                    'reviewed': 'blue',
                    'approved': 'green',
                    'rejected': 'red',
                  };
                  const labels: Record<string, string> = {
                    'pending': 'قيد المراجعة',
                    'reviewed': 'تمت المراجعة',
                    'approved': 'مقبول',
                    'rejected': 'مرفوض',
                  };
                  return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
                },
              },
              {
                title: 'التاريخ',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (date: string) => new Date(date).toLocaleDateString('ar-SA'),
              },
              {
                title: 'إجراءات',
                key: 'actions',
                render: (_: any, record: any) => (
                  <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewRequest(record)}>
                      عرض
                    </Button>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذا الطلب؟"
                      onConfirm={() => handleDeleteRequest(record.id)}
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
              <Input placeholder="الشراكة" />
            </Form.Item>
            <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="نعمل معاً لتحقيق أهداف مشتركة" />
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
              <TextArea rows={4} placeholder="نؤمن بقوة الشراكة..." />
            </Form.Item>
            <Form.Item name={['intro_text', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
            </Form.Item>
          </Card>

          <Card title="قسم 'لماذا الشراكة معنا؟'" style={{ marginTop: 16 }}>
            <Form.Item name={['why_title', 'section_key']} hidden initialValue="why_title">
              <Input />
            </Form.Item>
            <Form.Item name={['why_title', 'title']} label="العنوان">
              <Input placeholder="لماذا الشراكة معنا؟" />
            </Form.Item>
            <Form.Item name={['why_description', 'section_key']} hidden initialValue="why_description">
              <Input />
            </Form.Item>
            <Form.Item name={['why_description', 'description']} label="الوصف">
              <TextArea rows={4} placeholder="الشراكة معنا تفتح آفاقاً واسعة..." />
            </Form.Item>
          </Card>

          <Card title="نموذج التقديم" style={{ marginTop: 16 }}>
            <Form.Item name={['form_title', 'section_key']} hidden initialValue="form_title">
              <Input />
            </Form.Item>
            <Form.Item name={['form_title', 'title']} label="عنوان النموذج">
              <Input placeholder="قدّم طلب شراكة" />
            </Form.Item>
            <Form.Item name={['form_subtitle', 'section_key']} hidden initialValue="form_subtitle">
              <Input />
            </Form.Item>
            <Form.Item name={['form_subtitle', 'description']} label="نص النموذج">
              <TextArea rows={2} placeholder="املأ النموذج أدناه وسنتواصل معك..." />
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
      <h1 className="page-title">الشراكة</h1>
      <Tabs items={tabItems} />
      
      {/* Request Details Modal */}
      <Modal
        title="تفاصيل طلب الشراكة"
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRequestModalVisible(false)}>
            إلغاء
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateRequest}>
            حفظ التغييرات
          </Button>,
        ]}
        width={800}
      >
        {selectedRequest && (
          <div>
            <Form form={requestForm} layout="vertical">
              <div style={{ marginBottom: 16 }}>
                <strong>اسم المنظمة:</strong> {selectedRequest.organization_name}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>اسم المسؤول:</strong> {selectedRequest.contact_name}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>البريد الإلكتروني:</strong> {selectedRequest.email}
              </div>
              {selectedRequest.phone && (
                <div style={{ marginBottom: 16 }}>
                  <strong>الهاتف:</strong> {selectedRequest.phone}
                </div>
              )}
              {selectedRequest.website && (
                <div style={{ marginBottom: 16 }}>
                  <strong>الموقع الإلكتروني:</strong>{' '}
                  <a href={selectedRequest.website} target="_blank" rel="noopener noreferrer">
                    {selectedRequest.website}
                  </a>
                </div>
              )}
              {selectedRequest.organization_type && (
                <div style={{ marginBottom: 16 }}>
                  <strong>نوع المنظمة:</strong> {selectedRequest.organization_type}
                </div>
              )}
              {selectedRequest.partnership_type_title && (
                <div style={{ marginBottom: 16 }}>
                  <strong>نوع الشراكة المطلوبة:</strong> {selectedRequest.partnership_type_title}
                </div>
              )}
              {selectedRequest.description && (
                <div style={{ marginBottom: 16 }}>
                  <strong>وصف المنظمة:</strong>
                  <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {selectedRequest.description}
                  </div>
                </div>
              )}
              {selectedRequest.partnership_proposal && (
                <div style={{ marginBottom: 16 }}>
                  <strong>مقترح الشراكة:</strong>
                  <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {selectedRequest.partnership_proposal}
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <strong>تاريخ الإرسال:</strong> {new Date(selectedRequest.created_at).toLocaleString('ar-SA')}
              </div>
              
              <Form.Item name="status" label="الحالة" rules={[{ required: true }]}>
                <Select>
                  <Option value="pending">قيد المراجعة</Option>
                  <Option value="reviewed">تمت المراجعة</Option>
                  <Option value="approved">مقبول</Option>
                  <Option value="rejected">مرفوض</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="notes" label="ملاحظات">
                <TextArea rows={4} placeholder="ملاحظات إضافية حول الطلب..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
