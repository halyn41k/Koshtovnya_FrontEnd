<template>
    <div class="postal-info">
      <div class="input-container">
        <!-- Вибір категорії доставки -->
        <select
          v-model="localDeliveryCategory"
          @change="onDeliveryCategoryChange"
          class="input-field"
        >
          <option disabled value="">Оберіть тип доставки</option>
          <option value="courier">Кур'єр</option>
          <option value="pickup">Самовивіз</option>
        </select>
  
        <!-- Вибір способу доставки -->
        <select
          v-model="localData.deliveryType"
          class="input-field"
          @change="onDeliveryTypeChange"
        >
          <option disabled value="">Оберіть спосіб доставки</option>
          <option
            v-for="option in deliveryOptions"
            :key="option.id"
            :value="option.name"
          >
            {{ option.name }}
          </option>
        </select>
        <span v-if="errors.deliveryType" class="error">{{ errors.deliveryType }}</span>
  
        <!-- Введення міста -->
        <input
          class="input-field"
          v-model="localData.city"
          placeholder="Введіть місто"
          @input="onCityInput"
        />
        <span v-if="errors.city" class="error">{{ errors.city }}</span>
        <div v-if="cities.length" class="city-suggestions">
          <ul>
            <li v-for="city in cities" :key="city.Ref" @click="selectCity(city)">
              {{ city.city }}
            </li>
          </ul>
        </div>
  
        <!-- Якщо обрана доставка, що потребує введення міста -->
        <div v-if="localData.deliveryType && localData.deliveryType !== 'Самовивіз з наших магазинів'">
          <!-- Пошук вулиці для доставки кур'єром -->
          <div v-if="isCourier">
            <input
              class="input-field"
              v-model="localData.streetSearch"
              placeholder="Введіть назву вулиці"
              @input="onStreetSearch"
            />
            <div v-if="streets.length" class="street-suggestions">
              <ul>
                <li v-for="(street, idx) in streets" :key="idx" @click="selectStreet(street)">
                  {{ street.street || street.Name }}
                </li>
              </ul>
            </div>
            <div v-else-if="localData.streetSearch">
              <p>Немає вулиць для цього запиту.</p>
            </div>
            <span v-if="errors.street" class="error">{{ errors.street }}</span>
          </div>
  
          <!-- Введення номера будинку для доставки кур'єром -->
          <div v-if="isCourier && localData.street">
            <input
              class="input-field"
              v-model="localData.houseNumber"
              placeholder="Введіть номер будинку"
              @input="updateData"
            />
            <span v-if="errors.houseNumber" class="error">{{ errors.houseNumber }}</span>
          </div>
        </div>
  
        <!-- Вибір відділення для самовивозу -->
        <div v-if="localData.deliveryType === 'Самовивіз з наших магазинів' || localData.deliveryType === 'Самовивіз з Нової Пошти' || localData.deliveryType === 'Самовивіз з УКРПОШТИ' || localData.deliveryType === 'Самовивіз з поштоматів Нової Пошти'">
          <select v-model="localData.warehouse" class="input-field" @change="updateData">
            <option disabled value="">Оберіть відділення</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.name">
              {{ warehouse.name }}
            </option>
          </select>
          <span v-if="errors.warehouse" class="error">{{ errors.warehouse }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  export default {
    name: "PostalInfo",
    props: {
      modelValue: {
        type: Object,
        required: true,
      },
      errors: {
        type: Object,
        default: () => ({}),
      },
      cities: {
        type: Array,
        default: () => [],
      },
      streets: {
        type: Array,
        default: () => [],
      },
      warehouses: {
        type: Array,
        default: () => [],
      },
      selectedDeliveryCategory: {
        type: String,
        default: "",
      },
      deliveryOptions: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        localData: { ...this.modelValue },
        localDeliveryCategory: this.selectedDeliveryCategory || "",
        citiesLocal: [...this.cities],
        streetsLocal: [...this.streets],
        warehousesLocal: [...this.warehouses],
        streetSearchTimeout: null,
      };
    },
    computed: {
      isCourier() {
        return (
          this.localData.deliveryType &&
          this.localData.deliveryType.includes("Кур'єр")
        );
      },
    },
    watch: {
      modelValue: {
        handler(newVal) {
          this.localData = { ...newVal };
        },
        deep: true,
      },
      cities(newVal) {
        this.citiesLocal = [...newVal];
      },
      streets(newVal) {
        this.streetsLocal = [...newVal];
      },
      warehouses(newVal) {
        this.warehousesLocal = [...newVal];
      },
    },
    methods: {
      updateData() {
        this.$emit("update:modelValue", this.localData);
      },
      onDeliveryCategoryChange() {
        this.$emit("update-delivery-options", this.localDeliveryCategory);
        this.updateData();
      },
      onDeliveryTypeChange() {
        this.updateData();
        // Якщо змінюється спосіб доставки і вже введено місто, завантажуємо відділення
        if (this.localData.city && this.localData.deliveryType) {
          this.fetchWarehouses();
        }
      },
      onCityInput() {
        this.updateData();
        if (this.localData.city.length >= 3) {
          this.fetchCities();
        }
      },
      async fetchCities() {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/cities", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              city: this.localData.city,
              delivery_type: this.localData.deliveryType,
            },
          });
          if (response.data.success && Array.isArray(response.data.data)) {
            this.citiesLocal = response.data.data;
            this.$emit("update-cities", this.citiesLocal);
          } else {
            this.citiesLocal = [];
            this.$emit("update-cities", []);
          }
        } catch (error) {
          console.error("Помилка отримання міст", error);
        }
      },
      onStreetSearch() {
        clearTimeout(this.streetSearchTimeout);
        this.streetSearchTimeout = setTimeout(() => {
          this.fetchStreets();
        }, 300);
        this.updateData();
      },
      async fetchStreets() {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Ви не авторизовані. Будь ласка, увійдіть.");
          this.$router.push("/login");
          return;
        }
        if (this.localData.streetSearch.length >= 3) {
          try {
            const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/streets", {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                Ref: this.localData.cityRef,
                street: this.localData.streetSearch,
              },
            });
            if (response.data && Array.isArray(response.data.data)) {
              this.streetsLocal = response.data.data;
              this.$emit("update-streets", this.streetsLocal);
            } else {
              this.streetsLocal = [];
              this.$emit("update-streets", []);
            }
          } catch (error) {
            console.error("Помилка отримання вулиць", error);
          }
        }
      },
      selectStreet(street) {
        const streetName = street.street || street.Name;
        this.localData.street = streetName;
        this.localData.streetSearch = streetName;
        this.streetsLocal = [];
        this.$emit("update-streets", this.streetsLocal);
        this.updateData();
      },
      selectCity(city) {
        this.localData.city = city.city;
        this.localData.cityRef = city.Ref;
        console.log("Вибране місто:", city.city, "Ref:", city.Ref);
        this.citiesLocal = [];
        this.$emit("update-cities", this.citiesLocal);
        this.fetchWarehouses();
        this.updateData();
      },
      async fetchWarehouses() {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/ware-houses", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              city: this.localData.city,
              Ref: this.localData.cityRef,
              delivery_type: this.localData.deliveryType,
            },
          });
          if (response.status === 200 && Array.isArray(response.data?.data)) {
            this.warehousesLocal = response.data.data.map((item, index) => ({
              id: index + 1,
              name: item.warehouse,
            }));
            this.$emit("update-warehouses", this.warehousesLocal);
          }
        } catch (error) {
          console.error("Помилка отримання відділень", error);
        }
      },
    },
    mounted() {
      // Якщо вже є дані в полі міста – спробувати завантажити відділення
      if (this.localData.city && this.localData.deliveryType) {
        this.fetchWarehouses();
      }
    },
  };
  </script>
  
  <style scoped>
  .input-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 250px;
  }
  .input-field {
    border: 1px solid #9d9292;
    padding: 8px;
    color: #6b1f1f;
    font-family: 'Montserrat', sans-serif;
    border-radius: 4px;
  }
  .error {
    color: red;
    font-size: 12px;
  }
  .city-suggestions,
  .street-suggestions {
    border: 1px solid #ddd;
    max-height: 150px;
    overflow-y: auto;
  }
  .city-suggestions ul,
  .street-suggestions ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .city-suggestions li,
  .street-suggestions li {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #ddd;
  }
  .city-suggestions li:hover,
  .street-suggestions li:hover {
    background-color: #f0f0f0;
  }
  </style>
  