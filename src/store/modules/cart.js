// store/modules/cart.js
import axios from 'axios';

export default {
  namespaced: true,
  state: {
    items: [],
    isLoading: false,
    error: null,
    deliveryCost: 0,
    totalAmount: 0
  },
  mutations: {
    setCartItems(state, items) {
      state.items = items;
      state.totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    setLoading(state, isLoading) {
      state.isLoading = isLoading;
    },
    setError(state, error) {
      state.error = error;
    },
    setDeliveryCost(state, cost) {
      state.deliveryCost = cost;
    },
    updateTotalAmount(state) {
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0) + state.deliveryCost;
    }
  },
  actions: {
    async fetchCartItems({ commit }) {
      commit('setLoading', true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        commit('setError', 'Необхідна авторизація');
        commit('setLoading', false);
        return;
      }

      try {
        const response = await axios.get('https://koshtovnya.api-dev.bmax-edu.website/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const cartData = response.data.data || [];
        commit('setCartItems', cartData);
        commit('setLoading', false);
      } catch (error) {
        commit('setError', 'Помилка завантаження кошика');
        commit('setLoading', false);
        console.error('Помилка завантаження кошика', error);
      }
    },
    async calculateDeliveryCost({ commit, state }, { cityRef, deliveryType }) {
      if (!cityRef || !deliveryType || state.items.length === 0) {
        console.warn('Недостатньо даних для розрахунку доставки');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Необхідна авторизація');
        return;
      }

      const productIds = state.items.map(item => item.id);
      const serviceType = deliveryType.toLowerCase().includes('кур\'єр') 
        ? 'WarehouseDoors' 
        : 'WarehouseWarehouse';

      try {
        const response = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/delivery/cost',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              CityRecipient: cityRef,
              ServiceType: serviceType,
              product_ids: productIds
            }
          }
        );

        if (response.data?.deliveryCost !== undefined) {
          commit('setDeliveryCost', response.data.deliveryCost);
          commit('updateTotalAmount');
        } else {
          console.error('Невірна відповідь API розрахунку доставки', response.data);
        }
      } catch (error) {
        console.error('Помилка розрахунку вартості доставки', error);
      }
    }
  },
  getters: {
    cartItems: state => state.items,
    cartTotalAmount: state => state.totalAmount,
    deliveryCost: state => state.deliveryCost,
    isCartLoading: state => state.isLoading,
    cartError: state => state.error
  }
};