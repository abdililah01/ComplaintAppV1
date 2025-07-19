// src/screens/ComplaintFormScreen.js
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    findNodeHandle,
} from 'react-native';

// La palette de couleurs est parfaite, on la garde.
const colors = {
    background: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    header: '#1e3a8a',
    white: '#ffffff',
    border: '#e2e8f0',
    inputBackground: '#ffffff',
    error: '#ef4444',
    success: '#10b981',
    focus: '#3b82f6',
};

// Le composant FormInput avec forwardRef est correct et essentiel.
const FormInput = React.memo(React.forwardRef((
    { label, isRequired, onFocus, editable = true, ...props },
    ref
) => (
    <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
            {label} {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
        <TextInput
            ref={ref}
            style={[styles.input, !editable && styles.inputDisabled]}
            placeholderTextColor={colors.textSecondary}
            onFocus={onFocus}
            editable={editable}
            {...props}
        />
    </View>
)));

// Le Stepper à 4 étapes avec les libellés, comme sur le web.
const FormStepper = ({ currentStep }) => {
    const steps = useMemo(() => [
        { number: 1, label: 'معلومات حول المشتكي' },
        { number: 2, label: 'معلومات حول المشتكى به' },
        { number: 3, label: 'معلومات حول الشكاية' },
        { number: 4, label: 'تأكيد المعطيات' },
    ], []);

    return (
        <View style={styles.stepperWrapper}>
            <View style={styles.stepperContainer}>
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <View style={[styles.step, currentStep >= step.number && styles.activeStep]}>
                            <Text style={[styles.stepText, currentStep >= step.number && styles.activeStepText]}>{step.number}</Text>
                        </View>
                        {index < steps.length - 1 && <View style={[styles.stepperLine, currentStep > step.number && styles.activeStep]} />}
                    </React.Fragment>
                ))}
            </View>
            <View style={styles.stepperLabelsContainer}>
                {steps.map(step => (
                    <Text key={step.number} style={[styles.stepLabel, currentStep === step.number && styles.activeStepLabel]}>
                        {step.label}
                    </Text>
                ))}
            </View>
        </View>
    );
};

// ====================================================================
// COMPOSANTS POUR CHAQUE ÉTAPE
// ====================================================================

// Étape 1 : Informations sur le Plaignant
const Step1_ComplainantInfo = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    const [complainantType, setComplainantType] = useState(formData.complainantType || 'individual');

    const handleTypeChange = (type) => {
        setComplainantType(type);
        onFieldChange('complainantType', type);
    };

    return (
        <View>
            <View style={styles.typeSelectorContainer}>
                <TouchableOpacity style={[styles.typeButton, complainantType === 'individual' && styles.activeTypeButton]} onPress={() => handleTypeChange('individual')}>
                    <Text style={[styles.typeButtonText, complainantType === 'individual' && styles.activeTypeButtonText]}>شخص ذاتي</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, complainantType === 'legal' && styles.activeTypeButton]} onPress={() => handleTypeChange('legal')}>
                    <Text style={[styles.typeButtonText, complainantType === 'legal' && styles.activeTypeButtonText]}>شخص معنوي</Text>
                </TouchableOpacity>
            </View>
            {complainantType === 'individual' ?
                <IndividualForm onFieldChange={onFieldChange} formData={formData} onInputFocus={onInputFocus} inputRefs={inputRefs} /> :
                <LegalEntityForm onFieldChange={onFieldChange} formData={formData} onInputFocus={onInputFocus} inputRefs={inputRefs} />
            }
        </View>
    );
};

// Étape 2 : Informations sur l'Accusé
const Step2_RespondentInfo = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    const [respondentType, setRespondentType] = useState(formData.respondentType || 'individual');

    const handleTypeChange = (type) => {
        setRespondentType(type);
        onFieldChange('respondentType', type);
    };

    return (
        <View>
            <Text style={styles.sectionTitle}>هل المشتكى به ؟</Text>
            <View style={[styles.typeSelectorContainer, { marginBottom: 10 }]}>
                <TouchableOpacity style={[styles.typeButton, respondentType === 'individual' && styles.activeTypeButton]} onPress={() => handleTypeChange('individual')}>
                    <Text style={[styles.typeButtonText, respondentType === 'individual' && styles.activeTypeButtonText]}>شخص ذاتي</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, respondentType === 'legal' && styles.activeTypeButton]} onPress={() => handleTypeChange('legal')}>
                    <Text style={[styles.typeButtonText, respondentType === 'legal' && styles.activeTypeButtonText]}>شخص معنوي</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.unknownButton, respondentType === 'unknown' && styles.activeUnknownButton]} onPress={() => handleTypeChange('unknown')}>
                <Text style={[styles.unknownButtonText, respondentType === 'unknown' && styles.activeUnknownButtonText]}>المشتكى به غير محدد</Text>
            </TouchableOpacity>

            {respondentType === 'individual' && <RespondentIndividualForm onFieldChange={onFieldChange} formData={formData} onInputFocus={onInputFocus} inputRefs={inputRefs} />}
            {respondentType === 'legal' && <RespondentLegalForm onFieldChange={onFieldChange} formData={formData} onInputFocus={onInputFocus} inputRefs={inputRefs} />}
            {respondentType === 'unknown' && <RespondentUnknownForm onFieldChange={onFieldChange} formData={formData} onInputFocus={onInputFocus} inputRefs={inputRefs} />}
        </View>
    );
};

