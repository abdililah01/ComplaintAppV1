import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useCountries, useCities } from '../api/lookup';

const colors = {
    textPrimary: '#1a202c',
    textSecondary: '#718096',
    border: '#e2e8f0',
    inputBackground: '#ffffff',
    error: '#ef4444',
};

const styles = StyleSheet.create({
    inputContainer: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, textAlign: 'right' },
    requiredAsterisk: { color: colors.error },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.inputBackground,
        justifyContent: 'center',
    },
    picker: {
        height: 58,
        color: colors.textPrimary,
    },
    loadingContainer: {
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
      color: colors.error,
      textAlign: 'right',
      marginTop: 4,
    }
});

const CountryPicker = ({ onValueChange, selectedValue, isRequired }) => {
    // FIX: Removed 'ar' argument as per review
    const { data: countries, isLoading, isError } = useCountries();

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>الدولة {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}</Text>
            <View style={styles.pickerWrapper}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator />
                    </View>
                ) : (
                    <Picker
                        selectedValue={selectedValue}
                        onValueChange={(itemValue) => onValueChange(itemValue)}
                        style={styles.picker}
                        prompt="اختر الدولة"
                    >
                        <Picker.Item label="اختر الدولة..." value={null} enabled={false} style={{color: colors.textSecondary}} />
                        {/* FIX: Changed c.libelle to c.label as per review */}
                        {countries?.map((country) => (
                            <Picker.Item key={country.id} label={country.label} value={country.id} />
                        ))}
                    </Picker>
                )}
            </View>
            {isError && <Text style={styles.errorText}>خطأ في تحميل قائمة الدول</Text>}
        </View>
    );
};

export default CountryPicker;