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
    Alert,
    UIManager,
} from 'react-native';
// Note : `requestAnimationFrame` est une fonction globale et n'est pas importée.
import * as DocumentPicker from 'expo-document-picker';

const colors = {
    background: '#f8fafc',
    textPrimary: '#1e2d3b',
    textSecondary: '#64748b',
    header: '#1e3a8a',
    white: '#ffffff',
    border: '#e2e8f0',
    inputBackground: '#ffffff',
    error: '#ef4444',
    success: '#10b981',
    focus: '#3b82f6',
};

const FormInput = React.memo(React.forwardRef((
    { label, isRequired, onFocus, editable = true, multiline = false, numberOfLines = 1, ...props },
    ref
) => (
    <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
            {label} {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
        <TextInput
            ref={ref}
            style={[styles.input, !editable && styles.inputDisabled, multiline && styles.multilineInput]}
            placeholderTextColor={colors.textSecondary}
            onFocus={onFocus}
            editable={editable}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            {...props}
        />
    </View>
)));

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
// ÉTAPE 1: INFORMATIONS SUR LE PLAIGNANT (المشتكي)
// ====================================================================
const IndividualForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    return (
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
};

const LegalEntityForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    return (
        <View>
            <FormInput ref={el => inputRefs.current.companyName = el} label="التسمية" isRequired={true} value={formData.companyName} onChangeText={v => onFieldChange('companyName', v)} onFocus={() => onInputFocus('companyName')} />
            <FormInput ref={el => inputRefs.current.legalRep = el} label="الممثل القانوني" isRequired={true} value={formData.legalRep} onChangeText={v => onFieldChange('legalRep', v)} onFocus={() => onInputFocus('legalRep')} />
            <FormInput ref={el => inputRefs.current.companyId = el} label="المعرف الموحد للمقاولة" value={formData.companyId} onChangeText={v => onFieldChange('companyId', v)} onFocus={() => onInputFocus('companyId')} />
            <FormInput ref={el => inputRefs.current.hq = el} label="المقر الاجتماعي" isRequired={true} value={formData.hq} onChangeText={v => onFieldChange('hq', v)} onFocus={() => onInputFocus('hq')} />
            <FormInput ref={el => inputRefs.current.legalEmail = el} label="البريد الالكتروني" keyboardType="email-address" value={formData.legalEmail} onChangeText={v => onFieldChange('legalEmail', v)} onFocus={() => onInputFocus('legalEmail')} />
        </View>
    );
};

const Step1_ComplainantInfo = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    const [complainantType, setComplainantType] = useState(formData.complainantType || 'individual');
    const handleTypeChange = (type) => { setComplainantType(type); onFieldChange('complainantType', type); };
    return (
        <View>
            <View style={styles.typeSelectorContainer}>
                <TouchableOpacity style={[styles.typeButton, complainantType === 'individual' && styles.activeTypeButton]} onPress={() => handleTypeChange('individual')}><Text style={[styles.typeButtonText, complainantType === 'individual' && styles.activeTypeButtonText]}>شخص ذاتي</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, complainantType === 'legal' && styles.activeTypeButton]} onPress={() => handleTypeChange('legal')}><Text style={[styles.typeButtonText, complainantType === 'legal' && styles.activeTypeButtonText]}>شخص معنوي</Text></TouchableOpacity>
            </View>
            {complainantType === 'individual' ? <IndividualForm {...{ onFieldChange, formData, onInputFocus, inputRefs }} /> : <LegalEntityForm {...{ onFieldChange, formData, onInputFocus, inputRefs }} />}
        </View>
    );
};


