import { createStore } from "vuex";
import order from "./modules/order";
import cart from './modules/cart';

export default createStore({
  modules: {
    order
  }
});
