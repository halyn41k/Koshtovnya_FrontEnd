// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

//Протестовано головні аспекти

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
  jest.spyOn(console, 'log').mockImplementation(() => { });
});

jest.mock('vue-select', () => ({
  __esModule: true,
  default: { name: 'vSelect', render: () => null }
}), { virtual: true });

jest.mock('vue-select/dist/vue-select.css', () => '', { virtual: true });

jest.mock('vue-multiselect', () => ({
  __esModule: true,
  default: { name: 'Multiselect', render: () => null }
}), { virtual: true });

jest.mock('@/components/home/Loader.vue', () => ({
  __esModule: true,
  default: { name: 'Loader', render: () => null }
}));

jest.mock('@/services/api', () => ({
  getProfile: jest.fn()
}));


const { shallowMount } = require('@vue/test-utils');
const api = require('@/services/api');
const AccountInfo = require('@/components/User/AccountInfo.vue').default;
const PersonalInfo = require('@/components/User/PersonalInfo.vue').default;
const Addresses = require('@/components/User/UserAddresses.vue').default;
const OrderHistory = require('@/components/User/OrderHistory.vue').default;
const Wishlist = require('@/components/User/UserWishlist.vue').default;

describe('AccountInfo.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    api.getProfile.mockReset();
  });

  afterEach(() => {
    console.error.mockRestore();
    if (wrapper) wrapper.unmount();
  });

  it('mounted викликає fetchProfile і заповнює дані', async () => {
    api.getProfile.mockResolvedValue({
      user: {
        id: 10, first_name: 'A', last_name: 'B', second_name: 'C', email: 'a@b'
      }
    })
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} }
        }
      }
    })
    // початково порожні
    expect(wrapper.vm.userId).toBeNull()
    await wrapper.vm.$nextTick()
    // після успішного запиту
    expect(api.getProfile).toHaveBeenCalled()
    expect(wrapper.vm.userId).toBe(10)
    expect(wrapper.vm.first_name).toBe('A')
    expect(wrapper.vm.last_name).toBe('B')
    expect(wrapper.vm.second_name).toBe('C')
    expect(wrapper.vm.email).toBe('a@b')
  })

  it('fetchProfile помилка показує червоне повідомлення', async () => {
    api.getProfile.mockRejectedValue(new Error('fail'))
    wrapper = shallowMount(AccountInfo, {
      global: { mocks: { $route: { query: {} } } }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.message).toBe('Не вдалося завантажити профіль.')
    expect(wrapper.vm.messageType).toBe('error')
  })

  it('toggleAccordion відкриває та закриває акордеон і змінює activeTab', () => {
    wrapper = shallowMount(AccountInfo, { global: { mocks: { $route: { query: {} } } } })
    // спочатку openedAccordions = [0], activeTab=0
    expect(wrapper.vm.openedAccordions).toEqual([0])
    wrapper.vm.toggleAccordion(1)
    expect(wrapper.vm.openedAccordions).toContain(1)
    expect(wrapper.vm.activeTab).toBe(1)
    // повторний виклик приховає
    wrapper.vm.toggleAccordion(1)
    expect(wrapper.vm.openedAccordions).not.toContain(1)
  })

  it('якщо в route.query.tab = "wishlist", робить activeTab=3 при mount', () => {
    wrapper = shallowMount(AccountInfo, {
      global: { mocks: { $route: { query: { tab: 'wishlist' } } } }
    })
    expect(wrapper.vm.activeTab).toBe(3)
  })

  it('activeTab за замовчуванням має значення 0', () => {
    wrapper = shallowMount(AccountInfo, { global: { mocks: { $route: { query: {} } } } });
    expect(wrapper.vm.activeTab).toBe(0);
  });

  it('openedAccordions за замовчуванням містить 0', () => {
    wrapper = shallowMount(AccountInfo, { global: { mocks: { $route: { query: {} } } } });
    expect(wrapper.vm.openedAccordions).toEqual([0]);
  });

  it('toggleAccordion змінює activeTab на індекс акордеону', () => {
    wrapper = shallowMount(AccountInfo, { global: { mocks: { $route: { query: {} } } } });
    wrapper.vm.toggleAccordion(2);
    expect(wrapper.vm.activeTab).toBe(2);
  });

  it('message та messageType за замовчуванням порожні', () => {
    wrapper = shallowMount(AccountInfo, { global: { mocks: { $route: { query: {} } } } });
    expect(wrapper.vm.message).toBe('');
    expect(wrapper.vm.messageType).toBe('');
  });

  it('не заповнює дані, якщо getProfile повертає порожній обʼєкт', async () => {
    api.getProfile.mockResolvedValue({});
    wrapper = shallowMount(AccountInfo, {
      global: { mocks: { $route: { query: {} } } }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.userId).toBeNull();
  });

  it('has default data значення', () => {
    wrapper = shallowMount(AccountInfo, { global: { mocks: { $route: { query: {} } } } });
    expect(wrapper.vm.first_name).toBe('');
    expect(wrapper.vm.last_name).toBe('');
    expect(wrapper.vm.second_name).toBe('');
    expect(wrapper.vm.email).toBe('');
  });

  it('mounted встановлює activeTab з route.query.tab=wishlist', () => {
    wrapper = shallowMount(AccountInfo, {
      global: { mocks: { $route: { query: { tab: 'wishlist' } } } }
    });
    expect(wrapper.vm.activeTab).toBe(3);
  });

  it('mounted не змінює activeTab, якщо tab невалідний', () => {
    wrapper = shallowMount(AccountInfo, {
      global: { mocks: { $route: { query: { tab: 'not_exist' } } } }
    });
    expect(wrapper.vm.activeTab).toBe(0);
  });

  it('toggleAccordion не додає індекс, якщо він уже відкритий', () => {
    wrapper = shallowMount(AccountInfo, { global: { mocks: { $route: { query: {} } } } });
    wrapper.vm.openedAccordions = [1];
    wrapper.vm.toggleAccordion(1);
    expect(wrapper.vm.openedAccordions).not.toContain(1);
  });

  it('toggleAccordion додає індекс, якщо його нема в списку', () => {
    wrapper = shallowMount(AccountInfo, { global: { mocks: { $route: { query: {} } } } });
    wrapper.vm.toggleAccordion(2);
    expect(wrapper.vm.openedAccordions).toContain(2);
  });

  it('відповідні компоненти існують', () => {
    wrapper = shallowMount(AccountInfo, {
      global: { mocks: { $route: { query: {} } } },
      stubs: {
        PersonalInfo, Addresses, OrderHistory, Wishlist
      }
    });
    expect(PersonalInfo).toBeTruthy();
    expect(Addresses).toBeTruthy();
    expect(OrderHistory).toBeTruthy();
    expect(Wishlist).toBeTruthy();
  });
})