// ====================================================================
// ÉTAPE 2: INFORMATIONS SUR L'ACCUSÉ (المشتكى به)
// ====================================================================
const RespondentIndividualForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    return (
        <View style={styles.formSection}>
            <FormInput ref={el => inputRefs.current.resp_fullName = el} label="الاسم الكامل" isRequired={true} value={formData.resp_fullName} onChangeText={v => onFieldChange('resp_fullName', v)} onFocus={() => onInputFocus('resp_fullName')} />
            <FormInput ref={el => inputRefs.current.resp_address = el} label="العنوان" value={formData.resp_address} onChangeText={v => onFieldChange('resp_address', v)} onFocus={() => onInputFocus('resp_address')} />
        </View>
    );
};
const RespondentLegalForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    return (
        <View style={styles.formSection}>
            <FormInput ref={el => inputRefs.current.resp_companyName = el} label="التسمية" isRequired={true} value={formData.resp_companyName} onChangeText={v => onFieldChange('resp_companyName', v)} onFocus={() => onInputFocus('resp_companyName')} />
            <FormInput ref={el => inputRefs.current.resp_companyHQ = el} label="المقر الاجتماعي" value={formData.resp_companyHQ} onChangeText={v => onFieldChange('resp_companyHQ', v)} onFocus={() => onInputFocus('resp_companyHQ')} />
            <FormInput ref={el => inputRefs.current.resp_companyId = el} label="المعرف الموحد للمقاولة" value={formData.resp_companyId} onChangeText={v => onFieldChange('resp_companyId', v)} onFocus={() => onInputFocus('resp_companyId')} />
            <FormInput ref={el => inputRefs.current.resp_legalRep = el} label="الممثل القانوني" value={formData.resp_legalRep} onChangeText={v => onFieldChange('resp_legalRep', v)} onFocus={() => onInputFocus('resp_legalRep')} />
        </View>
    );
};
const RespondentUnknownForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    return (
        <View style={styles.formSection}>
            <FormInput ref={el => inputRefs.current.resp_unknownName = el} label="الاسم الكامل" isRequired={true} value={"غير محدد"} editable={false} />
            <FormInput ref={el => inputRefs.current.resp_unknownAddress = el} label="العنوان" value={"غير محدد"} editable={false} />
        </View>
    );
};
const Step2_RespondentInfo = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    const [respondentType, setRespondentType] = useState(formData.respondentType || 'individual');
    const handleTypeChange = (type) => { setRespondentType(type); onFieldChange('respondentType', type); };
    return (
        <View>
            <Text style={styles.sectionTitle}>هل المشتكى به ؟</Text>
            <View style={[styles.typeSelectorContainer, { marginBottom: 10 }]}>
                <TouchableOpacity style={[styles.typeButton, respondentType === 'individual' && styles.activeTypeButton]} onPress={() => handleTypeChange('individual')}><Text style={[styles.typeButtonText, respondentType === 'individual' && styles.activeTypeButtonText]}>شخص ذاتي</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, respondentType === 'legal' && styles.activeTypeButton]} onPress={() => handleTypeChange('legal')}><Text style={[styles.typeButtonText, respondentType === 'legal' && styles.activeTypeButtonText]}>شخص معنوي</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.unknownButton, respondentType === 'unknown' && styles.activeUnknownButton]} onPress={() => handleTypeChange('unknown')}><Text style={[styles.unknownButtonText, respondentType === 'unknown' && styles.activeUnknownButtonText]}>المشتكى به غير محدد</Text></TouchableOpacity>
            {respondentType === 'individual' && <RespondentIndividualForm {...{ onFieldChange, formData, onInputFocus, inputRefs }} />}
            {respondentType === 'legal' && <RespondentLegalForm {...{ onFieldChange, formData, onInputFocus, inputRefs }} />}
            {respondentType === 'unknown' && <RespondentUnknownForm {...{ onFieldChange, formData, onInputFocus, inputRefs }} />}
        </View>
    );
};


