"use client";
import { useState, useEffect } from 'react';
import { Tabs, Card, Statistic, Badge, Table, Tag, Modal, Form, Input, Select, App, Space, Popconfirm, Button } from 'antd';
import { 
  UserAddOutlined, 
  HeartOutlined, 
  IdcardOutlined, 
  TeamOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

export default function AllApplicationsPage() {
  const [activeTab, setActiveTab] = useState('volunteering');
  const [stats, setStats] = useState({
    volunteering: { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 },
    membership: { total: 0, pending: 0, reviewed: 0, approved: 0, rejected: 0 },
    jobs: { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 },
    partnership: { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 },
  });
  const { message } = App.useApp();
  
  // Data states
  const [volunteeringApps, setVolunteeringApps] = useState<any[]>([]);
  const [membershipApps, setMembershipApps] = useState<any[]>([]);
  const [jobApps, setJobApps] = useState<any[]>([]);
  const [partnershipReqs, setPartnershipReqs] = useState<any[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [volunteeringLoading, setVolunteeringLoading] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [partnershipLoading, setPartnershipLoading] = useState(false);
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadAllStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'volunteering') loadVolunteeringApplications();
    if (activeTab === 'membership') loadMembershipApplications();
    if (activeTab === 'jobs') loadJobApplications();
    if (activeTab === 'partnership') loadPartnershipRequests();
  }, [activeTab, statusFilter]);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      
      // Load all stats in parallel
      const [volunteeringData, membershipData, jobsData, partnershipData] = await Promise.all([
        api.listVolunteeringApplications().catch(() => ({ applications: [] })),
        api.listMembershipApplications().catch(() => ({ applications: [] })),
        api.listJobApplications().catch(() => ({ applications: [] })),
        api.listPartnershipRequests().catch(() => ({ requests: [] })),
      ]);

      const volunteeringApps = volunteeringData.applications || [];
      const membershipApps = membershipData.applications || [];
      const jobsApps = jobsData.applications || [];
      const partnershipReqs = partnershipData.requests || [];

      setStats({
        volunteering: {
          total: volunteeringApps.length,
          pending: volunteeringApps.filter((a: any) => a.status === 'pending').length,
          reviewed: volunteeringApps.filter((a: any) => a.status === 'reviewed').length,
          accepted: volunteeringApps.filter((a: any) => a.status === 'accepted').length,
          rejected: volunteeringApps.filter((a: any) => a.status === 'rejected').length,
        },
        membership: {
          total: membershipApps.length,
          pending: membershipApps.filter((a: any) => a.status === 'pending').length,
          reviewed: membershipApps.filter((a: any) => a.status === 'reviewed').length,
          approved: membershipApps.filter((a: any) => a.status === 'approved').length,
          rejected: membershipApps.filter((a: any) => a.status === 'rejected').length,
        },
        jobs: {
          total: jobsApps.length,
          pending: jobsApps.filter((a: any) => a.status === 'pending').length,
          reviewed: jobsApps.filter((a: any) => a.status === 'reviewed').length,
          accepted: jobsApps.filter((a: any) => a.status === 'accepted').length,
          rejected: jobsApps.filter((a: any) => a.status === 'rejected').length,
        },
        partnership: {
          total: partnershipReqs.length,
          pending: partnershipReqs.filter((a: any) => a.status === 'pending').length,
          reviewed: partnershipReqs.filter((a: any) => a.status === 'reviewed').length,
          accepted: partnershipReqs.filter((a: any) => a.status === 'accepted').length,
          rejected: partnershipReqs.filter((a: any) => a.status === 'rejected').length,
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteeringApplications = async () => {
    try {
      setVolunteeringLoading(true);
      const data = await api.listVolunteeringApplications(statusFilter ? { status: statusFilter } : undefined);
      setVolunteeringApps(data.applications || []);
    } catch (error: any) {
      message.error('فشل جلب طلبات التطوع: ' + error.message);
    } finally {
      setVolunteeringLoading(false);
    }
  };

  const loadMembershipApplications = async () => {
    try {
      setMembershipLoading(true);
      const data = await api.listMembershipApplications(statusFilter || undefined);
      setMembershipApps(data.applications || []);
    } catch (error: any) {
      message.error('فشل جلب طلبات العضوية: ' + error.message);
    } finally {
      setMembershipLoading(false);
    }
  };

  const loadJobApplications = async () => {
    try {
      setJobsLoading(true);
      const data = await api.listJobApplications(statusFilter || undefined);
      setJobApps(data.applications || []);
    } catch (error: any) {
      message.error('فشل جلب طلبات الوظائف: ' + error.message);
    } finally {
      setJobsLoading(false);
    }
  };

  const loadPartnershipRequests = async () => {
    try {
      setPartnershipLoading(true);
      const data = await api.listPartnershipRequests(statusFilter || undefined);
      setPartnershipReqs(data.requests || []);
    } catch (error: any) {
      message.error('فشل جلب طلبات الشراكة: ' + error.message);
    } finally {
      setPartnershipLoading(false);
    }
  };

  const handleView = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    form.setFieldsValue({
      status: item.status,
      notes: item.notes || '',
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const { type, id } = selectedItem;

      if (type === 'volunteering') {
        await api.updateVolunteeringApplication(id, values);
      } else if (type === 'membership') {
        await api.updateMembershipApplication(id, values);
      } else if (type === 'jobs') {
        await api.updateJobApplication(id, values);
      } else if (type === 'partnership') {
        await api.updatePartnershipRequest(id, values);
      }

      message.success('تم تحديث حالة الطلب بنجاح');
      setModalVisible(false);
      
      // Reload data
      if (activeTab === 'volunteering') loadVolunteeringApplications();
      if (activeTab === 'membership') loadMembershipApplications();
      if (activeTab === 'jobs') loadJobApplications();
      if (activeTab === 'partnership') loadPartnershipRequests();
      loadAllStats();
    } catch (error: any) {
      message.error('فشل تحديث الطلب: ' + error.message);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    try {
      if (type === 'volunteering') {
        await api.deleteVolunteeringApplication(id);
      } else if (type === 'membership') {
        await api.deleteMembershipApplication(id);
      } else if (type === 'jobs') {
        await api.deleteJobApplication(id);
      } else if (type === 'partnership') {
        await api.deletePartnershipRequest(id);
      }

      message.success('تم حذف الطلب بنجاح');
      
      // Reload data
      if (activeTab === 'volunteering') loadVolunteeringApplications();
      if (activeTab === 'membership') loadMembershipApplications();
      if (activeTab === 'jobs') loadJobApplications();
      if (activeTab === 'partnership') loadPartnershipRequests();
      loadAllStats();
    } catch (error: any) {
      message.error('فشل حذف الطلب: ' + error.message);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: any = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'قيد المراجعة' },
      reviewed: { color: 'blue', icon: <EyeOutlined />, text: 'تمت المراجعة' },
      accepted: { color: 'green', icon: <CheckCircleOutlined />, text: 'مقبول' },
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

  const getTotalPending = () => {
    return stats.volunteering.pending + stats.membership.pending + stats.jobs.pending + stats.partnership.pending;
  };

  const getTotalAccepted = () => {
    return stats.volunteering.accepted + stats.membership.approved + stats.jobs.accepted + stats.partnership.accepted;
  };

  const getTotalRejected = () => {
    return stats.volunteering.rejected + stats.membership.rejected + stats.jobs.rejected + stats.partnership.rejected;
  };

  // Volunteering columns
  const volunteeringColumns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
    { title: 'رقم الجوال', dataIndex: 'phone', key: 'phone' },
    { title: 'مجال الاهتمام', dataIndex: 'interest', key: 'interest' },
    { title: 'الحالة', dataIndex: 'status', key: 'status', render: getStatusTag },
    { title: 'تاريخ الطلب', dataIndex: 'created_at', key: 'created_at', render: (date: string) => new Date(date).toLocaleDateString('ar-SA') },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record, 'volunteering')}>عرض</Button>
          <Popconfirm title="هل أنت متأكد من حذف هذا الطلب؟" onConfirm={() => handleDelete(record.id, 'volunteering')} okText="نعم" cancelText="لا">
            <Button type="link" danger icon={<DeleteOutlined />}>حذف</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Membership columns
  const membershipColumns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
    { title: 'رقم الجوال', dataIndex: 'phone', key: 'phone' },
    { title: 'نوع العضوية', dataIndex: 'membership_type', key: 'membership_type' },
    { title: 'الحالة', dataIndex: 'status', key: 'status', render: getStatusTag },
    { title: 'تاريخ الطلب', dataIndex: 'created_at', key: 'created_at', render: (date: string) => new Date(date).toLocaleDateString('ar-SA') },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record, 'membership')}>عرض</Button>
          <Popconfirm title="هل أنت متأكد من حذف هذا الطلب؟" onConfirm={() => handleDelete(record.id, 'membership')} okText="نعم" cancelText="لا">
            <Button type="link" danger icon={<DeleteOutlined />}>حذف</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Jobs columns
  const jobsColumns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
    { title: 'رقم الجوال', dataIndex: 'phone', key: 'phone' },
    { title: 'الوظيفة', dataIndex: 'job_title', key: 'job_title' },
    { title: 'الحالة', dataIndex: 'status', key: 'status', render: getStatusTag },
    { title: 'تاريخ الطلب', dataIndex: 'created_at', key: 'created_at', render: (date: string) => new Date(date).toLocaleDateString('ar-SA') },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record, 'jobs')}>عرض</Button>
          <Popconfirm title="هل أنت متأكد من حذف هذا الطلب؟" onConfirm={() => handleDelete(record.id, 'jobs')} okText="نعم" cancelText="لا">
            <Button type="link" danger icon={<DeleteOutlined />}>حذف</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Partnership columns
  const partnershipColumns = [
    { title: 'اسم المؤسسة', dataIndex: 'organization_name', key: 'organization_name' },
    { title: 'اسم المسؤول', dataIndex: 'contact_name', key: 'contact_name' },
    { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
    { title: 'نوع الشراكة', dataIndex: 'partnership_type_title', key: 'partnership_type_title' },
    { title: 'الحالة', dataIndex: 'status', key: 'status', render: getStatusTag },
    { title: 'تاريخ الطلب', dataIndex: 'created_at', key: 'created_at', render: (date: string) => new Date(date).toLocaleDateString('ar-SA') },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record, 'partnership')}>عرض</Button>
          <Popconfirm title="هل أنت متأكد من حذف هذا الطلب؟" onConfirm={() => handleDelete(record.id, 'partnership')} okText="نعم" cancelText="لا">
            <Button type="link" danger icon={<DeleteOutlined />}>حذف</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderModalContent = () => {
    if (!selectedItem) return null;

    const { type } = selectedItem;
    
    if (type === 'volunteering') {
      return (
        <div>
          <h3 className="font-bold mb-2">معلومات المتقدم:</h3>
          <p><strong>الاسم:</strong> {selectedItem.name}</p>
          <p><strong>البريد الإلكتروني:</strong> {selectedItem.email}</p>
          <p><strong>رقم الجوال:</strong> {selectedItem.phone}</p>
          {selectedItem.age && <p><strong>العمر:</strong> {selectedItem.age}</p>}
          {selectedItem.education && <p><strong>المؤهل التعليمي:</strong> {selectedItem.education}</p>}
          {selectedItem.interest && <p><strong>مجال الاهتمام:</strong> {selectedItem.interest}</p>}
          {selectedItem.experience && <p><strong>الخبرات:</strong> {selectedItem.experience}</p>}
          {selectedItem.message && <p><strong>رسالة:</strong> {selectedItem.message}</p>}
          <p><strong>تاريخ الطلب:</strong> {new Date(selectedItem.created_at).toLocaleString('ar-SA')}</p>
        </div>
      );
    }

    if (type === 'membership') {
      return (
        <div>
          <h3 className="font-bold mb-2">معلومات المتقدم:</h3>
          <p><strong>الاسم:</strong> {selectedItem.name}</p>
          <p><strong>البريد الإلكتروني:</strong> {selectedItem.email}</p>
          <p><strong>رقم الجوال:</strong> {selectedItem.phone}</p>
          <p><strong>رقم الهوية:</strong> {selectedItem.id_number}</p>
          <p><strong>نوع العضوية:</strong> {selectedItem.membership_type}</p>
          <p><strong>المهنة:</strong> {selectedItem.occupation || '-'}</p>
          <p><strong>العنوان:</strong> {selectedItem.address || '-'}</p>
          <p><strong>سبب الانضمام:</strong> {selectedItem.reason || '-'}</p>
          <p><strong>تاريخ الطلب:</strong> {new Date(selectedItem.created_at).toLocaleString('ar-SA')}</p>
        </div>
      );
    }

    if (type === 'jobs') {
      return (
        <div>
          <h3 className="font-bold mb-2">معلومات المتقدم:</h3>
          <p><strong>الاسم:</strong> {selectedItem.name}</p>
          <p><strong>البريد الإلكتروني:</strong> {selectedItem.email}</p>
          <p><strong>رقم الجوال:</strong> {selectedItem.phone}</p>
          <p><strong>الوظيفة:</strong> {selectedItem.job_title || '-'}</p>
          {selectedItem.resume_url && <p><strong>رابط السيرة الذاتية:</strong> <a href={selectedItem.resume_url} target="_blank" rel="noreferrer">عرض</a></p>}
          {selectedItem.cover_letter && <p><strong>رسالة التقديم:</strong> {selectedItem.cover_letter}</p>}
          <p><strong>تاريخ الطلب:</strong> {new Date(selectedItem.created_at).toLocaleString('ar-SA')}</p>
        </div>
      );
    }

    if (type === 'partnership') {
      return (
        <div>
          <h3 className="font-bold mb-2">معلومات المؤسسة:</h3>
          <p><strong>اسم المؤسسة:</strong> {selectedItem.organization_name}</p>
          <p><strong>اسم المسؤول:</strong> {selectedItem.contact_name}</p>
          <p><strong>البريد الإلكتروني:</strong> {selectedItem.email}</p>
          <p><strong>رقم الجوال:</strong> {selectedItem.phone || '-'}</p>
          <p><strong>نوع المؤسسة:</strong> {selectedItem.organization_type || '-'}</p>
          <p><strong>نوع الشراكة:</strong> {selectedItem.partnership_type_title || '-'}</p>
          {selectedItem.website && <p><strong>الموقع الإلكتروني:</strong> <a href={selectedItem.website} target="_blank" rel="noreferrer">{selectedItem.website}</a></p>}
          {selectedItem.description && <p><strong>الوصف:</strong> {selectedItem.description}</p>}
          {selectedItem.partnership_proposal && <p><strong>اقتراح الشراكة:</strong> {selectedItem.partnership_proposal}</p>}
          <p><strong>تاريخ الطلب:</strong> {new Date(selectedItem.created_at).toLocaleString('ar-SA')}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="page-title">جميع الطلبات</h1>
        <p className="text-gray-600 mt-2">إدارة جميع طلبات ورسائل الموقع من مكان واحد</p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <Statistic
            title="إجمالي قيد المراجعة"
            value={getTotalPending()}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="إجمالي المقبول"
            value={getTotalAccepted()}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="إجمالي المرفوض"
            value={getTotalRejected()}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="إجمالي الطلبات"
            value={stats.volunteering.total + stats.membership.total + stats.jobs.total + stats.partnership.total}
            valueStyle={{ color: '#1890ff' }}
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
          <Option value="accepted">مقبول</Option>
          <Option value="approved">مقبول</Option>
          <Option value="rejected">مرفوض</Option>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large">
        <TabPane
          tab={
            <span>
              <HeartOutlined />
              طلبات التطوع
              {stats.volunteering.pending > 0 && <Badge count={stats.volunteering.pending} offset={[8, -2]} />}
            </span>
          }
          key="volunteering"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card size="small"><Statistic title="الإجمالي" value={stats.volunteering.total} /></Card>
            <Card size="small"><Statistic title="قيد المراجعة" value={stats.volunteering.pending} valueStyle={{ color: '#fa8c16' }} /></Card>
            <Card size="small"><Statistic title="مقبول" value={stats.volunteering.accepted} valueStyle={{ color: '#52c41a' }} /></Card>
            <Card size="small"><Statistic title="مرفوض" value={stats.volunteering.rejected} valueStyle={{ color: '#ff4d4f' }} /></Card>
          </div>
          <Table
            columns={volunteeringColumns}
            dataSource={volunteeringApps}
            loading={volunteeringLoading}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <UserAddOutlined />
              طلبات العضوية
              {stats.membership.pending > 0 && <Badge count={stats.membership.pending} offset={[8, -2]} />}
            </span>
          }
          key="membership"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card size="small"><Statistic title="الإجمالي" value={stats.membership.total} /></Card>
            <Card size="small"><Statistic title="قيد المراجعة" value={stats.membership.pending} valueStyle={{ color: '#fa8c16' }} /></Card>
            <Card size="small"><Statistic title="مقبول" value={stats.membership.approved} valueStyle={{ color: '#52c41a' }} /></Card>
            <Card size="small"><Statistic title="مرفوض" value={stats.membership.rejected} valueStyle={{ color: '#ff4d4f' }} /></Card>
          </div>
          <Table
            columns={membershipColumns}
            dataSource={membershipApps}
            loading={membershipLoading}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <IdcardOutlined />
              طلبات الوظائف
              {stats.jobs.pending > 0 && <Badge count={stats.jobs.pending} offset={[8, -2]} />}
            </span>
          }
          key="jobs"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card size="small"><Statistic title="الإجمالي" value={stats.jobs.total} /></Card>
            <Card size="small"><Statistic title="قيد المراجعة" value={stats.jobs.pending} valueStyle={{ color: '#fa8c16' }} /></Card>
            <Card size="small"><Statistic title="مقبول" value={stats.jobs.accepted} valueStyle={{ color: '#52c41a' }} /></Card>
            <Card size="small"><Statistic title="مرفوض" value={stats.jobs.rejected} valueStyle={{ color: '#ff4d4f' }} /></Card>
          </div>
          <Table
            columns={jobsColumns}
            dataSource={jobApps}
            loading={jobsLoading}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <TeamOutlined />
              طلبات الشراكة
              {stats.partnership.pending > 0 && <Badge count={stats.partnership.pending} offset={[8, -2]} />}
            </span>
          }
          key="partnership"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card size="small"><Statistic title="الإجمالي" value={stats.partnership.total} /></Card>
            <Card size="small"><Statistic title="قيد المراجعة" value={stats.partnership.pending} valueStyle={{ color: '#fa8c16' }} /></Card>
            <Card size="small"><Statistic title="مقبول" value={stats.partnership.accepted} valueStyle={{ color: '#52c41a' }} /></Card>
            <Card size="small"><Statistic title="مرفوض" value={stats.partnership.rejected} valueStyle={{ color: '#ff4d4f' }} /></Card>
          </div>
          <Table
            columns={partnershipColumns}
            dataSource={partnershipReqs}
            loading={partnershipLoading}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </TabPane>
      </Tabs>

      {/* View/Edit Modal */}
      <Modal
        title={`تفاصيل ${selectedItem?.type === 'volunteering' ? 'طلب التطوع' : selectedItem?.type === 'membership' ? 'طلب العضوية' : selectedItem?.type === 'jobs' ? 'طلب الوظيفة' : 'طلب الشراكة'}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>إلغاء</Button>,
          <Button key="submit" type="primary" onClick={handleUpdate}>حفظ التغييرات</Button>,
        ]}
        width={800}
      >
        {renderModalContent()}
        <div className="mt-4">
          <Form form={form} layout="vertical">
            <Form.Item
              name="status"
              label="الحالة"
              rules={[{ required: true, message: 'الرجاء اختيار الحالة' }]}
            >
              <Select>
                <Option value="pending">قيد المراجعة</Option>
                <Option value="reviewed">تمت المراجعة</Option>
                {selectedItem?.type === 'membership' ? (
                  <>
                    <Option value="approved">مقبول</Option>
                    <Option value="rejected">مرفوض</Option>
                  </>
                ) : (
                  <>
                    <Option value="accepted">مقبول</Option>
                    <Option value="rejected">مرفوض</Option>
                  </>
                )}
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="ملاحظات">
              <TextArea rows={4} placeholder="أضف ملاحظات حول هذا الطلب..." />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </AdminLayout>
  );
}
