"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { Form, Input, Button, Select, Space, App, Popconfirm } from "antd";
import { UploadField } from "@/components/UploadField";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;
const TextArea = Input.TextArea;

export default function EditOperationalPlanPage() {
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (params?.id) {
      axios
        .get(`/api/operational-budgets/${params.id}`)
        .then((res) => {
          const d = res.data;
          const initialFile = d.file_url
            ? [
                {
                  uid: "-1",
                  name: d.file_name || "الملف الحالي",
                  status: "done" as const,
                  url: d.file_url,
                },
              ]
            : [];
          form.setFieldsValue({
            title: d.title,
            year: d.year,
            type: d.type || "plan",
            description: d.description || "",
            fileUrl: d.file_url || "",
            file: initialFile,
          });
        })
        .catch(() => {
          message.error("فشل جلب البيانات");
          router.push("/governance/operational-plan");
        })
        .finally(() => setFetching(false));
    }
  }, [params?.id]);

  const onFinish = async (values: any) => {
    let file_url = values.fileUrl || "";
    let file_name = "";

    if (values.file && values.file.length > 0) {
      const f = values.file[0];
      if (f.response) {
        file_url = f.response.url || f.response.file_url || "";
        file_name = f.response.filename || f.name || "";
      } else if (f.url) {
        file_url = f.url;
        file_name = f.name || "";
      }
    }

    if (!file_url) {
      message.error("الرجاء رفع ملف PDF أو إدخال رابط الملف");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/api/operational-budgets/${params?.id}`, {
        title: values.title,
        year: values.year ? Number(values.year) : null,
        type: values.type || "plan",
        description: values.description || null,
        file_url: file_url || null,
        file_name: file_name || null,
      });
      message.success("تم التحديث بنجاح");
      router.push("/governance/operational-plan");
    } catch (error: any) {
      message.error(error?.response?.data?.error || "فشل التحديث");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/operational-budgets/${params?.id}`);
      message.success("تم الحذف بنجاح");
      router.push("/governance/operational-plan");
    } catch {
      message.error("فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">جاري التحميل...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="page-title mb-6">تعديل خطة تشغيلية / موازنة</h1>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="عنوان الملف"
          rules={[{ required: true, message: "أدخل العنوان" }]}
        >
          <Input placeholder="مثال: الخطة التشغيلية لعام 2025" />
        </Form.Item>

        <Form.Item
          name="year"
          label="السنة"
          rules={[{ required: true, message: "أدخل السنة" }]}
        >
          <Input type="number" placeholder="مثال: 2025" />
        </Form.Item>

        <Form.Item
          name="type"
          label="نوع الملف"
          rules={[{ required: true, message: "اختر النوع" }]}
        >
          <Select placeholder="اختر النوع">
            <Option value="plan">خطة تشغيلية</Option>
            <Option value="budget">موازنة</Option>
            <Option value="both">خطة + موازنة</Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="وصف (اختياري)">
          <TextArea rows={2} placeholder="ملاحظة قصيرة عن الملف" />
        </Form.Item>

        <Form.Item name="fileUrl" label="رابط الملف (اختياري)">
          <Input placeholder="https://example.com/plan.pdf" />
        </Form.Item>

        <Form.Item
          name="file"
          label="ملف PDF (رفع جديد لاستبدال الحالي)"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <UploadField accept=".pdf" maxCount={1} />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ التعديلات
          </Button>
          <Button onClick={() => router.push("/governance/operational-plan")}>
            رجوع
          </Button>
          <Popconfirm
            title="حذف الخطة/الموازنة"
            description="هل أنت متأكد من الحذف؟"
            onConfirm={handleDelete}
            okText="نعم"
            cancelText="لا"
          >
            <Button danger icon={<DeleteOutlined />} loading={deleting}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      </Form>
    </AdminLayout>
  );
}
