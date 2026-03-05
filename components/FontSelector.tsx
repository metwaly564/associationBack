"use client";
import { Select, Space } from 'antd';
import { useState } from 'react';

interface FontSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const commonFonts = [
  { value: 'Tajawal, sans-serif', label: 'Tajawal (افتراضي)' },
  { value: 'Cairo, sans-serif', label: 'Cairo' },
  { value: 'Amiri, serif', label: 'Amiri' },
  { value: 'Noto Sans Arabic, sans-serif', label: 'Noto Sans Arabic' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
];

export function FontSelector({ value = 'Tajawal, sans-serif', onChange, placeholder, label }: FontSelectorProps) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (newValue: string) => {
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="font-selector">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <Space>
        <Select
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder || "اختر الخط"}
          style={{ width: 200 }}
          showSearch
          optionFilterProp="children"
        >
          {commonFonts.map((font) => (
            <Select.Option key={font.value} value={font.value}>
              <span style={{ fontFamily: font.value }}>{font.label}</span>
            </Select.Option>
          ))}
        </Select>
        <div
          className="px-3 py-2 border border-gray-300 rounded bg-gray-50"
          style={{ fontFamily: currentValue, fontSize: '14px' }}
        >
          نموذج النص
        </div>
      </Space>
    </div>
  );
}