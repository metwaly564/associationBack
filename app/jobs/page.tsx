"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, App, Switch, Table, Space, Popconfirm, Tag, Modal, Select } from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';
import Link from 'next/link';

const { TextArea } = Input;

export default function JobsPage() {
  const [contentForm] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { message } = App.useApp();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load jobs
      const token = localStorage.getItem('auth_token');
      const jobsResponse = await fetch('/api/jobs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!jobsResponse.ok) throw new Error('فشل جلب الوظائف');
      const jobsData = await jobsResponse.json();
      setJobs(jobsData.jobs || []);
      
      // Load applications
      await loadApplications();
      
      // Load page content
      try {
        const contentData = await api.getJobsPageContent();
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

  const loadApplications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = statusFilter 
        ? `/api/job-applications?status=${statusFilter}`
        : '/api/job-applications';
      const applicationsResponse = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData.applications || []);
      }
    } catch (error: any) {
      console.error('Error loading applications:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      loadApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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

      await api.updateJobsPageContent({ content });
      message.success('تم حفظ المحتوى بنجاح');
    } catch (error: any) {
      message.error('فشل حفظ المحتوى: ' + error.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل حذف الوظيفة');
      message.success('تم حذف الوظيفة بنجاح');
      loadData();
    } catch (error: any) {
      message.error('فشل حذف الوظيفة: ' + error.message);
    }
  };

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    applicationForm.setFieldsValue({
      status: application.status || 'pending',
      notes: application.notes || '',
    });
    setApplicationModalVisible(true);
  };

  const handleUpdateApplication = async () => {
    try {
      const values = applicationForm.getFieldsValue();
      await api.updateJobApplication(selectedApplication.id, {
        status: values.status,
        notes: values.notes,
      });
      message.success('تم تحديث طلب التوظيف بنجاح');
      setApplicationModalVisible(false);
      loadApplications();
    } catch (error: any) {
      message.error('فشل تحديث طلب التوظيف: ' + error.message);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/job-applications/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل حذف طلب التوظيف');
      message.success('تم حذف طلب التوظيف بنجاح');
      loadApplications();
    } catch (error: any) {
      message.error('فشل حذف طلب التوظيف: ' + error.message);
    }
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'full-time': 'دوام كامل',
      'part-time': 'دوام جزئي',
      'contract': 'عقد',
      'internship': 'تدريب',
    };
    return labels[type] || type;
  };

  const tabItems = [
    {
      key: 'jobs',
      label: 'قائمة الوظائف',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <Link href="/jobs/new">
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة وظيفة جديدة
              </Button>
            </Link>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={jobs}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'المسمى الوظيفي', dataIndex: 'title', key: 'title' },
              { title: 'القسم', dataIndex: 'department', key: 'department' },
              { title: 'الموقع', dataIndex: 'location', key: 'location' },
              {
                title: 'نوع التوظيف',
                dataIndex: 'employment_type',
                key: 'employment_type',
                render: (type: string) => (
                  <Tag color="blue">{getEmploymentTypeLabel(type)}</Tag>
                ),
              },
              {
                title: 'عدد الطلبات',
                dataIndex: 'applications_count',
                key: 'applications_count',
                render: (count: number) => count || 0,
              },
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
                    <Link href={`/jobs/${record.id}`}>
                      <Button size="small" icon={<EditOutlined />}>تعديل</Button>
                    </Link>
                    <Popconfirm
                      title="هل أنت متأكد من حذف هذه الوظيفة؟"
                      onConfirm={() => handleDeleteJob(record.id)}
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
      key: 'applications',
      label: 'طلبات التوظيف',
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <Select
              placeholder="فلترة حسب الحالة"
              allowClear
              style={{ width: 200 }}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || '')}
            >
              <Select.Option value="pending">قيد المراجعة</Select.Option>
              <Select.Option value="reviewed">تمت المراجعة</Select.Option>
              <Select.Option value="interviewed">مقابلة</Select.Option>
              <Select.Option value="accepted">مقبول</Select.Option>
              <Select.Option value="rejected">مرفوض</Select.Option>
            </Select>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={applications}
            pagination={{ pageSize: 10 }}
            columns={[
            { title: 'الاسم', dataIndex: 'name', key: 'name' },
            { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
            { title: 'الهاتف', dataIndex: 'phone', key: 'phone' },
            { title: 'الوظيفة', dataIndex: 'job_title', key: 'job_title' },
            {
              title: 'الحالة',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => {
                const colors: Record<string, string> = {
                  'pending': 'orange',
                  'reviewed': 'blue',
                  'interviewed': 'purple',
                  'accepted': 'green',
                  'rejected': 'red',
                };
                const labels: Record<string, string> = {
                  'pending': 'قيد المراجعة',
                  'reviewed': 'تمت المراجعة',
                  'interviewed': 'مقابلة',
                  'accepted': 'مقبول',
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
                  <Button 
                    size="small" 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewApplication(record)}
                  >
                    عرض
                  </Button>
                  <Popconfirm
                    title="هل أنت متأكد من حذف هذا الطلب؟"
                    onConfirm={() => handleDeleteApplication(record.id)}
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
              <Input placeholder="الوظائف المتاحة" />
            </Form.Item>
            <Form.Item name={['hero_title', 'subtitle']} label="العنوان الفرعي">
              <Input placeholder="انضم إلى فريقنا وكن جزءاً من رحلة التغيير" />
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
              <TextArea rows={4} placeholder="نبحث عن موظفين مبدعين..." />
            </Form.Item>
            <Form.Item name={['intro_text', 'is_active']} label="الحالة" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
            </Form.Item>
          </Card>

          <Card title="نموذج التقديم" style={{ marginTop: 16 }}>
            <Form.Item name={['form_title', 'section_key']} hidden initialValue="form_title">
              <Input />
            </Form.Item>
            <Form.Item name={['form_title', 'title']} label="عنوان النموذج">
              <Input placeholder="قدّم طلب توظيف" />
            </Form.Item>
            <Form.Item name={['form_subtitle', 'section_key']} hidden initialValue="form_subtitle">
              <Input />
            </Form.Item>
            <Form.Item name={['form_subtitle', 'description']} label="نص النموذج">
              <TextArea rows={2} placeholder="املأ النموذج أدناه وسنتواصل معك قريباً" />
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
      <h1 className="page-title">الوظائف</h1>
      <Tabs items={tabItems} />
      
      <Modal
        title="تفاصيل طلب التوظيف"
        open={applicationModalVisible}
        onOk={handleUpdateApplication}
        onCancel={() => setApplicationModalVisible(false)}
        okText="حفظ التغييرات"
        cancelText="إلغاء"
        width={800}
      >
        {selectedApplication && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>الاسم:</strong> {selectedApplication.name}</p>
              <p><strong>البريد الإلكتروني:</strong> {selectedApplication.email}</p>
              <p><strong>الهاتف:</strong> {selectedApplication.phone || 'غير متوفر'}</p>
              <p><strong>الوظيفة:</strong> {selectedApplication.job_title || 'غير محدد'}</p>
              {selectedApplication.resume_url && (
                <p>
                  <strong>رابط السيرة الذاتية:</strong>{' '}
                  <a href={selectedApplication.resume_url} target="_blank" rel="noopener noreferrer">
                    {selectedApplication.resume_url}
                  </a>
                </p>
              )}
              {selectedApplication.cover_letter && (
                <div style={{ marginTop: 16 }}>
                  <p><strong>رسالة التقديم:</strong></p>
                  <div style={{ 
                    padding: 12, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 4,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}
              <p style={{ marginTop: 16 }}>
                <strong>تاريخ التقديم:</strong>{' '}
                {new Date(selectedApplication.created_at).toLocaleDateString('ar-SA')}
              </p>
            </div>
            
            <Form form={applicationForm} layout="vertical">
              <Form.Item name="status" label="الحالة">
                <Select>
                  <Select.Option value="pending">قيد المراجعة</Select.Option>
                  <Select.Option value="reviewed">تمت المراجعة</Select.Option>
                  <Select.Option value="interviewed">مقابلة</Select.Option>
                  <Select.Option value="accepted">مقبول</Select.Option>
                  <Select.Option value="rejected">مرفوض</Select.Option>
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
