// store/modules/cart.js
import api from '@/services/api';

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
        const data = await api.getCart();
        const cartData = data.data || [];
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
        const data = await api.getNPtdeliveryCost({
          CityRecipient: cityRef,
          ServiceType: serviceType,
          product_ids: productIds
        });

        if (data?.deliveryCost !== undefined) {
          commit('setDeliveryCost', data.deliveryCost);
          commit('updateTotalAmount');
        } else {
          console.error('Невірна відповідь API розрахунку доставки', data);
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