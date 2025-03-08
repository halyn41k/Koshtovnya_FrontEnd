export default {
  namespaced: true,
  state: {
    // step state
    currentStep: 0,
    // personal info
    firstName: "",
    lastName: "",
    secondName: "",
    phone: "",
    // delivery info
    selectedDeliveryCategory: "",
    deliveryType: "",
    city: "",
    cityRef: "",
    // (other fields such as street, houseNumber, warehouse etc.)
    // payment info
    paymentOptions: ["Післяоплата", "Оплата картою", "Передоплата"],
    selectedPaymentOption: "",
    // errors (you can store errors for each step)
    errors: {}
  },
  mutations: {
    // Personal info mutations
    setFirstName(state, payload) {
      state.firstName = payload;
    },
    setLastName(state, payload) {
      state.lastName = payload;
    },
    setSecondName(state, payload) {
      state.secondName = payload;
    },
    setPhone(state, payload) {
      state.phone = payload;
    },
    // Delivery info mutations – add as needed
    setSelectedDeliveryCategory(state, payload) {
      state.selectedDeliveryCategory = payload;
    },
    setDeliveryType(state, payload) {
      state.deliveryType = payload;
    },
    setCity(state, payload) {
      state.city = payload;
    },
    setCityRef(state, payload) {
      state.cityRef = payload;
    },
    // Payment info mutations
    setSelectedPaymentOption(state, payload) {
      state.selectedPaymentOption = payload;
    },
    // Step logic
    completeStep(state) {
      state.currentStep++;
    },
    goToStep(state, stepIndex) {
      state.currentStep = stepIndex;
    },
    // Error handling
    setErrors(state, payload) {
      state.errors = payload;
    }
  },
  actions: {
    fetchCities({ commit }, { city, deliveryType }) {
      // Implement your API call here
      // and commit any necessary mutations (for example, storing the list of cities)
    }
    // More actions as needed for fetching streets, warehouses etc.
  },
  getters: {
    // You can implement getters for validations if needed.
    isPersonalInfoValid: (state) => {
      const errors = {};
      if (!state.firstName) errors.firstName = "Ім'я обов'язкове";
      if (!state.lastName) errors.lastName = "Прізвище обов'язкове";
      if (!state.secondName) errors.secondName = "По батькові обов'язкове";
      if (!state.phone) errors.phone = "Номер телефону обов'язковий";
      return Object.keys(errors).length === 0;
    },
    // Add getters for delivery and payment validations similarly.
  }
};