// ====================================================================
// DÉFINITION COMPLÈTE DES FORMULAIRES
// ====================================================================

// Formulaires pour l'Étape 1
const IndividualForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => (
    <View>
        <FormInput ref={el => inputRefs.current.firstName = el} label="الاسم الشخصي" isRequired={true} value={formData.firstName} onChangeText={v => onFieldChange('firstName', v)} onFocus={() => onInputFocus('firstName')} />
        <FormInput ref={el => inputRefs.current.lastName = el} label="الاسم العائلي" isRequired={true} value={formData.lastName} onChangeText={v => onFieldChange('lastName', v)} onFocus={() => onInputFocus('lastName')} />
        <FormInput ref={el => inputRefs.current.idNumber = el} label="رقم وثيقة التعريف" isRequired={true} value={formData.idNumber} onChangeText={v => onFieldChange('idNumber', v)} onFocus={() => onInputFocus('idNumber')} />
        <FormInput ref={el => inputRefs.current.birthDate = el} label="تاريخ الازدياد" placeholder="mm/dd/yyyy" value={formData.birthDate} onChangeText={v => onFieldChange('birthDate', v)} onFocus={() => onInputFocus('birthDate')} />
        <FormInput ref={el => inputRefs.current.gender = el} label="الجنس" value={formData.gender} onChangeText={v => onFieldChange('gender', v)} onFocus={() => onInputFocus('gender')} />
        <FormInput ref={el => inputRefs.current.country = el} label="الدولة" isRequired={true} value={formData.country} onChangeText={v => onFieldChange('country', v)} onFocus={() => onInputFocus('country')} />
        <FormInput ref={el => inputRefs.current.city = el} label="المدينة" isRequired={true} value={formData.city} onChangeText={v => onFieldChange('city', v)} onFocus={() => onInputFocus('city')} />
        <FormInput ref={el => inputRefs.current.residence = el} label="محل الإقامة" isRequired={true} value={formData.residence} onChangeText={v => onFieldChange('residence', v)} onFocus={() => onInputFocus('residence')} />
        <FormInput ref={el => inputRefs.current.address = el} label="العنوان" isRequired={true} value={formData.address} onChangeText={v => onFieldChange('address', v)} onFocus={() => onInputFocus('address')} />
        <FormInput ref={el => inputRefs.current.email = el} label="البريد الالكتروني" keyboardType="email-address" value={formData.email} onChangeText={v => onFieldChange('email', v)} onFocus={() => onInputFocus('email')} />
    </View>
);

const LegalEntityForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => (
    <View>
        <FormInput ref={el => inputRefs.current.companyName = el} label="التسمية" isRequired={true} value={formData.companyName} onChangeText={v => onFieldChange('companyName', v)} onFocus={() => onInputFocus('companyName')} />
        <FormInput ref={el => inputRefs.current.legalRep = el} label="الممثل القانوني" isRequired={true} value={formData.legalRep} onChangeText={v => onFieldChange('legalRep', v)} onFocus={() => onInputFocus('legalRep')} />
        <FormInput ref={el => inputRefs.current.companyId = el} label="المعرف الموحد للمقاولة" value={formData.companyId} onChangeText={v => onFieldChange('companyId', v)} onFocus={() => onInputFocus('companyId')} />
        <FormInput ref={el => inputRefs.current.hq = el} label="المقر الاجتماعي" isRequired={true} value={formData.hq} onChangeText={v => onFieldChange('hq', v)} onFocus={() => onInputFocus('hq')} />
        <FormInput ref={el => inputRefs.current.legalEmail = el} label="البريد الالكتروني" keyboardType="email-address" value={formData.legalEmail} onChangeText={v => onFieldChange('legalEmail', v)} onFocus={() => onInputFocus('legalEmail')} />
    </View>
);

// Formulaires pour l'Étape 2
const RespondentIndividualForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => (
    <View style={styles.formSection}>
        <FormInput ref={el => inputRefs.current.resp_fullName = el} label="الاسم الكامل" isRequired={true} value={formData.resp_fullName} onChangeText={v => onFieldChange('resp_fullName', v)} onFocus={() => onInputFocus('resp_fullName')} />
        <FormInput ref={el => inputRefs.current.resp_address = el} label="العنوان" value={formData.resp_address} onChangeText={v => onFieldChange('resp_address', v)} onFocus={() => onInputFocus('resp_address')} />
    </View>
);

const RespondentLegalForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => (
    <View style={styles.formSection}>
        <FormInput ref={el => inputRefs.current.resp_companyName = el} label="التسمية" isRequired={true} value={formData.resp_companyName} onChangeText={v => onFieldChange('resp_companyName', v)} onFocus={() => onInputFocus('resp_companyName')} />
        <FormInput ref={el => inputRefs.current.resp_companyHQ = el} label="المقر الاجتماعي" value={formData.resp_companyHQ} onChangeText={v => onFieldChange('resp_companyHQ', v)} onFocus={() => onInputFocus('resp_companyHQ')} />
        <FormInput ref={el => inputRefs.current.resp_companyId = el} label="المعرف الموحد للمقاولة" value={formData.resp_companyId} onChangeText={v => onFieldChange('resp_companyId', v)} onFocus={() => onInputFocus('resp_companyId')} />
        <FormInput ref={el => inputRefs.current.resp_legalRep = el} label="الممثل القانوني" value={formData.resp_legalRep} onChangeText={v => onFieldChange('resp_legalRep', v)} onFocus={() => onInputFocus('resp_legalRep')} />
    </View>
);

const RespondentUnknownForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => (
    <View style={styles.formSection}>
        <FormInput ref={el => inputRefs.current.resp_unknownName = el} label="الاسم الكامل" isRequired={true} value={"غير محدد"} editable={false} />
        <FormInput ref={el => inputRefs.current.resp_unknownAddress = el} label="العنوان" value={"غير محدد"} editable={false} />
    </View>
);


// ====================================================================
// COMPOSANT PRINCIPAL (GESTIONNAIRE D'ÉTAPES)
// ====================================================================
const ComplaintFormScreen = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        complainantType: 'individual',
        respondentType: 'individual',
    });

    const scrollViewRef = useRef(null);
    const inputRefs = useRef({});

    const handleInputFocus = useCallback((inputKey) => {
        setTimeout(() => {
            if (scrollViewRef.current && inputRefs.current[inputKey]) {
                const node = findNodeHandle(inputRefs.current[inputKey]);
                if (node) {
                    node.measureLayout(findNodeHandle(scrollViewRef.current), (x, y) => {
                        scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
                    });
                }
            }
        }, 200);
    }, []);

    const handleFieldChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }
    };

    const renderCurrentStep = () => {
        switch(currentStep) {
            case 1:
                return <Step1_ComplainantInfo onFieldChange={handleFieldChange} formData={formData} onInputFocus={handleInputFocus} inputRefs={inputRefs} />;
            case 2:
                return <Step2_RespondentInfo onFieldChange={handleFieldChange} formData={formData} onInputFocus={handleInputFocus} inputRefs={inputRefs} />;
            case 3:
                return <Text style={styles.placeholderText}>Étape 3 : Informations sur la plainte</Text>;
            case 4:
                return <Text style={styles.placeholderText}>Étape 4 : Confirmation</Text>;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <FormStepper currentStep={currentStep} />
                    {renderCurrentStep()}
                </ScrollView>
                <View style={styles.footerButtons}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                        <Text style={styles.nextButtonText}>المرحلة الموالية</Text>
                    </TouchableOpacity>
                    {currentStep > 1 && (
                        <TouchableOpacity style={styles.prevButton} onPress={handlePrevStep}>
                            <Text style={styles.prevButtonText}>المرحلة السابقة</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// Tous les styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20, paddingBottom: 40 },
    stepperWrapper: { marginBottom: 20, alignItems: 'center' },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, width: '100%' },
    step: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
    activeStep: { backgroundColor: colors.header },
    stepText: { color: colors.textSecondary, fontWeight: 'bold' },
    activeStepText: { color: colors.white },
    stepperLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: -1 },
    stepperLabelsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8, paddingHorizontal: 5 },
    stepLabel: { fontSize: 10, color: colors.textSecondary, flex: 1, textAlign: 'center' },
    activeStepLabel: { color: colors.header, fontWeight: 'bold' },
    typeSelectorContainer: { flexDirection: 'row', borderWidth: 1, borderColor: colors.header, borderRadius: 10, overflow: 'hidden', marginVertical: 12 },
    typeButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.white },
    activeTypeButton: { backgroundColor: colors.header },
    typeButtonText: { color: colors.header, fontSize: 16, fontWeight: '600' },
    activeTypeButtonText: { color: colors.white },
    unknownButton: { paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.white, marginBottom: 24 },
    activeUnknownButton: { borderColor: colors.header, backgroundColor: '#eef2ff' },
    unknownButtonText: { color: colors.textPrimary, fontWeight: '600' },
    activeUnknownButtonText: { color: colors.header },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'right', marginBottom: 16 },
    formSection: { marginTop: 20 },
    inputContainer: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, textAlign: 'right' },
    requiredAsterisk: { color: colors.error },
    input: { backgroundColor: colors.inputBackground, paddingHorizontal: 15, paddingVertical: 14, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: colors.border, textAlign: 'right', color: colors.textPrimary },
    inputDisabled: { backgroundColor: colors.border },
    footerButtons: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
    nextButton: { backgroundColor: colors.header, paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    nextButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
    prevButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    prevButtonText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
    placeholderText: { textAlign: 'center', padding: 40, fontSize: 18, color: colors.textSecondary },
});

export default ComplaintFormScreen;