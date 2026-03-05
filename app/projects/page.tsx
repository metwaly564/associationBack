 "use client";
import { Button, Input, Select, Space, Table, Tag, Tabs, Card, Form, InputNumber, Modal, ColorPicker, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api, type Project, type ProjectCategory } from '@/lib/apiClient';
import { SaveOutlined } from '@ant-design/icons';
import { rules, slugify } from '@/lib/validators';

const { TextArea } = Input;

const statusLabels: Record<Project['status'], string> = {
  ongoing: 'جارٍ',
  completed: 'مكتمل',
  upcoming: 'قادم',
};

export default function ProjectsListPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'projects' | 'categories' | 'page-content'>('projects');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [messageApi, contextHolder] = message.useMessage();
  
  // Programs page content form state
  const [programsForm] = Form.useForm();
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsSaving, setProgramsSaving] = useState(false);
  const [programsData, setProgramsData] = useState<any>(null);
  const [programsLoaded, setProgramsLoaded] = useState(false);
  
  // Project categories state
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [categoryForm] = Form.useForm();
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [categoryFormLoading, setCategoryFormLoading] = useState(false);

  const loadProjects = async (pageNumber: number = 1, pageLimit: number = 10) => {
    try {
      setLoading(true);
      const result = await api.listProjects({ page: pageNumber, limit: pageLimit });
      setData(result.items);
      setPage(result.page);
      setPageSize(result.limit);
      setTotal(result.total);
    } catch (error: any) {
      messageApi.error(error.message || 'فشل جلب المشاريع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(1, 10);
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await api.listProjectCategories();
      setCategories(data);
    } catch (error: any) {
      const errorMessage = error.message || 'فشل جلب التصنيفات';
      messageApi.error(errorMessage);
      console.error('Error loading project categories:', error);
      
      if (errorMessage.includes('جدول') || errorMessage.includes('42P01')) {
        messageApi.warning('يجب إنشاء جدول تصنيفات المشاريع أولاً. راجع ملف create_project_categories_table.sql');
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCategoryCreate = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({
      is_active: true,
      order_index: 0,
      color: '#1890ff',
    });
    setCategoryModalVisible(true);
  };

  const handleCategoryEdit = (category: ProjectCategory) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color || '#1890ff',
      icon_name: category.icon_name,
      order_index: category.order_index || 0,
      is_active: category.is_active !== false,
    });
    setCategoryModalVisible(true);
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      await api.deleteProjectCategory(id);
      messageApi.success('تم حذف التصنيف بنجاح');
      loadCategories();
    } catch (error: any) {
      messageApi.error('فشل حذف التصنيف: ' + error.message);
    }
  };

  const handleCategorySubmit = async (values: any) => {
    try {
      setCategoryFormLoading(true);
      const payload = {
        name: values.name,
        slug: values.slug || slugify(values.name),
        description: values.description,
        color: typeof values.color === 'string' ? values.color : (values.color?.toHexString ? values.color.toHexString() : '#1890ff'),
        icon_name: values.icon_name,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
      };

      if (editingCategory) {
        await api.updateProjectCategory(editingCategory.id, payload);
        messageApi.success('تم تحديث التصنيف بنجاح');
      } else {
        await api.createProjectCategory(payload);
        messageApi.success('تم إنشاء التصنيف بنجاح');
      }

      setCategoryModalVisible(false);
      categoryForm.resetFields();
      loadCategories();
    } catch (error: any) {
      messageApi.error('فشل حفظ التصنيف: ' + error.message);
    } finally {
      setCategoryFormLoading(false);
    }
  };

  const onCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!categoryForm.getFieldValue('slug')) {
      categoryForm.setFieldsValue({ slug: slugify(name) });
    }
  };

  const loadProgramsPageContent = async () => {
    try {
      setProgramsLoading(true);
      const data = await api.getProgramsPageContent();
      setProgramsData(data);
      
      // Set form values
      const formValues: any = {};
      
      // Content sections
      data.content?.forEach((item: any) => {
        if (item.section_key) {
          formValues[`content_${item.section_key}`] = {
            ...item,
            section_key: item.section_key,
          };
        }
      });
      
      // Categories
      formValues.categories = data.categories || [];
      
      programsForm.setFieldsValue(formValues);
      setProgramsLoaded(true);
    } catch (error: any) {
      message.error('فشل جلب محتوى صفحة البرامج والمشاريع: ' + error.message);
    } finally {
      setProgramsLoading(false);
    }
  };

  const handleSaveProgramsPage = async () => {
    try {
      setProgramsSaving(true);
      const values = programsForm.getFieldsValue();
      
      // Extract content sections
      const content = Object.keys(values)
        .filter(key => key.startsWith('content_'))
        .map(key => {
          const item = values[key];
          if (item) {
            if (!item.section_key) {
              item.section_key = key.replace('content_', '');
            }
          }
          return item;
        })
        .filter(Boolean);
      
      const payload = {
        content: content,
        categories: values.categories || [],
      };
      
      await api.updateProgramsPageContent(payload);
      messageApi.success('تم حفظ محتوى صفحة البرامج والمشاريع بنجاح');
      loadProgramsPageContent();
    } catch (error: any) {
      messageApi.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setProgramsSaving(false);
    }
  };

  const handleMainTabChange = (key: string) => {
    const typedKey = key as 'projects' | 'categories' | 'page-content';
    setActiveTab(typedKey);

    if (typedKey === 'categories' && !categoriesLoaded) {
      loadCategories();
      setCategoriesLoaded(true);
    }

    if (typedKey === 'page-content' && !programsLoaded) {
      loadProgramsPageContent();
    }
  };

  const filtered = data.filter((i) => {
    const matchText = i.title.includes(q) || i.slug.includes(q);
    const matchStatus = !status || i.status === status;
    return matchText && matchStatus;
  });

  const programsPageTabItems = [
    {
      key: 'hero',
      label: 'محتوى الصفحة',
      children: (
        <Card title="محتوى صفحة البرامج والمشاريع">
          <Form.Item name={['content_hero', 'section_key']} hidden initialValue="hero">
            <Input />
          </Form.Item>
          <Form.Item name={['content_hero', 'title']} label="العنوان الرئيسي">
            <Input placeholder="البرامج والمشاريع" />
          </Form.Item>
          <Form.Item name={['content_hero', 'subtitle']} label="الوصف">
            <TextArea rows={3} placeholder="نقدم مجموعة متنوعة من البرامج التي تلبي احتياجات المجتمع" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'categories',
      label: 'التصنيفات',
      children: (
        <Card title="تصنيفات البرامج">
          <Form.List name="categories">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'category_key']}
                        label="مفتاح التصنيف"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="all, social, health..." />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'label']}
                        label="اسم التصنيف"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="جميع البرامج" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_index']}
                        label="الترتيب"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  إضافة تصنيف
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
  ];

  const mainTabs = [
    {
      key: 'projects',
      label: 'قائمة المشاريع',
      children: (
        <>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <Space style={{ flex: 1 }} wrap>
              <Input
                placeholder="بحث بالعنوان أو الرابط"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Select
                allowClear
                placeholder="حالة المشروع"
                style={{ minWidth: 160 }}
                value={status}
                onChange={(v) => setStatus(v)}
                options={[
                  { value: 'ongoing', label: 'جارٍ' },
                  { value: 'upcoming', label: 'قادم' },
                  { value: 'completed', label: 'مكتمل' },
                ]}
              />
            </Space>
            <Link href="/projects/new"><Button type="primary">إنشاء مشروع</Button></Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filtered}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (current, size) => {
                loadProjects(current, size);
              },
            }}
            columns={[
              { title: 'العنوان', dataIndex: 'title' },
              { title: 'الرابط', dataIndex: 'slug' },
              {
                title: 'الحالة',
                dataIndex: 'status',
                render: (s: Project['status']) => {
                  const color = s === 'ongoing' ? 'blue' : s === 'completed' ? 'green' : 'orange';
                  return <Tag color={color}>{statusLabels[s]}</Tag>;
                },
              },
              { 
                title: 'التصنيف', 
                dataIndex: 'category_name',
                render: (name: string, record: any) => {
                  if (!name && record.category) {
                    // Fallback for old category field
                    return <Tag>{record.category}</Tag>;
                  }
                  return name ? (
                    <Tag color={record.category_color || 'blue'}>{name}</Tag>
                  ) : (
                    <Tag>-</Tag>
                  );
                }
              },
              {
                title: 'في الرئيسية',
                dataIndex: 'showOnHome',
                render: (v?: boolean) => (v ? <Tag color="purple">نعم</Tag> : <Tag>لا</Tag>),
              },
              { title: 'أولوية', dataIndex: 'priority' },
              {
                title: 'إجراءات',
                render: (_, r) => (
                  <Space>
                    <Link href={`/projects/${r.id}`}><Button size="small">تعديل</Button></Link>
                    <Button 
                      size="small" 
                      danger 
                      onClick={async () => {
                        if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
                          try {
                            await api.deleteProject(r.id);
                            messageApi.success('تم الحذف بنجاح');
                            await loadProjects(page, pageSize);
                          } catch (error: any) {
                            if (error.message && error.message.includes('غير موجود')) {
                              // already gone, just refresh list
                              messageApi.warning('المشروع غير موجود، تم تحديث القائمة');
                              await loadProjects(page, pageSize);
                            } else {
                              messageApi.error('فشل الحذف: ' + error.message);
                            }
                          }
                        }
                      }}
                    >
                      حذف
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      key: 'categories',
      label: (
        <span>
          <AppstoreOutlined /> تصنيفات المشاريع
        </span>
      ),
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>تصنيفات المشاريع</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCategoryCreate}
            >
              إضافة تصنيف جديد
            </Button>
          </div>
          <Table
            columns={[
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
                title: 'الأيقونة',
                dataIndex: 'icon_name',
                key: 'icon_name',
              },
              {
                title: 'الترتيب',
                dataIndex: 'order_index',
                key: 'order_index',
                sorter: (a: ProjectCategory, b: ProjectCategory) => (a.order_index || 0) - (b.order_index || 0),
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
                render: (_: any, record: ProjectCategory) => (
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
            ]}
            dataSource={categories}
            loading={categoriesLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
    {
      key: 'page-content',
      label: 'محتوى الصفحة',
      children: (
        <Form form={programsForm} layout="vertical" onFinish={handleSaveProgramsPage}>
          <Tabs items={programsPageTabItems} />
          
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={programsSaving}
              onClick={handleSaveProgramsPage}
            >
              حفظ جميع التغييرات
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <AdminLayout>
      {contextHolder}
      <h1 className="page-title">المشاريع والبرامج</h1>
      <Tabs
        items={mainTabs}
        activeKey={activeTab}
        onChange={handleMainTabChange}
      />

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          categoryForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategorySubmit}
        >
          <Form.Item
            name="name"
            label="الاسم"
            rules={[{ required: true, message: 'الرجاء إدخال الاسم' }]}
          >
            <Input placeholder="مثال: الرعاية الاجتماعية" onChange={onCategoryNameChange} />
          </Form.Item>

          <Form.Item
            name="slug"
            label="الرابط (Slug)"
            rules={rules.slug}
          >
            <Input placeholder="مثال: social-care" />
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
            name="icon_name"
            label="اسم الأيقونة (اختياري)"
          >
            <Input placeholder="مثال: Heart, Users, Award" />
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
              <Button type="primary" htmlType="submit" loading={categoryFormLoading}>
                {editingCategory ? 'تحديث' : 'إنشاء'}
              </Button>
              <Button onClick={() => {
                setCategoryModalVisible(false);
                categoryForm.resetFields();
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

