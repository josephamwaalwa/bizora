import type { BusinessProfile } from '../types';

export function getLogoOptions(profile: BusinessProfile) {
  return {
    size: Math.min(220, Math.max(40, profile.logoSize ?? 112)),
    fit: profile.logoFit ?? 'contain',
    alignment: profile.logoAlignment ?? 'left',
    padding: Math.min(24, Math.max(0, profile.logoPadding ?? 0)),
    backgroundColor: (profile.logoBackgroundTransparent ?? true)
      ? 'transparent'
      : profile.logoBackgroundColor || '#ffffff',
  };
}
