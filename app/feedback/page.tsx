"use client";
import { useState, useEffect } from 'react';
import { Table, Select, Tag, Card, Statistic, Row, Col, App } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { Option } = Select;

const surveyTypeLabels: Record<string, string> = {
  employees: 'الموظفين',
  volunteers: 'المتطوعين',
  donors: 'المتبرعين',
  beneficiaries: 'المستفيدين',
  stakeholders: 'أصحاب العلاقة',
};

export default function FeedbackSurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>({});
  const { message } = App.useApp();

  useEffect(() => {
    loadSurveys();
  }, [selectedType]);

  useEffect(() => {
    calculateStats();
  }, [surveys]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await api.listFeedbackSurveys(selectedType || undefined, 100, 0);
      setSurveys(data.surveys);
      setTotal(data.total);
    } catch (error: any) {
      message.error('فشل جلب الاستبيانات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const statsByType: any = {};
    const satisfactionCounts: any = {};

    surveys.forEach((survey) => {
      // Count by type
      if (!statsByType[survey.survey_type]) {
        statsByType[survey.survey_type] = { count: 0, totalSatisfaction: 0 };
      }
      statsByType[survey.survey_type].count++;
      statsByType[survey.survey_type].totalSatisfaction += survey.satisfaction;

      // Count by satisfaction level
      if (!satisfactionCounts[survey.satisfaction]) {
        satisfactionCounts[survey.satisfaction] = 0;
      }
      satisfactionCounts[survey.satisfaction]++;
    });

    // Calculate averages
    Object.keys(statsByType).forEach((type) => {
      statsByType[type].average = (
        statsByType[type].totalSatisfaction / statsByType[type].count
      ).toFixed(2);
    });

    setStats({ byType: statsByType, bySatisfaction: satisfactionCounts });
  };

  const columns = [
    {
      title: 'نوع الاستبيان',
      dataIndex: 'survey_type',
      key: 'survey_type',
      render: (type: string) => (
        <Tag color="blue">{surveyTypeLabels[type] || type}</Tag>
      ),
    },
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: 'العلاقة',
      dataIndex: 'relation',
      key: 'relation',
      render: (relation: string) => relation || '-',
    },
    {
      title: 'مستوى الرضا',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      render: (satisfaction: number) => (
        <Tag color={satisfaction >= 4 ? 'green' : satisfaction >= 3 ? 'orange' : 'red'}>
          {satisfaction} / 5
        </Tag>
      ),
    },
    {
      title: 'الملاحظات',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes ? (notes.length > 50 ? notes.substring(0, 50) + '...' : notes) : '-',
    },
    {
      title: 'تاريخ الإرسال',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('ar-SA'),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">الاستبيانات</h1>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="إجمالي الاستبيانات" value={total} />
          </Card>
        </Col>
        {Object.keys(stats.byType || {}).map((type) => (
          <Col span={6} key={type}>
            <Card>
              <Statistic
                title={`${surveyTypeLabels[type] || type}`}
                value={stats.byType[type].count}
                suffix={`(متوسط: ${stats.byType[type].average})`}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="فلترة حسب النوع"
          allowClear
          style={{ width: 200 }}
          value={selectedType || undefined}
          onChange={(value) => setSelectedType(value || '')}
        >
          <Option value="employees">الموظفين</Option>
          <Option value="volunteers">المتطوعين</Option>
          <Option value="donors">المتبرعين</Option>
          <Option value="beneficiaries">المستفيدين</Option>
          <Option value="stakeholders">أصحاب العلاقة</Option>
        </Select>
      </div>

      {/* Table */}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={surveys}
        columns={columns}
        pagination={{
          pageSize: 20,
          total: total,
          showTotal: (total) => `إجمالي ${total} استبيان`,
        }}
      />
    </AdminLayout>
  );
}
