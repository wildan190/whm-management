<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Cycle Counting (Stok Opname)" />
    
    <div class="space-y-6">
      <ComponentCard title="Sistem Verifikasi Fisik">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">Terakhir counting: {{ lastUpdate || 'Belum pernah' }}</span>
          </div>
        </template>
        
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
              <tr class="bg-gray-100 dark:bg-gray-800">
                <th class="px-5 py-3 text-left font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider">Grup Barang & SKU Fisik</th>
                <th class="px-5 py-3 text-center font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider w-32">Stok Sistem</th>
                <th class="px-5 py-3 text-center font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider w-40">Verifikasi Fisik</th>
                <th class="px-5 py-3 text-center font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider w-32">Status Opname</th>
                <th class="px-4 py-3 text-right font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider w-32">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <template v-for="(group, groupName) in groupedStocks" :key="groupName">
                <!-- Group Header -->
                <tr class="bg-brand-50/50 dark:bg-brand-900/20 border-b border-brand-100 dark:border-brand-900/30">
                  <td colspan="5" class="px-5 py-3 font-bold text-brand-700 dark:text-brand-400">
                    📦 Produk Induk: <span class="uppercase tracking-wide">{{ groupName }}</span> <span class="text-xs text-brand-600/70 dark:text-brand-300 ml-2 font-normal">(Total Target verifikasi: {{ group.length }} Unit)</span>
                  </td>
                </tr>
                <!-- SKUs under this Group -->
                <tr v-for="stock in group" :key="stock._id" class="hover:bg-gray-50/40 dark:hover:bg-gray-800/30 transition-colors">
                  <td class="px-5 py-4 pl-10 border-l-4 border-brand-100/50 dark:border-brand-900/30">
                    <div class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                       <span class="text-lg">🏷️</span> {{ stock.item?.sku }}
                    </div>
                    <div class="text-xs text-gray-500 ml-7 mt-1 font-medium">Rak Penempatan: <span class="text-gray-800 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{{ stock.location?.name }}</span></div>
                  </td>
                  <td class="px-5 py-4 text-center text-sm font-bold text-gray-600 dark:text-gray-300">
                    {{ stock.quantity }}
                  </td>
                  <td class="px-5 py-4 text-center">
                    <select v-model.number="adjustments[stock._id]" class="w-full max-w-[130px] p-2 text-sm rounded-xl border border-gray-200 bg-white dark:bg-dark-900 dark:border-gray-700 font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none">
                      <option :value="1">✅ Ditemukan</option>
                      <option :value="0">❌ Hilang</option>
                    </select>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span v-if="adjustments[stock._id] !== undefined" :class="[getColor(adjustments[stock._id] - stock.quantity), adjustments[stock._id] - stock.quantity < 0 ? 'bg-error-50' : 'bg-gray-50 dark:bg-gray-800']" class="font-bold text-xs uppercase tracking-wide inline-flex px-2 py-1 rounded-md">
                      {{ (adjustments[stock._id] - stock.quantity) < 0 ? 'Hilang/Minus' : 'Klop (Sesuai)' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <button @click="saveCount(stock)" :disabled="adjustments[stock._id] === undefined || adjustments[stock._id] === stock.quantity" class="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl disabled:opacity-40 disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all hover:bg-brand-600 hover:shadow-lg shadow-brand-500/30">
                      Simpan
                    </button>
                  </td>
                </tr>
              </template>
              <tr v-if="stocks.length === 0">
                <td colspan="5" class="px-5 py-8 text-center text-gray-500 italic">Belum ada barang di inventaris. Lakukan proses Inbound terlebih dahulu.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import ComponentCard from '@/components/common/ComponentCard.vue';
import api from '@/services/api';
import Swal from 'sweetalert2';

const stocks = ref<any[]>([]);
const adjustments = ref<Record<string, number>>({});
const lastUpdate = ref('');

const groupedStocks = computed(() => {
  const groups: Record<string, any[]> = {};
  stocks.value.forEach(s => {
    const groupName = s.item?.name || 'Merek/Produk Tidak Dikenal';
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(s);
  });
  return groups;
});

const fetchStocks = async () => {
  const res = await api.get('/inventory/stock');
  stocks.value = res.data;
  // Initialize adjustments with current quantity
  stocks.value.forEach(s => {
    adjustments.value[s._id] = s.quantity;
  });
};

const getColor = (diff: number) => {
  if (diff === 0) return 'text-gray-400';
  return diff > 0 ? 'text-success-500' : 'text-error-500';
};

const saveCount = async (stock: any) => {
  const qty = adjustments.value[stock._id];
  if (qty === undefined) return;
  
  try {
    await api.post(`/inventory/stock/${stock._id}/cycle-count`, { physicalQuantity: qty });
    
    // Jika opname hilng dikonfirmasi (fisik = 0), tandai sebagai DEMAGED/HILANG agar otomatis dieksklusi dari Outbound.
    if (qty === 0) {
       await api.patch(`/inventory/stock/${stock._id}/status`, { status: 'DAMAGED' });
    }

    Swal.fire('Berhasil', 'Stok fisik berhasil diperbarui dan diselaraskan!', 'success');
    fetchStocks();
  } catch (err) {
    Swal.fire('Gagal', 'Gagal memperbarui stok: ' + (err as Error).message, 'error');
  }
};

onMounted(fetchStocks);
</script>
