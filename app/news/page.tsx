"use client";
import { useState, useEffect } from 'react';
import { Button, Table, Tag, Space, Modal, Form, Input, InputNumber, Switch, ColorPicker, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api, type NewsItem, type NewsCategory } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { rules, slugify } from '@/lib/validators';
import { App } from 'antd';

const { TextArea } = Input;

export default function NewsListPage() {
    const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<'news' | 'categories'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Categories state
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadNews(1, 10);
  }, []);

  const loadNews = async (pageNumber: number = 1, pageLimit: number = 10) => {
    try {
      setLoading(true);
      const result = await api.listNews({ page: pageNumber, limit: pageLimit });
      setNews(result.items);
      setPage(result.page);
      setPageSize(result.limit);
      setTotal(result.total);
    } catch (error: any) {
      message.error('فشل جلب الأخبار: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (id: string) => {
  if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;

  try {
    console.log('Deleting news id:', id);
    await api.deleteNews(id);
    message.success('تم حذف الخبر بنجاح');
    loadNews(page, pageSize);
  } catch (error: any) {
    console.error('Delete error:', error);
    message.error(error.message || 'فشل حذف الخبر');
  }
};

  // Categories functions
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await api.listCategories();
      setCategories(data);
    } catch (error: any) {
      const errorMessage = error.message || 'فشل جلب التصنيفات';
      message.error(errorMessage);
      console.error('Error loading categories:', error);
      
      // Check if it's a table not found error
      if (errorMessage.includes('جدول التصنيفات غير موجود') || errorMessage.includes('42P01')) {
        message.warning('يجب إنشاء جدول التصنيفات أولاً. راجع ملف create_categories_table.sql');
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCategoryCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      order_index: 0,
      color: '#1890ff',
    });
    setModalVisible(true);
  };

  const handleCategoryEdit = (category: NewsCategory) => {
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

  const handleCategoryDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      await api.deleteCategory(id);
      message.success('تم حذف التصنيف بنجاح');
      loadCategories();
    } catch (error: any) {
      message.error('فشل حذف التصنيف: ' + error.message);
    }
  };

  const handleCategorySubmit = async (values: any) => {
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
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'التصنيف',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const labels: Record<string, string> = {
          events: 'الفعاليات',
          programs: 'البرامج',
          achievements: 'الإنجازات',
        };
        const colors: Record<string, string> = {
          events: 'blue',
          programs: 'green',
          achievements: 'purple',
        };
        return (
          <Tag color={colors[category] || 'default'}>
            {labels[category] || category}
          </Tag>
        );
      },
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? 'منشور' : 'مسودة'}
        </Tag>
      ),
    },
    {
      title: 'تاريخ النشر',
      dataIndex: 'published_at',
      key: 'published_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString('ar-SA') : '-',
    },
    {
      title: 'آخر تحديث',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString('ar-SA') : '-',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: NewsItem) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => router.push(`/news/${record.id}`)}
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

  const categoryColumns = [
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
            onClick={() => handleCategoryEdit(record)}
          >
            تعديل
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleCategoryDelete(record.id)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  const handleTabChange = (key: string) => {
    const typedKey = key as 'news' | 'categories';
    setActiveTab(typedKey);

    if (typedKey === 'categories' && !categoriesLoaded) {
      loadCategories();
      setCategoriesLoaded(true);
    }
  };

  const tabItems = [
    {
      key: 'news',
      label: 'الأخبار',
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>قائمة الأخبار</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/news/new')}
            >
              إضافة خبر جديد
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={news}
            loading={loading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (current, size) => {
                loadNews(current, size);
              },
            }}
          />
        </>
      ),
    },
    {
      key: 'categories',
      label: (
        <span>
          <AppstoreOutlined /> تصنيفات الأخبار
        </span>
      ),
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>تصنيفات الأخبار</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCategoryCreate}
            >
              إضافة تصنيف جديد
            </Button>
          </div>
          <Table
            columns={categoryColumns}
            dataSource={categories}
            loading={categoriesLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 16 }}>
        <h1 className="page-title">الأخبار</h1>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />

      {/* Category Modal */}
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
          onFinish={handleCategorySubmit}
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

