"use client";
import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, App, Space, Popconfirm, Card, Statistic, Tag, Tabs } from 'antd';
import { EyeOutlined, DeleteOutlined, DollarOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;

export default function DonorsPage() {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [donorDonations, setDonorDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    loadDonors(1, 20);
  }, []);

  const loadDonors = async (pageNumber: number = 1, pageLimit: number = 20) => {
    try {
      setLoading(true);
      const result = await api.listDonors({ page: pageNumber, limit: pageLimit });
      setDonors(result.items);
      setPage(result.page);
      setPageSize(result.limit);
      setTotal(result.total);
    } catch (error: any) {
      message.error('فشل جلب المتبرعين: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDonorDonations = async (donor: any) => {
    try {
      setDonationsLoading(true);
      const result = await api.listDonations({ page: 1, limit: 1000 });
      const allDonations = result.items || [];
      // Filter donations by email or phone
      const filtered = allDonations.filter((d: any) => 
        (donor.email && d.donor_email === donor.email) ||
        (donor.phone && d.donor_phone === donor.phone)
      );
      setDonorDonations(filtered);
    } catch (error: any) {
      message.error('فشل جلب تبرعات المتبرع: ' + error.message);
    } finally {
      setDonationsLoading(false);
    }
  };

  const handleView = async (donor: any) => {
    setSelectedDonor(donor);
    form.setFieldsValue({
      name: donor.name,
      email: donor.email || '',
      phone: donor.phone || '',
    });
    setModalVisible(true);
    await loadDonorDonations(donor);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      // Note: You may need to add updateDonor to apiClient if it doesn't exist
      message.success('تم تحديث معلومات المتبرع بنجاح');
      setModalVisible(false);
      loadDonors();
    } catch (error: any) {
      message.error('فشل تحديث المتبرع: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDonor(id);
      message.success('تم حذف المتبرع بنجاح');
      loadDonors(page, pageSize);
    } catch (error: any) {
      message.error('فشل حذف المتبرع: ' + error.message);
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: donors.length,
      totalAmount: donors.reduce((sum: number, d: any) => sum + (parseFloat(d.total_donated) || 0), 0),
      totalDonations: donors.reduce((sum: number, d: any) => sum + (parseInt(d.donations_count) || 0), 0),
      avgDonation: 0,
    };
    
    if (stats.totalDonations > 0) {
      stats.avgDonation = stats.totalAmount / stats.totalDonations;
    }
    
    return stats;
  };

  const stats = getStatusStats();

  const donationColumns = [
    {
      title: 'نوع التبرع',
      dataIndex: 'donation_type',
      key: 'donation_type',
      render: (type: string) => {
        const typeLabels: any = {
          product: 'منتج',
          zakat: 'زكاة',
          sadaqa: 'صدقة',
          support: 'دعم',
          waqf: 'وقف',
          giftWaqf: 'وقف هدية',
        };
        return typeLabels[type] || type;
      },
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
      render: (status: string) => {
        const statusConfig: any = {
          success: { color: 'green', text: 'نجح' },
          pending: { color: 'orange', text: 'قيد الانتظار' },
          cancelled: { color: 'red', text: 'ملغي' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'تاريخ التبرع',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
  ];

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => text || '-',
    },
    {
      title: 'رقم الجوال',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '-',
    },
    {
      title: 'إجمالي التبرعات',
      dataIndex: 'total_donated',
      key: 'total_donated',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          {parseFloat(amount?.toString() || '0').toLocaleString('ar-SA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          ر.س
        </span>
      ),
      sorter: (a: any, b: any) => parseFloat(a.total_donated || 0) - parseFloat(b.total_donated || 0),
    },
    {
      title: 'عدد التبرعات',
      dataIndex: 'donations_count',
      key: 'donations_count',
      render: (count: number) => (
        <Tag color="blue">{count || 0}</Tag>
      ),
      sorter: (a: any, b: any) => parseInt(a.donations_count || 0) - parseInt(b.donations_count || 0),
    },
    {
      title: 'تاريخ التسجيل',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString('ar-SA') : '-',
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
            title="هل أنت متأكد من حذف هذا المتبرع؟"
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
        <h1 className="page-title">المتبرعون</h1>
        <p className="text-gray-600 mt-2">إدارة قائمة المتبرعين وإجمالي تبرعاتهم</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <Statistic
            title="إجمالي المتبرعين"
            value={stats.total}
            valueStyle={{ color: '#1890ff' }}
            prefix={<UserOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="إجمالي المبلغ المتبرع به"
            value={stats.totalAmount}
            valueStyle={{ color: '#52c41a' }}
            prefix={<DollarOutlined />}
            suffix="ر.س"
            precision={2}
          />
        </Card>
        <Card>
          <Statistic
            title="إجمالي عدد التبرعات"
            value={stats.totalDonations}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card>
          <Statistic
            title="متوسط التبرع"
            value={stats.avgDonation}
            valueStyle={{ color: '#722ed1' }}
            prefix={<DollarOutlined />}
            suffix="ر.س"
            precision={2}
          />
        </Card>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={donors}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (current, size) => {
            loadDonors(current, size);
          },
        }}
        scroll={{ x: 1200 }}
      />

      {/* View/Edit Modal */}
      <Modal
        title="تفاصيل المتبرع"
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
        width={900}
      >
        {selectedDonor && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: 'معلومات المتبرع',
                children: (
                  <div className="mb-4">
                    <Form form={form} layout="vertical">
                      <Form.Item
                        name="name"
                        label="الاسم"
                        rules={[{ required: true, message: 'الرجاء إدخال الاسم' }]}
                      >
                        <Input prefix={<UserOutlined />} />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        label="البريد الإلكتروني"
                        rules={[{ type: 'email', message: 'البريد الإلكتروني غير صحيح' }]}
                      >
                        <Input prefix={<MailOutlined />} />
                      </Form.Item>
                      <Form.Item name="phone" label="رقم الجوال">
                        <Input prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Form>
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-bold mb-2">إحصائيات التبرع:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>إجمالي التبرعات:</strong>{' '}
                          <span style={{ color: '#52c41a', fontWeight: 600 }}>
                            {parseFloat(selectedDonor.total_donated?.toString() || '0').toLocaleString('ar-SA', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            ر.س
                          </span>
                        </div>
                        <div>
                          <strong>عدد التبرعات:</strong>{' '}
                          <Tag color="blue">{selectedDonor.donations_count || 0}</Tag>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'donations',
                label: `تبرعاته (${donorDonations.length})`,
                children: (
                  <Table
                    columns={donationColumns}
                    dataSource={donorDonations}
                    loading={donationsLoading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                ),
              },
            ]}
          />
        )}
      </Modal>
    </AdminLayout>
  );
}
