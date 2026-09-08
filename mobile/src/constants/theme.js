/**
 * CarbonTrust Registry — Design System
 *
 * A sophisticated climate-tech palette: deep forest green, emerald accents
 * and off-white surfaces. Restrained gradients — never "all bright green".
 */
export const Colors = {
  // Brand
  forest: '#0B2E20',
  forestDeep: '#071F15',
  forestSoft: '#123A2A',
  forestMuted: '#3E5C50',
  emerald: '#10B981',
  emeraldDark: '#059669',
  emeraldSoft: '#D1FAE5',
  lime: '#A3E635',
  limeDark: '#84CC16',

  // Surfaces
  background: '#F6F9F5',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF4EF',
  surfaceAlt: '#F0F5F1',

  // Text
  textPrimary: '#12261D',
  textSecondary: '#5B6B63',
  textTertiary: '#8A968F',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.72)',

  // Status
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  info: '#0E7490',
  infoSoft: '#CFFAFE',

  // Lines
  border: '#E3EBE5',
  borderStrong: '#CBD9CF',
  divider: '#EDF2EE',

  // Overlays
  scrim: 'rgba(7,31,21,0.55)',
  shadow: 'rgba(11,46,32,0.10)',
};

export const Theme = {
  colors: Colors,

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    xxxl: 40,
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
  },

  typography: {
    display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
    h1: { fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
    h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
    h3: { fontSize: 16.5, fontWeight: '700' },
    body: { fontSize: 15, fontWeight: '400' },
    bodyStrong: { fontSize: 15, fontWeight: '600' },
    caption: { fontSize: 13, fontWeight: '500' },
    small: { fontSize: 11.5, fontWeight: '500' },
    micro: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8 },
  },

  shadows: {
    card: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 14,
      elevation: 3,
    },
    floating: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 8,
    },
  },

  gradients: {
    brand: [Colors.forest, Colors.forestDeep],
    emerald: [Colors.emerald, Colors.emeraldDark],
    lime: [Colors.lime, Colors.limeDark],
    cardSheen: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)'],
  },
};

export const RoleMeta = {
  USER: { label: 'User', color: Colors.info, soft: Colors.infoSoft, icon: 'person' },
  NGO: { label: 'NGO', color: Colors.emeraldDark, soft: Colors.emeraldSoft, icon: 'leaf' },
  VERIFIER: { label: 'Verifier', color: Colors.warning, soft: Colors.warningSoft, icon: 'shield-checkmark' },
  BUYER: { label: 'Buyer', color: Colors.emerald, soft: Colors.emeraldSoft, icon: 'cart' },
  HEALTHCARE_ADVISOR: {
    label: 'Healthcare Advisor',
    color: '#7C3AED',
    soft: '#EDE9FE',
    icon: 'medical',
  },
  ADMIN: { label: 'Admin', color: Colors.forest, soft: Colors.surfaceMuted, icon: 'settings' },
};

export const ProjectStatusMeta = {
  DRAFT: { label: 'Draft', color: Colors.textTertiary, soft: Colors.surfaceMuted },
  SUBMITTED: { label: 'Submitted', color: Colors.info, soft: Colors.infoSoft },
  UNDER_REVIEW: { label: 'Under Review', color: Colors.warning, soft: Colors.warningSoft },
  VERIFIED: { label: 'Verified', color: Colors.success, soft: Colors.successSoft },
  REJECTED: { label: 'Rejected', color: Colors.danger, soft: Colors.dangerSoft },
};

export const MrvStatusMeta = {
  PENDING: { label: 'Pending', color: Colors.warning, soft: Colors.warningSoft },
  UNDER_REVIEW: { label: 'Under Review', color: Colors.info, soft: Colors.infoSoft },
  APPROVED: { label: 'Approved', color: Colors.success, soft: Colors.successSoft },
  REJECTED: { label: 'Rejected', color: Colors.danger, soft: Colors.dangerSoft },
};

export default Theme;
