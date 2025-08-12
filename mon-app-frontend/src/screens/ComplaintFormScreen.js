// file: mon-app-frontend/src/screens/ComplaintFormScreen.js
import React, { useState, useRef } from 'react';
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
  UIManager,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';

import CountryPicker from '../components/CountryPicker';
import CityPicker from '../components/CityPicker';
import { LookupPicker } from '../components/LookupPicker';

import { useGenders, useResidenceSituations } from '../api/lookup';
import { useSubmitComplaint } from '../hooks/useSubmitComplaint';

const DEFAULT_PROF_ID = 1;       // "غير محدد"
const DEFAULT_RESIDENCE_ID = 1;  // "مغربي"

const MAX_MB = 2;
const ALLOWED = new Set(['application/pdf', 'image/jpeg']);

const colors = {
  background: '#f8fafc',
  white: '#FFFFFF',
  accent: '#CCA43B',
  primary: '#3A4F53',
  textPrimary: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0',
  inputBackground: '#ffffff',
  error: '#ef4444',
  success: '#10b981',
  focus: '#5a7d83',
  smsBlue: '#CCA43B',
};

const nullIfEmpty = (v) => {
  if (v == null) return null;
  const t = String(v).trim();
  return t.length ? t : null;
};

/* ── shared text input ────────────────────────────────────────── */
const FormInput = React.memo(
  React.forwardRef(({ label, isRequired, onFocus, multiline = false, numberOfLines = 1, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label} {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
        <TextInput
          ref={ref}
          style={[styles.input, isFocused && styles.inputFocused, multiline && styles.multilineInput]}
          placeholderTextColor={colors.textSecondary}
          onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          {...props}
        />
      </View>
    );
  })
);

/* ── stepper ──────────────────────────────────────────────────── */
const FormStepper = ({ currentStep }) => {
  const steps = ['المشتكي', 'المشتكى به', 'الشكاية', 'التأكيد'];
  return (
    <View style={styles.stepperWrapper}>
      <View style={styles.stepperContainer}>
        {steps.map((_, i) => (
          <React.Fragment key={i}>
            <View style={[styles.step, currentStep > i && styles.activeStep]}>
              <Text style={[styles.stepText, currentStep > i && styles.activeStepText]}>{i + 1}</Text>
            </View>
            {i < steps.length - 1 && <View style={styles.stepperLine} />}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.stepperLabelsContainer}>
        {steps.map((lbl, i) => (
          <Text key={i} style={[styles.stepLabel, currentStep > i && styles.activeStepLabel]}>
            {lbl}
          </Text>
        ))}
      </View>
    </View>
  );
};

/* ── Step-1 ▶︎ Individual ─────────────────────────────────────── */
const IndividualForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
  const { data: genders = [] } = useGenders();
  const { data: residences = [] } = useResidenceSituations();

  const handleCountry = (id) => {
    onFieldChange('idPays', id);
    onFieldChange('idVille', null);
  };
  const handleCity = (id) => onFieldChange('idVille', id);

  return (
    <View>
      <FormInput
        ref={(el) => (inputRefs.current.firstName = el)}
        label="الاسم الشخصي"
        isRequired
        value={formData.firstName}
        onChangeText={(v) => onFieldChange('firstName', v)}
        onFocus={() => onInputFocus('firstName')}
      />
      <FormInput
        ref={(el) => (inputRefs.current.lastName = el)}
        label="الاسم العائلي"
        isRequired
        value={formData.lastName}
        onChangeText={(v) => onFieldChange('lastName', v)}
        onFocus={() => onInputFocus('lastName')}
      />
      <FormInput
        ref={(el) => (inputRefs.current.idNumber = el)}
        label="رقم وثيقة التعريف"
        isRequired
        value={formData.idNumber}
        onChangeText={(v) => onFieldChange('idNumber', v)}
        onFocus={() => onInputFocus('idNumber')}
      />

      <LookupPicker
        label="الجنس"
        value={formData.sexe}
        onChange={(v) => onFieldChange('sexe', v)}
        options={genders}
      />

      {/* REQUIRED: residence situation */}
      <LookupPicker
        label="محل الإقامة"
        value={formData.idSituationResidence}
        onChange={(v) => onFieldChange('idSituationResidence', v)}
        options={residences}
      />

      <CountryPicker isRequired selectedValue={formData.idPays} onValueChange={handleCountry} />
      <CityPicker
        isRequired
        idPays={formData.idPays}
        selectedValue={formData.idVille}
        onValueChange={handleCity}
      />

      <FormInput
        ref={(el) => (inputRefs.current.address = el)}
        label="العنوان"
        isRequired
        value={formData.address}
        onChangeText={(v) => onFieldChange('address', v)}
        onFocus={() => onInputFocus('address')}
      />
      <FormInput
        ref={(el) => (inputRefs.current.email = el)}
        label="البريد الالكتروني"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(v) => onFieldChange('email', v)}
        onFocus={() => onInputFocus('email')}
      />
    </View>
  );
};

