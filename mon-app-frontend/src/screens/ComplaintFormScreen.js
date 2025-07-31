import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useCountries, useCities } from '../api/lookup';
import { LookupPicker } from '../components/LookupPicker';

export default function ComplaintFormScreen() {
  /* ----------------------------------------------------------------------- */
  /* react-hook-form                                                          */
  /* ----------------------------------------------------------------------- */
  const { control, handleSubmit, watch } = useForm({
    defaultValues: { country: null, city: null },
  });
  const selectedCountry = watch('country');

  /* ----------------------------------------------------------------------- */
  /* lookups                                                                  */
  /* ----------------------------------------------------------------------- */
  const {
    data: countries = [],
    isLoading: loadingCountries,
  } = useCountries();

  const {
    data: cities = [],
    isLoading: loadingCities,
  } = useCities(selectedCountry);

  /* ----------------------------------------------------------------------- */
  /* submit                                                                   */
  /* ----------------------------------------------------------------------- */
  const onSubmit = data => {
    console.log('FORM DATA:', data);
    // TODO → api.post('/api/v1/complaints', data)
  };

  /* ----------------------------------------------------------------------- */
  /* render                                                                   */
  /* ----------------------------------------------------------------------- */
  return (
    <View style={styles.container}>
      {/* Country ----------------------------------------------------------- */}
      <Text style={styles.label}>الدولة</Text>
      <Controller
        name="country"
        control={control}
        render={({ field: { value, onChange } }) => (
          <LookupPicker
            label={loadingCountries ? 'جاري التحميل...' : '-- الدولة --'}
            value={value}
            onChange={onChange}
            options={countries.map(c => ({ id: c.id, label: c.label }))}
          />
        )}
      />

      {/* City -------------------------------------------------------------- */}
      <Text style={styles.label}>المدينة</Text>
      <Controller
        name="city"
        control={control}
        render={({ field: { value, onChange } }) => (
          <LookupPicker
            label={
              selectedCountry === 1
                ? loadingCities
                  ? 'جاري التحميل...'
                  : '-- اختر المدينة --'
                : 'المدن غير متوفرة'
            }
            value={value}
            onChange={onChange}
            options={
              selectedCountry === 1
                ? cities.map(v => ({ id: v.id, label: v.label }))
                : []
            }
            disabled={selectedCountry !== 1}
          />
        )}
      />

      {/* Submit ------------------------------------------------------------ */}
      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});
