// src/components/LookupPicker.tsx
import React from 'react';
import { Picker } from '@react-native-picker/picker';

export interface LookupItem { id: number; label: string; }

interface Props {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  options: LookupItem[];
  disabled?: boolean;
}

export function LookupPicker({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: Props) {
  return (
    <Picker
      selectedValue={value ?? 0}
      enabled={!disabled}
      onValueChange={itemValue =>
        onChange(itemValue === 0 ? null : Number(itemValue))
      }
    >
      <Picker.Item label={label} value={0} />
      {options.map(o => (
        <Picker.Item key={o.id} label={o.label} value={o.id} />
      ))}
    </Picker>
  );
}
