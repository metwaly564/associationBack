"use client";
import { Input, Select, Space } from 'antd';
import { useState } from 'react';

interface SizeSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  type?: 'font-size' | 'line-height' | 'weight';
}

export function SizeSelector({ value = '16px', onChange, placeholder, label, type = 'font-size' }: SizeSelectorProps) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (newValue: string) => {
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  const getPresets = () => {
    switch (type) {
      case 'font-size':
        return [
          { value: '12px', label: 'صغير جداً (12px)' },
          { value: '14px', label: 'صغير (14px)' },
          { value: '16px', label: 'متوسط (16px)' },
          { value: '18px', label: 'كبير (18px)' },
          { value: '20px', label: 'كبير جداً (20px)' },
          { value: '24px', label: 'عنوان (24px)' },
          { value: '2rem', label: 'عنوان كبير (2rem)' },
          { value: '2.5rem', label: 'عنوان كبير جداً (2.5rem)' },
        ];
      case 'line-height':
        return [
          { value: '1.2', label: 'مضغوط (1.2)' },
          { value: '1.4', label: 'عادي (1.4)' },
          { value: '1.6', label: 'مريح (1.6)' },
          { value: '1.8', label: 'واسع (1.8)' },
          { value: '2', label: 'واسع جداً (2)' },
        ];
      case 'weight':
        return [
          { value: '300', label: 'خفيف (300)' },
          { value: '400', label: 'عادي (400)' },
          { value: '500', label: 'متوسط (500)' },
          { value: '600', label: 'سميك (600)' },
          { value: '700', label: 'جريء (700)' },
          { value: '800', label: 'جريء جداً (800)' },
        ];
      default:
        return [];
    }
  };

  const presets = getPresets();

  return (
    <div className="size-selector">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <Space>
        <Select
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder || "اختر الحجم"}
          style={{ width: 150 }}
          showSearch
          optionFilterProp="children"
        >
          {presets.map((preset) => (
            <Select.Option key={preset.value} value={preset.value}>
              {preset.label}
            </Select.Option>
          ))}
        </Select>
        <Input
          value={currentValue}
          onChange={(e) => {
            const val = e.target.value;
            setCurrentValue(val);
            onChange?.(val);
          }}
          placeholder="قيمة مخصصة"
          className="font-mono"
          style={{ width: 120 }}
        />
        {type === 'font-size' && (
          <div
            className="px-3 py-2 border border-gray-300 rounded bg-gray-50 text-center"
            style={{ fontSize: currentValue }}
          >
            Aa
          </div>
        )}
      </Space>
    </div>
  );
}