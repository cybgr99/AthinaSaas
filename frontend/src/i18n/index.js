import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import el from './el.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      el: el
    },
    lng: 'el',
    fallbackLng: 'el',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