// ====================================================================
// ÉTAPE 3: INFORMATIONS SUR LA PLAINTE (الشكاية)
// ====================================================================
const Step3_ComplaintDetails = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
    const [attachments, setAttachments] = useState(formData.attachments || []);
    const handlePickDocument = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], multiple: true });
            if (!result.canceled) {
                const newFiles = result.assets.map(asset => ({ name: asset.name, uri: asset.uri, size: asset.size }));
                const updatedAttachments = [...attachments, ...newFiles];
                setAttachments(updatedAttachments);
                onFieldChange('attachments', updatedAttachments);
            }
        } catch (err) {
            console.warn(err);
            Alert.alert('Erreur', 'Impossible de sélectionner un fichier. Avez-vous reconstruit l\'application (npx expo run:android) ?');
        }
    }, [attachments, onFieldChange]);

    const removeAttachment = (index) => {
        const updatedAttachments = attachments.filter((_, i) => i !== index);
        setAttachments(updatedAttachments);
        onFieldChange('attachments', updatedAttachments);
    };

    return (
        <View>
            <FormInput ref={el => inputRefs.current.complaintSummary = el} label="ملخص الشكاية" isRequired={true} value={formData.complaintSummary} onChangeText={v => onFieldChange('complaintSummary', v)} onFocus={() => onInputFocus('complaintSummary')} multiline={true} numberOfLines={8} />
            <View style={styles.attachmentSection}>
                <Text style={styles.inputLabel}>المرفقات</Text>
                <TouchableOpacity style={styles.browseButton} onPress={handlePickDocument}>
                    <Text style={styles.browseButtonText}>... تصفح</Text>
                </TouchableOpacity>
                {attachments.map((file, index) => (
                    <View key={index} style={styles.attachmentItem}>
                        <View style={styles.attachmentInfo}><Text style={styles.attachmentName} numberOfLines={1}>{file.name}</Text><Text style={styles.attachmentSize}>{(file.size / 1024).toFixed(2)} KB</Text></View>
                        <TouchableOpacity onPress={() => removeAttachment(index)} style={styles.removeButton}><Text style={styles.removeButtonText}>×</Text></TouchableOpacity>
                    </View>
                ))}
                <Text style={styles.attachmentInstructions}>حرصا على جدية الشكاية يرجى إرفاق وثيقة تثبت هويتكم و أي وثيقة لها علاقة بها. يمكنكم إرفاق وثيقة لا يتجاوز حجمها 2 ميغا بايت الأشكال المقبولة هي PDF و صور</Text>
            </View>
        </View>
    );
};


