"use client";
import { useState, useEffect } from 'react';
import { Button, Table, Tag, Modal, Form, Input, Select, App, Space, Popconfirm, Card, Statistic } from 'antd';
import { EyeOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;
const { Option } = Select;

export default function VolunteeringApplicationsPage() {
  const { message } = App.useApp();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadApplications();
  }, [statusFilter, pagination.page]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.listVolunteeringApplications({
        status: statusFilter || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });
      setApplications(data.applications || []);
      if (data.pagination) {
        setPagination(prev => ({ ...prev, total: data.pagination.total }));
      }
    } catch (error: any) {
      message.error('فشل جلب طلبات التطوع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (application: any) => {
    setSelectedApplication(application);
    form.setFieldsValue({
      status: application.status,
      notes: application.notes || '',
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await api.updateVolunteeringApplication(selectedApplication.id, {
        status: values.status,
        notes: values.notes,
      });
      message.success('تم تحديث حالة الطلب بنجاح');
      setModalVisible(false);
      loadApplications();
    } catch (error: any) {
      message.error('فشل تحديث الطلب: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteVolunteeringApplication(id);
      message.success('تم حذف الطلب بنجاح');
      loadApplications();
    } catch (error: any) {
      message.error('فشل حذف الطلب: ' + error.message);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: any = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'قيد المراجعة' },
      reviewed: { color: 'blue', icon: <EyeOutlined />, text: 'تمت المراجعة' },
      accepted: { color: 'green', icon: <CheckCircleOutlined />, text: 'مقبول' },
      rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'مرفوض' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getStatusStats = () => {
    const stats = {
      pending: applications.filter((a: any) => a.status === 'pending').length,
      reviewed: applications.filter((a: any) => a.status === 'reviewed').length,
      accepted: applications.filter((a: any) => a.status === 'accepted').length,
      rejected: applications.filter((a: any) => a.status === 'rejected').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'رقم الجوال',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'مجال الاهتمام',
      dataIndex: 'interest',
      key: 'interest',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'تاريخ التقديم',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('ar-SA'),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            عرض
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا الطلب؟"
            onConfirm={() => handleDelete(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">طلبات التطوع</h1>

      <div style={{ marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <Statistic
              title="قيد المراجعة"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Statistic
              title="تمت المراجعة"
              value={stats.reviewed}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Statistic
              title="مقبول"
              value={stats.accepted}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Statistic
              title="مرفوض"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="تصفية حسب الحالة"
          allowClear
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value || '');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
        >
          <Option value="pending">قيد المراجعة</Option>
          <Option value="reviewed">تمت المراجعة</Option>
          <Option value="accepted">مقبول</Option>
          <Option value="rejected">مرفوض</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={applications}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: (page) => setPagination(prev => ({ ...prev, page })),
        }}
      />

      <Modal
        title="تفاصيل طلب التطوع"
        open={modalVisible}
        onOk={handleUpdate}
        onCancel={() => setModalVisible(false)}
        okText="حفظ التغييرات"
        cancelText="إلغاء"
        width={800}
      >
        {selectedApplication && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3>معلومات المتقدم</h3>
              <p><strong>الاسم:</strong> {selectedApplication.name}</p>
              <p><strong>البريد الإلكتروني:</strong> {selectedApplication.email}</p>
              <p><strong>رقم الجوال:</strong> {selectedApplication.phone}</p>
              {selectedApplication.age && <p><strong>العمر:</strong> {selectedApplication.age}</p>}
              {selectedApplication.education && <p><strong>المؤهل التعليمي:</strong> {selectedApplication.education}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>معلومات التطوع</h3>
              {selectedApplication.interest && <p><strong>مجال الاهتمام:</strong> {selectedApplication.interest}</p>}
              {selectedApplication.availability && <p><strong>الوقت المتاح:</strong> {selectedApplication.availability}</p>}
              {selectedApplication.experience && (
                <div>
                  <strong>الخبرات السابقة:</strong>
                  <p style={{ marginTop: 8 }}>{selectedApplication.experience}</p>
                </div>
              )}
              {selectedApplication.message && (
                <div>
                  <strong>رسالة إضافية:</strong>
                  <p style={{ marginTop: 8 }}>{selectedApplication.message}</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <p><strong>تاريخ التقديم:</strong> {new Date(selectedApplication.created_at).toLocaleString('ar-SA')}</p>
              {selectedApplication.reviewed_at && (
                <p><strong>تاريخ المراجعة:</strong> {new Date(selectedApplication.reviewed_at).toLocaleString('ar-SA')}</p>
              )}
            </div>

            <Form form={form} layout="vertical">
              <Form.Item
                name="status"
                label="الحالة"
                rules={[{ required: true, message: 'الرجاء اختيار الحالة' }]}
              >
                <Select>
                  <Option value="pending">قيد المراجعة</Option>
                  <Option value="reviewed">تمت المراجعة</Option>
                  <Option value="accepted">مقبول</Option>
                  <Option value="rejected">مرفوض</Option>
                </Select>
              </Form.Item>
              <Form.Item name="notes" label="ملاحظات">
                <TextArea rows={4} placeholder="أضف ملاحظات حول هذا الطلب..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
