import { Platform } from 'react-native';
import { Colors, Theme } from '../constants/theme';

const statusKeys = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  'UNDER REVIEW': 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

const mrvKeys = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  'UNDER REVIEW': 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const projectStatusMeta = (raw) => {
  const key = statusKeys[String(raw || '').toUpperCase()] || 'DRAFT';
  return Theme.colors && key
    ? { key, ...(metaFor(key)) }
    : { key: 'DRAFT' };
};

function metaFor(key) {
  const map = {
    DRAFT: { label: 'Draft', color: Colors.textTertiary, soft: Colors.surfaceMuted },
    SUBMITTED: { label: 'Submitted', color: Colors.info, soft: Colors.infoSoft },
    UNDER_REVIEW: { label: 'Under Review', color: Colors.warning, soft: Colors.warningSoft },
    VERIFIED: { label: 'Verified', color: Colors.success, soft: Colors.successSoft },
    REJECTED: { label: 'Rejected', color: Colors.danger, soft: Colors.dangerSoft },
  };
  return map[key];
}

export const mrvStatusMeta = (raw) => {
  const key = mrvKeys[String(raw || '').toUpperCase()] || 'PENDING';
  const map = {
    PENDING: { label: 'Pending', color: Colors.warning, soft: Colors.warningSoft },
    UNDER_REVIEW: { label: 'Under Review', color: Colors.info, soft: Colors.infoSoft },
    APPROVED: { label: 'Approved', color: Colors.success, soft: Colors.successSoft },
    REJECTED: { label: 'Rejected', color: Colors.danger, soft: Colors.dangerSoft },
  };
  return { key, ...map[key] };
};

export const roleLabel = (role) =>
  ({
    USER: 'User',
    NGO: 'NGO',
    VERIFIER: 'Verifier',
    BUYER: 'Buyer',
    HEALTHCARE_ADVISOR: 'Healthcare Advisor',
    ADMIN: 'Admin',
  }[role] || role || 'Member');

export const formatCredits = (n) => {
  const v = Number(n || 0);
  return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

export const formatCurrency = (n) => {
  const v = Number(n || 0);
  return v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
};

export const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const timeAgo = (iso) => {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return '';
  const s = Math.max(0, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

export const isWeb = Platform.OS === 'web';
