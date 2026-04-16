<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="metric in metrics" :key="metric.title" class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ metric.title }}</p>
              <h4 class="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{{ metric.value }}</h4>
            </div>
            <div :class="metric.color" class="flex h-12 w-12 items-center justify-center rounded-xl bg-opacity-10">
              <component :is="metric.icon" class="h-6 w-6"></component>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Transaction Trends -->
        <ComponentCard title="Tren Barang Masuk vs Keluar">
          <div id="trendChart">
            <VueApexCharts type="line" height="300" :options="trendOptions" :series="trendSeries"></VueApexCharts>
          </div>
        </ComponentCard>

        <!-- Stock Status Distribution -->
        <ComponentCard title="Kesehatan Inventaris">
          <div id="donutChart" class="flex justify-center">
            <VueApexCharts type="donut" height="300" :options="donutOptions" :series="donutSeries"></VueApexCharts>
          </div>
        </ComponentCard>
      </div>

      <!-- Labor Productivity -->
      <ComponentCard title="Produktivitas Tenaga Kerja (KPI)">
        <div class="space-y-6">
          <div id="laborChart">
            <VueApexCharts type="bar" height="300" :options="laborOptions" :series="laborSeries"></VueApexCharts>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="px-4 py-2 text-left text-gray-500">Staf</th>
                  <th class="px-4 py-2 text-left text-gray-500">Selesai</th>
                  <th class="px-4 py-2 text-right text-gray-500">Unit/Jam</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in laborData" :key="user._id" class="border-b border-gray-50 dark:border-gray-800">
                  <td class="px-4 py-2 font-medium">{{ user.username }}</td>
                  <td class="px-4 py-2 text-gray-500">{{ user.transactionCount }} trx</td>
                  <td class="px-4 py-2 text-right font-bold text-brand-500">{{ user.itemsPerHour.toFixed(1) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import api from "@/services/api";
import { BoxIcon, SuccessIcon, WarningIcon, BarChartIcon } from "../../icons";

const currentPageTitle = ref("Laporan & Analisis Kinerja");
const transactions = ref<any[]>([]);
const stocks = ref<any[]>([]);
const laborData = ref<any[]>([]);

const fetchReportData = async () => {
  try {
    const [txRes, stockRes, laborRes] = await Promise.all([
      api.get('/transactions'),
      api.get('/inventory/stock'),
      api.get('/analytics/labor-productivity')
    ]);
    transactions.value = txRes.data;
    stocks.value = stockRes.data;
    laborData.value = laborRes.data;
  } catch (err) {
    console.error('Error fetching reports:', err);
  }
};

const productSummaries = computed(() => {
  const groups: Record<string, number> = {};
  stocks.value.forEach(s => {
    const name = s.item?.name || 'Unknown';
    groups[name] = (groups[name] || 0) + (s.quantity || 1);
  });
  return Object.values(groups);
});

const metrics = computed(() => {
  const summaries = productSummaries.value;
  return [
    { title: 'Kategori Aman (>10)', value: summaries.filter(q => q > 10).length, icon: SuccessIcon, color: 'text-success-500 bg-success-500' },
    { title: 'Kategori Rendah (≤10)', value: summaries.filter(q => q <= 10 && q > 0).length, icon: WarningIcon, color: 'text-warning-500 bg-warning-500' },
    { title: 'Total Jenis/Kategori', value: summaries.length, icon: BoxIcon, color: 'text-brand-500 bg-brand-500' },
    { title: 'Total Fisik SKU', value: stocks.value.length, icon: BoxIcon, color: 'text-gray-500 bg-gray-500' },
  ];
});

const trendSeries = computed(() => {
  return [
    { name: 'Inbound', data: [31, 40, 28, 51, 42, 109] },
    { name: 'Outbound', data: [11, 32, 45, 32, 34, 52] }
  ];
});

const trendOptions = ref<any>({
  colors: ['#465fff', '#ef4444'],
  chart: { fontFamily: 'Outfit, sans-serif', toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'] },
});

const donutSeries = computed(() => {
  const summaries = productSummaries.value;
  return [
    summaries.filter(q => q > 10).length,
    summaries.filter(q => q <= 10).length
  ];
});

const donutOptions = ref<any>({
  labels: ['Stok Sehat', 'Stok Rendah'],
  colors: ['#10b981', '#f59e0b'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: false }
});

const laborSeries = computed(() => [{
  name: 'Unit per Jam',
  data: laborData.value.map(d => d.itemsPerHour)
}]);

const laborOptions = computed(() => ({
  colors: ['#465fff'],
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { columnWidth: '40%', borderRadius: 6 } },
  xaxis: { categories: laborData.value.map(d => d.username) }
}));

onMounted(fetchReportData);
</script>
