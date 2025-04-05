<template>
  <main class="order-list profit-report">
    <!-- Заголовок та кнопки дій -->
    <div class="order-header">
      <h1 class="order-list__title">Звіт по Прибутку</h1>
      <div class="report-actions">
        <button class="action-button" @click="printReport">Друк</button>
        <button class="action-button" @click="exportToExcel">Експорт в Excel</button>
        <button class="action-button" @click="exportToPDF">Експорт в PDF</button>
      </div>
    </div>

    <!-- Пошукове поле -->
    <div class="order-search-container">
      <div class="order-search-input-wrapper">
        <input
          class="order-search-input"
          type="text"
          placeholder="Пошук"
          v-model="searchQuery"
          @input="onSearch"
        />
        <img src="@/assets/icons/search.svg" alt="Search icon" class="order-search-icon" />
      </div>
    </div>

    <!-- Таблиця звіту у стилі "Замовлення" -->
    <div class="order-table-container">
      <header class="order-table__header">
        <span class="order-sortable-header" @click="cycleSort('id')">ID</span>
        <span class="order-sortable-header" @click="cycleSort('order_date')">Дата</span>
        <span class="order-sortable-header" @click="cycleSort('orderPrice')">Ціна Замовлення</span>
        <span class="order-sortable-header" @click="cycleSort('profit')">Прибуток</span>
      </header>
      <ul class="order-list__items">
        <li
          v-for="order in filteredProfitData"
          :key="order.id"
          class="order-item"
        >
          <span class="order-item__id">{{ order.id }}</span>
          <span class="order-item__date">{{ order.date }}</span>
          <span class="order-item__price">{{ order.orderPrice }}</span>
          <span class="order-item__profit">{{ order.profit }}</span>
        </li>
      </ul>
    </div>
  </main>
</template>

<script>
import axios from "axios";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export default {
  name: "ProfitReport",
  data() {
    return {
      orders: [],
      searchQuery: "",
      sortState: {
        id: "none",
        order_date: "none",
        orderPrice: "none",
        profit: "none"
      }
    };
  },
  computed: {
    // Мапуємо дані замовлень до необхідного формату для звіту
    profitData() {
      return this.orders.map(order => ({
        id: order.id,
        date: order.order_date,
        // Припустимо, API повертає поля totalAmount та profit, або їх можна обчислити
        orderPrice: order.totalAmount ? order.totalAmount + " грн" : "N/A",
        profit: order.profit ? order.profit + " грн" : "N/A"
      }));
    },
    filteredProfitData() {
      if (!this.searchQuery) return this.profitData;
      const query = this.searchQuery.toLowerCase();
      return this.profitData.filter(order =>
        order.id.toString().toLowerCase().includes(query) ||
        order.date.toLowerCase().includes(query) ||
        order.orderPrice.toLowerCase().includes(query) ||
        order.profit.toLowerCase().includes(query)
      );
    }
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json"
          }
        });
        // API повертає orders у полі response.data.orders
        this.orders = response.data.orders;
      } catch (error) {
        console.error("Помилка отримання замовлень:", error);
      }
    },
    printReport() {
      window.print();
    },
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.profitData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Звіт по Прибутку');
      XLSX.writeFile(wb, 'profit_report.xlsx');
    },
    exportToPDF() {
      const doc = new jsPDF();
      doc.text('Звіт по Прибутку', 20, 20);
      // Логіку для експорту даних можна розширити за потреби
      doc.save('profit_report.pdf');
    },
    onSearch() {
      console.log("Пошук:", this.searchQuery);
    },
    cycleSort(column) {
      if (this.sortState[column] === "none") {
        this.sortState[column] = "asc";
      } else if (this.sortState[column] === "asc") {
        this.sortState[column] = "desc";
      } else {
        this.sortState[column] = "none";
      }
      console.log(`Сортування ${column}: ${this.sortState[column]}`);
      // Тут можна реалізувати сортування profitData за вибраним полем
    }
  }
};
</script>

<style scoped>
/* Стилі, схожі на компонент "Замовлення" */
.order-list {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: Montserrat, sans-serif;
  color: #000;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-list__title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.report-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 8px 16px;
  background-color: #6B1F1F;
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #a01212;
}

.order-search-container {
  margin-bottom: 20px;
}

.order-search-input-wrapper {
  display: flex;
  align-items: center;
  width: 262px;
  height: 30px;
  background-color: #f6e7e7;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid transparent;
  transition: border 0.3s;
}

.order-search-input-wrapper:focus-within {
  border: 1px solid #1d1d1d;
}

.order-search-input {
  flex: 1;
  height: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #6b1f1f;
  font-size: 14px;
  outline: none;
}

.order-search-icon {
  width: 16px;
  height: 16px;
  margin-right: 12px;
  pointer-events: none;
}

.order-table-container {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.order-table__header {
  display: grid;
  grid-template-columns: 10% 25% 30% 35%;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #F6E7E7;
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
}

.order-sortable-header {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.order-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.order-item {
  display: grid;
  grid-template-columns: 10% 25% 30% 35%;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  font-size: 14px;
  transition: background-color 0.3s;
}

.order-item__id,
.order-item__date,
.order-item__price,
.order-item__profit {
  text-align: center;
}
</style>
