// -----------------------------------------------------------------------------
// file : mon-app-frontend/src/screens/ComplaintFormScreen.js
// (FULL REPLACEMENT)
// -----------------------------------------------------------------------------
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
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';

import CountryPicker from '../components/CountryPicker';
import CityPicker    from '../components/CityPicker';
import { useSubmitComplaint } from '../hooks/useSubmitComplaint';

/* ─────────────────────────────────────────────────────────────────── */
/*  Theme colours                                                     */
/* ─────────────────────────────────────────────────────────────────── */
const colors = {
  background    : '#f8fafc',
  white         : '#FFFFFF',
  accent        : '#CCA43B',
  primary       : '#3A4F53',
  textPrimary   : '#1a202c',
  textSecondary : '#718096',
  border        : '#e2e8f0',
  inputBackground: '#ffffff',
  error         : '#ef4444',
  success       : '#10b981',
  focus         : '#5a7d83',
  smsBlue       : '#CCA43B',
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Helpers                                                           */
/* ─────────────────────────────────────────────────────────────────── */
const nullIfEmpty = v => {
  if (v == null) return null;
  const t = String(v).trim();
  return t.length ? t : null;
};

/* ─────────────────────────────────────────────────────────────────── */
/*  FormStepper Component                                             */
/* ─────────────────────────────────────────────────────────────────── */
const FormStepper = ({ currentStep }) => {
  const steps = ['المشتكي', 'المشتكى به', 'الشكاية', 'التأكيد'];
  
  return (
    <View style={styles.stepperWrapper}>
      <View style={styles.stepperContainer}>
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <View style={[
              styles.step,
              currentStep > index && styles.activeStep
            ]}>
              <Text style={[
                styles.stepText,
                currentStep > index && styles.activeStepText
              ]}>
                {index + 1}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={styles.stepperLine} />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.stepperLabelsContainer}>
        {steps.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.stepLabel,
              currentStep > index && styles.activeStepLabel
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Shared <FormInput/>                                               */
/* ─────────────────────────────────────────────────────────────────── */
const FormInput = React.memo(
  React.forwardRef(
    (
      {
        label,
        isRequired,
        onFocus,
        editable = true,
        multiline = false,
        numberOfLines = 1,
        ...props
      },
      ref,
    ) => {
      const [isFocused, setIsFocused] = useState(false);
      const handleFocus = e => {
        setIsFocused(true);
        onFocus?.(e);
      };
      const handleBlur = () => setIsFocused(false);

      return (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {label}{' '}
            {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
          </Text>

          <TextInput
            ref={ref}
            style={[
              styles.input,
              !editable && styles.inputDisabled,
              isFocused  && styles.inputFocused,
              multiline  && styles.multilineInput,
            ]}
            placeholderTextColor={colors.textSecondary}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={editable}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            {...props}
          />
        </View>
      );
    },
  ),
);

/* ─────────────────────────────────────────────────────────────────── */
/*  Step-1 sub-forms                                                  */
/* ─────────────────────────────────────────────────────────────────── */
const IndividualForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
  const handleCountry = id => {
    onFieldChange('idPays', id);
    onFieldChange('idVille', null);
  };
  const handleCity = id => onFieldChange('idVille', id);

  return (
    <View>
      <FormInput
        ref={el => (inputRefs.current.firstName = el)}
        label="الاسم الشخصي"
        isRequired
        value={formData.firstName}
        onChangeText={v => onFieldChange('firstName', v)}
        onFocus={() => onInputFocus('firstName')}
      />
      <FormInput
        ref={el => (inputRefs.current.lastName = el)}
        label="الاسم العائلي"
        isRequired
        value={formData.lastName}
        onChangeText={v => onFieldChange('lastName', v)}
        onFocus={() => onInputFocus('lastName')}
      />
      <FormInput
        ref={el => (inputRefs.current.idNumber = el)}
        label="رقم وثيقة التعريف"
        isRequired
        value={formData.idNumber}
        onChangeText={v => onFieldChange('idNumber', v)}
        onFocus={() => onInputFocus('idNumber')}
      />
      <FormInput
        ref={el => (inputRefs.current.sexe = el)}
        label="الجنس"
        value={formData.sexe}
        onChangeText={v => onFieldChange('sexe', v)}
        onFocus={() => onInputFocus('sexe')}
        placeholder="F / M"
      />

      <CountryPicker
        selectedValue={formData.idPays}
        onValueChange={handleCountry}
        isRequired
      />
      <CityPicker
        idPays={formData.idPays}
        selectedValue={formData.idVille}
        onValueChange={handleCity}
        isRequired
      />

      <FormInput
        ref={el => (inputRefs.current.address = el)}
        label="العنوان"
        isRequired
        value={formData.address}
        onChangeText={v => onFieldChange('address', v)}
        onFocus={() => onInputFocus('address')}
      />
      <FormInput
        ref={el => (inputRefs.current.email = el)}
        label="البريد الالكتروني"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={v => onFieldChange('email', v)}
        onFocus={() => onInputFocus('email')}
      />
    </View>
  );
};

const LegalEntityForm = ({
  onFieldChange,
  formData,
  onInputFocus,
  inputRefs,
}) => (
  <View>
    <FormInput
      ref={el => (inputRefs.current.companyName = el)}
      label="التسمية"
      isRequired
      value={formData.companyName}
      onChangeText={v => onFieldChange('companyName', v)}
      onFocus={() => onInputFocus('companyName')}
    />
    <FormInput
      ref={el => (inputRefs.current.companyRC = el)}
      label="رقم السجل التجاري (RC)"
      isRequired
      value={formData.companyRC}
      onChangeText={v => onFieldChange('companyRC', v)}
      onFocus={() => onInputFocus('companyRC')}
    />
    <FormInput
      ref={el => (inputRefs.current.legalRep = el)}
      label="الممثل القانوني"
      isRequired
      value={formData.legalRep}
      onChangeText={v => onFieldChange('legalRep', v)}
      onFocus={() => onInputFocus('legalRep')}
    />
    <FormInput
      ref={el => (inputRefs.current.hq = el)}
      label="المقر الاجتماعي"
      isRequired
      value={formData.hq}
      onChangeText={v => onFieldChange('hq', v)}
      onFocus={() => onInputFocus('hq')}
    />
    <FormInput
      ref={el => (inputRefs.current.legalEmail = el)}
      label="البريد الالكتروني"
      keyboardType="email-address"
      value={formData.legalEmail}
      onChangeText={v => onFieldChange('legalEmail', v)}
      onFocus={() => onInputFocus('legalEmail')}
    />
  </View>
);

/* ─────────────────────────────────────────────────────────────────── */
/*  Step-1 container (complainant)                                    */
/* ─────────────────────────────────────────────────────────────────── */
const Step1_ComplainantInfo = ({
  onFieldChange,
  formData,
  onInputFocus,
  inputRefs,
}) => {
  const [type, setType] = useState(formData.complainantType || 'individual');
  const pick = t => {
    setType(t);
    onFieldChange('complainantType', t);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>معلومات المشتكي</Text>
      <View style={styles.typeSelectorContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'individual' && styles.activeTypeButton]}
          onPress={() => pick('individual')}>
          <Text
            style={[
              styles.typeButtonText,
              type === 'individual' && styles.activeTypeButtonText,
            ]}>
            شخص ذاتي
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'legal' && styles.activeTypeButton]}
          onPress={() => pick('legal')}>
          <Text
            style={[
              styles.typeButtonText,
              type === 'legal' && styles.activeTypeButtonText,
            ]}>
            شخص معنوي
          </Text>
        </TouchableOpacity>
      </View>

      {type === 'individual' ? (
        <IndividualForm
          {...{ onFieldChange, formData, onInputFocus, inputRefs }}
        />
      ) : (
        <LegalEntityForm
          {...{ onFieldChange, formData, onInputFocus, inputRefs }}
        />
      )}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Step-2 (Respondent Info)                                         */
/* ─────────────────────────────────────────────────────────────────── */
const Step2_RespondentInfo = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
  const [type, setType] = useState(formData.respondentType || 'individual');
  
  const pick = t => {
    setType(t);
    onFieldChange('respondentType', t);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>معلومات المشتكى به</Text>
      
      <View style={styles.typeSelectorContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'individual' && styles.activeTypeButton]}
          onPress={() => pick('individual')}>
          <Text
            style={[
              styles.typeButtonText,
              type === 'individual' && styles.activeTypeButtonText,
            ]}>
            شخص ذاتي
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'legal' && styles.activeTypeButton]}
          onPress={() => pick('legal')}>
          <Text
            style={[
              styles.typeButtonText,
              type === 'legal' && styles.activeTypeButtonText,
            ]}>
            شخص معنوي
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'unknown' && styles.activeTypeButton]}
          onPress={() => pick('unknown')}>
          <Text
            style={[
              styles.typeButtonText,
              type === 'unknown' && styles.activeTypeButtonText,
            ]}>
            غير معروف
          </Text>
        </TouchableOpacity>
      </View>

      {type === 'individual' && (
        <FormInput
          ref={el => (inputRefs.current.resp_fullName = el)}
          label="الاسم الكامل"
          isRequired
          value={formData.resp_fullName}
          onChangeText={v => onFieldChange('resp_fullName', v)}
          onFocus={() => onInputFocus('resp_fullName')}
        />
      )}

      {type === 'legal' && (
        <FormInput
          ref={el => (inputRefs.current.resp_companyName = el)}
          label="اسم الشركة"
          isRequired
          value={formData.resp_companyName}
          onChangeText={v => onFieldChange('resp_companyName', v)}
          onFocus={() => onInputFocus('resp_companyName')}
        />
      )}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Step-3 (Complaint Details)                                       */
