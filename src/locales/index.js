import { createI18n } from 'vue-i18n';

// EN imports
import enUser from './en/user';
import enProduct from './en/product';
import enPayment from './en/payment';
import enInfoshop from './en/infoshop';
import enHome from './en/home';
import enCategories from './en/categories';
import enCart from './en/cart';
import enAuthorization from './en/authorization';
import enAdmin from './en/admin';

// UK imports
import ukUser from './uk/user';
import ukProduct from './uk/product';
import ukPayment from './uk/payment';
import ukInfoshop from './uk/infoshop';
import ukHome from './uk/home';
import ukCategories from './uk/categories';
import ukCart from './uk/cart';
import ukAuthorization from './uk/authorization';
import ukAdmin from './uk/admin';

const messages = {
  en: {
    ...enUser,
    ...enProduct,
    ...enPayment,
    ...enInfoshop,
    ...enHome,
    ...enCategories,
    ...enCart,
    ...enAuthorization,
    ...enAdmin,
  },
  uk: {
    ...ukUser,
    ...ukProduct,
    ...ukPayment,
    ...ukInfoshop,
    ...ukHome,
    ...ukCategories,
    ...ukCart,
    ...ukAuthorization,
    ...ukAdmin,
  },
};

const i18n = createI18n({
  locale: 'uk',
  fallbackLocale: 'uk',
  messages,
});

export default i18n;
