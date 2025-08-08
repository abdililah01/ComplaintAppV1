import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export interface LookupItem {
  id: number | string;
  label: string;
}

interface Props {
  /** Field label that the user sees above the picker */
  label: string;
  /** Current selected value (id) – can be null */
  value: number | string | null;
  /** Array you receive from the /lookups/* endpoints */
  options: LookupItem[];
  /** Callback every time the user chooses something */
  onChange: (v: number | string | null) => void;
  /** When you want the picker greyed-out / disabled */
  disabled?: boolean;
}

export function LookupPicker({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={[styles.pickerWrapper, disabled && styles.pickerDisabled]}>
        <Picker
          enabled={!disabled}
          selectedValue={value ?? 0}
          onValueChange={(val /* , idx */) =>
            onChange(val === 0 ? null : val)
          }
          style={styles.picker}
          dropdownIconColor="#3A4F53"
        >
          {/* first empty option */}
          <Picker.Item label={`اختر ${label}…`} value={0} />
          {options.map(opt => (
            <Picker.Item key={opt.id} label={opt.label} value={opt.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styling – keep it simple; colours match ComplaintFormScreen       */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'right',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  picker: {
    width: '100%',
    height: 48,
    textAlign: 'right',
  },
  pickerDisabled: { opacity: 0.55 },
});

/* ------------------------------------------------------------ */
/*  Make it available BOTH as a named *and* default export      */
/* ------------------------------------------------------------ */
export default LookupPicker;
