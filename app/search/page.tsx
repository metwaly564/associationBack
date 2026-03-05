"use client";
import { useState } from 'react';
import { Input, Button, Card, List, Tag, Empty, Spin, Tabs } from 'antd';
import { SearchOutlined, FileTextOutlined, TeamOutlined, ProjectOutlined, ReadOutlined, HeartOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import { AdminLayout } from '@/components/AdminLayout';
import { api } from '@/lib/apiClient';

const { Search } = Input;

interface SearchResult {
  type: string;
  id: string;
  title: string;
  description?: string;
  url: string;
  metadata?: any;
}

const typeLabels: Record<string, string> = {
  news: 'أخبار',
  projects: 'مشاريع',
  pages: 'صفحات',
  team: 'فريق العمل',
  members: 'أعضاء',
  donations: 'تبرعات',
  donors: 'متبرعون',
  applications: 'طلبات',
  content: 'محتوى',
};

const typeIcons: Record<string, any> = {
  news: <ReadOutlined />,
  projects: <ProjectOutlined />,
  pages: <FileTextOutlined />,
  team: <TeamOutlined />,
  members: <UserOutlined />,
  donations: <DollarOutlined />,
  donors: <HeartOutlined />,
  applications: <FileTextOutlined />,
  content: <FileTextOutlined />,
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      const data = await api.search(value);
      setResults(data);
      setQuery(value);
    } catch (error: any) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(r => r.type === activeTab);

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const tabs = [
    { key: 'all', label: 'الكل' },
    ...Object.keys(typeLabels).map(key => ({
      key,
      label: `${typeLabels[key]} (${results.filter(r => r.type === key).length})`,
    })).filter(tab => results.some(r => r.type === tab.key)),
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="page-title">البحث العام</h1>
        <p className="text-gray-600 mt-2">ابحث في جميع محتويات الموقع</p>
      </div>

      <Card className="mb-6">
        <Search
          placeholder="اكتب كلمة البحث..."
          allowClear
          enterButton={<Button type="primary" icon={<SearchOutlined />}>بحث</Button>}
          size="large"
          onSearch={handleSearch}
          loading={searching}
        />
      </Card>

      {searching && (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">جاري البحث...</p>
        </div>
      )}

      {!searching && query && results.length === 0 && (
        <Empty
          description="لم يتم العثور على نتائج"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {!searching && results.length > 0 && (
        <div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
            className="mb-4"
          />

          <div className="space-y-6">
            {Object.entries(groupedResults).map(([type, items]) => (
              <Card
                key={type}
                title={
                  <div className="flex items-center gap-2">
                    {typeIcons[type]}
                    <span>{typeLabels[type] || type}</span>
                    <Tag>{items.length}</Tag>
                  </div>
                }
              >
                <List
                  dataSource={items}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <a href={item.url} className="text-blue-600 hover:underline">
                            {item.title}
                          </a>
                        }
                        description={
                          <div>
                            {item.description && (
                              <p className="text-gray-600 mb-2">{item.description}</p>
                            )}
                            <Tag color="blue">{typeLabels[item.type] || item.type}</Tag>
                            {item.metadata && (
                              <span className="text-xs text-gray-500 mr-2">
                                {JSON.stringify(item.metadata)}
                              </span>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center text-gray-500">
            تم العثور على {results.length} نتيجة للبحث عن "{query}"
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
