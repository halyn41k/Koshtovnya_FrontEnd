import { createStore } from "vuex";
import order from "./modules/order";
import cart from './modules/cart';
import settings from './modules/settings';

export default createStore({
  modules: {
    order,
    settings,
  }
});