/* ── Step-1 ▶︎ Legal entity ────────────────────────────────────── */
const LegalEntityForm = ({ onFieldChange, formData, onInputFocus, inputRefs }) => (
  <View>
    {/* REQUIRED: NomCommercial */}
    <FormInput
      ref={(el) => (inputRefs.current.companyName = el)}
      label="التسمية"
      isRequired
      value={formData.companyName}
      onChangeText={(v) => onFieldChange('companyName', v)}
      onFocus={() => onInputFocus('companyName')}
    />

    {/* OPTIONAL: RC (no red star) */}
    <FormInput
      ref={(el) => (inputRefs.current.companyRC = el)}
      label="رقم السجل التجاري (RC)"
      value={formData.companyRC}
      onChangeText={(v) => onFieldChange('companyRC', v)}
      onFocus={() => onInputFocus('companyRC')}
    />

    {/* REQUIRED: legal representative */}
    <FormInput
      ref={(el) => (inputRefs.current.legalRep = el)}
      label="الممثل القانوني"
      isRequired
      value={formData.legalRep}
      onChangeText={(v) => onFieldChange('legalRep', v)}
      onFocus={() => onInputFocus('legalRep')}
    />

    {/* REQUIRED: HQ / Siege Social */}
    <FormInput
      ref={(el) => (inputRefs.current.hq = el)}
      label="المقر الاجتماعي"
      isRequired
      value={formData.hq}
      onChangeText={(v) => onFieldChange('hq', v)}
      onFocus={() => onInputFocus('hq')}
    />

    <FormInput
      ref={(el) => (inputRefs.current.legalEmail = el)}
      label="البريد الالكتروني"
      keyboardType="email-address"
      value={formData.legalEmail}
      onChangeText={(v) => onFieldChange('legalEmail', v)}
      onFocus={() => onInputFocus('legalEmail')}
    />
  </View>
);

/* ── Step-1 container ──────────────────────────────────────────── */
const Step1_ComplainantInfo = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
  const [type, setType] = useState(formData.complainantType || 'individual');
  const pick = (t) => { setType(t); onFieldChange('complainantType', t); };
  return (
    <View>
      <Text style={styles.sectionTitle}>معلومات المشتكي</Text>
      <View style={styles.typeSelectorContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'individual' && styles.activeTypeButton]}
          onPress={() => pick('individual')}
        >
          <Text style={[styles.typeButtonText, type === 'individual' && styles.activeTypeButtonText]}>
            شخص ذاتي
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'legal' && styles.activeTypeButton]}
          onPress={() => pick('legal')}
        >
          <Text style={[styles.typeButtonText, type === 'legal' && styles.activeTypeButtonText]}>
            شخص معنوي
          </Text>
        </TouchableOpacity>
      </View>

      {type === 'individual'
        ? <IndividualForm {...{ onFieldChange, formData, onInputFocus, inputRefs }} />
        : <LegalEntityForm {...{ onFieldChange, formData, onInputFocus, inputRefs }} />}
    </View>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  Step-2 ▸ Respondent info                                         */
