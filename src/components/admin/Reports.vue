<template>
  <main class="w-full p-4 space-y-6 relative bg-white dark:bg-[#0B1A2F] text-black dark:text-white">
    <!-- Заголовок -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">{{ $t('admin.profitReport.title') }}</h1>
    </div>

    <!-- Дати + кнопки в ряд -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <!-- Дата -->
      <div class="flex gap-4 items-center">
        <VueDatePicker
          v-model="startDate"
          :placeholder="$t('admin.profitReport.dateFrom')"
          :locale="locale"
          teleport
        />

        <!-- Кінцева дата -->
        <VueDatePicker
          v-model="endDate"
          :placeholder="$t('admin.profitReport.dateTo')"
          :locale="locale"
          teleport
        />

        <button
          @click="fetchIncomeReport()"
          class="px-5 py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >
          {{ $t('admin.profitReport.apply') }}
        </button>

        <button
          v-if="startDate || endDate"
          @click="resetDates"
          class="px-5 py-2 bg-gray-200 dark:bg-[#1E2B45] text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-[#2C3E66] transition"
        >
          {{ $t('admin.profitReport.reset') }}
        </button>
      </div>

      <!-- Кнопки експорту -->
      <div class="flex gap-3">
        <button
          @click="printReport"
          class="px-4 py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >
          {{ $t('admin.profitReport.print') }}
        </button>
        <button
          @click="exportToExcel"
          class="px-4 py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >
          {{ $t('admin.profitReport.excel') }}
        </button>
        <button
          @click="exportToPDF"
          class="px-4 py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >
          {{ $t('admin.profitReport.pdf') }}
        </button>
      </div>
    </div>

    <!-- Таблиця -->
    <div
      v-if="filteredData.length"
      ref="printableArea"
      class="overflow-x-auto bg-white dark:bg-[#132544] shadow-sm rounded-lg border border-gray-200 dark:border-[#1F3B64]"
    >
      <table class="min-w-full table-auto text-sm">
        <thead class="bg-gray-100 dark:bg-[#1B335C] text-left">
          <tr>
            <th class="px-4 py-3 text-gray-700 dark:text-gray-300">
              {{ $t('admin.profitReport.table.id') }}
            </th>
            <th class="px-4 py-3 text-gray-700 dark:text-gray-300">
              {{ $t('admin.profitReport.table.date') }}
            </th>
            <th class="px-4 py-3 text-gray-700 dark:text-gray-300">
              {{ $t('admin.profitReport.table.revenue') }}
            </th>
            <th class="px-4 py-3 text-gray-700 dark:text-gray-300">
              {{ $t('admin.profitReport.table.transactions') }}
            </th>
            <th class="px-4 py-3 text-gray-700 dark:text-gray-300">
              {{ $t('admin.profitReport.table.expenses') }}
            </th>
            <th class="px-4 py-3 text-gray-700 dark:text-gray-300">
              {{ $t('admin.profitReport.table.netIncome') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filteredData"
            :key="row.id"
            class="hover:bg-gray-50 dark:hover:bg-[#1C2F51] transition-all"
          >
            <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-[#2A4C79] text-sm text-gray-800 dark:text-gray-200">
              {{ row.id }}
            </td>
            <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-[#2A4C79] text-sm text-gray-800 dark:text-gray-200">
              {{ row.date }}
            </td>
            <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-[#2A4C79] text-sm text-gray-800 dark:text-gray-200">
              {{ formatCurrencyIntl(row.total_amount, currency) }}
            </td>
            <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-[#2A4C79] text-sm text-gray-800 dark:text-gray-200">
              {{ row.transaction_number || '—' }}
            </td>
            <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-[#2A4C79] text-sm text-gray-800 dark:text-gray-200">
              {{ formatCurrencyIntl(row.expenses, currency) }}
            </td>
            <td
              class="px-4 py-2 border-b border-[#E0E0E0] dark:border-[#2A4C79] text-sm font-semibold"
              :class="{
                'text-green-700 dark:text-green-400': row.net_income > 0,
                'text-red-600 dark:text-red-400': row.net_income < 0
              }"
            >
              {{ formatCurrencyIntl(row.net_income, currency) }}
            </td>
          </tr>
        </tbody>
      </table>
      <div ref="printAreaCloned" class="hidden fixed top-0 left-0 z-[-1]"></div>
    </div>

    <!-- Сума -->
    <div
      v-if="summary"
      class="bg-gray-50 dark:bg-[#1A2F4D] p-4 rounded-md border border-gray-200 dark:border-[#2F4F7A] space-y-1"
    >
      <p>
        <strong>{{ $t('admin.profitReport.summary.totalRevenue') }}:</strong>
        {{ formatCurrencyIntl(summary.total_income, currency) }}
      </p>
      <p>
        <strong>{{ $t('admin.profitReport.summary.totalExpenses') }}:</strong>
        {{ formatCurrencyIntl(summary.total_expenses, currency) }}
      </p>
      <p>
        <strong>{{ $t('admin.profitReport.summary.totalNetIncome') }}:</strong>
        {{ formatCurrencyIntl(summary.total_net_income, currency) }}
      </p>
    </div>

    <!-- Порожній стан -->
    <div
      v-else
      class="py-12 text-center text-gray-500 dark:text-gray-400 border border-dashed dark:border-gray-600 rounded-md"
    >
      <p>{{ $t('admin.profitReport.noData') }}</p>
    </div>
  </main>
</template>


<script>
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { uk } from 'date-fns/locale';
import api from '@/services/api';

export default {
  name: "ProfitReport",
  components: {
    VueDatePicker,
  },
  data() {
    return {
      incomeData: [],
      summary: null,
      startDate: null,
      endDate: null,
      searchQuery: "",
      locale: uk,
      // Зчитуємо валюту: 'usd' або 'uah' (грн) з localStorage або за замовчуванням 'uah'
      currency: (localStorage.getItem("currency") || "uah").toLowerCase(),
    };
  },
  computed: {
    filteredData() {
      if (!this.searchQuery) return this.incomeData;
      const q = this.searchQuery.toLowerCase();
      return this.incomeData.filter((r) =>
        r.id.toString().includes(q) ||
        r.date.toLowerCase().includes(q) ||
        r.revenue.toString().includes(q) ||
        (r.transaction_number || "").toString().includes(q) ||
        r.expenses.toString().includes(q) ||
        r.net_income.toString().includes(q)
      );
    }
  },
  mounted() {
    this.fetchIncomeReport("month");
    // Слідкуємо за зміною localStorage валюты, якщо інша частина застосунку змінює currency:
    window.addEventListener('storage', this.onStorageChange);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.onStorageChange);
  },
  methods: {
    onStorageChange(e) {
      if (e.key === 'currency') {
        this.currency = (e.newValue || "uah").toLowerCase();
      }
    },
    formatDate(date) {
      if (!date || isNaN(new Date(date))) return null;
      const d = new Date(date);
      return d.toISOString().split("T")[0];
    },
    // Форматування валюти за Intl API
    formatCurrencyIntl(price, currency) {
      const locale = currency === 'usd' ? 'en-US' : 'uk-UA';
      const currCode = currency.toUpperCase() === 'USD' ? 'USD' : 'UAH';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currCode
      }).format(Number(price));
    },
      async fetchIncomeReport(period = null) {
      try {
        const params = period
          ? { period }
          : {
              start_date: this.formatDate(this.startDate),
              end_date: this.formatDate(this.endDate),
            };

        console.log("▶ startDate", this.startDate);
        console.log("▶ endDate", this.endDate);
        console.log("▶ formatted", this.formatDate(this.startDate), this.formatDate(this.endDate));

        // Використовуємо api із services/api. Переконайтеся, що в services/api додано метод getAdminStatsIncome.
        const res = await api.getAdminStatsIncome(params);
        // Якщо API повертає { data: [...], summary: {...}, currency, ... }
        this.incomeData = res.data || [];
        this.summary = res.summary || null;
        // За потреби збережіть валюту: this.currency = res.currency || this.currency
      } catch (err) {
        console.error("❌ Помилка отримання звіту:", err);
      }
    },
    printReport() {
      const el = this.$refs.printableArea;
      if (!el) return;
      const win = window.open("", "", "width=800,height=600");
      win.document.write(`<html><head><title>Звіт по Прибутку</title></head><body>${el.outerHTML}</body></html>`);
      win.document.close();
      win.focus();
      win.print();
      win.close();
    },
    resetDates() {
      this.startDate = null;
      this.endDate = null;
      this.fetchIncomeReport("month");
    },
    exportToExcel() {
      const data = this.filteredData.map(r => ({
        ID: r.id,
        Дата: r.date,
        Виторг: r.revenue,
        Транзакції: r.transaction_number,
        Витрати: r.expenses,
        Прибуток: r.net_income,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, 'profit_report.xlsx');
    },
    exportToPDF() {
      const original = this.$refs.printableArea;
      const cloneTarget = this.$refs.printAreaCloned;
      if (!original || !cloneTarget) return;

      const cloned = original.cloneNode(true);

      cloned.style.backgroundColor = "#ffffff";
      cloned.style.color = "#000000";
      cloned.style.fontFamily = "sans-serif";

      cloneTarget.innerHTML = "";
      cloneTarget.appendChild(cloned);
      cloneTarget.style.display = "block";

      html2canvas(cloned, { scale: 2 }).then(canvas => {
        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");
        const w = pdf.internal.pageSize.getWidth();
        const h = (canvas.height * w) / canvas.width;
        pdf.addImage(img, "PNG", 0, 0, w, h);
        pdf.save("profit_report.pdf");

        cloneTarget.style.display = "none";
      });
    }
  }
}
</script>


<style scoped>
/* Опціонально: можна додати стилі для ширини колонок таблиці */
</style>
