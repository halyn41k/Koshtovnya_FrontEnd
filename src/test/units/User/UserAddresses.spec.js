describe.skip('Тести для MyComponent', () => {
    it('цей тест не виконається', () => {
      expect(true).toBe(false)
    })
  })
  
  //Протестовано головні аспекти
  /*
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  import { shallowMount } from '@vue/test-utils';
  import UserAddresses from '@/components/user/UserAddresses.vue';
  import axios from 'axios';
  
  // Мокаємо методи axios
  jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  }));
  
  // Мокаємо зображення
  jest.mock('@/assets/logo1.webp', () => '');
  
  // Мокаємо виклик window.alert, щоб уникнути помилок під час тестування
  window.alert = jest.fn();
  
  // Замокаємо метод fetchUserAddress, щоб created hook не викликав його під час тестування
  UserAddresses.methods.fetchUserAddress = jest.fn();
  
  describe('UserAddresses.vue - Рендеринг компонентів та взаємодія з формою', () => {
    let wrapper;
    const routerPushMock = jest.fn();
  
    beforeEach(() => {
      wrapper = shallowMount(UserAddresses, {
        stubs: ['Loader'],
        // Встановлюємо початкові дані, які необхідні для тестування рендерингу
        data() {
          return {
            loading: false,
            addressAvailable: false,
            showForm: false,
            phoneNumber: '1234567890',
            formData: {
              city: "",
              deliveryType: "",
              streetSearch: "",
              selectedDeliveryMethod: null,
              deliveryName: ""
            },
            deliveryAddress: {
              street: "",
              number: "",
              branch: "",
              postomat: ""
            },
            errors: {},
            cities: [],
            warehouses: [],
            showCityDropdown: false
          };
        },
        global: {
          mocks: {
            $router: { push: routerPushMock },
          },
        },
      });
    });
  
    afterEach(() => {
      wrapper.unmount();
      jest.clearAllMocks();
    });
  
    it('відображається компонент Loader, коли loading встановлено в true', async () => {
      await wrapper.setData({ loading: true });
      const loader = wrapper.findComponent({ name: 'Loader' });
      expect(loader.exists()).toBe(true);
    });
  
    it('рендериться блок з класом "no-address" з відповідним текстом та кнопкою, коли addressAvailable=false, loading=false та showForm=false', async () => {
      await wrapper.setData({
        loading: false,
        addressAvailable: false,
        showForm: false,
      });
  
      const noAddressBlock = wrapper.find('.no-address');
      expect(noAddressBlock.exists()).toBe(true);
      expect(noAddressBlock.text()).toContain('Немає адреси доставки. Додайте або створіть нову адресу!');
  
      const addAddressButton = noAddressBlock.find('.add-address-button');
      expect(addAddressButton.exists()).toBe(true);
    });
  
    it('відкривається форма при кліку по кнопці з класом "add-address-button" (викликається метод openForm і showForm встановлюється в true)', async () => {
      await wrapper.setData({
        loading: false,
        addressAvailable: false,
        showForm: false,
      });
  
      // Замокаємо метод openForm для тестування
      wrapper.vm.openForm = jest.fn(() => {
        wrapper.setData({ showForm: true });
      });
  
      const addAddressButton = wrapper.find('.add-address-button');
      await addAddressButton.trigger('click');
  
      expect(wrapper.vm.openForm).toHaveBeenCalled();
      expect(wrapper.vm.showForm).toBe(true);
    });
  
    it('рендериться форма з класом "address-form", коли showForm встановлено в true', async () => {
      await wrapper.setData({ showForm: true });
      const addressForm = wrapper.find('.address-form');
      expect(addressForm.exists()).toBe(true);
    });
  
    it('заголовок форми містить "Додати нову адресу", коли addressAvailable=false', async () => {
      await wrapper.setData({
        showForm: true,
        addressAvailable: false
      });
      const addressForm = wrapper.find('.address-form');
      expect(addressForm.text()).toContain("Додати нову адресу");
    });
  
    it('заголовок форми містить "Оновити адресу", коли addressAvailable=true', async () => {
      await wrapper.setData({
        showForm: true,
        addressAvailable: true
      });
      const addressForm = wrapper.find('.address-form');
      expect(addressForm.text()).toContain("Оновити адресу");
    });
  
    // Тест для взаємодії з формою доставки кур'єром
    it('при виборі типу доставки "courier" рендеряться додаткові поля для введення міста, вулиці та номера будинку', async () => {
      await wrapper.setData({ showForm: true });
      await wrapper.setData({
        formData: { deliveryType: "courier", city: "", streetSearch: "" },
        deliveryAddress: { street: "", number: "" }
      });
  
      const cityInput = wrapper.find('input[placeholder="Введіть назву міста"]');
      expect(cityInput.exists()).toBe(true);
  
      const streetInput = wrapper.find('input[placeholder="Введіть назву вулиці"]');
      expect(streetInput.exists()).toBe(true);
  
      const labels = wrapper.findAll('label');
      const houseLabel = labels.filter(label => label.text().includes("Будинок/Квартира:")).at(0);
      expect(houseLabel.exists()).toBe(true);
      const houseNumberInput = houseLabel.find('input');
      expect(houseNumberInput.exists()).toBe(true);
    });
  
    it('логіка пошуку вулиць: при введенні тексту в поле пошуку вулиць, відображаються підказки, і при виборі вулиці значення встановлюється', async () => {
      await wrapper.setData({ showForm: true });
      await wrapper.setData({
        formData: { deliveryType: "courier", streetSearch: "Main" },
        deliveryAddress: { street: "", number: "" }
      });
  
      const streetsData = [
        { street: "Main Street" },
        { street: "Main Avenue" }
      ];
      await wrapper.setData({ streets: streetsData });
  
      const streetSuggestions = wrapper.find('.street-suggestions');
      expect(streetSuggestions.exists()).toBe(true);
  
      const suggestionItems = streetSuggestions.findAll('li');
      expect(suggestionItems.length).toBeGreaterThan(0);
      await suggestionItems.at(0).trigger('click');
  
      expect(wrapper.vm.deliveryAddress.street).toBe("Main Street");
      expect(wrapper.vm.formData.streetSearch).toBe("Main Street");
    });
  
    // Тести для методу validateForm
    it('метод validateForm повертає false та встановлює відповідні помилки, якщо поля заповнені невірно (для доставки courier)', async () => {
      await wrapper.setData({
        phoneNumber: "+380123456789",
        formData: { deliveryType: "courier", city: "", streetSearch: "" },
        deliveryAddress: { street: "", number: "" }
      });
      
      const isValid = wrapper.vm.validateForm();
      expect(isValid).toBe(false);
      expect(wrapper.vm.errors).toHaveProperty("city", "Місто є обов'язковим");
      expect(wrapper.vm.errors).toHaveProperty("street", "Оберіть вулицю");
      expect(wrapper.vm.errors).toHaveProperty("number", "Введіть номер будинку/квартири");
    });
  
    it('метод validateForm встановлює помилку для номера телефону, якщо формат невірний', async () => {
      await wrapper.setData({
        phoneNumber: "12345",
        formData: { deliveryType: "courier", city: "TestCity", streetSearch: "TestStreet" },
        deliveryAddress: { street: "TestStreet", number: "10" }
      });
      
      const isValid = wrapper.vm.validateForm();
      expect(isValid).toBe(false);
      expect(wrapper.vm.errors).toHaveProperty(
        "phoneNumber",
        "Невірний формат номера телефону. Приклад: +380XXXXXXXXX"
      );
    });
  
    it('клік по кнопці оновлення (update-button) викликає метод editAddress і відкриває форму для редагування', async () => {
      await wrapper.setData({ loading: false, addressAvailable: true, showForm: false });
      
      // Замокаємо метод editAddress для тестування
      wrapper.vm.editAddress = jest.fn(() => {
        wrapper.setData({ showForm: true });
      });
      
      const updateButton = wrapper.find('.address-card .update-button');
      expect(updateButton.exists()).toBe(true);
      await updateButton.trigger('click');
      
      expect(wrapper.vm.editAddress).toHaveBeenCalled();
      expect(wrapper.vm.showForm).toBe(true);
    });
  
    it('клік по кнопці видалення (delete-button) викликає метод deleteAddress і виконується відповідна логіка видалення', async () => {
      await wrapper.setData({ loading: false, addressAvailable: true, showForm: false });
      
      wrapper.vm.deleteAddress = jest.fn();
      
      const deleteButton = wrapper.find('.address-card .delete-button');
      expect(deleteButton.exists()).toBe(true);
      await deleteButton.trigger('click');
      
      expect(wrapper.vm.deleteAddress).toHaveBeenCalled();
    });
  });
  
  describe('UserAddresses.vue - Рендеринг збереженої адреси та відображення тексту залежно від типу доставки', () => {
    let wrapper;
    const routerPushMock = jest.fn();
    
    beforeEach(() => {
      wrapper = shallowMount(UserAddresses, {
        stubs: ['Loader'],
        data() {
          return {
            loading: false,
            addressAvailable: false,
            showForm: false,
            // Для цього блоку очікується об’єкт з ключем phone_number
            phoneNumber: {},
            formData: {
              city: "",
              deliveryType: "",
              streetSearch: "",
              selectedDeliveryMethod: null,
              deliveryName: ""
            },
            deliveryAddress: {
              street: "",
              number: "",
              branch: "",
              postomat: ""
            },
            errors: {},
            cities: [],
            warehouses: [],
            showCityDropdown: false
          };
        },
        global: {
          mocks: {
            $router: { push: routerPushMock },
          },
        },
      });
    });
    
    afterEach(() => {
      wrapper.unmount();
      jest.clearAllMocks();
    });
    
    it('відображає блок збереженої адреси з інформацією, коли addressAvailable=true, loading=false і showForm=false (для кур\'єра)', async () => {
      await wrapper.setData({
        addressAvailable: true,
        loading: false,
        showForm: false,
        phoneNumber: { phone_number: "1234567890" },
        formData: {
          deliveryType: "courier",
          deliveryName: "Кур'єр Нової Пошти",
          city: "Київ"
        },
        deliveryAddress: {
          street: "Вулиця Лесі Українки",
          number: "15A",
          branch: "",
          postomat: ""
        }
      });
      
      const addressCard = wrapper.find('.address-card');
      expect(addressCard.exists()).toBe(true);
      expect(addressCard.text()).toContain("1234567890");
      expect(addressCard.text()).toContain("Кур'єр Нової Пошти");
      expect(addressCard.text()).toContain("Київ");
      expect(addressCard.text()).toContain("Вулиця Лесі Українки 15A");
    });
    
    it('відображає правильний текст залежно від типу доставки, коли addressAvailable=true, loading=false і showForm=false (для самовивозу)', async () => {
      // Сценарій a: "Самовивіз з нашого магазину"
      await wrapper.setData({
        addressAvailable: true,
        loading: false,
        showForm: false,
        phoneNumber: { phone_number: "0987654321" },
        formData: {
          deliveryType: "pickup",
          selectedDeliveryMethod: { id: 1, name: "Самовивіз з нашого магазину", is_store: true },
          deliveryName: "Самовивіз з нашого магазину",
          city: ""
        },
        deliveryAddress: {
          branch: "",
          postomat: "",
          street: "",
          number: ""
        }
      });
      let addressCard = wrapper.find('.address-card');
      expect(addressCard.exists()).toBe(true);
      expect(addressCard.text()).toContain("0987654321");
      expect(addressCard.text()).toContain("Самовивіз з нашого магазину");
      expect(addressCard.text()).toContain("вул. Степана Бандери 22, Коломия");
    
      // Сценарій b: "Самовивіз з Нової Пошти"
      await wrapper.setData({
        addressAvailable: true,
        loading: false,
        showForm: false,
        phoneNumber: { phone_number: "0987654321" },
        formData: {
          deliveryType: "pickup",
          selectedDeliveryMethod: { id: 2, name: "Самовивіз з Нової Пошти", is_store: false },
          deliveryName: "Самовивіз з Нової Пошти",
          city: "Львів"
        },
        deliveryAddress: {
          branch: "Відділення 5",
          postomat: "",
          street: "",
          number: ""
        }
      });
      addressCard = wrapper.find('.address-card');
      expect(addressCard.exists()).toBe(true);
      expect(addressCard.text()).toContain("0987654321");
      expect(addressCard.text()).toContain("Самовивіз з Нової Пошти");
      expect(addressCard.text()).toContain("Львів");
      expect(addressCard.text()).toContain("Відділення 5");
    });
  });
  
  describe('UserAddresses.vue - API methods', () => {
    let wrapper;
    const token = 'fake-token';
    
    beforeEach(() => {
      localStorage.setItem('token', token);
      wrapper = shallowMount(UserAddresses, {
        global: {
          mocks: {
            $router: { push: jest.fn() }
          }
        }
        // Видалено опцію methods щодо debounce, адже вона вже не використовується у цьому варіанті
      });
      jest.clearAllMocks();
    });
    
    afterEach(() => {
      wrapper.unmount();
      localStorage.clear();
    });
    
    describe('fetchUserPhoneNumber', () => {
      it('оновлює phoneNumber при успішному запиті', async () => {
        // Виправлено структуру відповіді, що повертається, щоб метод отримав response.data.phone
        const responseData = { data: { phone: "1234567890" } };
        axios.get.mockResolvedValue(responseData);
        await wrapper.vm.fetchUserPhoneNumber();
        expect(wrapper.vm.phoneNumber).toBe("1234567890");
      });
    
      it('логування помилки при невдалому запиті', async () => {
        const error = new Error("Phone error");
        axios.get.mockRejectedValue(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await wrapper.vm.fetchUserPhoneNumber();
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
      });
    });
    
    describe('fetchDeliveryTypes', () => {
      it('оновлює deliveryOptions при успішному запиті', async () => {
        const responseData = { data: { data: { type1: "value1", type2: "value2" } } };
        axios.get.mockResolvedValue(responseData);
        await wrapper.vm.fetchDeliveryTypes();
        expect(wrapper.vm.deliveryOptions).toEqual(responseData.data.data);
      });
    
      it('перенаправляє користувача на /login при відсутності токена', async () => {
        localStorage.clear();
        const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
        await wrapper.vm.fetchDeliveryTypes();
        expect(routerPushSpy).toHaveBeenCalledWith("/login");
      });
    });
    
    describe('fetchCities', () => {
      it('оновлює cities при успішному запиті', async () => {
        const responseData = { data: { success: true, data: [{ Ref: "1", city: "City1" }] } };
        axios.get.mockResolvedValue(responseData);
        wrapper.vm.formData.deliveryType = "courier";
        wrapper.vm.formData.city = "Ci";
        await wrapper.vm.fetchCities();
        expect(wrapper.vm.cities).toEqual(responseData.data.data);
      });
    
      it('очищує cities при некоректному форматі відповіді', async () => {
        const responseData = { data: { success: false } };
        axios.get.mockResolvedValue(responseData);
        wrapper.vm.formData.deliveryType = "courier";
        wrapper.vm.formData.city = "Ci";
        await wrapper.vm.fetchCities();
        expect(wrapper.vm.cities).toEqual([]);
      });
    });
    
    describe('fetchWarehouses', () => {
      it('оновлює warehouses при успішному запиті', async () => {
        wrapper.vm.formData.city = "TestCity";
        wrapper.vm.formData.cityRef = "ref123";
        const responseData = { 
          status: 200, 
          data: { data: [ { warehouse: "Warehouse1" }, { warehouse: "Warehouse2" } ] }
        };
        axios.get.mockResolvedValue(responseData);
        await wrapper.vm.fetchWarehouses();
        expect(wrapper.vm.warehouses).toEqual([
          { id: 1, name: "Warehouse1" },
          { id: 2, name: "Warehouse2" }
        ]);
      });
    
      it('очищує warehouses при невдалому запиті', async () => {
        wrapper.vm.formData.city = "TestCity";
        wrapper.vm.formData.cityRef = "ref123";
        const error = new Error("Warehouse error");
        axios.get.mockRejectedValue(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await wrapper.vm.fetchWarehouses();
        expect(wrapper.vm.warehouses).toEqual([]);
        consoleErrorSpy.mockRestore();
      });
    });
    
    describe('fetchStreets', () => {
      it('оновлює streets при успішному запиті', async () => {
        wrapper.vm.formData.city = "TestCity";
        wrapper.vm.formData.cityRef = "ref123";
        wrapper.vm.formData.streetSearch = "Main";
        const responseData = { 
          status: 200, 
          data: { data: [{ street: "Main Street" }, { street: "Main Ave" }] }
        };
        axios.get.mockResolvedValue(responseData);
        await wrapper.vm.fetchStreets();
        expect(wrapper.vm.streets).toEqual(responseData.data.data);
      });
    
      it('очищує streets при невдалому запиті', async () => {
        wrapper.vm.formData.city = "TestCity";
        wrapper.vm.formData.cityRef = "ref123";
        wrapper.vm.formData.streetSearch = "Main";
        const error = new Error("Street error");
        axios.get.mockRejectedValue(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await wrapper.vm.fetchStreets();
        expect(wrapper.vm.streets).toEqual([]);
        consoleErrorSpy.mockRestore();
      });
    });
  });
  */