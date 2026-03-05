"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Table, Button, Tag, Popconfirm, message, Empty, Card } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

export default function OperationalPlanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/operational-budgets");
      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      message.error("فشل تحميل البيانات");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/operational-budgets/${id}`);
      message.success("تم الحذف");
      fetchData();
    } catch {
      message.error("فشل الحذف");
    }
  };

  const columns = [
    {
      title: "العنوان",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <span className="font-medium">{text || "—"}</span>
      ),
    },
    {
      title: "السنة",
      dataIndex: "year",
      key: "year",
      width: 100,
      render: (year: number) => year || "—",
    },
    {
      title: "النوع",
      dataIndex: "type",
      key: "type",
      width: 140,
      render: (type: string) => {
        if (type === "plan") return <Tag color="blue">خطة تشغيلية</Tag>;
        if (type === "budget") return <Tag color="orange">موازنة</Tag>;
        return <Tag color="purple">خطة + موازنة</Tag>;
      },
    },
    {
      title: "الملف",
      dataIndex: "file_url",
      key: "file_url",
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            عرض الملف
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "إجراءات",
      key: "actions",
      width: 160,
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push(("/governance/operational-plan/" + record.id) as Parameters<typeof router.push>[0])}
          >
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من الحذف؟"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger size="small">
              حذف
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title m-0">
          الخطة التشغيلية والموازنة
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/governance/operational-plan/new")}
        >
          إضافة خطة / موازنة
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description="لا توجد خطط أو موازنات مضافة بعد"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  onClick={() => router.push("/governance/operational-plan/new")}
                >
                  إضافة أول خطة تشغيلية أو موازنة
                </Button>
              </Empty>
            ),
          }}
          pagination={
            data.length > 10
              ? { pageSize: 10, showSizeChanger: false, showTotal: (t) => `الإجمالي: ${t}` }
              : false
          }
        />
      </Card>
    </AdminLayout>
  );
}
