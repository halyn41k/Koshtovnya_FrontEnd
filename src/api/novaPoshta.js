import axios from "axios";

const BASE_API_URL = "http://26.235.139.202:8080/api/nova-poshta";

const validDeliveryTypes = [
  "Самовивіз з Нової Пошти",
  "Самовивіз з поштоматів Нової Пошти",
  "Кур'єр Нової Пошти",
];

function getAuthToken() {
  return localStorage.getItem("token");
}

function getAuthHeaders() {
  const token = getAuthToken();
  if (!token) {
    alert("Будь ласка, увійдіть у свій обліковий запис.");
    window.location.href = "/login";
    throw new Error("Користувач не авторизований.");
  }
  return { Authorization: `Bearer ${token}` };
}

export async function getCities(deliveryType, city) {
  try {
    console.log("Функція getCities викликана з:", { deliveryType, city });
    
    if (!validDeliveryTypes.includes(deliveryType)) {
      throw new Error(`Некоректний тип доставки: ${deliveryType}`);
    }

    const url = `${BASE_API_URL}/cities`;
    const headers = getAuthHeaders();
    const params = { delivery_type: deliveryType, city };
    
    console.log("Відправляємо запит на міста:", url, params);
    const response = await axios.get(url, { headers, params });
    console.log("Отримано відповідь на міста:", response.data);
    
    return response.data || [];
  } catch (error) {
    console.error("Помилка отримання міст:", error.response?.data || error.message);
    return [];
  }
}

export async function getWarehouses(cityRef, cityName, type) {
  try {
    const headers = getAuthHeaders();
    const url = `${BASE_API_URL}/ware-houses`;
    const params = {
      city_ref: cityRef,
      city: cityName, // Додаємо параметр city
      delivery_type: type
    };

    console.log("Відправляємо запит на відділення:", url, params);
    const response = await axios.get(url, { headers, params });

    if (response.status !== 200) {
      throw new Error(`Помилка отримання відділень: ${response.status} - ${response.statusText}`);
    }

    console.log("Отримані відділення:", response.data);
    return response.data?.data?.map((warehouse) => ({
      name: warehouse.warehouse || warehouse.Description,
      id: warehouse.id || warehouse.Ref,
    })) || [];
  } catch (error) {
    console.error("Помилка отримання відділень:", error.message);
    return [];
  }
}

export async function getStreets(cityRef, street = "") {
  try {
    if (!cityRef) {
      throw new Error("City Ref є обов'язковим параметром");
    }

    const headers = getAuthHeaders();
    const url = `${BASE_API_URL}/streets`;
    const params = { Ref: cityRef };

    if (street) {
      params.street = street; // Додаємо пошук за назвою вулиці
    }

    console.log("Відправляємо запит на вулиці:", url, params);
    const response = await axios.get(url, { headers, params });

    if (response.status !== 200) {
      throw new Error(`Помилка отримання вулиць: ${response.status} - ${response.statusText}`);
    }

    console.log("Отримано список вулиць:", response.data);
    return response.data?.data || [];
  } catch (error) {
    console.error("Помилка отримання вулиць:", error.response?.data || error.message);
    return [];
  }
}
