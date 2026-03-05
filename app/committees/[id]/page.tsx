"use client";
import { Button, Form, Input, Space, App, InputNumber, Select, Card } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const TextArea = Input.TextArea;

export default function CommitteeEditPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadCommittee();
  }, [params.id]);

  const loadCommittee = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/committees/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('فشل جلب اللجنة');
      const data = await response.json();
      const committee = data.committee;
      
      form.setFieldsValue({
        name: committee.name,
        description: committee.description,
        type: committee.type || 'permanent',
        icon_name: committee.icon_name,
        order_index: committee.order_index || 0,
        is_active: committee.is_active !== false,
        members: committee.members || [],
        tasks: committee.tasks || [],
      });
    } catch (error: any) {
      message.error('فشل جلب اللجنة: ' + error.message);
      router.push('/committees');
    } finally {
      setLoadingData(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const payload = {
        name: values.name,
        description: values.description,
        type: values.type || 'permanent',
        icon_name: values.icon_name || null,
        order_index: values.order_index || 0,
        is_active: values.is_active !== false,
        members: values.members || [],
        tasks: values.tasks || [],
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/committees/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const msg = error.error || 'فشل تحديث اللجنة';
        const details = error.details ? `: ${error.details}` : '';
        throw new Error(msg + details);
      }
      
      message.success('تم تحديث اللجنة بنجاح');
      router.push('/committees');
    } catch (error: any) {
      message.error('فشل تحديث اللجنة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          جاري التحميل...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="page-title">تعديل لجنة</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="اسم اللجنة"
          rules={[{ required: true, message: 'اسم اللجنة مطلوب' }]}
        >
          <Input placeholder="مثال: اللجنة المالية" />
        </Form.Item>
        <Form.Item name="description" label="الوصف">
          <TextArea rows={4} placeholder="وصف اللجنة..." />
        </Form.Item>
        <Form.Item name="type" label="النوع">
          <Select>
            <Select.Option value="permanent">دائمة</Select.Option>
            <Select.Option value="temporary">مؤقتة</Select.Option>
            <Select.Option value="both">دائمة ومؤقته</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="icon_name" label="اسم الأيقونة (اختياري)">
          <Input placeholder="مثال: DollarSign, Stethoscope, Briefcase" />
        </Form.Item>
        <Form.Item name="order_index" label="الترتيب" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_active" label="الحالة" valuePropName="checked" initialValue={true}>
          <input type="checkbox" defaultChecked />
        </Form.Item>
        
        <Card title="أعضاء اللجنة" style={{ marginTop: 16 }}>
          <Form.List name="members">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="الاسم"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="اسم العضو" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'role']}
                        label="الدور"
                      >
                        <Input placeholder="مثال: رئيس اللجنة" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'position']}
                        label="المنصب"
                      >
                        <Input placeholder="مثال: عضو مجلس الإدارة" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_index']}
                        label="الترتيب"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  إضافة عضو
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="مهام اللجنة" style={{ marginTop: 16 }}>
          <Form.List name="tasks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} style={{ marginBottom: 16 }} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'task_text']}
                        label="المهمة"
                        rules={[{ required: true }]}
                      >
                        <TextArea rows={2} placeholder="وصف المهمة..." />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_index']}
                        label="الترتيب"
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        حذف
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  إضافة مهمة
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Space style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
          <Button onClick={() => router.back()}>إلغاء</Button>
        </Space>
      </Form>
    </AdminLayout>
  );
}