/* ────────────────────────────────────────────────────────────────── */
const Step2_RespondentInfo = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
  const [type, setType] = useState(formData.respondentType || 'individual');
  const pick = (t) => { setType(t); onFieldChange('respondentType', t); };

  return (
    <View>
      <Text style={styles.sectionTitle}>معلومات المشتكى به</Text>
      <View style={styles.typeSelectorContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'individual' && styles.activeTypeButton]}
          onPress={() => pick('individual')}
        >
          <Text style={[styles.typeButtonText, type === 'individual' && styles.activeTypeButtonText]}>
            شخص ذاتي
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'legal' && styles.activeTypeButton]}
          onPress={() => pick('legal')}
        >
          <Text style={[styles.typeButtonText, type === 'legal' && styles.activeTypeButtonText]}>
            شخص معنوي
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'unknown' && styles.activeTypeButton]}
          onPress={() => pick('unknown')}
        >
          <Text style={[styles.typeButtonText, type === 'unknown' && styles.activeTypeButtonText]}>
            غير معروف
          </Text>
        </TouchableOpacity>
      </View>

      {type === 'individual' && (
        <FormInput
          ref={(el) => (inputRefs.current.resp_fullName = el)}
          label="الاسم الكامل"
          isRequired
          value={formData.resp_fullName}
          onChangeText={(v) => onFieldChange('resp_fullName', v)}
          onFocus={() => onInputFocus('resp_fullName')}
        />
      )}

      {type === 'legal' && (
        <>
          {/* REQUIRED only: company name */}
          <FormInput
            ref={(el) => (inputRefs.current.resp_companyName = el)}
            label="اسم الشركة"
            isRequired
            value={formData.resp_companyName}
            onChangeText={(v) => onFieldChange('resp_companyName', v)}
            onFocus={() => onInputFocus('resp_companyName')}
          />
          {/* OPTIONAL RC (no red star) */}
          <FormInput
            ref={(el) => (inputRefs.current.resp_companyRC = el)}
            label="رقم السجل التجاري (RC)"
            value={formData.resp_companyRC}
            onChangeText={(v) => onFieldChange('resp_companyRC', v)}
            onFocus={() => onInputFocus('resp_companyRC')}
          />
        </>
      )}
    </View>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  Step-3 ▸ Complaint details                                       */
