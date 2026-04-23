import enCommon from './resources/en/common';
import zhCnCommon from './resources/zh-CN/common';

export const I18N_NAMESPACES = ['common'] as const;

export const resources = {
  en: {
    common: enCommon,
  },
  'zh-CN': {
    common: zhCnCommon,
  },
} as const;
