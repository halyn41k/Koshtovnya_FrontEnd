<template>
  <main class="profit-report">
    <header class="report-header">
      <h1 class="report-title">Звіти</h1>
      <h2 class="report-subtitle">Звіт по прибутку</h2>
    </header>

    <section class="report-controls">
      <div class="date-range-picker">
        <label for="start-date" class="date-label">Період:</label>
        <div class="date-input">
          <input type="date" id="start-date" class="date-field" aria-label="Start date" />
        </div>
        <span class="date-separator">до</span>
        <div class="date-input">
          <input type="date" id="end-date" class="date-field" aria-label="End date" />
        </div>
      </div>
      <div class="filter">
        <span class="filter-text">Фільтр</span>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/4b09284ab367fa70a05a4a4f59e91721443ad7e8e783dfd2c26fb681ebacd30f?apiKey=c3e46d0a629546c7a48302a5db3297d5"
          alt="Filter icon" class="filter-icon" />
      </div>
    </section>

    <div class="report-table-container">
      <table class="profit-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Номер Транзакції</th>
            <th>Джерело прибутку</th>
            <th>Сума прибутку</th>
            <th>Витрати</th>
            <th>Чистий прибуток</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td>{{ row.date }}</td>
            <td>{{ row.transactionNumber }}</td>
            <td>{{ row.source }}</td>
            <td>{{ row.income }}</td>
            <td>{{ row.expenses }}</td>
            <td>{{ row.netProfit }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="report-summary">
      <p class="summary-item">Загальний Прибуток: 15,000 грн</p>
      <p class="summary-item">Загальні Витрати: 2,000 грн</p>
      <p class="summary-item">Чистий Прибуток: 12,000 грн</p>
    </div>

    <div class="report-actions">
      <button class="action-button" @click="printReport">Друк</button>
      <button class="action-button" @click="exportToExcel">Експорт в Excel</button>
      <button class="action-button" @click="exportToPDF">Експорт в PDF</button>
    </div>

    <section class="materials-report">
      <h3 class="report-title">Матеріали</h3>
      <table class="materials-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип Матеріалу</th>
            <th>Кількість</th>
            <th>Сума (грн)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in materialsData" :key="index">
            <td>{{ item.date }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.amount }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="expenses-report">
      <h3 class="report-title">Операційні Витрати</h3>
      <table class="expenses-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип Витрати</th>
            <th>Опис</th>
            <th>Сума (грн)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(expense, index) in expensesData" :key="index">
            <td>{{ expense.date }}</td>
            <td>{{ expense.type }}</td>
            <td>{{ expense.description }}</td>
            <td>{{ expense.amount }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="personnel-expenses-report">
      <h3 class="report-title">Витрати на Персонал</h3>
      <table class="personnel-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип Витрати</th>
            <th>Опис</th>
            <th>Сума (грн)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(personnelExpense, index) in personnelExpensesData" :key="index">
            <td>{{ personnelExpense.date }}</td>
            <td>{{ personnelExpense.type }}</td>
            <td>{{ personnelExpense.description }}</td>
            <td>{{ personnelExpense.amount }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<script>
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export default {
  name: 'ProfitReportView',
  data() {
    return {
      tableData: [
        { date: '01.11.2023', transactionNumber: 'TRX12345', source: 'Продаж товару', income: '10,000 грн', expenses: '2,000 грн', netProfit: '8,000 грн' }
      ],
      materialsData: [
        { date: '01.11.2023', type: 'Японський бісер', quantity: '100 грам', amount: '3,000 грн' },
        { date: '02.11.2023', type: 'Чеський бісер', quantity: '200 грам', amount: '2,500 грн' },
        { date: '03.11.2023', type: 'Застібки', quantity: '50 штук', amount: '1,000 грн' }
      ],
      expensesData: [
        { date: '01.11.2023', type: 'Упаковка', description: 'Коробки та пакети', amount: '500 грн' },
        { date: '02.11.2023', type: 'Доставка', description: 'Пересилання замовлень', amount: '1,000 грн' },
        { date: '03.11.2023', type: 'Інструменти', description: 'Нитки та голки', amount: '200 грн' }
      ],
      personnelExpensesData: [
        { date: '01.11.2023', type: 'Зарплата', description: 'Зарплата майстра', amount: '10,000 грн' },
        { date: '01.11.2023', type: 'Бонус', description: 'Бонус за виконання плану', amount: '2,000 грн' },
        { date: '02.11.2023', type: 'Навчання', description: 'Курс підвищення кваліфікації', amount: '500 грн' }
      ]
    };
  },
  methods: {
    printReport() {
      window.print();
    },
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.tableData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Звіт по прибутку');
      XLSX.writeFile(wb, 'profit_report.xlsx');
    },
    exportToPDF() {
      const doc = new jsPDF();
      doc.text('Звіт по прибутку', 20, 20);
      doc.save('profit_report.pdf');
    }
  }
};
</script>

<style scoped>
.profit-report {
  font-family: Montserrat, sans-serif;
  margin: 20px;
  font-size: 18px;
}

.report-header {
  margin-bottom: 20px;
}

.report-title {
  font-size: 32px;
  font-weight: 700;
}

.report-subtitle {
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  margin-top: 55px;
}

.report-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 17px;
}

.date-label {
  font-size: 20px;
}

.date-input {
  background-color: #fff;

  padding: 2px 3px;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 13px;
}

.report-content {
  display: flex;
  gap: 26px;
  flex-wrap: wrap;
}



.profit-table {
  width: 100%;
  border-collapse: collapse;
}

.profit-table th,
.profit-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #dcdcdc;
}

.summary-item {
  font-size: 20px;
  margin: 10px 0;
}

.report-actions {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.action-button {
  font-family: Montserrat, sans-serif;
  padding: 10px 20px;
  background-color: #6B1F1F;
  color: #fff;
  border: none;
  font-size: 18px;
  cursor: pointer;
  border-radius: 5px;
}

.materials-table,
.expenses-table,
.personnel-table {
  width: 100%;
  border-collapse: collapse;
}

.materials-table th,
.expenses-table th,
.personnel-table th,
.materials-table td,
.expenses-table td,
.personnel-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #dcdcdc;
}

.report-title {
  margin-bottom: 20px;
}

.report-summary {
  align-items: flex-end;
}
</style>
