"use client";
import { Form, Input, Button, Tabs, Card, App, Space, InputNumber } from 'antd';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageInput } from '@/components/ImageInput';
import { ColorPicker } from '@/components/ColorPicker';
import { FontSelector } from '@/components/FontSelector';
import { SizeSelector } from '@/components/SizeSelector';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { api } from '@/lib/apiClient';

const TextArea = Input.TextArea;

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSiteSettings();

      // Set default values first
      const defaultValues: Record<string, any> = {
        site_name: 'جمعية الرعاية الخيرية',
        site_name_en: 'Charity Care Association',
        site_logo: '',
        site_favicon: '',
        site_description: 'نعمل على توفير الرعاية والدعم للأسر المحتاجة في مجتمعنا، ونسعى لبناء مستقبل أفضل من خلال برامجنا المتنوعة.',
        contact_email: 'info@charity-association.org',
        contact_phone: '+966 11 234 5678',
        contact_mobile: '+966 11 234 5678',
        contact_address: 'الرياض، المملكة العربية السعودية',
        contact_map_url: '',
        working_hours: 'الأحد - الخميس: 8:00 ص - 5:00 م',
        donation_phone: '',
        social_facebook: '',
        social_twitter: '',
        social_instagram: '',
        social_linkedin: '',
        social_youtube: '',
        social_whatsapp: '',
        seo_title: 'جمعية الرعاية الخيرية',
        seo_description: 'نعمل على توفير الرعاية والدعم للأسر المحتاجة في مجتمعنا، ونسعى لبناء مستقبل أفضل من خلال برامجنا المتنوعة.',
        seo_keywords: 'جمعية خيرية، رعاية، دعم، مساعدة، جمعية الرعاية الخيرية',
        footer_text: '© 2024 جمعية الرعاية الخيرية. جميع الحقوق محفوظة.',
        footer_copyright_year: '2024',
        // Color theme defaults
        primary_color: '#1f2937',
        secondary_color: '#3b82f6',
        accent_color: '#10b981',
        background_color: '#ffffff',
        header_background: '#ffffff',
        footer_background: '#f9fafb',
        text_primary: '#111827',
        text_secondary: '#6b7280',
        text_light: '#9ca3af',
        link_color: '#3b82f6',
        link_hover_color: '#2563eb',
        button_primary_bg: '#3b82f6',
        button_primary_text: '#ffffff',
        button_secondary_bg: '#f3f4f6',
        button_secondary_text: '#374151',
        card_background: '#ffffff',
        card_border: '#e5e7eb',
        border_color: '#d1d5db',
        // Font settings
        font_family_primary: 'Tajawal, sans-serif',
        font_family_headings: 'Tajawal, sans-serif',
        font_size_base: '16px',
        font_size_h1: '2.25rem',
        font_size_h2: '1.875rem',
        font_size_h3: '1.5rem',
        font_size_h4: '1.25rem',
        font_size_h5: '1.125rem',
        font_size_h6: '1rem',
        font_weight_normal: '400',
        font_weight_bold: '700',
        line_height_base: '1.6',
        line_height_headings: '1.3',
      };

      // Convert settings array to form values if settings exist
      if (data.settings && data.settings.length > 0) {
        const formValues: Record<string, any> = {};
        data.settings.forEach((setting: any) => {
          formValues[setting.setting_key] = setting.setting_value || '';
        });

        // Merge database values with defaults
        const mergedValues = { ...defaultValues, ...formValues };
        form.setFieldsValue(mergedValues);
      } else {
        // Use defaults only
        form.setFieldsValue(defaultValues);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      message.error('فشل جلب الإعدادات: ' + (error.message || 'حدث خطأ غير متوقع'));
      
      // Set default values even on error
      const defaultValues: Record<string, any> = {
        site_name: 'جمعية الرعاية الخيرية',
        site_name_en: 'Charity Care Association',
        site_logo: '',
        site_favicon: '',
        site_description: 'نعمل على توفير الرعاية والدعم للأسر المحتاجة في مجتمعنا، ونسعى لبناء مستقبل أفضل من خلال برامجنا المتنوعة.',
        contact_email: 'info@charity-association.org',
        contact_phone: '+966 11 234 5678',
        contact_mobile: '+966 11 234 5678',
        contact_address: 'الرياض، المملكة العربية السعودية',
        contact_map_url: '',
        working_hours: 'الأحد - الخميس: 8:00 ص - 5:00 م',
        donation_phone: '',
        social_facebook: '',
        social_twitter: '',
        social_instagram: '',
        social_linkedin: '',
        social_youtube: '',
        social_whatsapp: '',
        seo_title: 'جمعية الرعاية الخيرية',
        seo_description: 'نعمل على توفير الرعاية والدعم للأسر المحتاجة في مجتمعنا، ونسعى لبناء مستقبل أفضل من خلال برامجنا المتنوعة.',
        seo_keywords: 'جمعية خيرية، رعاية، دعم، مساعدة، جمعية الرعاية الخيرية',
        footer_text: '© 2024 جمعية الرعاية الخيرية. جميع الحقوق محفوظة.',
        footer_copyright_year: '2024',
        // Color theme defaults
        primary_color: '#1f2937',
        secondary_color: '#3b82f6',
        accent_color: '#10b981',
        background_color: '#ffffff',
        header_background: '#ffffff',
        footer_background: '#f9fafb',
        text_primary: '#111827',
        text_secondary: '#6b7280',
        text_light: '#9ca3af',
        link_color: '#3b82f6',
        link_hover_color: '#2563eb',
        button_primary_bg: '#3b82f6',
        button_primary_text: '#ffffff',
        button_secondary_bg: '#f3f4f6',
        button_secondary_text: '#374151',
        card_background: '#ffffff',
        card_border: '#e5e7eb',
        border_color: '#d1d5db',
        // Font settings
        font_family_primary: 'Tajawal, sans-serif',
        font_family_headings: 'Tajawal, sans-serif',
        font_size_base: '16px',
        font_size_h1: '2.25rem',
        font_size_h2: '1.875rem',
        font_size_h3: '1.5rem',
        font_size_h4: '1.25rem',
        font_size_h5: '1.125rem',
        font_size_h6: '1rem',
        font_weight_normal: '400',
        font_weight_bold: '700',
        line_height_base: '1.6',
        line_height_headings: '1.3',
      };
      form.setFieldsValue(defaultValues);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = form.getFieldsValue();

      console.log('💾 Saving settings:', values);

      // Convert form values back to settings array
      const settings = Object.keys(values).map((key) => {
        // Get setting metadata from default settings
        const settingMeta = getSettingMeta(key);
        const setting = {
          setting_key: key,
          setting_value: values[key] || null,
          setting_type: settingMeta.type,
          description: settingMeta.description,
          category: settingMeta.category,
          order_index: settingMeta.order,
        };
        console.log(`📤 Setting to save: ${key} = ${values[key]} (${settingMeta.type})`);
        return setting;
      });

      console.log('📦 Total settings to save:', settings.length);
      await api.updateSiteSettings({ settings });
      message.success('تم حفظ الإعدادات بنجاح! سيتم تطبيق التغييرات على الموقع خلال 30 ثانية كحد أقصى.');

      // Auto-reload after 2 seconds to show changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Save error:', error);
      message.error('فشل حفظ الإعدادات: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getSettingMeta = (key: string) => {
    const meta: Record<string, any> = {
      // General
      site_name: { type: 'text', description: 'اسم الموقع', category: 'general', order: 1 },
      site_name_en: { type: 'text', description: 'اسم الموقع بالإنجليزية', category: 'general', order: 2 },
      site_logo: { type: 'image', description: 'شعار الموقع', category: 'general', order: 3 },
      site_favicon: { type: 'image', description: 'أيقونة الموقع (Favicon)', category: 'general', order: 4 },
      site_description: { type: 'text', description: 'وصف الموقع', category: 'general', order: 5 },
      // Contact
      contact_email: { type: 'email', description: 'البريد الإلكتروني', category: 'contact', order: 10 },
      contact_phone: { type: 'phone', description: 'رقم الهاتف', category: 'contact', order: 11 },
      contact_mobile: { type: 'phone', description: 'رقم الجوال', category: 'contact', order: 12 },
      contact_address: { type: 'text', description: 'العنوان', category: 'contact', order: 13 },
      contact_map_url: { type: 'url', description: 'رابط الخريطة', category: 'contact', order: 14 },
      working_hours: { type: 'text', description: 'ساعات العمل', category: 'contact', order: 15 },
      donation_phone: { type: 'phone', description: 'رقم التبرع', category: 'contact', order: 16 },
      // Social
      social_facebook: { type: 'url', description: 'رابط فيسبوك', category: 'social', order: 20 },
      social_twitter: { type: 'url', description: 'رابط تويتر', category: 'social', order: 21 },
      social_instagram: { type: 'url', description: 'رابط إنستغرام', category: 'social', order: 22 },
      social_linkedin: { type: 'url', description: 'رابط لينكد إن', category: 'social', order: 23 },
      social_youtube: { type: 'url', description: 'رابط يوتيوب', category: 'social', order: 24 },
      social_whatsapp: { type: 'phone', description: 'رقم واتساب', category: 'social', order: 25 },
      // SEO
      seo_title: { type: 'text', description: 'عنوان SEO', category: 'seo', order: 30 },
      seo_description: { type: 'text', description: 'وصف SEO', category: 'seo', order: 31 },
      seo_keywords: { type: 'text', description: 'كلمات مفتاحية', category: 'seo', order: 32 },
      // Footer
      footer_text: { type: 'text', description: 'نص الفوتر', category: 'footer', order: 40 },
      footer_copyright_year: { type: 'text', description: 'سنة حقوق النشر', category: 'footer', order: 41 },
      // Typography
      font_family_primary: { type: 'font', description: 'الخط الأساسي', category: 'typography', order: 200 },
      font_family_headings: { type: 'font', description: 'خط العناوين', category: 'typography', order: 201 },
      font_size_base: { type: 'size', description: 'حجم الخط الأساسي', category: 'typography', order: 202 },
      font_size_h1: { type: 'size', description: 'حجم عنوان H1', category: 'typography', order: 203 },
      font_size_h2: { type: 'size', description: 'حجم عنوان H2', category: 'typography', order: 204 },
      font_size_h3: { type: 'size', description: 'حجم عنوان H3', category: 'typography', order: 205 },
      font_size_h4: { type: 'size', description: 'حجم عنوان H4', category: 'typography', order: 206 },
      font_size_h5: { type: 'size', description: 'حجم عنوان H5', category: 'typography', order: 207 },
      font_size_h6: { type: 'size', description: 'حجم عنوان H6', category: 'typography', order: 208 },
      font_weight_normal: { type: 'weight', description: 'وزن الخط العادي', category: 'typography', order: 209 },
      font_weight_bold: { type: 'weight', description: 'وزن الخط الجريء', category: 'typography', order: 210 },
      line_height_base: { type: 'height', description: 'ارتفاع السطر الأساسي', category: 'typography', order: 211 },
      line_height_headings: { type: 'height', description: 'ارتفاع السطر للعناوين', category: 'typography', order: 212 },
      // Theme Colors
      primary_color: { type: 'color', description: 'اللون الأساسي الرئيسي', category: 'theme', order: 100 },
      secondary_color: { type: 'color', description: 'اللون الثانوي', category: 'theme', order: 101 },
      accent_color: { type: 'color', description: 'لون التمييز', category: 'theme', order: 102 },
      background_color: { type: 'color', description: 'لون خلفية الصفحة', category: 'theme', order: 103 },
      header_background: { type: 'color', description: 'لون خلفية الهيدر', category: 'theme', order: 104 },
      footer_background: { type: 'color', description: 'لون خلفية الفوتر', category: 'theme', order: 105 },
      text_primary: { type: 'color', description: 'لون النص الأساسي', category: 'theme', order: 106 },
      text_secondary: { type: 'color', description: 'لون النص الثانوي', category: 'theme', order: 107 },
      text_light: { type: 'color', description: 'لون النص الفاتح', category: 'theme', order: 108 },
      link_color: { type: 'color', description: 'لون الروابط', category: 'theme', order: 109 },
      link_hover_color: { type: 'color', description: 'لون الروابط عند التمرير', category: 'theme', order: 110 },
      button_primary_bg: { type: 'color', description: 'خلفية الزر الأساسي', category: 'theme', order: 111 },
      button_primary_text: { type: 'color', description: 'نص الزر الأساسي', category: 'theme', order: 112 },
      button_secondary_bg: { type: 'color', description: 'خلفية الزر الثانوي', category: 'theme', order: 113 },
      button_secondary_text: { type: 'color', description: 'نص الزر الثانوي', category: 'theme', order: 114 },
      card_background: { type: 'color', description: 'خلفية البطاقات', category: 'theme', order: 115 },
      card_border: { type: 'color', description: 'حدود البطاقات', category: 'theme', order: 116 },
      border_color: { type: 'color', description: 'لون الحدود العام', category: 'theme', order: 117 },
    };
    return meta[key] || { type: 'text', description: '', category: 'general', order: 0 };
  };

  const tabItems = [
    {
      key: 'general',
      label: 'الإعدادات العامة',
      children: (
        <Card>
          <Form.Item name="site_name" label="اسم الموقع">
            <Input placeholder="جمعية الرعاية الخيرية" />
          </Form.Item>
          <Form.Item name="site_name_en" label="اسم الموقع بالإنجليزية">
            <Input placeholder="Charity Care Association" />
          </Form.Item>
          <Form.Item name="site_description" label="وصف الموقع">
            <TextArea rows={3} placeholder="وصف الموقع" />
          </Form.Item>
          <Form.Item name="site_logo" label="شعار الموقع">
            <ImageInput 
              onChange={(url) => form.setFieldsValue({ site_logo: url })}
            />
            {form.getFieldValue('site_logo') && (
              <div className="mt-2">
                <img 
                  src={form.getFieldValue('site_logo')} 
                  alt="Logo" 
                  className="h-20 object-contain"
                />
              </div>
            )}
          </Form.Item>
          <Form.Item name="site_favicon" label="أيقونة الموقع (Favicon)">
            <ImageInput 
              onChange={(url) => form.setFieldsValue({ site_favicon: url })}
            />
            {form.getFieldValue('site_favicon') && (
              <div className="mt-2">
                <img 
                  src={form.getFieldValue('site_favicon')} 
                  alt="Favicon" 
                  className="h-16 w-16 object-contain"
                />
              </div>
            )}
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'contact',
      label: 'معلومات الاتصال',
      children: (
        <Card>
          <Form.Item name="contact_email" label="البريد الإلكتروني">
            <Input type="email" placeholder="info@example.com" />
          </Form.Item>
          <Form.Item name="contact_phone" label="رقم الهاتف">
            <Input placeholder="+966500000000" />
          </Form.Item>
          <Form.Item name="contact_mobile" label="رقم الجوال">
            <Input placeholder="+966500000000" />
          </Form.Item>
          <Form.Item name="contact_address" label="العنوان">
            <TextArea rows={2} placeholder="المدينة المنورة، المملكة العربية السعودية" />
          </Form.Item>
          <Form.Item name="contact_map_url" label="رابط الخريطة">
            <Input placeholder="https://maps.google.com/..." />
          </Form.Item>
          <Form.Item name="working_hours" label="ساعات العمل">
            <Input placeholder="الأحد - الخميس: 8:00 ص - 5:00 م" />
          </Form.Item>
          <Form.Item name="donation_phone" label="رقم التبرع">
            <Input placeholder="+966500000000" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'social',
      label: 'وسائل التواصل الاجتماعي',
      children: (
        <Card>
          <Form.Item name="social_facebook" label="رابط فيسبوك">
            <Input placeholder="https://facebook.com/..." />
          </Form.Item>
          <Form.Item name="social_twitter" label="رابط تويتر">
            <Input placeholder="https://twitter.com/..." />
          </Form.Item>
          <Form.Item name="social_instagram" label="رابط إنستغرام">
            <Input placeholder="https://instagram.com/..." />
          </Form.Item>
          <Form.Item name="social_linkedin" label="رابط لينكد إن">
            <Input placeholder="https://linkedin.com/..." />
          </Form.Item>
          <Form.Item name="social_youtube" label="رابط يوتيوب">
            <Input placeholder="https://youtube.com/..." />
          </Form.Item>
          <Form.Item name="social_whatsapp" label="رقم واتساب">
            <Input placeholder="+966500000000" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'seo',
      label: 'إعدادات SEO',
      children: (
        <Card>
          <Form.Item name="seo_title" label="عنوان SEO">
            <Input placeholder="جمعية الرعاية الخيرية" />
          </Form.Item>
          <Form.Item name="seo_description" label="وصف SEO">
            <TextArea rows={3} placeholder="وصف الموقع لمحركات البحث" />
          </Form.Item>
          <Form.Item name="seo_keywords" label="كلمات مفتاحية">
            <Input placeholder="جمعية خيرية، رعاية، دعم" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'footer',
      label: 'إعدادات الفوتر',
      children: (
        <Card>
          <Form.Item name="footer_text" label="نص الفوتر">
            <TextArea rows={3} placeholder="جميع الحقوق محفوظة © 2024" />
          </Form.Item>
          <Form.Item name="footer_copyright_year" label="سنة حقوق النشر">
            <Input placeholder="2024" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'theme',
      label: 'إعدادات الألوان والمظهر',
      children: (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ألوان أساسية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">الألوان الأساسية</h3>
              <Form.Item name="primary_color" label="اللون الأساسي الرئيسي">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="secondary_color" label="اللون الثانوي">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="accent_color" label="لون التمييز">
                <ColorPicker />
              </Form.Item>
            </div>

            {/* ألوان الخلفية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">ألوان الخلفية</h3>
              <Form.Item name="background_color" label="خلفية الصفحة">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="header_background" label="خلفية الهيدر">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="footer_background" label="خلفية الفوتر">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="card_background" label="خلفية البطاقات">
                <ColorPicker />
              </Form.Item>
            </div>

            {/* ألوان النصوص */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">ألوان النصوص</h3>
              <Form.Item name="text_primary" label="النص الأساسي">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="text_secondary" label="النص الثانوي">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="text_light" label="النص الفاتح">
                <ColorPicker />
              </Form.Item>
            </div>

            {/* ألوان الروابط والأزرار */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">الروابط والأزرار</h3>
              <Form.Item name="link_color" label="لون الروابط">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="link_hover_color" label="لون الروابط عند التمرير">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="button_primary_bg" label="خلفية الزر الأساسي">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="button_primary_text" label="نص الزر الأساسي">
                <ColorPicker />
              </Form.Item>
            </div>

            {/* ألوان إضافية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">ألوان إضافية</h3>
              <Form.Item name="button_secondary_bg" label="خلفية الزر الثانوي">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="button_secondary_text" label="نص الزر الثانوي">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="card_border" label="حدود البطاقات">
                <ColorPicker />
              </Form.Item>
              <Form.Item name="border_color" label="الحدود العامة">
                <ColorPicker />
              </Form.Item>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'typography',
      label: 'إعدادات الخطوط والنصوص',
      children: (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* الخطوط الأساسية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">الخطوط الأساسية</h3>
              <Form.Item name="font_family_primary" label="الخط الأساسي للنصوص">
                <FontSelector />
              </Form.Item>
              <Form.Item name="font_family_headings" label="خط العناوين">
                <FontSelector />
              </Form.Item>
            </div>

            {/* أحجام الخطوط */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">أحجام الخطوط</h3>
              <Form.Item name="font_size_base" label="حجم الخط الأساسي">
                <SizeSelector type="font-size" />
              </Form.Item>
              <Form.Item name="font_size_h1" label="حجم العنوان H1">
                <SizeSelector type="font-size" />
              </Form.Item>
              <Form.Item name="font_size_h2" label="حجم العنوان H2">
                <SizeSelector type="font-size" />
              </Form.Item>
              <Form.Item name="font_size_h3" label="حجم العنوان H3">
                <SizeSelector type="font-size" />
              </Form.Item>
            </div>

            {/* إعدادات إضافية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">إعدادات إضافية</h3>
              <Form.Item name="font_size_h4" label="حجم العنوان H4">
                <SizeSelector type="font-size" />
              </Form.Item>
              <Form.Item name="font_size_h5" label="حجم العنوان H5">
                <SizeSelector type="font-size" />
              </Form.Item>
              <Form.Item name="font_size_h6" label="حجم العنوان H6">
                <SizeSelector type="font-size" />
              </Form.Item>
            </div>

            {/* أوزان الخطوط */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">أوزان الخطوط</h3>
              <Form.Item name="font_weight_normal" label="وزن الخط العادي">
                <SizeSelector type="weight" />
              </Form.Item>
              <Form.Item name="font_weight_bold" label="وزن الخط الجريء">
                <SizeSelector type="weight" />
              </Form.Item>
            </div>

            {/* ارتفاع السطور */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">ارتفاع السطور</h3>
              <Form.Item name="line_height_base" label="ارتفاع السطر الأساسي">
                <SizeSelector type="line-height" />
              </Form.Item>
              <Form.Item name="line_height_headings" label="ارتفاع السطر للعناوين">
                <SizeSelector type="line-height" />
              </Form.Item>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">الإعدادات العامة</h1>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Tabs items={tabItems} />
        <div style={{ marginTop: 24, textAlign: 'left' }}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
              htmlType="submit"
            >
              حفظ جميع الإعدادات
            </Button>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              onClick={() => {
                message.info('جاري إعادة تحميل الإعدادات...');
                window.location.reload();
              }}
            >
              إعادة تحميل الصفحة
            </Button>
          </Space>
        </div>
      </Form>
    </AdminLayout>
  );
}
