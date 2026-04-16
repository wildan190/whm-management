<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <!-- Metrics Overview -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 pb-6">
      <div v-for="metric in metrics" :key="metric.title" class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ metric.title }}</p>
            <h4 class="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{{ metric.value }}</h4>
          </div>
          <div :class="metric.color" class="flex h-12 w-12 items-center justify-center rounded-xl bg-opacity-10">
            <component :is="metric.icon" class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Recent Transactions Table -->
      <ComponentCard title="Aktivitas Gudang Terbaru">
        <div class="overflow-hidden">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-4 py-3 text-left text-theme-xs font-medium text-gray-500">Tipe</th>
                <th class="px-4 py-3 text-left text-theme-xs font-medium text-gray-500">Tanggal</th>
                <th class="px-4 py-3 text-left text-theme-xs font-medium text-gray-500">User</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="tx in transactions.slice(0, 10)" :key="tx._id">
                <td class="px-4 py-3 text-theme-sm">
                  <span :class="tx.type === 'INBOUND' ? 'text-success-500' : 'text-error-500'" class="font-bold">
                    {{ tx.type === 'INBOUND' ? 'MASUK' : 'KELUAR' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-theme-sm text-gray-500">{{ new Date(tx.createdAt).toLocaleDateString() }}</td>
                <td class="px-4 py-3 text-theme-sm text-gray-800 dark:text-white">{{ tx.user?.username }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentCard>

      <!-- Low Stock Alert -->
      <ComponentCard title="Peringatan Stok Rendah">
        <div class="space-y-4">
          <div v-for="stock in lowStock" :key="stock._id" class="flex items-center justify-between p-3 rounded-lg bg-error-50 dark:bg-error-500/5 border border-error-100 dark:border-error-500/20">
            <div>
              <p class="text-sm font-bold text-error-700 dark:text-error-400">{{ stock.item?.name }}</p>
              <p class="text-xs text-error-600 dark:text-error-500/70">Lokasi: {{ stock.location?.name }}</p>
            </div>
            <div class="text-error-700 font-bold">tersisa {{ stock.quantity }}</div>
          </div>
          <p v-if="lowStock.length === 0" class="text-center text-gray-500 text-sm py-4 italic">Semua level stok sehat.</p>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import api from "@/services/api";
import { BoxIcon, BoxCubeIcon, UserGroupIcon, PieChartIcon } from "../../icons";

const currentPageTitle = ref("Dashboard WMS");
const transactions = ref<any[]>([]);
const stocks = ref<any[]>([]);
const allUsers = ref<any[]>([]);

const fetchDashboardData = async () => {
  try {
    const [txRes, stockRes, userRes] = await Promise.all([
      api.get('/transactions'),
      api.get('/inventory/stock'),
      api.get('/users').catch(() => ({ data: [] })) // In case not admin
    ]);
    transactions.value = txRes.data;
    stocks.value = stockRes.data;
    allUsers.value = userRes.data;
  } catch (err) {
    console.error(err);
  }
};

const lowStock = computed(() => stocks.value.filter(s => s.quantity < 5));

const metrics = computed(() => [
  { title: 'Total Barang', value: stocks.value.reduce((acc, s) => acc + s.quantity, 0), icon: BoxIcon, color: 'text-brand-500 bg-brand-500' },
  { title: 'Masuk Hari Ini', value: transactions.value.filter(t => t.type === 'INBOUND' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length, icon: BoxCubeIcon, color: 'text-success-500 bg-success-500' },
  { title: 'Keluar Hari Ini', value: transactions.value.filter(t => t.type === 'OUTBOUND' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length, icon: PieChartIcon, color: 'text-error-500 bg-error-500' },
  { title: 'User Aktif', value: allUsers.value.length || 'N/A', icon: UserGroupIcon, color: 'text-warning-500 bg-warning-500' },
]);

onMounted(fetchDashboardData);
</script>
