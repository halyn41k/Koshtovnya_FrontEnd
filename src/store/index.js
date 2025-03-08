import { createStore } from "vuex";
import payment from "../../store/modules/payment";


const store = createStore({
  modules: {
    payment
  }
});


export default store;