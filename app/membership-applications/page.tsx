"use client";
import { useState, useEffect } from 'react';
import { Button, Table, Tag, Modal, Form, Input, Select, Space, Popconfirm, Card, Statistic, App } from 'antd';
import { EyeOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;
const { Option } = Select;

export default function MembershipApplicationsPage() {
  const { message } = App.useApp();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.listMembershipApplications(statusFilter || undefined);
      setApplications(data.applications || []);
    } catch (error: any) {
      message.error('فشل جلب طلبات العضوية: ' + error.message);
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
      await api.updateMembershipApplication(selectedApplication.id, {
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
      await api.deleteMembershipApplication(id);
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
      approved: { color: 'green', icon: <CheckCircleOutlined />, text: 'مقبول' },
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
      approved: applications.filter((a: any) => a.status === 'approved').length,
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
      title: 'نوع العضوية',
      dataIndex: 'membership_type',
      key: 'membership_type',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'تاريخ الطلب',
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
      <h1 className="page-title">طلبات العضوية</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <Statistic
            title="قيد المراجعة"
            value={stats.pending}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="تمت المراجعة"
            value={stats.reviewed}
            valueStyle={{ color: '#1890ff' }}
            prefix={<EyeOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="مقبول"
            value={stats.approved}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="مرفوض"
            value={stats.rejected}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <Select
          placeholder="تصفية حسب الحالة"
          allowClear
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value || '')}
        >
          <Option value="pending">قيد المراجعة</Option>
          <Option value="reviewed">تمت المراجعة</Option>
          <Option value="approved">مقبول</Option>
          <Option value="rejected">مرفوض</Option>
        </Select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={applications}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />

      {/* View/Edit Modal */}
      <Modal
        title="تفاصيل طلب العضوية"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            إلغاء
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdate}>
            حفظ التغييرات
          </Button>,
        ]}
        width={800}
      >
        {selectedApplication && (
          <div>
            <div className="mb-4">
              <h3 className="font-bold mb-2">معلومات المتقدم:</h3>
              <p><strong>الاسم:</strong> {selectedApplication.name}</p>
              <p><strong>البريد الإلكتروني:</strong> {selectedApplication.email}</p>
              <p><strong>رقم الجوال:</strong> {selectedApplication.phone}</p>
              <p><strong>رقم الهوية:</strong> {selectedApplication.id_number}</p>
              <p><strong>نوع العضوية:</strong> {selectedApplication.membership_type}</p>
              <p><strong>المهنة:</strong> {selectedApplication.occupation || '-'}</p>
              <p><strong>العنوان:</strong> {selectedApplication.address || '-'}</p>
              <p><strong>سبب الانضمام:</strong> {selectedApplication.reason || '-'}</p>
              <p><strong>تاريخ الطلب:</strong> {new Date(selectedApplication.created_at).toLocaleString('ar-SA')}</p>
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
                  <Option value="approved">مقبول</Option>
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
