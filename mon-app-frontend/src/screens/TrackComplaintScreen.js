// src/screens/TrackComplaintScreen.js
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';

// Utilisation de la même palette de couleurs pour la cohérence
const colors = {
    background: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    header: '#1e3a8a',
    white: '#ffffff',
    border: '#e2e8f0',
    inputBackground: '#ffffff',
    cardShadow: '#64748b',
};

// Composant réutilisable pour les champs de saisie de cet écran
const FormInput = ({ label, ...props }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
            {...props}
        />
    </View>
);

const TrackComplaintScreen = () => {
    // État pour savoir quelle option de recherche est sélectionnée
    const [searchOption, setSearchOption] = useState('A'); // 'A' or 'B'

    // États pour les champs de chaque option
    const [optionAData, setOptionAData] = useState({ trackingCode: '', mobileNumber: '' });
    const [optionBData, setOptionBData] = useState({ trackingCode: '', complaintNumber: '', year: '' });

    const handleSearch = () => {
        if (searchOption === 'A') {
            if (!optionAData.trackingCode || !optionAData.mobileNumber) {
                Alert.alert('خطأ', 'المرجو إدخال رمز التتبع ورقم الهاتف.');
                return;
            }
            console.log('Searching with Option A:', optionAData);
            Alert.alert('بحث (أ)', 'جاري البحث عن شكايتك...');
        } else {
            if (!optionBData.trackingCode || !optionBData.complaintNumber || !optionBData.year) {
                Alert.alert('خطأ', 'المرجو إدخال رمز التتبع، رقم الشكاية والسنة.');
                return;
            }
            console.log('Searching with Option B:', optionBData);
            Alert.alert('بحث (ب)', 'جاري البحث عن شكايتك...');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.cardIconContainer}>
                        <Text style={styles.cardIcon}>🔍</Text>
                    </View>
                    <Text style={styles.title}>تتبع شكاية موجودة</Text>
                    <Text style={styles.description}>
                        اختر طريقة البحث وأدخل المعلومات المطلوبة لعرض حالة شكايتك.
                    </Text>

                    {/* Sélecteur d'options de recherche */}
                    <View style={styles.typeSelectorContainer}>
                        <TouchableOpacity
                            style={[styles.typeButton, searchOption === 'A' && styles.activeTypeButton]}
                            onPress={() => setSearchOption('A')}
                        >
                            <Text style={[styles.typeButtonText, searchOption === 'A' && styles.activeTypeButtonText]}>
                                الطريقة الأولى
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, searchOption === 'B' && styles.activeTypeButton]}
                            onPress={() => setSearchOption('B')}
                        >
                            <Text style={[styles.typeButtonText, searchOption === 'B' && styles.activeTypeButtonText]}>
                                الطريقة الثانية
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Affichage conditionnel des formulaires */}
                    {searchOption === 'A' ? (
                        <View style={styles.formContainer}>
                            <FormInput
                                label="رمز تتبع الشكاية"
                                value={optionAData.trackingCode}
                                onChangeText={(text) => setOptionAData({ ...optionAData, trackingCode: text })}
                                placeholder="أدخل رمز التتبع هنا"
                            />
                            <FormInput
                                label="رقم الهاتف"
                                value={optionAData.mobileNumber}
                                onChangeText={(text) => setOptionAData({ ...optionAData, mobileNumber: text })}
                                placeholder="أدخل رقم هاتفك هنا"
                                keyboardType="phone-pad"
                            />
                        </View>
                    ) : (
                        <View style={styles.formContainer}>
                            <FormInput
                                label="رمز تتبع الشكاية"
                                value={optionBData.trackingCode}
                                onChangeText={(text) => setOptionBData({ ...optionBData, trackingCode: text })}
                                placeholder="أدخل رمز التتبع هنا"
                            />
                            <FormInput
                                label="رقم الشكاية"
                                value={optionBData.complaintNumber}
                                onChangeText={(text) => setOptionBData({ ...optionBData, complaintNumber: text })}
                                placeholder="أدخل رقم الشكاية"
                                keyboardType="number-pad"
                            />
                            <FormInput
                                label="السنة"
                                value={optionBData.year}
                                onChangeText={(text) => setOptionBData({ ...optionBData, year: text })}
                                placeholder="أدخل السنة"
                                keyboardType="number-pad"
                                maxLength={4}
                            />
                        </View>
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleSearch}>
                        <Text style={styles.buttonText}>بحث</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        justifyContent: 'center',
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 6,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        alignItems: 'center',
    },
    cardIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardIcon: {
        fontSize: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    typeSelectorContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.header,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 24,
        width: '100%',
    },
    typeButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    activeTypeButton: {
        backgroundColor: colors.header,
    },
    typeButtonText: {
        color: colors.header,
        fontSize: 16,
        fontWeight: '600',
    },
    activeTypeButtonText: {
        color: colors.white,
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'right',
    },
    input: {
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
        textAlign: 'right',
        color: colors.textPrimary,
    },
    button: {
        backgroundColor: colors.header,
        width: '100%',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default TrackComplaintScreen;