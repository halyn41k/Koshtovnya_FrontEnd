<template>
  <div class="postal-info font-montserrat text-[14px]">
    <div class="flex flex-col gap-4 w-[520px]">
      <!-- Спосіб доставки -->
      <div class="relative">
        <label class="block mb-1 text-sm font-medium text-gray-700">Спосіб доставки:</label>
        <Multiselect
          v-model="deliveryType"
          :options="deliveryOptions"
          :custom-label="opt => `${opt.label} — ${opt.name}`"
          track-by="id"
          placeholder="Оберіть спосіб доставки"
          searchable
          @input="onDeliveryTypeChange"
        />
        <span v-if="errors.deliveryType" class="text-red-500 text-xs">{{ errors.deliveryType }}</span>
      </div>

      <!-- Місто -->
      <div v-if="deliveryType && !isStorePickup">
        <label class="block mb-1 text-sm font-medium text-gray-700">Місто:</label>
        <Combobox v-model="city" as="div" class="relative">
          <ComboboxInput
            class="block w-full p-2 border rounded-md"
            :class="{ 'border-red-500': errors.city }"
            @input="handleCitySearch"
            :displayValue="c => c?.city || c"
            placeholder="Введіть місто"
          />
          <ComboboxOptions v-if="cities.length" class="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg">
            <ComboboxOption
              v-for="c in cities"
              :key="c.Ref"
              :value="c"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {{ c.city }}
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>
        <p v-if="errors.city" class="text-red-500 text-xs mt-1">{{ errors.city }}</p>
      </div>

      <!-- Вулиця + номер -->
      <div v-if="isCourier">
        <label class="block mb-1 text-sm font-medium text-gray-700">Вулиця:</label>
        <Combobox v-model="street" as="div" class="relative">
          <ComboboxInput
            class="block w-full p-2 border rounded-md"
            :class="{ 'border-red-500': errors.street }"
            @input="handleStreetSearch"
            :displayValue="s => s?.Name || s"
            placeholder="Введіть вулицю"
          />
          <ComboboxOptions v-if="streets.length" class="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg">
            <ComboboxOption
              v-for="(s, i) in streets"
              :key="i"
              :value="s"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {{ s.Name }}
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>
        <p v-if="errors.street" class="text-red-500 text-xs mt-1">{{ errors.street }}</p>

        <div class="mt-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Номер будинку:</label>
          <input
            v-model="houseNumber"
            class="block w-full p-2 border rounded-md"
            :class="{ 'border-red-500': errors.houseNumber }"
            placeholder="Номер будинку"
          />
          <p v-if="errors.houseNumber" class="text-red-500 text-xs mt-1">{{ errors.houseNumber }}</p>
        </div>
      </div>

      <!-- Відділення / поштомат -->
      <div v-if="showWarehouse">
        <label class="block mb-1 text-sm font-medium text-gray-700">
          {{ isPostomat ? 'Поштомат' : 'Відділення' }}:
        </label>
        <Multiselect
  v-model="warehouse"
  :options="warehouses"
  label="name"
  track-by="id"
  placeholder="Оберіть відділення"
  searchable
  taggable                      
  @tag="onWarehouseTag"      
/>
        <span v-if="errors.warehouse" class="text-red-500 text-xs mt-1">{{ errors.warehouse }}</span>
      </div>

      <!-- Магазин -->
      <div v-if="isStorePickup" class="text-sm text-gray-800">
        <p><strong>Місто:</strong> Коломия</p>
        <p><strong>Адреса:</strong> вул. Степана Бандери 22</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/vue';