/* ─────────────────────────────────────────────────────────────────── */
const Step3_ComplaintDetails = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          type: asset.mimeType,
        }));
        
        onFieldChange('attachments', [...(formData.attachments || []), ...newFiles]);
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل في اختيار المرفقات');
    }
  };

  const removeAttachment = index => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    onFieldChange('attachments', newAttachments);
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>تفاصيل الشكاية</Text>
      
      <FormInput
        ref={el => (inputRefs.current.complaintSummary = el)}
        label="ملخص الشكاية"
        isRequired
        multiline
        numberOfLines={6}
        value={formData.complaintSummary}
        onChangeText={v => onFieldChange('complaintSummary', v)}
        onFocus={() => onInputFocus('complaintSummary')}
        placeholder="اكتب ملخصاً مفصلاً عن شكايتك..."
      />

      <View style={styles.attachmentSection}>
        <TouchableOpacity style={styles.browseButton} onPress={pickDocument}>
          <Text style={styles.browseButtonText}>إضافة مرفقات</Text>
        </TouchableOpacity>

        {formData.attachments?.map((file, index) => (
          <View key={index} style={styles.attachmentItem}>
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.attachmentSize}>
                ({formatFileSize(file.size)})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeAttachment(index)}>
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.attachmentInstructions}>
          يمكنك إرفاق الوثائق المساعدة (PDF, Word, صور) - حجم أقصى 5MB لكل ملف
        </Text>
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Step-4 (Confirmation)                                            */
/* ─────────────────────────────────────────────────────────────────── */
const Step4_Confirmation = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
  return (
    <View style={styles.confirmationContainer}>
      <Text style={styles.confirmationTitle}>مراجعة وتأكيد الشكاية</Text>
      
      <ScrollView style={styles.confirmationContent} showsVerticalScrollIndicator={false}>
        {/* Complainant Info */}
        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationSectionTitle}>معلومات المشتكي</Text>
          {formData.complainantType === 'individual' ? (
            <>
              <Text style={styles.confirmationItem}>
                الاسم: {formData.firstName} {formData.lastName}
              </Text>
              <Text style={styles.confirmationItem}>
                رقم التعريف: {formData.idNumber}
              </Text>
              <Text style={styles.confirmationItem}>
                العنوان: {formData.address}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.confirmationItem}>
                اسم الشركة: {formData.companyName}
              </Text>
              <Text style={styles.confirmationItem}>
                رقم السجل التجاري: {formData.companyRC}
              </Text>
              <Text style={styles.confirmationItem}>
                الممثل القانوني: {formData.legalRep}
              </Text>
            </>
          )}
        </View>

        {/* Respondent Info */}
        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationSectionTitle}>معلومات المشتكى به</Text>
          {formData.respondentType === 'individual' && (
            <Text style={styles.confirmationItem}>
              الاسم: {formData.resp_fullName}
            </Text>
          )}
          {formData.respondentType === 'legal' && (
            <Text style={styles.confirmationItem}>
              اسم الشركة: {formData.resp_companyName}
            </Text>
          )}
          {formData.respondentType === 'unknown' && (
            <Text style={styles.confirmationItem}>النوع: غير معروف</Text>
          )}
        </View>

        {/* Complaint Details */}
        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationSectionTitle}>تفاصيل الشكاية</Text>
          <Text style={styles.confirmationComplaintText}>
            {formData.complaintSummary}
          </Text>
          {formData.attachments?.length > 0 && (
            <Text style={styles.confirmationItem}>
              المرفقات: {formData.attachments.length} ملف(ات)
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Phone Verification */}
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>التحقق من الهاتف</Text>
        
        <FormInput
          ref={el => (inputRefs.current.phoneToVerify = el)}
          label="رقم الهاتف"
          isRequired
          keyboardType="phone-pad"
          value={formData.phoneToVerify}
          onChangeText={v => onFieldChange('phoneToVerify', v)}
          onFocus={() => onInputFocus('phoneToVerify')}
          placeholder="0612345678"
        />

        <TouchableOpacity style={styles.smsButton}>
          <Text style={styles.smsButtonText}>إرسال رمز التحقق</Text>
        </TouchableOpacity>

        <FormInput
          ref={el => (inputRefs.current.otpCode = el)}
          label="رمز التحقق"
          isRequired
          keyboardType="numeric"
          value={formData.otpCode}
          onChangeText={v => onFieldChange('otpCode', v)}
          onFocus={() => onInputFocus('otpCode')}
          placeholder="أدخل رمز التحقق"
        />
      </View>
    </View>
  );
};

