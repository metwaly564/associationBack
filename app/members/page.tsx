"use client";
import { Button, Input, Radio, Space, Table, Tag, App, Popconfirm } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { api, type AssociationMember } from '@/lib/apiClient';

const categoryLabel: Record<AssociationMember['category'], string> = {
  chairman: 'رئيس',
  member: 'عضو',
};

export default function AssociationMembersListPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AssociationMember[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<AssociationMember['category'] | undefined>();

  useEffect(() => {
    loadMembers(1, 20);
  }, []);

  const loadMembers = async (pageNumber: number = 1, pageLimit: number = 20) => {
    try {
      setLoading(true);
      const result = await api.listAssociationMembers({ page: pageNumber, limit: pageLimit });
      setData(result.items);
      setPage(result.page);
      setPageSize(result.limit);
      setTotal(result.total);
    } catch (error: any) {
      message.error('فشل جلب أعضاء الجمعية: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((m) => {
    const textMatch =
      m.name.includes(q) ||
      m.position.includes(q) ||
      (m.membershipNumber && m.membershipNumber.includes(q));
    const catMatch = !cat || m.category === cat;
    return textMatch && catMatch;
  });

  return (
    <AdminLayout>
      <h1 className="page-title">أعضاء الجمعية</h1>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Space style={{ flex: 1 }} wrap>
          <Input
            placeholder="بحث بالاسم، الصفة، أو رقم العضوية"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Radio.Group
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            <Radio.Button value={undefined}>الكل</Radio.Button>
            <Radio.Button value="chairman">الرئيس</Radio.Button>
            <Radio.Button value="member">الأعضاء</Radio.Button>
          </Radio.Group>
        </Space>
        <Link href="/members/new"><Button type="primary">إضافة عضو جمعية</Button></Link>
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
            loadMembers(current, size);
          },
        }}
        scroll={{ x: 1200 }}
        columns={[
          {
            title: 'الصورة',
            dataIndex: 'photo_url',
            width: 80,
            render: (url: string) => url ? (
              <img src={url} alt="صورة" style={{ width: 50, height: 50, borderRadius: 4, objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#ccc' }}>—</span>
            ),
          },
          { title: 'الاسم', dataIndex: 'name' },
          { title: 'الصفة', dataIndex: 'position' },
          {
            title: 'التصنيف',
            dataIndex: 'category',
            render: (c: AssociationMember['category']) => (
              <Tag color={c === 'chairman' ? 'gold' : 'blue'}>{categoryLabel[c]}</Tag>
            ),
          },
          { title: 'البريد الإلكتروني', dataIndex: 'email' },
          { title: 'رقم العضوية', dataIndex: 'membershipNumber' },
          {
            title: 'إجراءات',
            render: (_, r) => (
              <Space>
                <Link href={`/members/${r.id}`}><Button size="small">تعديل</Button></Link>
                <Button 
                  size="small" 
                  danger 
                  onClick={async () => {
                    if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
                      try {
                        await api.deleteAssociationMember(r.id);
                        message.success('تم الحذف بنجاح');
                        await loadMembers(page, pageSize);
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