export default {
  name: 'PostalInfo',
  components: { Multiselect, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption },
  props: {
    modelValue:      { type: Object, required: true },
    errors:          { type: Object, default: () => ({}) },
    tempUserAddress: { type: Object, default: null },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      selectedCity:       null,
      selectedStreet:     null,
      deliveryOptions:    [],
      cities:             [],
      streets:            [],
      warehouses:         [],
      citySearchTimeout:  null,
      streetSearchTimeout:null,
      pendingAddr:        null,
    };
  },
  computed: {
    deliveryType: {
      get() { return this.modelValue.deliveryType; },
      set(v) { this.update({ deliveryType: v }); }
    },
    city: {
      get() { return this.modelValue.city; },
      set(v) { this.update({ city: v, cityRef: v?.Ref }); }
    },
    street: {
      get() { return this.modelValue.street; },
      set(v) { this.update({ street: v.Name || v }); }
    },
    houseNumber: {
      get() { return this.modelValue.houseNumber; },
      set(v) { this.update({ houseNumber: v }); }
    },
    warehouse: {
      get() { return this.modelValue.warehouse; },
      set(v) { this.update({ warehouse: v }); }
    },
    isCourier()     { return this.deliveryType?.delivery_type === 'courier'; },
    isPickup()      { return this.deliveryType?.delivery_type === 'pickup'; },
    isStorePickup() { return this.deliveryType?.name === 'Самовивіз з наших магазинів'; },
    isPostomat()    { return this.deliveryType?.name?.toLowerCase().includes('поштомат'); },
    showWarehouse() { return this.isPickup && !this.isStorePickup; },
  },
  watch: {
    warehouses(newList) {
      console.log('Список відділень:', newList);
      const wName = this.modelValue.warehouse?.name;
      if (wName) {
        const match = newList.find(w => w.name === wName);
        if (match) this.update({ warehouse: match });
      }
    },
    tempUserAddress: {
      immediate: true,
      deep:      true,
      handler(addr) {
        if (!addr) return;
        console.log('PostalInfo: отримано tempUserAddress', addr);
        // оновимо поля міста/телефону/тощо
        const patch = {};
        if ('phone' in addr)         patch.phone = addr.phone;
        if ('city' in addr) {
          patch.city    = addr.city;
          patch.cityRef = addr.cityRef;
        }
        if ('street' in addr) {
          patch.street = addr.street;
          if ('streetSearch' in addr) patch.streetSearch = addr.streetSearch;
        }
        if ('houseNumber' in addr)   patch.houseNumber = addr.houseNumber;
        this.update(patch);

        // inject кастомної адреси в warehouses, якщо є:
        const customName = addr.warehouseName || addr.delivery_address;
        if (customName && !this.warehouses.find(w => w.name === customName)) {
          this.warehouses.unshift({ id: -1, name: customName });
        }
        // одразу обрати її:
        if (customName) {
          this.update({ warehouse: this.warehouses.find(w => w.name === customName) });
        }

        // Локальні селектори UI
        if (addr.city && addr.cityRef) {
          this.selectedCity = { city: addr.city, Ref: addr.cityRef };
        }
        if (addr.street && this.isCourier) {
          const raw = addr.street || '';
          const m = raw.match(/(.+?)\s+(.+)$/);
          if (m) {
            this.selectedStreet = { Name: m[1].trim() };
            this.update({ streetSearch: m[1].trim() });
          } else {
            this.selectedStreet = null;
          }
        }

        // deliveryType за назвою
        if (addr.deliveryTypeName) {
          const match = this.deliveryOptions.find(o => o.name === addr.deliveryTypeName);
          if (match) {
            this.update({ deliveryType: match });
            if (match.delivery_type === 'courier') {
              this.fetchStreets();
            } else if (match.delivery_type === 'pickup') {
              this.fetchWarehouses(addr.city, addr.cityRef, addr.deliveryTypeName);
            }
          }
        }
      }
    }
  },
  async created() {
    await this.fetchDeliveryTypes();
    // якщо був pendingAddr — watch.deliveryOptions може відпрацювати
  },
  methods: {
    update(patch) {
      this.$emit('update:modelValue', { ...this.modelValue, ...patch });
    },
    onWarehouseTag(newTag) {
      const nextId = this.warehouses.length
        ? Math.max(...this.warehouses.map(w => w.id)) + 1
        : 1;
      const custom = { id: nextId, name: newTag };
      this.warehouses.unshift(custom);
      this.update({ warehouse: custom });
    },
    async fetchDeliveryTypes() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/delivery-types',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.deliveryOptions = Object.entries(data.data).flatMap(([type, list]) =>
          list.map(opt => ({
            id: opt.id,
            name: opt.name,
            delivery_type: type,
            label: type === 'pickup' ? 'Самовивіз' : 'Кур’єр'
          }))
        );
      } catch (e) {
        console.error('PostalInfo: помилка fetchDeliveryTypes', e);
      }
    },
    onDeliveryTypeChange() {
      if (this.isStorePickup) {
        this.update({
          city: 'Коломия',
          street: 'вул. Степана Бандери 22',
          houseNumber: '',
          warehouse: null
        });
      } else {
        this.update({ city: '', street: '', houseNumber: '', warehouse: null });
      }
    },
    handleCitySearch(e) {
      const q = e.target.value;
      this.update({ city: q });
      clearTimeout(this.citySearchTimeout);
      if (q.length < 3) return;
      this.citySearchTimeout = setTimeout(this.fetchCities, 300);
    },
    async fetchCities() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/cities',
          { headers: { Authorization: `Bearer ${token}` }, params: { city: this.city } }
        );
        this.cities = data.success ? data.data : [];
      } catch (e) {
        console.error('PostalInfo: помилка fetchCities', e);
      }
    },
    handleStreetSearch() {
      clearTimeout(this.streetSearchTimeout);
      this.streetSearchTimeout = setTimeout(this.fetchStreets, 300);
    },
    async fetchStreets() {
      if (!this.modelValue.cityRef) return;
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/streets',
          { headers: { Authorization: `Bearer ${token}` }, params: { Ref: this.modelValue.cityRef, street: this.street } }
        );
        this.streets = data.data || [];
      } catch (e) {
        console.error('PostalInfo: помилка fetchStreets', e);
      }
    },
    async fetchWarehouses(city, cityRef, deliveryName) {
      if (!city || !cityRef) return [];
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/ware-houses',
          { headers: { Authorization: `Bearer ${token}` }, params: { city, Ref: cityRef, delivery_type: deliveryName } }
        );
        // стандартний список
        const list = (data.data || []).map((item, i) => ({
          id: i + 1,
          name: item.warehouse
        }));
        // inject кастомної
        const addr = this.tempUserAddress;
        if (addr && addr.delivery_address && !list.find(w => w.name === addr.delivery_address)) {
          list.unshift({ id: -1, name: addr.delivery_address });
        }
        this.warehouses = list;
        // синхронізуємо модель
        const wName = this.modelValue.warehouse?.name;
        if (wName) {
          const m = list.find(w => w.name === wName);
          if (m) this.update({ warehouse: m });
        }
        return this.warehouses;
      } catch (e) {
        console.error('PostalInfo: помилка fetchWarehouses', e);
        return [];
      }
    }
  }
};
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&display=swap');
.font-montserrat { font-family: 'Montserrat', sans-serif; }
</style>
