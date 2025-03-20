import { createStore } from "vuex";
import order from "./modules/order";

export default createStore({
  modules: {
    order
  }
});
