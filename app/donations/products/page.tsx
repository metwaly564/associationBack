"use client";
import { useState, useEffect } from 'react';
import { Button, Table, Tag, Modal, Form, Input, Select, App, Space, Popconfirm, Card, Statistic, InputNumber, Switch, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TextArea } = Input;
const { Option } = Select;

const donationTypeLabels: any = {
  product: 'منتج',
  zakat: 'زكاة',
  sadaqa: 'صدقة',
  support: 'دعم',
  waqf: 'وقف',
  giftWaqf: 'وقف هدية',
};

export default function DonationProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const { message } = App.useApp();

  useEffect(() => {
    loadProducts();
  }, [typeFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.listDonationProducts();
      let filtered = data;
      
      if (typeFilter) {
        filtered = data.filter((p: any) => p.donation_type === typeFilter);
      }
      
      setProducts(filtered);
    } catch (error: any) {
      message.error('فشل جلب منتجات التبرع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      order_index: 0,
      donation_type: 'product',
    });
    setModalVisible(true);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    form.setFieldsValue({
      title: product.title,
      description: product.description,
      donation_type: product.donation_type,
      suggested_amount: product.suggested_amount,
      min_amount: product.min_amount,
      is_active: product.is_active !== false,
      order_index: product.order_index || 0,
      image_url: product.image_url || '',
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormLoading(true);

      const payload = {
        title: values.title,
        description: values.description,
        donation_type: values.donation_type,
        suggested_amount: values.suggested_amount || null,
        min_amount: values.min_amount || null,
        is_active: values.is_active !== false,
        order_index: values.order_index || 0,
        image_url: values.image_url || null,
      };

      if (selectedProduct) {
        await api.updateDonationProduct(selectedProduct.id, payload);
        message.success('تم تحديث منتج التبرع بنجاح');
      } else {
        await api.createDonationProduct(payload);
        message.success('تم إنشاء منتج التبرع بنجاح');
      }

      setModalVisible(false);
      form.resetFields();
      loadProducts();
    } catch (error: any) {
      message.error('فشل حفظ منتج التبرع: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDonationProduct(id);
      message.success('تم حذف منتج التبرع بنجاح');
      loadProducts();
    } catch (error: any) {
      message.error('فشل حذف منتج التبرع: ' + error.message);
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: products.length,
      active: products.filter((p: any) => p.is_active !== false).length,
      inactive: products.filter((p: any) => p.is_active === false).length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const columns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          {record.image_url && (
            <Image
              src={record.image_url}
              alt={text}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: 4, marginRight: 8 }}
              preview={false}
            />
          )}
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'نوع التبرع',
      dataIndex: 'donation_type',
      key: 'donation_type',
      render: (type: string) => (
        <Tag color="blue">{donationTypeLabels[type] || type}</Tag>
      ),
    },
    {
      title: 'المبلغ المقترح',
      dataIndex: 'suggested_amount',
      key: 'suggested_amount',
      render: (amount: number) => amount ? (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {parseFloat(amount?.toString() || '0').toLocaleString('ar-SA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          ر.س
        </span>
      ) : '-',
    },
    {
      title: 'الحد الأدنى',
      dataIndex: 'min_amount',
      key: 'min_amount',
      render: (amount: number) => amount ? (
        <span style={{ fontWeight: 600 }}>
          {parseFloat(amount?.toString() || '0').toLocaleString('ar-SA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          ر.س
        </span>
      ) : '-',
    },
    {
      title: 'الحالة',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive !== false ? 'green' : 'red'} icon={isActive !== false ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isActive !== false ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'ترتيب العرض',
      dataIndex: 'order_index',
      key: 'order_index',
      sorter: (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا المنتج؟"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">منتجات التبرع</h1>
            <p className="text-gray-600 mt-2">إدارة منتجات وبرامج التبرع المتاحة</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <Statistic
            title="إجمالي المنتجات"
            value={stats.total}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card>
          <Statistic
            title="نشطة"
            value={stats.active}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="غير نشطة"
            value={stats.inactive}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <Select
          placeholder="تصفية حسب نوع التبرع"
          allowClear
          style={{ width: 200 }}
          value={typeFilter}
          onChange={(value) => setTypeFilter(value || '')}
        >
          {Object.entries(donationTypeLabels).map(([key, label]) => (
            <Option key={key} value={key}>{label as string}</Option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1200 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={selectedProduct ? 'تعديل منتج التبرع' : 'إضافة منتج تبرع جديد'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            form.resetFields();
          }}>
            إلغاء
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={formLoading}>
            حفظ
          </Button>,
        ]}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="العنوان"
            rules={[{ required: true, message: 'الرجاء إدخال العنوان' }]}
          >
            <Input placeholder="مثال: كفالة طفل" />
          </Form.Item>

          <Form.Item
            name="description"
            label="الوصف"
            rules={[{ required: true, message: 'الرجاء إدخال الوصف' }]}
          >
            <TextArea rows={4} placeholder="وصف تفصيلي عن منتج التبرع..." />
          </Form.Item>

          <Form.Item
            name="donation_type"
            label="نوع التبرع"
            rules={[{ required: true, message: 'الرجاء اختيار نوع التبرع' }]}
          >
            <Select>
              {Object.entries(donationTypeLabels).map(([key, label]) => (
                <Option key={key} value={key}>{label as string}</Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="suggested_amount"
              label="المبلغ المقترح (ر.س)"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="مثال: 500"
                prefix={<DollarOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="min_amount"
              label="الحد الأدنى (ر.س)"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="مثال: 100"
                prefix={<DollarOutlined />}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="image_url"
            label="رابط الصورة"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="order_index"
              label="ترتيب العرض"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="الحالة"
              valuePropName="checked"
            >
              <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
