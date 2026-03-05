"use client";
import { Button, Card, Form, Input, App } from 'antd';
import { useAuth } from '@/lib/authContext';
import { useState } from 'react';

export default function LoginPage() {
  const { message } = App.useApp();
  const { signIn, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    const { error } = await signIn(values.email, values.password);
    setLoading(false);

    if (error) {
      message.error(error.message || 'بيانات الدخول غير صحيحة');
    }
  };

  return (
    <Card title={<span className="page-title">تسجيل الدخول</span>} style={{ maxWidth: 420, margin: '64px auto' }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item 
          name="email" 
          label="البريد الإلكتروني" 
          rules={[
            { required: true, message: 'الرجاء إدخال البريد الإلكتروني' },
            { type: 'email', message: 'البريد الإلكتروني غير صحيح' }
          ]}
        >
          <Input placeholder="example@email.com" type="email" />
        </Form.Item>
        <Form.Item 
          name="password" 
          label="كلمة المرور" 
          rules={[{ required: true, message: 'الرجاء إدخال كلمة المرور' }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading || authLoading}>
            دخول
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

