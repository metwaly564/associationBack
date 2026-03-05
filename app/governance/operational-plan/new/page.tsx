"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { Form, Input, Button, Select, Space, App } from "antd";
import { UploadField } from "@/components/UploadField";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Option } = Select;
const TextArea = Input.TextArea;

export default function CreateOperationalPlanPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    let file_url = values.fileUrl || "";
    let file_name = "";

    if (values.file && values.file.length > 0) {
      const res = values.file[0].response;
      if (res) {
        file_url = res.url || res.file_url || "";
        file_name = res.filename || values.file[0].name || "";
      }
    }

    if (!file_url) {
      message.error("الرجاء رفع ملف PDF أو إدخال رابط الملف");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/operational-budgets", {
        title: values.title,
        year: values.year ? Number(values.year) : null,
        type: values.type || "plan",
        description: values.description || null,
        file_url: file_url || null,
        file_name: file_name || null,
      });
      message.success("تم الحفظ بنجاح");
      router.push("/governance/operational-plan");
    } catch (error: any) {
      // عرض رسالة السيرفر + التفاصيل إن وُجدت لتوضيح سبب الخطأ
      const serverError = error?.response?.data;
      console.error("Operational budget create error:", error);
      console.error("Server response:", serverError);
      message.error(
        serverError?.error ||
          serverError?.details ||
          "فشل الحفظ، تحقق من إعدادات قاعدة البيانات وجداول الخطة التشغيلية"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="page-title mb-6">
        إضافة خطة تشغيلية / موازنة
      </h1>

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
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

        <Form.Item
          name="fileUrl"
          label="رابط الملف (اختياري - إذا كان الملف موجوداً على رابط)"
        >
          <Input placeholder="https://example.com/plan.pdf" />
        </Form.Item>

        <Form.Item
          name="file"
          label="أو رفع ملف PDF (حد أقصى 100 ميجا)"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <UploadField accept=".pdf" maxCount={1} >fffff</UploadField>
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
          <Button onClick={() => router.push("/governance/operational-plan")}>
            رجوع
          </Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
