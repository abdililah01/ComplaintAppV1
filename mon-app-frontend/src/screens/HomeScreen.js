// src/screens/HomeScreen.js
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
} from 'react-native';

// Enhanced professional color palette
const colors = {
    background: '#f8fafc',       // Cleaner background
    textPrimary: '#1e293b',      // Darker, more professional text
    textSecondary: '#64748b',    // Professional secondary text
    header: '#1e3a8a',           // Professional blue header
    headerSecondary: '#3b82f6',  // Lighter blue for gradients
    accent: '#fef3c7',           // Warm accent for icons
    accentStrong: '#f59e0b',     // Stronger accent
    footer: '#1e293b',           // Professional dark footer
    white: '#ffffff',
    border: '#e2e8f0',
    cardShadow: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
};

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.header} />

            {/* Enhanced Header with gradient effect */}
            <View style={styles.header}>
                <View style={styles.headerGradient} />
                <View style={styles.headerContent}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>رئاسة النيابة العامة</Text>
                        <Text style={styles.headerSubtitle}>المملكة المغربية</Text>
                    </View>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/images/logo_morocco.png')}
                            style={styles.logo}
                        />
                    </View>
                </View>
            </View>

            {/* Professional Stats Bar */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>24/7</Text>
                    <Text style={styles.statLabel}>متاح</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>آمن</Text>
                    <Text style={styles.statLabel}>محمي</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>سريع</Text>
                    <Text style={styles.statLabel}>فوري</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Message */}
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>مرحبا بكم في الخدمة الرقمية</Text>
                    <Text style={styles.welcomeDescription}>
                        منصة إلكترونية آمنة وسريعة لتقديم ومتابعة الشكايات
                    </Text>
                </View>

                {/* Enhanced Submit Complaint Card */}
                <TouchableOpacity
                    style={[styles.card, styles.primaryCard]}
                    onPress={() => navigation.navigate('ComplaintForm')}
                    activeOpacity={0.9}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardIconContainer, styles.primaryIconContainer]}>
                            <Text style={styles.cardIcon}>📝</Text>
                        </View>
                        <View style={styles.cardBadge}>
                            <Text style={styles.cardBadgeText}>الأساسي</Text>
                        </View>
                    </View>
                    <Text style={styles.cardTitle}>وضع شكاية جديدة</Text>
                    <Text style={styles.cardDescription}>
                        قدم شكايتك بسهولة وأمان. نظام متطور لضمان سرية وسرعة المعالجة
                    </Text>
                    <View style={styles.cardFeatures}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>🔒</Text>
                            <Text style={styles.featureText}>آمن ومحمي</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>⚡</Text>
                            <Text style={styles.featureText}>معالجة سريعة</Text>
                        </View>
                    </View>
                    <View style={[styles.cardButton, styles.primaryButton]}>
                        <Text style={styles.cardButtonText}>إبدأ الآن</Text>
                        <Text style={styles.buttonArrow}>←</Text>
                    </View>
                </TouchableOpacity>

                {/* Enhanced Track Complaint Card */}
                <TouchableOpacity
                    style={[styles.card, styles.secondaryCard]}
                    // ====================================================================
                    // CORRECTION APPLIQUÉE ICI
                    // ====================================================================
                    onPress={() => navigation.navigate('TrackComplaint')}
                    activeOpacity={0.9}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardIconContainer, styles.secondaryIconContainer]}>
                            <Text style={styles.cardIcon}>🔍</Text>
                        </View>
                        <View style={[styles.cardBadge, styles.secondaryBadge]}>
                            <Text style={styles.cardBadgeText}>متابعة</Text>
                        </View>
                    </View>
                    <Text style={styles.cardTitle}>تتبع شكاية موجودة</Text>
                    <Text style={styles.cardDescription}>
                        تابع حالة شكايتك وآخر التطورات في الوقت الفعلي
                    </Text>
                    <View style={styles.cardFeatures}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>📊</Text>
                            <Text style={styles.featureText}>تحديثات فورية</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>📱</Text>
                            <Text style={styles.featureText}>إشعارات ذكية</Text>
                        </View>
                    </View>
                    <View style={[styles.cardButton, styles.secondaryButton]}>
                        <Text style={styles.cardButtonText}>تتبع الآن</Text>
                        <Text style={styles.buttonArrow}>←</Text>
                    </View>
                </TouchableOpacity>

                {/* Additional Services Card */}
                <View style={styles.servicesCard}>
                    <Text style={styles.servicesTitle}>خدمات إضافية</Text>
                    <View style={styles.servicesList}>
                        <TouchableOpacity style={styles.serviceItem}>
                            <Text style={styles.serviceIcon}>📞</Text>
                            <Text style={styles.serviceText}>تواصل معنا</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.serviceItem}>
                            <Text style={styles.serviceIcon}>❓</Text>
                            <Text style={styles.serviceText}>الأسئلة الشائعة</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.serviceItem}>
                            <Text style={styles.serviceIcon}>📋</Text>
                            <Text style={styles.serviceText}>دليل الاستخدام</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Enhanced Footer */}
            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    <Text style={styles.footerText}>© رئاسة النيابة العامة 2025</Text>
                    <Text style={styles.footerSubtext}>جميع الحقوق محفوظة</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.header,
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        position: 'relative',
        elevation: 8,
        shadowColor: colors.header,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.headerSecondary,
        opacity: 0.1,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.white,
        textAlign: 'left',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'left',
    },
    logoContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 30,
        padding: 8,
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingVertical: 16,
        paddingHorizontal: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.header,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.border,
        marginHorizontal: 10,
    },
    scrollContent: {
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    welcomeCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: colors.header,
        elevation: 2,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    welcomeTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 6,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    primaryCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.header,
    },
    secondaryCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.textSecondary,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryIconContainer: {
        backgroundColor: colors.accent,
        borderWidth: 2,
        borderColor: colors.accentStrong,
    },
    secondaryIconContainer: {
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: colors.textSecondary,
    },
    cardIcon: {
        fontSize: 32,
    },
    cardBadge: {
        backgroundColor: colors.header,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    secondaryBadge: {
        backgroundColor: colors.textSecondary,
    },
    cardBadgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    cardFeatures: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    featureText: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    cardButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    primaryButton: {
        backgroundColor: colors.header,
    },
    secondaryButton: {
        backgroundColor: colors.textSecondary,
    },
    cardButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },
    buttonArrow: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    servicesCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    servicesTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    servicesList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    serviceItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 12,
    },
    serviceIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    serviceText: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    footer: {
        backgroundColor: colors.footer,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    footerContent: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '600',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
});

export default HomeScreen;