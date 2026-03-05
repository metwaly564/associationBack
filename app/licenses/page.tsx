"use client";
import { Button, Input, Space, Table, App } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api, type LicenseItem } from '@/lib/apiClient';

const DEFAULT_PAGE_SIZE = 20;

export default function LicensesListPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LicenseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [q, setQ] = useState('');

  const loadLicenses = async (p: number = 1, size: number = DEFAULT_PAGE_SIZE) => {
    try {
      setLoading(true);
      const result = await api.listLicenses({ page: p, limit: size });
      setData(result.items ?? []);
      setTotal(result.total ?? 0);
      setPage(p);
      setPageSize(size);
    } catch (error: any) {
      message.error('فشل جلب التراخيص: ' + (error.message || 'حدث خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses(1, DEFAULT_PAGE_SIZE);
  }, []);

  const filtered = data.filter((i) => i.title.includes(q));
  const paginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t: number) => `الإجمالي: ${t}`,
    onChange: (p: number, size: number) => loadLicenses(p, size || pageSize),
  };

  return (
    <AdminLayout>
      <h1 className="page-title">التراخيص والاعتمادات</h1>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Space style={{ flex: 1 }} wrap>
          <Input
            placeholder="بحث باسم الترخيص"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Space>
        <Link href="/licenses/new"><Button type="primary">إضافة ترخيص</Button></Link>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={paginationConfig}
        columns={[
          { title: 'اسم الترخيص / الاعتماد', dataIndex: 'title' },
          {
            title: 'اسم الملف',
            dataIndex: 'file_name',
            render: (name?: string) => name || '—',
          },
          {
            title: 'الملف',
            dataIndex: 'file_url',
            render: (url?: string) =>
              url ? (
                <a href={url} target="_blank" rel="noreferrer">
                  عرض / تحميل
                </a>
              ) : (
                '—'
              ),
          },
          {
            title: 'إجراءات',
            render: (_, r) => (
              <Space>
                <Link href={`/licenses/${r.id}`}><Button size="small">تعديل</Button></Link>
                <Button 
                  size="small" 
                  danger 
                  onClick={async () => {
                    if (confirm('هل أنت متأكد من حذف هذا الترخيص؟')) {
                      try {
                        await api.deleteLicense(r.id);
                        message.success('تم الحذف بنجاح');
                        loadLicenses(page, pageSize);
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
    </AdminLayout>
  );
}

