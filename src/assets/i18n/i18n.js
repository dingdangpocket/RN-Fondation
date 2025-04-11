// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入语言资源文件
import en from './en';
import zh from './zh';

// 初始化 i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  fallbackLng: 'en', // 默认语言
  interpolation: {
    escapeValue: false, // React 已经防止了 XSS 攻击
  },
});

export default i18n;