"use client";
import { Button, Input, Select, Space, Table, Tag, App, Tabs, Card, Form, InputNumber, Switch } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api, type TeamMember } from '@/lib/apiClient';
import { ImageInput } from '@/components/ImageInput';

const { TextArea } = Input;

const typeLabels: Record<TeamMember['type'], string> = {
  board: 'مجلس الإدارة',
  staff: 'فريق العمل',
};

export default function TeamListPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeamMember[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'members' | 'page-content'>('members');
  const [q, setQ] = useState('');
  const [type, setType] = useState<string | undefined>();
  
  // Team page content form state
  const [pageForm] = Form.useForm();
  const [pageLoading, setPageLoading] = useState(true);
  const [pageSaving, setPageSaving] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [pageContentLoaded, setPageContentLoaded] = useState(false);

  useEffect(() => {
    loadTeam(1, 20);
  }, []);

  const loadTeam = async (pageNumber: number = 1, pageLimit: number = 20) => {
    try {
      setLoading(true);
      const result = await api.listTeam({ page: pageNumber, limit: pageLimit });
      setData(result.items);
      setPage(result.page);
      setPageSize(result.limit);
      setTotal(result.total);
    } catch (error: any) {
      message.error('فشل جلب فريق العمل: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamPageContent = async () => {
    try {
      setPageLoading(true);
      const data = await api.getTeamPageContent();
      setPageData(data);
      
      // Set form values
      const formValues: any = {};
      
      // Content sections
      data.content?.forEach((item: any) => {
        if (item.section_key) {
          if (item.section_key === 'board_title' || item.section_key === 'staff_title') {
            formValues[`content_${item.section_key}`] = {
              title: item.title,
            };
          } else {
            formValues[`content_${item.section_key}`] = {
              ...item,
              section_key: item.section_key,
            };
          }
        }
      });
      
      // Set default titles if not found
      if (!formValues.content_board_title) {
        formValues.content_board_title = { title: 'أعضاء مجلس الإدارة' };
      }
      if (!formValues.content_staff_title) {
        formValues.content_staff_title = { title: 'موظفو الجمعية' };
      }
      
      // Hero images
      formValues.heroImages = data.heroImages || [];
      
      // Executive director
      if (data.executiveDirector) {
        formValues.executiveDirector = data.executiveDirector;
      }
      
      pageForm.setFieldsValue(formValues);
      setPageContentLoaded(true);
    } catch (error: any) {
      message.error('فشل جلب محتوى صفحة فريق العمل: ' + error.message);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSavePageContent = async () => {
    try {
      setPageSaving(true);
      const values = pageForm.getFieldsValue();
      
      // Extract content sections
      const content: any[] = [];
      
      // Add board title
      if (values.content_board_title) {
        content.push({
          section_key: 'board_title',
          title: values.content_board_title.title || values.content_board_title,
          order_index: 1,
          is_active: true,
        });
      }
      
      // Add staff title
      if (values.content_staff_title) {
        content.push({
          section_key: 'staff_title',
          title: values.content_staff_title.title || values.content_staff_title,
          order_index: 2,
          is_active: true,
        });
      }
      
      // Add other content sections
      Object.keys(values)
        .filter(key => key.startsWith('content_') && key !== 'content_board_title' && key !== 'content_staff_title')
        .forEach(key => {
          const item = values[key];
          if (item && typeof item === 'object') {
            if (!item.section_key) {
              item.section_key = key.replace('content_', '');
            }
            content.push(item);
          }
        });
      
      const payload = {
        content: content,
        heroImages: values.heroImages || [],
        executiveDirector: values.executiveDirector || null,
      };
      
      await api.updateTeamPageContent(payload);
      message.success('تم حفظ محتوى صفحة فريق العمل بنجاح');
      loadTeamPageContent();
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setPageSaving(false);
    }
  };

  const filtered = data.filter((i) => {
    const matchText = i.name.includes(q) || i.role.includes(q);
    const matchType = !type || i.type === type;
    return matchText && matchType;
  });

  const handleMainTabChange = (key: string) => {
    const typedKey = key as 'members' | 'page-content';
    setActiveTab(typedKey);

    if (typedKey === 'page-content' && !pageContentLoaded) {
      loadTeamPageContent();
    }
  };

  const mainTabs = [
    {
      key: 'members',
      label: 'قائمة الأعضاء',
      children: (
        <>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <Space style={{ flex: 1 }} wrap>
              <Input
                placeholder="بحث بالاسم أو المسمى"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Select
                allowClear
                placeholder="النوع"
                style={{ minWidth: 160 }}
                value={type}
                onChange={(v) => setType(v)}
                options={[
                  { value: 'board', label: 'مجلس الإدارة' },
                  { value: 'staff', label: 'فريق العمل' },
                ]}
              />
            </Space>
            <Link href="/team/new"><Button type="primary">إضافة عضو</Button></Link>
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
                loadTeam(current, size);
              },
            }}
            columns={[
              { title: 'الاسم', dataIndex: 'name' },
              { title: 'المسمى / الصفة', dataIndex: 'role' },
              {
                title: 'النوع',
                dataIndex: 'type',
                render: (t: TeamMember['type']) => <Tag>{typeLabels[t]}</Tag>,
              },
              { title: 'ترتيب', dataIndex: 'order_index' },
              {
                title: 'إجراءات',
                render: (_, r) => (
                  <Space>
                    <Link href={`/team/${r.id}`}><Button size="small">تعديل</Button></Link>
                    <Button 
                      size="small" 
                      danger 
                      onClick={async () => {
                        if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
                          try {
                            await api.deleteTeamMember(r.id);
                            message.success('تم الحذف بنجاح');
                            await loadTeam(page, pageSize);
                          } catch (error: any) {
                            message.error('فشل الحذف: ' + error.message);
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
      key: 'page-content',
      label: 'محتوى الصفحة',
      children: (
        <Form form={pageForm} layout="vertical" onFinish={handleSavePageContent}>
          <Tabs
            items={[
              {
                key: 'hero',
                label: 'صور Hero',
                children: (
                  <Card>
                    <Form.List name="heroImages">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <Card key={field.key} style={{ marginBottom: 16 }} size="small">
                              <Form.Item
                                {...field}
                                name={[field.name, 'image_url']}
                                label={`صورة ${index + 1}`}
                                rules={[{ required: true, message: 'الرجاء إدخال رابط الصورة' }]}
                              >
                                <ImageInput />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, 'order_index']}
                                label="ترتيب العرض"
                              >
                                <InputNumber min={0} style={{ width: '100%' }} />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, 'is_active']}
                                label="الحالة"
                                valuePropName="checked"
                                initialValue={true}
                              >
                                <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
                              </Form.Item>
                              <Button danger onClick={() => remove(field.name)}>حذف</Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            إضافة صورة
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ),
              },
              {
                key: 'executive',
                label: 'المدير التنفيذي',
                children: (
                  <Card>
                    <Form.Item name={['executiveDirector', 'name']} label="الاسم الكامل">
                      <Input placeholder="مثال: الأستاذ باسم بن غيث نويفع الجهني" />
                    </Form.Item>
                    <Form.Item name={['executiveDirector', 'title']} label="المسمى الوظيفي">
                      <Input placeholder="مثال: المدير التنفيذي" />
                    </Form.Item>
                    <Form.Item name={['executiveDirector', 'email']} label="البريد الإلكتروني">
                      <Input type="email" placeholder="example@email.com" />
                    </Form.Item>
                    <Form.Item name={['executiveDirector', 'phone']} label="رقم الهاتف">
                      <Input placeholder="059506264" />
                    </Form.Item>
                    <Form.Item name={['executiveDirector', 'image_url']} label="الصورة الشخصية">
                      <ImageInput />
                    </Form.Item>
                    <Form.Item name={['executiveDirector', 'period_from']} label="الفترة من">
                      <Input placeholder="مثال: 13 / 07 / 1440هـ" />
                    </Form.Item>
                    <Form.Item name={['executiveDirector', 'period_to']} label="الفترة إلى">
                      <Input placeholder="مثال: 05 / 08 / 1444هـ" />
                    </Form.Item>
                    <Form.Item name={['executiveDirector', 'qualification']} label="المؤهل العلمي">
                      <TextArea rows={2} placeholder="مثال: بكالوريوس علم نفس..." />
                    </Form.Item>
                    <Form.Item name={['executiveDirector', 'description']} label="الوصف">
                      <TextArea rows={4} placeholder="وصف عن المدير التنفيذي..." />
                    </Form.Item>
                  </Card>
                ),
              },
              {
                key: 'titles',
                label: 'العناوين',
                children: (
                  <Card>
                    <Form.Item 
                      name={['content_board_title', 'title']} 
                      label="عنوان قسم مجلس الإدارة"
                      initialValue="أعضاء مجلس الإدارة"
                    >
                      <Input placeholder="أعضاء مجلس الإدارة" />
                    </Form.Item>
                    <Form.Item 
                      name={['content_staff_title', 'title']} 
                      label="عنوان قسم موظفو الجمعية"
                      initialValue="موظفو الجمعية"
                    >
                      <Input placeholder="موظفو الجمعية" />
                    </Form.Item>
                  </Card>
                ),
              },
            ]}
          />
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={pageSaving}
              onClick={handleSavePageContent}
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
      <h1 className="page-title">فريق العمل / مجلس الإدارة</h1>
      <Tabs
        items={mainTabs}
        activeKey={activeTab}
        onChange={handleMainTabChange}
      />
    </AdminLayout>
  );
}

