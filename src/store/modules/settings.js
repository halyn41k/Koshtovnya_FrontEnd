// store/modules/settings.js
import i18n from '@/i18n';

const LANG_KEY     = 'language';
const CURRENCY_KEY = 'currency';

export default {
  namespaced: true,
  state: () => ({
    lang: localStorage.getItem(LANG_KEY) || 'uk',
    currency: localStorage.getItem(CURRENCY_KEY) || 'uah',
  }),
  mutations: {
    SET_LANG(state, code) {
      state.lang = code;
      // Vue I18n: directly set locale
      i18n.global.locale = code;
      localStorage.setItem(LANG_KEY, code);
    },
    SET_CURRENCY(state, curr) {
      state.currency = curr.toLowerCase();
      localStorage.setItem(CURRENCY_KEY, state.currency);
    },
  },
  actions: {
    changeLang({ commit }, code) {
      commit('SET_LANG', code);
    },
    changeCurrency({ commit }, curr) {
      commit('SET_CURRENCY', curr);
    }
  },
  getters: {
    lang: state => state.lang,
    currency: state => state.currency,
  }
};
