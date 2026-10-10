import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Layers,
  ShoppingCart,
  Store,
  Wallet,
  Recycle,
  FileCheck2,
  ClipboardList,
  History,
  Sprout,
  PlusCircle,
  Stethoscope,
} from 'lucide-react'

/** sections: [{ label, items: [{ to, label, icon }] }] */
export const NAV_BY_ROLE = {
  ADMIN: [
    {
      items: [
        { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Manage',
      items: [
        { to: '/admin/users', label: 'Users & roles', icon: Users },
        { to: '/admin/mrv', label: 'MRV assignments', icon: ClipboardList },
        { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
        { to: '/admin/credits', label: 'Carbon credits', icon: Layers },
        { to: '/admin/purchases', label: 'Purchases', icon: ShoppingCart },
      ],
    },
  ],
  NGO: [
    {
      items: [{ to: '/ngo', end: true, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Projects',
      items: [
        { to: '/ngo/projects', label: 'My projects', icon: FolderKanban },
        { to: '/ngo/projects/new', label: 'Register project', icon: PlusCircle },
      ],
    },
  ],
  VERIFIER: [
    {
      items: [{ to: '/verifier', end: true, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Verification',
      items: [
        { to: '/verifier/mrv', label: 'MRV queue', icon: ClipboardList },
        { to: '/verifier/history', label: 'My verifications', icon: History },
      ],
    },
  ],
  USER: [
    {
      items: [{ to: '/buyer', end: true, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Carbon credits',
      items: [
        { to: '/buyer/marketplace', label: 'Marketplace', icon: Store },
        { to: '/buyer/credits', label: 'My credits', icon: Wallet },
        { to: '/buyer/retirements', label: 'Retirements', icon: Recycle },
      ],
    },
  ],
  HEALTHCARE_ASSISTANT: [
    {
      items: [
        { to: '/health', end: true, label: 'Dashboard', icon: Stethoscope },
      ],
    },
  ],
}

export function navForRole(role) {
  return NAV_BY_ROLE[role] || []
}

export const ROLE_ICONS = {
  ADMIN: LayoutDashboard,
  NGO: Sprout,
  VERIFIER: FileCheck2,
  USER: Store,
  HEALTHCARE_ASSISTANT: Stethoscope,
}
