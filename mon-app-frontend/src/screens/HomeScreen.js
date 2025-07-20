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

// ====================================================================
// NOUVELLE PALETTE DE COULEURS - VERT ARDOISE & OR MOUTARDE
// ====================================================================
const colors = {
    background: '#f8fafc',
    white: '#FFFFFF',
    accent: '#CCA43B',      // Nouveau : Or moutarde sobre
    primary: '#3A4F53',     // Nouveau : Vert ardoise foncé

    // Neutres pour le texte et les bordures
    textPrimary: '#1a202c',
    textSecondary: '#718096',
    border: '#e2e8f0',
    cardShadow: '#a0aec0',
};

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Header mis à jour avec la nouvelle couleur primaire */}
            <View style={styles.header}>
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

            {/* Stats Bar mis à jour */}
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
                {/* Welcome Message mis à jour */}
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>مرحبا بكم في الخدمة الرقمية</Text>
                    <Text style={styles.welcomeDescription}>
                        منصة إلكترونية آمنة وسريعة لتقديم ومتابعة الشكايات
                    </Text>
                </View>

                {/* Submit Complaint Card mis à jour */}
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
                    <View style={[styles.cardButton, styles.primaryButton]}>
                        <Text style={styles.cardButtonText}>إبدأ الآن</Text>
                        <Text style={styles.buttonArrow}>←</Text>
                    </View>
                </TouchableOpacity>

                {/* Track Complaint Card mis à jour */}
                <TouchableOpacity
                    style={[styles.card, styles.secondaryCard]}
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
                    <View style={[styles.cardButton, styles.secondaryButton]}>
                        <Text style={styles.cardButtonText}>تتبع الآن</Text>
                        <Text style={styles.buttonArrow}>←</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Footer mis à jour */}
            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    <Text style={styles.footerText}>© رئاسة النيابة العامة 2025</Text>
                    <Text style={styles.footerSubtext}>جميع الحقوق محفوظة</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

// ====================================================================
// FEUILLE DE STYLE MISE À JOUR AVEC LA NOUVELLE PALETTE
// ====================================================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary, // MISE À JOUR
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
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
        color: colors.primary, // MISE À JOUR
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
        borderLeftColor: colors.primary, // MISE À JOUR
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
        borderTopColor: colors.primary, // MISE À JOUR
        borderLeftWidth: 0,
    },
    secondaryCard: {
        borderTopWidth: 5,
        borderTopColor: colors.accent, // MISE À JOUR
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
        backgroundColor: 'rgba(58, 79, 83, 0.1)', // Couleur primaire très claire
    },
    secondaryIconContainer: {
        backgroundColor: 'rgba(204, 164, 59, 0.1)', // Couleur accent très claire
    },
    cardIcon: {
        fontSize: 28,
    },
    cardBadge: {
        backgroundColor: colors.primary, // MISE À JOUR
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    secondaryBadge: {
        backgroundColor: colors.accent, // MISE À JOUR
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
        backgroundColor: colors.primary, // MISE À JOUR
    },
    secondaryButton: {
        backgroundColor: colors.accent, // MISE À JOUR
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
        backgroundColor: colors.primary, // MISE À JOUR
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