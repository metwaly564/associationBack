"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { Layout, Menu, Button, App } from 'antd';
import {
	FileTextOutlined,
	TeamOutlined,
	ProjectOutlined,
	ReadOutlined,
	SettingOutlined,
	SafetyCertificateOutlined,
	ClusterOutlined,
	IdcardOutlined,
	AuditOutlined,
   HeartOutlined,
   LogoutOutlined,
   UserAddOutlined,
   SearchOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

const { Sider, Content, Header } = Layout;

const items = [
  // البحث
  {
    key: '/search',
    label: 'البحث العام',
    icon: <SearchOutlined />,
  },

  // المحتوى الأساسي
  {
    key: 'content-group',
    label: 'المحتوى الأساسي',
    icon: <FileTextOutlined />,
    children: [
      { key: '/homepage', label: 'الصفحة الرئيسية', icon: <FileTextOutlined /> },
      { key: '/news', label: 'الأخبار', icon: <ReadOutlined /> },
      { key: '/projects', label: 'المشاريع والبرامج', icon: <ProjectOutlined /> },
      { key: '/pages', label: 'الصفحات الثابتة', icon: <FileTextOutlined /> },
    ],
  },

  // من نحن
  {
    key: 'about-group',
    label: 'من نحن',
    icon: <TeamOutlined />,
    children: [
      { key: '/strategic-framework', label: 'الإطار الاستراتيجي', icon: <FileTextOutlined /> },
      { key: '/general-assembly', label: 'الجمعية العمومية', icon: <FileTextOutlined /> },
      { key: '/management-board', label: 'مجلس الإدارة', icon: <FileTextOutlined /> },
      { key: '/org-structure', label: 'الهيكل التنظيمي', icon: <ClusterOutlined /> },
      { key: '/committees', label: 'اللجان', icon: <FileTextOutlined /> },
      { key: '/offices-branches', label: 'المكاتب والفروع', icon: <FileTextOutlined /> },
      { key: '/team', label: 'فريق العمل', icon: <TeamOutlined /> },
      { key: '/members', label: 'أعضاء الجمعية', icon: <IdcardOutlined /> },
      { key: '/annual-reports', label: 'التقارير السنوية', icon: <FileTextOutlined /> },
    ],
  },

  // الطلبات والاستمارات
  {
    key: 'applications-group',
    label: 'الطلبات والاستمارات',
    icon: <FileTextOutlined />,
    children: [
      { key: '/applications', label: 'جميع الطلبات', icon: <FileTextOutlined /> },
      { key: '/volunteering-applications', label: 'طلبات التطوع', icon: <HeartOutlined /> },
      { key: '/membership-applications', label: 'طلبات العضوية', icon: <UserAddOutlined /> },
    ],
  },

  // صفحات الخدمات
  {
    key: 'services-group',
    label: 'صفحات الخدمات',
    icon: <FileTextOutlined />,
    children: [
      { key: '/volunteering', label: 'صفحة التطوع', icon: <HeartOutlined /> },
      { key: '/membership', label: 'صفحة العضوية', icon: <IdcardOutlined /> },
      { key: '/jobs', label: 'الوظائف', icon: <IdcardOutlined /> },
      { key: '/partnership', label: 'الشراكة', icon: <TeamOutlined /> },
      { key: '/contact', label: 'صفحة التواصل', icon: <FileTextOutlined /> },
    ],
  },

  // التبرعات
  {
    key: 'donations-group',
    label: 'التبرعات',
    icon: <HeartOutlined />,
    children: [
      { key: '/donate', label: 'صفحة التبرع', icon: <FileTextOutlined /> },
      { key: '/donations/products', label: 'منتجات التبرع' },
      { key: '/donations/list', label: 'قائمة التبرعات' },
      { key: '/donors', label: 'المتبرعون' },
    ],
  },

  // الحوكمة والشفافية
  {
    key: 'governance-group',
    label: 'الحوكمة والشفافية',
    icon: <AuditOutlined />,
    children: [
      { key: '/policies', label: 'الأنظمة واللوائح والسياسات' },
      { key: '/governance/operational-plan', label: 'الخطة التشغيلية والموازنة' },
      { key: '/governance/financial-statements', label: 'القوائم والتقارير المالية' },
      { key: '/governance/reports', label: 'التقارير' },
      { key: '/licenses', label: 'التراخيص والاعتمادات', icon: <SafetyCertificateOutlined /> },
      { key: '/feedback', label: 'الاستبيانات', icon: <FileTextOutlined /> },
    ],
  },

  // الإعدادات
  {
    key: '/settings',
    label: 'الإعدادات',
    icon: <SettingOutlined />,
  },
];


export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();

  // جميع مفاتيح العناصر الفرعية (المسارات الفعلية)
  const leafKeys = useMemo(() => {
    const result: string[] = [];
    const walk = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.children) {
          walk(node.children);
        } else if (node.key && typeof node.key === 'string') {
          result.push(node.key);
        }
      }
    };
    walk(items as any[]);
    return result;
  }, []);

  // اختيار المفتاح الأقرب للمسار الحالي (أطول تطابق)
  const selectedKey = useMemo(() => {
    if (!pathname) return undefined;
    let best: string | undefined;
    for (const key of leafKeys) {
      if (pathname === key || pathname.startsWith(key + '/')) {
        if (!best || key.length > best.length) {
          best = key;
        }
      }
    }
    return best;
  }, [pathname, leafKeys]);

  // المجموعات المفتوحة بناءً على المسار الحالي مع إمكانية التحكم بها
  const initialOpenKeys = useMemo(
    () =>
      items
        .filter(
          (item: any) =>
            item.children &&
            item.children.some(
              (child: any) =>
                pathname === child.key || pathname.startsWith(child.key + '/')
            )
        )
        .map((item: any) => item.key as string),
    [pathname]
  );

  const [openKeys, setOpenKeys] = useState<string[]>(initialOpenKeys);

  useEffect(() => {
    setOpenKeys(initialOpenKeys);
  }, [initialOpenKeys]);


  return (
    <App>
      <Layout
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at top left, #0f172a 0, #020617 45%, #020617 100%)',
          direction: 'rtl',
        }}
      >
        <Sider
          breakpoint="lg"
          collapsedWidth={64}
          theme="dark"
          style={{
            background: 'rgba(15,23,42,0.96)',
            borderInlineEnd: '1px solid rgba(148,163,184,0.25)',
            boxShadow: '0 0 40px rgba(15,23,42,0.65)',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 4,
              color: '#e5e7eb',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            <span>لوحة التحكم</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: '#9ca3af',
              }}
            >
              نظام إدارة المحتوى
            </span>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            items={items}
            onClick={(info) => {
              const path = info.key as string;
              // Don't navigate if it's a group key (ends with '-group')
              if (path.endsWith('-group')) {
                return;
              }
              // Navigate to the path
              router.push(path as any);
            }}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(14px)',
              borderBottom: '1px solid rgba(226,232,240,0.8)',
              marginTop: 24,
              paddingInline: 32,
              paddingBlock: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 24,
              zIndex: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  color: '#0f172a',
                }}
              >
                لوحة إدارة المحتوى
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: '#6b7280',
                  lineHeight: 1.6,
                }}
              >
                تحكم كامل في محتوى موقع الجمعية من مكان واحد
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user && (
                <span style={{ fontSize: 14, color: '#64748b' }}>
                  {user.email}
                </span>
              )}
              <Button 
                type="primary" 
                icon={<LogoutOutlined />} 
                onClick={signOut}
                style={{
                  borderRadius: 999,
                  boxShadow: '0 10px 20px rgba(59,130,246,0.35)',
                }}
              >
                تسجيل الخروج
              </Button>
            </div>
          </Header>
          <Content
            style={{
              padding: 24,
              paddingBottom: 24,
              overflow: 'auto',
              scrollbarWidth: 'thin',
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.98)',
                padding: 24,
                minHeight: 'calc(100vh - 64px - 48px)',
                borderRadius: 16,
                boxShadow:
                  '0 24px 60px rgba(15,23,42,0.22), 0 1px 0 rgba(148,163,184,0.35)',
                border: '1px solid rgba(226,232,240,0.9)',
                transition: 'box-shadow 0.2s ease-in-out, transform 0.15s ease-out',
              }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </App>
  );
}