/* ================================================================== */
/*  MAIN SCREEN                                                       */
/* ================================================================== */
const ComplaintFormScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    complainantType: 'individual',
    respondentType : 'individual',
    attachments    : [],
  });

  const scrollRef = useRef(null);
  const inputRefs = useRef({});
  const navigation = useNavigation();
  const { mutate: submitComplaint, isPending } = useSubmitComplaint();

  /* ---------- focus helper ---------- */
  const onInputFocus = inputKey => {
    requestAnimationFrame(() => {
      const node   = inputRefs.current[inputKey];
      const scroll = scrollRef.current;
      if (node && scroll) {
        node.measureLayout(
          findNodeHandle(scroll),
          (x, y) => scroll.scrollTo({ y: y - 60, animated: true }),
          () => {},
        );
      }
    });
  };

  const onFieldChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  /* ---------- submit ---------- */
  const handleSubmit = () => {
    if (!formData.phoneToVerify || !formData.otpCode) {
      Alert.alert('خطأ', 'المرجو إدخال رقم الهاتف ورمز التأكيد.');
      return;
    }

    /* map respondent type to backend enum */
    const defMap = { individual: 'P', legal: 'M', unknown: 'I' };

    /* build PLAIGNANT payload */
    let plaignant;
    if (formData.complainantType === 'legal') {
      plaignant = {
        nom                : formData.companyName || '',
        prenom             : '-',                       // not null
        numeroRC           : formData.companyRC || '',
        cin                : null,
        idPays             : formData.idPays  || 1,
        idVille            : formData.idVille || 1,
        idSituationResidence: 1,
        idProfession       : 1,
        sexe               : null,
        adresse            : formData.hq || '',
        telephone          : formData.phoneToVerify,
        email              : nullIfEmpty(formData.legalEmail),
      };
    } else {
      plaignant = {
        nom                : formData.lastName  || '',
        prenom             : formData.firstName || '-',
        cin                : formData.idNumber  || '',
        idPays             : formData.idPays  || 1,
        idVille            : formData.idVille || 1,
        idSituationResidence: 1,
        idProfession       : 1,
        sexe               : (formData.sexe || 'M').toUpperCase() === 'F' ? 'F' : 'M',
        adresse            : formData.address || '',
        telephone          : formData.phoneToVerify,
        email              : nullIfEmpty(formData.email),
      };
    }

    const jsonBody = {
      complainantType: formData.complainantType,
      plaignant,
      defendeur: {
        type         : defMap[formData.respondentType] || 'I',
        nom          : formData.respondentType === 'individual'
                       ? nullIfEmpty(formData.resp_fullName)
                       : null,
        nomCommercial: formData.respondentType === 'legal'
                       ? nullIfEmpty(formData.resp_companyName)
                       : null,
      },
      plainteDetails: {
        resume           : formData.complaintSummary || '',
        idObjetInjustice : 1,
        idJuridiction    : 1,
      },
      phoneToVerify: formData.phoneToVerify,
    };

    submitComplaint(
      { jsonBody, files: formData.attachments },
      {
        onSuccess: d =>
          navigation.navigate('TrackComplaint', {
            complaintId : d.complaintId,
            trackingCode: d.trackingCode,
          }),
        onError: err => {
          const msg =
            err.response?.data?.message || err.message || 'حدث خطأ غير متوقع';
          Alert.alert('خطأ', msg);
        },
      },
    );
  };

  /* ---------- step navigation ---------- */
  const next = () => {
    if (currentStep === 3 && (!formData.complaintSummary || formData.complaintSummary.length < 10)) {
      Alert.alert('خطأ', 'يجب أن يكون ملخص الشكاية 10 أحرف على الأقل.');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(p => p + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      handleSubmit();
    }
  };
  
  const prev = () => {
    if (currentStep > 1) {
      setCurrentStep(p => p - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const stepProps = { onFieldChange, formData, onInputFocus, inputRefs };
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1_ComplainantInfo {...stepProps} />;
      case 2: return <Step2_RespondentInfo  {...stepProps} />;
      case 3: return <Step3_ComplaintDetails {...stepProps} />;
      case 4: return <Step4_Confirmation {...stepProps} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <FormStepper currentStep={currentStep} />
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          {isPending && (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.activityIndicator}
            />
          )}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                isPending && styles.disabledButton,
              ]}
              onPress={next}
              disabled={isPending}>
              <Text style={styles.nextButtonText}>
                {currentStep === 4 ? 'وضع الشكاية' : 'المرحلة الموالية'}
              </Text>
            </TouchableOpacity>

            {currentStep > 1 && (
              <TouchableOpacity
                style={[
                  styles.prevButton,
                  isPending && styles.disabledButton,
                ]}
                onPress={prev}
                disabled={isPending}>
                <Text style={styles.prevButtonText}>المرحلة السابقة</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Styles                                                            */
/* ─────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepperWrapper: { marginBottom: 20, alignItems: 'center' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, width: '100%' },
  step: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  activeStep: { backgroundColor: colors.primary },
  stepText: { color: colors.textSecondary, fontWeight: 'bold' },
  activeStepText: { color: colors.white },
  stepperLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: -1 },
  stepperLabelsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8, paddingHorizontal: 5 },
  stepLabel: { fontSize: 10, color: colors.textSecondary, flex: 1, textAlign: 'center' },
  activeStepLabel: { color: colors.primary, fontWeight: 'bold' },
  typeSelectorContainer: { flexDirection: 'row', borderWidth: 1, borderColor: colors.primary, borderRadius: 10, overflow: 'hidden', marginVertical: 12 },
  typeButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.white },
  activeTypeButton: { backgroundColor: colors.primary },
  typeButtonText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  activeTypeButtonText: { color: colors.white },
  unknownButton: { paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.white, marginBottom: 24 },
  activeUnknownButton: { borderColor: colors.primary, backgroundColor: 'rgba(58, 79, 83, 0.1)' },
  unknownButtonText: { color: colors.textPrimary, fontWeight: '600' },
  activeUnknownButtonText: { color: colors.primary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'right', marginBottom: 16 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, textAlign: 'right' },
  requiredAsterisk: { color: colors.error },
  input: { backgroundColor: colors.inputBackground, paddingHorizontal: 15, paddingVertical: 14, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: colors.border, textAlign: 'right', color: colors.textPrimary },
  inputDisabled: { backgroundColor: colors.border },
  inputFocused: { borderColor: colors.focus, borderWidth: 1.5 },
  multilineInput: { height: 140, textAlignVertical: 'top', paddingTop: 14 },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  footerButtons: { padding: 20 },
  nextButton: { backgroundColor: colors.accent, paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  nextButtonText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  prevButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  prevButtonText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
  activityIndicator: { paddingVertical: 10 },
  attachmentSection: { marginTop: 16 },
  browseButton: { backgroundColor: colors.white, borderColor: colors.accent, borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  browseButtonText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  attachmentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(58, 79, 83, 0.05)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8 },
  attachmentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  attachmentName: { color: colors.textPrimary, flexShrink: 1, marginRight: 8 },
  attachmentSize: { color: colors.textSecondary, fontSize: 12 },
  removeButton: { padding: 8 },
  removeButtonText: { color: colors.error, fontSize: 20, fontWeight: 'bold' },
  attachmentInstructions: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginTop: 8 },
  confirmationContainer: { padding: 10 },
  confirmationTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: 20 },
  confirmationContent: { maxHeight: 250 },
  confirmationSection: { marginBottom: 15, backgroundColor: colors.white, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  confirmationSectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 10, textAlign: 'right', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 5 },
  confirmationItem: { fontSize: 14, color: colors.textPrimary, marginBottom: 5, textAlign: 'right', lineHeight: 20 },
  confirmationComplaintText: { fontSize: 14, color: colors.textPrimary, textAlign: 'right', lineHeight: 20 },
  verificationContainer: { padding: 20, marginTop: 10, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  verificationTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, textAlign: 'right', marginBottom: 16 },
  smsButton: { backgroundColor: colors.smsBlue, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  smsButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
});

export default ComplaintFormScreen;