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
    pickerDisabledWrapper: {
        backgroundColor: '#f7fafc',
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

const CityPicker = ({ idPays, onValueChange, selectedValue, isRequired }) => {
    const isCountrySelected = !!idPays;
    // FIX: Removed 'ar' and options arguments as per review.
    // The hook will be disabled automatically by React Query if idPays is falsy.
    const { data: cities, isLoading, isError } = useCities(idPays);

    const isDisabled = !isCountrySelected;

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>المدينة {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}</Text>
            <View style={[styles.pickerWrapper, isDisabled && styles.pickerDisabledWrapper]}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator />
                    </View>
                ) : (
                    <Picker
                        selectedValue={selectedValue}
                        onValueChange={(itemValue) => onValueChange(itemValue)}
                        enabled={!isDisabled}
                        style={styles.picker}
                        prompt="اختر المدينة"
                    >
                        <Picker.Item label={isDisabled ? "الرجاء اختيار الدولة أولا" : "اختر المدينة..."} value={null} enabled={false} style={{color: colors.textSecondary}} />
                        {/* FIX: Changed city.libelle to city.label as per review */}
                        {cities?.map((city) => (
                            <Picker.Item key={city.id} label={city.label} value={city.id} />
                        ))}
                    </Picker>
                )}
            </View>
            {isError && <Text style={styles.errorText}>خطأ في تحميل قائمة المدن</Text>}
        </View>
    );
};

export default CityPicker;