"use client";
import { useState, useEffect } from 'react';
import { Button, Table, Tag, Modal, Form, Input, Select, App, Space, Popconfirm, Card, Statistic } from 'antd';
import { EyeOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;
const { Option } = Select;

export default function DonationsListPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { message } = App.useApp();

  useEffect(() => {
    loadDonations(1, 20, statusFilter || undefined);
  }, [statusFilter]);

  const loadDonations = async (pageNumber: number = 1, pageLimit: number = 20, status?: string) => {
    try {
      setLoading(true);
      const result = await api.listDonations({
        status,
        page: pageNumber,
        limit: pageLimit,
      });
      setDonations(result.items);
      setPage(result.page);
      setPageSize(result.limit);
      setTotal(result.total);
    } catch (error: any) {
      message.error('فشل جلب التبرعات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (donation: any) => {
    setSelectedDonation(donation);
    form.setFieldsValue({
      status: donation.status,
      notes: donation.notes || '',
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await api.updateDonation(selectedDonation.id, {
        status: values.status,
        notes: values.notes,
      });
      message.success('تم تحديث حالة التبرع بنجاح');
      setModalVisible(false);
      loadDonations(page, pageSize, statusFilter || undefined);
    } catch (error: any) {
      message.error('فشل تحديث التبرع: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDonation(id);
      message.success('تم حذف التبرع بنجاح');
      loadDonations(page, pageSize, statusFilter || undefined);
    } catch (error: any) {
      message.error('فشل حذف التبرع: ' + error.message);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: any = {
      success: { color: 'green', icon: <CheckCircleOutlined />, text: 'نجح' },
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'قيد الانتظار' },
      cancelled: { color: 'red', icon: <CloseCircleOutlined />, text: 'ملغي' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getDonationTypeLabel = (type: string) => {
    const typeLabels: any = {
      product: 'منتج',
      zakat: 'زكاة',
      sadaqa: 'صدقة',
      support: 'دعم',
      waqf: 'وقف',
      giftWaqf: 'وقف هدية',
    };
    return typeLabels[type] || type;
  };

  const getStatusStats = () => {
    const stats = {
      total: donations.length,
      success: donations.filter((d: any) => d.status === 'success').length,
      pending: donations.filter((d: any) => d.status === 'pending').length,
      cancelled: donations.filter((d: any) => d.status === 'cancelled').length,
      totalAmount: donations.reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0),
      successAmount: donations
        .filter((d: any) => d.status === 'success')
        .reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0),
    };
    return stats;
  };

  const stats = getStatusStats();

  const columns = [
    {
      title: 'اسم المتبرع',
      dataIndex: 'donor_name',
      key: 'donor_name',
      render: (text: string) => text || 'غير محدد',
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'donor_email',
      key: 'donor_email',
      render: (text: string) => text || '-',
    },
    {
      title: 'رقم الجوال',
      dataIndex: 'donor_phone',
      key: 'donor_phone',
      render: (text: string) => text || '-',
    },
    {
      title: 'نوع التبرع',
      dataIndex: 'donation_type',
      key: 'donation_type',
      render: (type: string) => getDonationTypeLabel(type),
    },
    {
      title: 'طريقة التبرع',
      dataIndex: 'donation_method_name',
      key: 'donation_method_name',
      render: (name: string) => name || '-',
    },
    {
      title: 'المبلغ',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {parseFloat(amount?.toString() || '0').toLocaleString('ar-SA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          ر.س
        </span>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'تاريخ التبرع',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            عرض
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا التبرع؟"
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
      <div className="mb-6">
        <h1 className="page-title">قائمة التبرعات</h1>
        <p className="text-gray-600 mt-2">إدارة جميع التبرعات الواردة</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <Statistic
            title="إجمالي التبرعات"
            value={stats.total}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card>
          <Statistic
            title="نجحت"
            value={stats.success}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="قيد الانتظار"
            value={stats.pending}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="ملغاة"
            value={stats.cancelled}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="إجمالي المبلغ الناجح"
            value={stats.successAmount}
            valueStyle={{ color: '#52c41a' }}
            prefix={<DollarOutlined />}
            suffix="ر.س"
            precision={2}
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
          <Option value="success">نجح</Option>
          <Option value="pending">قيد الانتظار</Option>
          <Option value="cancelled">ملغي</Option>
        </Select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={donations}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (current, size) => {
            loadDonations(current, size, statusFilter || undefined);
          },
        }}
        scroll={{ x: 1200 }}
      />

      {/* View/Edit Modal */}
      <Modal
        title="تفاصيل التبرع"
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
        width={700}
      >
        {selectedDonation && (
          <div className="mb-4">
            <h3 className="font-bold mb-2">معلومات المتبرع:</h3>
            <p>
              <strong>الاسم:</strong> {selectedDonation.donor_name || 'غير محدد'}
            </p>
            <p>
              <strong>البريد الإلكتروني:</strong> {selectedDonation.donor_email || '-'}
            </p>
            <p>
              <strong>رقم الجوال:</strong> {selectedDonation.donor_phone || '-'}
            </p>
            <h3 className="font-bold mb-2 mt-4">معلومات التبرع:</h3>
            <p>
              <strong>نوع التبرع:</strong> {getDonationTypeLabel(selectedDonation.donation_type)}
            </p>
            <p>
              <strong>طريقة التبرع:</strong> {selectedDonation.donation_method_name || '-'}
            </p>
            <p>
              <strong>المبلغ:</strong>{' '}
              {parseFloat(selectedDonation.amount?.toString() || '0').toLocaleString('ar-SA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              ر.س
            </p>
            <p>
              <strong>الحالة:</strong> {getStatusTag(selectedDonation.status)}
            </p>
            <p>
              <strong>تاريخ التبرع:</strong>{' '}
              {new Date(selectedDonation.created_at).toLocaleString('ar-SA')}
            </p>
            {selectedDonation.notes && (
              <p>
                <strong>ملاحظات:</strong> {selectedDonation.notes}
              </p>
            )}
          </div>
        )}
        <div className="mt-4">
          <Form form={form} layout="vertical">
            <Form.Item
              name="status"
              label="الحالة"
              rules={[{ required: true, message: 'الرجاء اختيار الحالة' }]}
            >
              <Select>
                <Option value="success">نجح</Option>
                <Option value="pending">قيد الانتظار</Option>
                <Option value="cancelled">ملغي</Option>
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="ملاحظات">
              <TextArea rows={4} placeholder="أضف ملاحظات حول هذا التبرع..." />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </AdminLayout>
  );
}