/* ────────────────────────────────────────────────────────────────── */
const Step3_ComplaintDetails = ({ onFieldChange, formData, onInputFocus, inputRefs }) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // we’ll still filter to JPEG below
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets) return;

      const current = formData.attachments || [];
      const roomLeft = Math.max(0, 5 - current.length);
      if (roomLeft === 0) {
        Alert.alert('حدّ المرفقات', 'يمكنك إرفاق 5 ملفات كحد أقصى.');
        return;
      }

      const picked = result.assets.slice(0, roomLeft);
      const accepted = [];
      const rejected = [];

      for (const a of picked) {
        const type = a.mimeType || '';
        const sizeMB = (a.size || 0) / (1024 * 1024);
        const isPdf = type === 'application/pdf';
        const isJpeg = type === 'image/jpeg' || /\.jpe?g$/i.test(a.name || '');

        if (!(isPdf || isJpeg) || !ALLOWED.has(isPdf ? 'application/pdf' : 'image/jpeg')) {
          rejected.push(`${a.name} (نوع غير مسموح)`);
          continue;
        }
        if (sizeMB > MAX_MB) {
          rejected.push(`${a.name} (> ${MAX_MB}MB)`);
          continue;
        }
        accepted.push({
          uri: a.uri,
          name: a.name || (isPdf ? 'file.pdf' : 'photo.jpg'),
          size: a.size,
          type: isPdf ? 'application/pdf' : 'image/jpeg',
        });
      }

      if (rejected.length) {
        Alert.alert(
          'المرفقات',
          `تم رفض:\n- ${rejected.join('\n- ')}\n\nالمسموح: PDF أو JPEG، الحجم ≤ ${MAX_MB}MB، حتى 5 ملفات.`,
        );
      }
      if (accepted.length) {
        onFieldChange('attachments', [...current, ...accepted]);
      }
    } catch {
      Alert.alert('خطأ', 'فشل في اختيار المرفقات');
    }
  };

  const removeAttachment = (i) =>
    onFieldChange('attachments', formData.attachments.filter((_, idx) => idx !== i));
  const formatSize = (b) => (b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`);

  return (
    <View>
      <Text style={styles.sectionTitle}>تفاصيل الشكاية</Text>
      <FormInput
        ref={(el) => (inputRefs.current.complaintSummary = el)}
        label="ملخص الشكاية"
        isRequired
        multiline
        numberOfLines={6}
        value={formData.complaintSummary}
        onChangeText={(v) => onFieldChange('complaintSummary', v)}
        onFocus={() => onInputFocus('complaintSummary')}
        placeholder="اكتب ملخصاً مفصلاً عن شكايتك..."
      />
      <View style={styles.attachmentSection}>
        <TouchableOpacity style={styles.browseButton} onPress={pickDocument}>
          <Text style={styles.browseButtonText}>إضافة مرفقات</Text>
        </TouchableOpacity>

        {formData.attachments?.map((f, i) => (
          <View key={i} style={styles.attachmentItem}>
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName} numberOfLines={1}>{f.name}</Text>
              <Text style={styles.attachmentSize}>({formatSize(f.size)})</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={() => removeAttachment(i)}>
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.attachmentInstructions}>
          المسموح: PDF أو JPEG فقط — الحجم الأقصى 2MB لكل ملف — حتى 5 ملفات
        </Text>
      </View>
    </View>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  Step-4 ▸ Confirmation                                            */
/* ────────────────────────────────────────────────────────────────── */
const Step4_Confirmation = ({ formData, onFieldChange, onInputFocus, inputRefs }) => (
  <View style={styles.confirmationContainer}>
    <Text style={styles.confirmationTitle}>مراجعة وتأكيد الشكاية</Text>
    <ScrollView style={styles.confirmationContent} showsVerticalScrollIndicator={false}>
      <View style={styles.confirmationSection}>
        <Text style={styles.confirmationSectionTitle}>معلومات المشتكي</Text>
        {formData.complainantType === 'individual' ? (
          <>
            <Text style={styles.confirmationItem}>الاسم: {formData.firstName} {formData.lastName}</Text>
            <Text style={styles.confirmationItem}>رقم التعريف: {formData.idNumber}</Text>
            <Text style={styles.confirmationItem}>العنوان: {formData.address}</Text>
          </>
        ) : (
          <>
            <Text style={styles.confirmationItem}>اسم الشركة: {formData.companyName}</Text>
            {!!formData.companyRC && <Text style={styles.confirmationItem}>رقم السجل التجاري: {formData.companyRC}</Text>}
            <Text style={styles.confirmationItem}>الممثل القانوني: {formData.legalRep}</Text>
            <Text style={styles.confirmationItem}>المقر الاجتماعي: {formData.hq}</Text>
          </>
        )}
      </View>

      <View style={styles.confirmationSection}>
        <Text style={styles.confirmationSectionTitle}>معلومات المشتكى به</Text>
        {formData.respondentType === 'individual' && (
          <Text style={styles.confirmationItem}>الاسم: {formData.resp_fullName}</Text>
        )}
        {formData.respondentType === 'legal' && (
          <>
            <Text style={styles.confirmationItem}>اسم الشركة: {formData.resp_companyName}</Text>
            {!!formData.resp_companyRC && <Text style={styles.confirmationItem}>رقم السجل التجاري: {formData.resp_companyRC}</Text>}
          </>
        )}
        {formData.respondentType === 'unknown' && (
          <Text style={styles.confirmationItem}>النوع: غير معروف</Text>
        )}
      </View>

      <View style={styles.confirmationSection}>
        <Text style={styles.confirmationSectionTitle}>تفاصيل الشكاية</Text>
        <Text style={styles.confirmationComplaintText}>{formData.complaintSummary}</Text>
        {!!formData.attachments?.length && (
          <Text style={styles.confirmationItem}>المرفقات: {formData.attachments.length} ملف(ات)</Text>
        )}
      </View>
    </ScrollView>

    <View style={styles.verificationContainer}>
      <Text style={styles.verificationTitle}>التحقق من الهاتف</Text>
      <FormInput
        ref={(el) => (inputRefs.current.phoneToVerify = el)}
        label="رقم الهاتف"
        isRequired
        keyboardType="phone-pad"
        value={formData.phoneToVerify}
        onChangeText={(v) => onFieldChange('phoneToVerify', v)}
        onFocus={() => onInputFocus('phoneToVerify')}
        placeholder="0612345678"
      />
      <TouchableOpacity style={styles.smsButton}>
        <Text style={styles.smsButtonText}>إرسال رمز التحقق</Text>
      </TouchableOpacity>
      <FormInput
        ref={(el) => (inputRefs.current.otpCode = el)}
        label="رمز التحقق"
        isRequired
        keyboardType="numeric"
        value={formData.otpCode}
        onChangeText={(v) => onFieldChange('otpCode', v)}
        onFocus={() => onInputFocus('otpCode')}
        placeholder="أدخل رمز التحقق"
      />
    </View>
  </View>
);

/* ────────────────────────────────────────────────────────────────── */
/*  Main screen                                                      */
/* ────────────────────────────────────────────────────────────────── */
const ComplaintFormScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    complainantType: 'individual',
    respondentType: 'individual',
    attachments: [],
  });
  const scrollRef = useRef(null);
  const inputRefs = useRef({});
  const navigation = useNavigation();
  const { mutate: submitComplaint, isPending } = useSubmitComplaint();

  const onInputFocus = (key) => {
    requestAnimationFrame(() => {
      const inputNode = inputRefs.current[key];
      const scrollNode = scrollRef.current;
      const target = inputNode ? findNodeHandle(inputNode) : null;
      const ancestor = scrollNode ? findNodeHandle(scrollNode) : null;
      if (target && ancestor && scrollNode?.scrollTo) {
        UIManager.measureLayout(target, ancestor, () => {}, (_x, y) => {
          scrollNode.scrollTo({ y: Math.max(y - 60, 0), animated: true });
        });
      }
    });
  };

  const onFieldChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!formData.phoneToVerify) {
      Alert.alert('خطأ', 'المرجو إدخال رقم الهاتف.');
      return;
    }

    // Minimal checks aligned with rules
    if (formData.complainantType === 'legal') {
      if (!nullIfEmpty(formData.companyName) || !nullIfEmpty(formData.hq) || !nullIfEmpty(formData.legalRep)) {
        Alert.alert('خطأ', 'المرجو تعبئة التسمية والمقر الاجتماعي والممثل القانوني.');
        return;
      }
    }
    if (formData.complainantType === 'individual' && !formData.idSituationResidence) {
      Alert.alert('خطأ', 'المرجو اختيار محل الإقامة.');
      return;
    }
    if (formData.respondentType === 'legal' && !nullIfEmpty(formData.resp_companyName)) {
      Alert.alert('خطأ', 'المرجو إدخال تسمية الشركة للمشتكى به.');
      return;
    }

    const respMap = { individual: 'P', legal: 'M', unknown: 'I' };

    let plaignant;
    if (formData.complainantType === 'legal') {
      plaignant = {
        nomCommercial: formData.companyName || '',
        numeroRC: formData.companyRC || '',
        siegeSocial: formData.hq || '',
        representantLegal: formData.legalRep || '',
        idPays: formData.idPays || 1,
        idVille: formData.idVille || 1,
        idSituationResidence: DEFAULT_RESIDENCE_ID,
        idProfession: DEFAULT_PROF_ID,
        adresse: formData.hq || '',
        telephone: formData.phoneToVerify,
        email: nullIfEmpty(formData.legalEmail),
      };
    } else {
      plaignant = {
        nom: formData.lastName || '',
        prenom: formData.firstName || '-',
        cin: formData.idNumber || '',
        idPays: formData.idPays || 1,
        idVille: formData.idVille || 1,
        idSituationResidence: formData.idSituationResidence || DEFAULT_RESIDENCE_ID,
        idProfession: DEFAULT_PROF_ID,
        sexe: formData.sexe || null,
        adresse: formData.address || '',
        telephone: formData.phoneToVerify,
        email: nullIfEmpty(formData.email),
      };
    }

    const jsonBody = {
      complainantType: formData.complainantType,
      plaignant,
      defendeur: {
        type: respMap[formData.respondentType] || 'I',
        nom: formData.respondentType === 'individual' ? nullIfEmpty(formData.resp_fullName) : null,
        nomCommercial: formData.respondentType === 'legal' ? nullIfEmpty(formData.resp_companyName) : null,
        numeroRC: formData.respondentType === 'legal' ? nullIfEmpty(formData.resp_companyRC) : null,
      },
      plainteDetails: {
        resume: formData.complaintSummary || '',
        idObjetInjustice: 1,
        idJuridiction: 1,
      },
      phoneToVerify: formData.phoneToVerify,
    };

    submitComplaint(
      { jsonBody, files: formData.attachments },
      {
        onSuccess: (d) => navigation.navigate('TrackComplaint', { complaintId: d.complaintId, trackingCode: d.trackingCode }),
        onError: (err) => {
          const msg = err?.response?.data?.message || err.message || 'حدث خطأ غير متوقع';
          Alert.alert('خطأ', msg);
        },
      }
    );
  };

  const next = () => {
    if (currentStep === 3 && (!formData.complaintSummary || formData.complaintSummary.length < 10)) {
      Alert.alert('خطأ', 'يجب أن يكون ملخص الشكاية 10 أحرف على الأقل.');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((p) => p + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      handleSubmit();
    }
  };
  const prev = () => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const stepProps = { onFieldChange, formData, onInputFocus, inputRefs };
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1_ComplainantInfo {...stepProps} />;
      case 2: return <Step2_RespondentInfo {...stepProps} />;
      case 3: return <Step3_ComplaintDetails {...stepProps} />;
      case 4: return <Step4_Confirmation {...stepProps} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <FormStepper currentStep={currentStep} />
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          {isPending && <ActivityIndicator size="large" color={colors.primary} style={styles.activityIndicator} />}
          <View style={styles.footerButtons}>
            <TouchableOpacity style={[styles.nextButton, isPending && styles.disabledButton]} onPress={next} disabled={isPending}>
              <Text style={styles.nextButtonText}>{currentStep === 4 ? 'وضع الشكاية' : 'المرحلة الموالية'}</Text>
            </TouchableOpacity>
            {currentStep > 1 && (
              <TouchableOpacity style={[styles.prevButton, isPending && styles.disabledButton]} onPress={prev} disabled={isPending}>
                <Text style={styles.prevButtonText}>المرحلة السابقة</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, textAlign: 'right' },
  requiredAsterisk: { color: colors.error },
  input: { backgroundColor: colors.inputBackground, paddingHorizontal: 15, paddingVertical: 14, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: colors.border, textAlign: 'right', color: colors.textPrimary },
  inputDisabled: { backgroundColor: colors.border },
  inputFocused: { borderColor: colors.focus, borderWidth: 1.5 },
  multilineInput: { height: 140, textAlignVertical: 'top', paddingTop: 14 },
  pickerContainer: { marginBottom: 16 },
  pickerLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '600', marginBottom: 8, textAlign: 'right' },
  pickerSelect: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 12, color: colors.textPrimary, textAlign: 'right' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'right', marginBottom: 16 },
  attachmentSection: { marginTop: 16 },
  browseButton: { backgroundColor: colors.white, borderColor: colors.accent, borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  browseButtonText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  attachmentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(58,79,83,0.05)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8 },
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
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  footerButtons: { padding: 20 },
  nextButton: { backgroundColor: colors.accent, paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  nextButtonText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  prevButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  prevButtonText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
  activityIndicator: { paddingVertical: 10 },
});

export default ComplaintFormScreen;
