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

    <!-- Таблиця звіту -->
    <div
      v-if="filteredProfitData.length > 0"
      ref="printableArea"
      class="order-table-container"
    >
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

    <!-- Порожній стан -->
    <div v-else-if="!searchQuery" class="empty-state">
      Поки що не було додано жодного звіту по прибутку.
    </div>
    <div v-else class="empty-state">
      За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.
    </div>
  </main>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
    profitData() {
      return this.orders.map(o => ({
        id: o.id,
        date: o.order_date,
        orderPrice: o.totalAmount != null ? `${o.totalAmount} грн` : "N/A",
        profit: o.profit != null ? `${o.profit} грн` : "N/A"
      }));
    },
    filteredProfitData() {
      if (!this.searchQuery) return this.profitData;
      const q = this.searchQuery.toLowerCase();
      return this.profitData.filter(r =>
        r.id.toString().includes(q) ||
        r.date.toLowerCase().includes(q) ||
        r.orderPrice.toLowerCase().includes(q) ||
        r.profit.toLowerCase().includes(q)
      );
    }
  },
  mounted() {
    this.fetchOrders();
    document.title = "Звіти";
  },
  methods: {
    async fetchOrders() {
      try {
        const res = await axios.get(
          "http://26.235.139.202:8080/api/admin/orders",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        this.orders = res.data.orders;
      } catch (e) {
        console.error("Помилка отримання замовлень:", e);
      }
    },
    printReport() {
      const el = this.$refs.printableArea;
      if (!el) {
        console.warn("Немає таблиці для друку");
        return;
      }
      const printContents = el.outerHTML;
      const printWindow = window.open("", "", "width=800,height=600");
      printWindow.document.write(`
        <html>
          <head>
            <title>Звіт по Прибутку</title>
            <style>
              body { font-family: Montserrat, sans-serif; padding: 20px; }
              .order-table__header {
                display: grid;
                grid-template-columns: 100px 200px 300px 300px;
                background-color: #F6E7E7;
                font-weight: 600;
                padding: 8px;
              }
              .order-item {
                display: grid;
                grid-template-columns: 100px 200px 300px 300px;
                padding: 8px;
                border-bottom: 1px solid #e0e0e0;
              }
              .order-item__id,
              .order-item__date,
              .order-item__price,
              .order-item__profit {
                text-align: center;
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    },
    exportToExcel() {
      const data = this.filteredProfitData.map(r => ({
        ID: r.id,
        Дата: r.date,
        "Ціна Замовлення": r.orderPrice,
        Прибуток: r.profit
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Звіт по Прибутку");
      XLSX.writeFile(wb, "profit_report.xlsx");
    },
    exportToPDF() {
      const el = this.$refs.printableArea;
      if (!el) {
        console.warn("Немає таблиці для експорту в PDF");
        return;
      }
      html2canvas(el, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("profit_report.pdf");
      });
    },
    onSearch() {
      // можна додати debounce, якщо потрібно
    },
    cycleSort(col) {
      const s = this.sortState[col];
      this.sortState[col] = s === "none" ? "asc" : s === "asc" ? "desc" : "none";
      // тут можна додати реальне сортування this.orders
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');

.order-list {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: Montserrat, sans-serif;
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
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
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
  grid-template-columns: 100px 200px 300px 300px;
  align-items: center;
  padding: 12px 16px;
  background-color: #F6E7E7;
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
}
.order-sortable-header {
  cursor: pointer;
}
.order-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.order-item {
  display: grid;
  grid-template-columns: 100px 200px 300px 300px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  font-size: 14px;
}
.order-item__id,
.order-item__date,
.order-item__price,
.order-item__profit {
  text-align: center;
}
.empty-state {
  width: 100%;
  height: 200px;
  margin: 40px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  text-align: center;
}
</style>

<!-- Глобальні стилі для друку -->
<style>
@media print {
  body * {
    visibility: hidden;
  }
  .order-table-container,
  .order-table-container * {
    visibility: visible;
  }
  .order-table-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
}
</style>
