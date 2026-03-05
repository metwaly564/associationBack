"use client";
import { Input, Space } from 'antd';
import { useState } from 'react';

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function ColorPicker({ value = '#000000', onChange, placeholder, label }: ColorPickerProps) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="color-picker">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <Space>
        <input
          type="color"
          value={currentValue}
          onChange={handleChange}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          title="اختر لون"
        />
        <Input
          value={currentValue}
          onChange={(e) => {
            const val = e.target.value;
            setCurrentValue(val);
            onChange?.(val);
          }}
          placeholder={placeholder || "#000000"}
          className="font-mono"
          style={{ width: 120 }}
        />
        <div
          className="w-8 h-8 border border-gray-300 rounded"
          style={{ backgroundColor: currentValue }}
          title={`اللون المحدد: ${currentValue}`}
        />
      </Space>
    </div>
  );
}