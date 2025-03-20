const state = {
    customerData: {
      firstName: "",
      lastName: "",
      secondName: "",
      phone: "",
      city: "",
      cityRef: "",
      deliveryType: "",
      street: "",
      houseNumber: "",
      warehouse: "",
      typeOfCard: "",
      paymentMethod: ""
    },
    cartItems: [],
    deliveryCost: 0
  };
  
  const mutations = {
    SET_CUSTOMER_DATA(state, payload) {
      state.customerData = { ...state.customerData, ...payload };
    },
    SET_CART_ITEMS(state, payload) {
      state.cartItems = payload;
    },
    SET_DELIVERY_COST(state, cost) {
      state.deliveryCost = cost;
    }
  };
  
  const actions = {
    updateCustomerData({ commit }, data) {
      commit("SET_CUSTOMER_DATA", data);
    },
    updateCartItems({ commit }, items) {
      commit("SET_CART_ITEMS", items);
    },
    updateDeliveryCost({ commit }, cost) {
      commit("SET_DELIVERY_COST", cost);
    }
  };
  
  const getters = {
    customerData: (state) => state.customerData,
    cartItems: (state) => state.cartItems,
    deliveryCost: (state) => state.deliveryCost,
    cartTotalAmount: (state) =>
      state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  };
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
  };
  