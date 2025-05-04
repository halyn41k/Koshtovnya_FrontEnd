<template>
  <main class="max-w-4xl p-4 space-y-6">
    <!-- Заголовок та кнопки дій -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
      <h1 class="text-2xl font-semibold text-gray-800">Звіт по Прибутку</h1>
      <div class="flex space-x-2">
        <button @click="printReport" class="px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded text-sm transition">Друк</button>
        <button @click="exportToExcel" class="px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded text-sm transition">Excel</button>
        <button @click="exportToPDF" class="px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded text-sm transition">PDF</button>
      </div>
    </div>

    <!-- Пошук -->
    <div class="w-full md:w-1/3">
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="onSearch"
          type="text"
          placeholder="Пошук"
          class="w-full pl-10 pr-4 py-2 bg-red-50 border border-transparent rounded focus:outline-none focus:border-gray-300 text-sm"
        />
        <img src="@/assets/icons/search.svg" alt="Search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
      </div>
    </div>

    <!-- Таблиця звіту -->
    <div v-if="filteredProfitData.length" ref="printableArea" class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="w-full table-auto text-sm">
        <thead class="bg-red-50">
          <tr>
            <th @click="cycleSort('id')" class="px-4 py-2 font-medium text-gray-700 cursor-pointer">ID</th>
            <th @click="cycleSort('order_date')" class="px-4 py-2 font-medium text-gray-700 cursor-pointer">Дата</th>
            <th @click="cycleSort('orderPrice')" class="px-4 py-2 font-medium text-gray-700 cursor-pointer">Ціна Замовлення</th>
            <th @click="cycleSort('profit')" class="px-4 py-2 font-medium text-gray-700 cursor-pointer">Прибуток</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="order in filteredProfitData" :key="order.id" class="hover:bg-red-50">
            <td class="px-4 py-2 text-center">{{ order.id }}</td>
            <td class="px-4 py-2 text-center">{{ order.date }}</td>
            <td class="px-4 py-2 text-center">{{ order.orderPrice }}</td>
            <td class="px-4 py-2 text-center">{{ order.profit }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Порожній стан -->
    <div v-else class="py-12 text-center text-gray-500 border border-gray-200 rounded-lg">
      <p v-if="!searchQuery">Поки що не було додано жодного звіту по прибутку.</p>
      <p v-else>За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.</p>
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
      sortState: { id: 'none', order_date: 'none', orderPrice: 'none', profit: 'none' }
    };
  },
  computed: {
    profitData() {
      return this.orders.map(o => ({
        id: o.id,
        date: o.order_date,
        orderPrice: o.totalAmount != null ? `${o.totalAmount} грн` : 'N/A',
        profit: o.profit != null ? `${o.profit} грн` : 'N/A'
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
        const res = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json"
          }
        });
        this.orders = res.data.orders;
      } catch (e) {
        console.error("Помилка отримання замовлень:", e);
      }
    },
    printReport() {
      const el = this.$refs.printableArea;
      if (!el) return;
      const printWindow = window.open("", "", "width=800,height=600");
      printWindow.document.write(
        `<html><head><title>Звіт по Прибутку</title></head><body>${el.outerHTML}</body></html>`
      );
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    },
    exportToExcel() {
      const data = this.filteredProfitData.map(r => ({ ID: r.id, Дата: r.date, 'Ціна Замовлення': r.orderPrice, Прибуток: r.profit }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, 'profit_report.xlsx');
    },
    exportToPDF() {
      const el = this.$refs.printableArea;
      if (!el) return;
      html2canvas(el, { scale: 2 }).then(canvas => {
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const w = pdf.internal.pageSize.getWidth();
        const h = (canvas.height * w) / canvas.width;
        pdf.addImage(img, 'PNG', 0, 0, w, h);
        pdf.save('profit_report.pdf');
      });
    },
    onSearch() {},
    cycleSort(col) {
      const s = this.sortState[col];
      this.sortState[col] = s === 'none' ? 'asc' : s === 'asc' ? 'desc' : 'none';
    }
  }
};
</script>