// ====================================================================
// ÉTAPE 4: CONFIRMATION
// ====================================================================
const Step4_Confirmation = ({ formData }) => {
    return (
        <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationTitle}>تأكيد المعطيات</Text>
            <ScrollView style={styles.confirmationContent}>
                <View style={styles.confirmationSection}>
                    <Text style={styles.confirmationSectionTitle}>معلومات المشتكي</Text>
                    {formData.complainantType === 'individual' ? (
                        <View>
                            <Text style={styles.confirmationItem}>الاسم: {formData.firstName || ''} {formData.lastName || ''}</Text>
                            <Text style={styles.confirmationItem}>رقم التعريف: {formData.idNumber || ''}</Text>
                            <Text style={styles.confirmationItem}>البريد الإلكتروني: {formData.email || ''}</Text>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.confirmationItem}>التسمية: {formData.companyName || ''}</Text>
                            <Text style={styles.confirmationItem}>الممثل القانوني: {formData.legalRep || ''}</Text>
                            <Text style={styles.confirmationItem}>البريد الإلكتروني: {formData.legalEmail || ''}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.confirmationSection}>
                    <Text style={styles.confirmationSectionTitle}>معلومات المشتكى به</Text>
                    {formData.respondentType === 'individual' && (<Text style={styles.confirmationItem}>الاسم: {formData.resp_fullName || ''}</Text>)}
                    {formData.respondentType === 'legal' && (<Text style={styles.confirmationItem}>التسمية: {formData.resp_companyName || ''}</Text>)}
                    {formData.respondentType === 'unknown' && (<Text style={styles.confirmationItem}>المشتكى به: غير محدد</Text>)}
                </View>
                <View style={styles.confirmationSection}>
                    <Text style={styles.confirmationSectionTitle}>ملخص الشكاية</Text>
                    <Text style={styles.confirmationItem}>{formData.complaintSummary || ''}</Text>
                </View>
                {formData.attachments && formData.attachments.length > 0 && (
                    <View style={styles.confirmationSection}>
                        <Text style={styles.confirmationSectionTitle}>المرفقات ({formData.attachments.length})</Text>
                        {formData.attachments.map((file, index) => (<Text key={index} style={styles.confirmationItem}>• {file.name}</Text>))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};


// ====================================================================
// COMPOSANT PRINCIPAL : GESTIONNAIRE D'ÉTAPES
// ====================================================================
const ComplaintFormScreen = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({ complainantType: 'individual', respondentType: 'individual', attachments: [] });
    const scrollViewRef = useRef(null);
    const inputRefs = useRef({});

    const handleInputFocus = useCallback((inputKey) => {
        requestAnimationFrame(() => {
            const node = inputRefs.current[inputKey];
            const scroll = scrollViewRef.current;
            if (!node || !scroll) return;

            const nodeHandle = findNodeHandle(node);
            const scrollHandle = findNodeHandle(scroll);

            if (nodeHandle && scrollHandle) {
                UIManager.measureLayout(
                    nodeHandle,
                    scrollHandle,
                    (err) => console.warn('measureLayout error:', err),
                    (x, y) => scroll.scrollTo({ y: y - 20, animated: true })
                );
            }
        });
    }, []);

    const handleFieldChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        } else {
            Alert.alert('إرسال الشكاية', 'هل أنت متأكد من أنك تريد إرسال هذه الشكاية؟', [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'إرسال', onPress: () => console.log('SUBMITTING:', formData) }
            ]);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }
    };

    const renderCurrentStep = () => {
        const stepProps = {
            onFieldChange: handleFieldChange,
            formData,
            onInputFocus: handleInputFocus,
            inputRefs
        };

        switch(currentStep) {
            case 1: return <Step1_ComplainantInfo {...stepProps} />;
            case 2: return <Step2_RespondentInfo {...stepProps} />;
            case 3: return <Step3_ComplaintDetails {...stepProps} />;
            case 4: return <Step4_Confirmation formData={formData} />;
            default: return null;
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
                        <Text style={styles.nextButtonText}>{currentStep === 4 ? 'إرسال الشكاية' : 'المرحلة الموالية'}</Text>
                    </TouchableOpacity>
                    {currentStep > 1 && (<TouchableOpacity style={styles.prevButton} onPress={handlePrevStep}><Text style={styles.prevButtonText}>المرحلة السابقة</Text></TouchableOpacity>)}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


// ====================================================================
// STYLES
// ====================================================================
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
    multilineInput: { height: 140, textAlignVertical: 'top', paddingTop: 14 },
    footerButtons: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
    nextButton: { backgroundColor: colors.header, paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    nextButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
    prevButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    prevButtonText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
    placeholderText: { textAlign: 'center', padding: 40, fontSize: 18, color: colors.textSecondary },
    attachmentSection: { marginTop: 16 },
    browseButton: { backgroundColor: colors.white, borderColor: colors.header, borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
    browseButtonText: { color: colors.header, fontSize: 16, fontWeight: '600' },
    attachmentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eef2ff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8 },
    attachmentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    attachmentName: { color: colors.textPrimary, flexShrink: 1, marginRight: 8 },
    attachmentSize: { color: colors.textSecondary, fontSize: 12 },
    removeButton: { padding: 8 },
    removeButtonText: { color: colors.error, fontSize: 20, fontWeight: 'bold' },
    attachmentInstructions: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginTop: 8 },
    confirmationContainer: { padding: 10 },
    confirmationTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: 20 },
    confirmationContent: { maxHeight: 400 },
    confirmationSection: { marginBottom: 20, backgroundColor: colors.white, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
    confirmationSectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.header, marginBottom: 10, textAlign: 'right', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 5 },
    confirmationItem: { fontSize: 14, color: colors.textPrimary, marginBottom: 5, textAlign: 'right', lineHeight: 20 },
});

export default ComplaintFormScreen;