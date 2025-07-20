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
    ImageBackground,
} from 'react-native';
// If you're using react-native-svg, uncomment the line below
// import { SvgUri } from 'react-native-svg';

// ====================================================================
// NOUVELLE PALETTE DE COULEURS - VERT ARDOISE & OR MOUTARDE
// ====================================================================
const colors = {
    background: '#f8fafc',
    white: '#FFFFFF',
    accent: '#CCA43B',
    primary: '#3A4F53',
    textPrimary: '#1a202c',
    textSecondary: '#718096',
    border: '#e2e8f0',
    cardShadow: '#a0aec0',
};

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* ====== HEADER with background image ====== */}
            <ImageBackground
                source={require('../assets/images/bk.png')}
                style={styles.header}
                resizeMode="cover"
            >
                {/* Gradient overlay for better visual depth */}
                <View style={styles.headerOverlay} />
                <View style={styles.headerGradientOverlay} />

                <View style={styles.headerContent}>
                    {/* Left logo with enhanced styling */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoInnerGlow} />
                        <Image
                            source={require('../assets/images/LOGO_.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Centered text with enhanced typography */}
                    <View style={styles.headerTextContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>رئاسة النيابة العامة</Text>
                            <View style={styles.titleUnderline} />
                        </View>
                        <Text style={styles.headerSubtitle}>المملكة المغربية</Text>
                    </View>

                    {/* Right logo with enhanced styling */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoInnerGlow} />
                        <Image
                            source={require('../assets/images/logo_morocco.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </ImageBackground>

            {/* ================================================ */}

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
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>مرحبا بكم في الخدمة الرقمية</Text>
                    <Text style={styles.welcomeDescription}>
                        منصة إلكترونية آمنة وسريعة لتقديم ومتابعة الشكايات
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.card, styles.primaryCard]}
                    onPress={() => navigation.navigate('ComplaintForm')}
                    activeOpacity={0.9}
                >
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
                    <View style={[styles.cardButton, styles.primaryButton]}>
                        <Text style={styles.cardButtonText}>إبدأ الآن</Text>
                        <Text style={styles.buttonArrow}>←</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, styles.secondaryCard]}
                    onPress={() => navigation.navigate('TrackComplaint')}
                    activeOpacity={0.9}
                >
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
                    <View style={[styles.cardButton, styles.secondaryButton]}>
                        <Text style={styles.cardButtonText}>تتبع الآن</Text>
                        <Text style={styles.buttonArrow}>←</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

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
        paddingTop: 25,
        paddingBottom: 25,
        paddingHorizontal: 24,
        position: 'relative',
        minHeight: 120,
        overflow: 'hidden',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(58, 79, 83, 0.4)',
    },
    headerGradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        background: 'linear-gradient(135deg, rgba(58, 79, 83, 0.6) 0%, rgba(204, 164, 59, 0.3) 100%)',
        // For React Native, we simulate gradient with multiple overlays
        backgroundColor: 'rgba(58, 79, 83, 0.2)',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 6,
    },
    titleUnderline: {
        width: 60,
        height: 3,
        backgroundColor: 'rgba(204, 164, 59, 0.8)',
        borderRadius: 2,
        marginTop: 4,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    logoInnerGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 31,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: colors.white,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
        position: 'relative',
        paddingVertical: 8,
    },
    headerTextContainer: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.white,
        textAlign: 'center',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        letterSpacing: 0.5,
        lineHeight: 28,
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.95)',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    logoContainer: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        // Add subtle inner shadow effect
        position: 'relative',
        overflow: 'hidden',
    },
    logo: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
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
        color: colors.primary,
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
        borderLeftWidth: 5,
        borderLeftColor: colors.primary,
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
        elevation: 4,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    primaryCard: {
        borderTopWidth: 5,
        borderTopColor: colors.primary,
        borderLeftWidth: 0,
    },
    secondaryCard: {
        borderTopWidth: 5,
        borderTopColor: colors.accent,
        borderLeftWidth: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryIconContainer: {
        backgroundColor: 'rgba(58, 79, 83, 0.1)',
    },
    secondaryIconContainer: {
        backgroundColor: 'rgba(204, 164, 59, 0.1)',
    },
    cardIcon: {
        fontSize: 28,
    },
    cardBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    secondaryBadge: {
        backgroundColor: colors.accent,
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
    cardButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    secondaryButton: {
        backgroundColor: colors.accent,
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
    footer: {
        backgroundColor: colors.primary,
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