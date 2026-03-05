"use client";
import { useState, useEffect } from 'react';
import { Button, Table, Tag, Space, App, Modal, Form, Input, InputNumber, Switch, ColorPicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api, type NewsCategory } from '@/lib/apiClient';
import { rules, slugify } from '@/lib/validators';

const { TextArea } = Input;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.listCategories();
      setCategories(data);
    } catch (error: any) {
      message.error('فشل جلب التصنيفات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      order_index: 0,
      color: '#1890ff',
    });
    setModalVisible(true);
  };

  const handleEdit = (category: NewsCategory) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color || '#1890ff',
      order_index: category.order_index || 0,
      is_active: category.is_active !== false,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      await api.deleteCategory(id);
      message.success('تم حذف التصنيف بنجاح');
      loadCategories();
    } catch (error: any) {
      message.error('فشل حذف التصنيف: ' + error.message);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setFormLoading(true);
      const payload = {
        name: values.name,
        slug: values.slug || slugify(values.name),
        description: values.description,
        color: typeof values.color === 'string' ? values.color : (values.color?.toHexString ? values.color.toHexString() : '#1890ff'),
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
        message.success('تم تحديث التصنيف بنجاح');
      } else {
        await api.createCategory(payload);
        message.success('تم إنشاء التصنيف بنجاح');
      }

      setModalVisible(false);
      form.resetFields();
      loadCategories();
    } catch (error: any) {
      message.error('فشل حفظ التصنيف: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!form.getFieldValue('slug')) {
      form.setFieldsValue({ slug: slugify(name) });
    }
  };

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'الرابط (Slug)',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'اللون',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Tag color={color || '#1890ff'} style={{ width: 40, height: 20 }}>
          {' '}
        </Tag>
      ),
    },
    {
      title: 'الترتيب',
      dataIndex: 'order_index',
      key: 'order_index',
      sorter: (a: NewsCategory, b: NewsCategory) => (a.order_index || 0) - (b.order_index || 0),
    },
    {
      title: 'الحالة',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: NewsCategory) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            تعديل
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="page-title">تصنيفات الأخبار</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          إضافة تصنيف جديد
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="الاسم"
            rules={[{ required: true, message: 'الرجاء إدخال الاسم' }]}
          >
            <Input placeholder="مثال: الفعاليات" onChange={onNameChange} />
          </Form.Item>

          <Form.Item
            name="slug"
            label="الرابط (Slug)"
            rules={rules.slug}
          >
            <Input placeholder="مثال: events" />
          </Form.Item>

          <Form.Item
            name="description"
            label="الوصف"
          >
            <TextArea rows={3} placeholder="وصف التصنيف..." />
          </Form.Item>

          <Form.Item
            name="color"
            label="اللون"
          >
            <ColorPicker showText format="hex" />
          </Form.Item>

          <Form.Item
            name="order_index"
            label="ترتيب العرض"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="الحالة"
            valuePropName="checked"
          >
            <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={formLoading}>
                {editingCategory ? 'تحديث' : 'إنشاء'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
