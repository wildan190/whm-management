<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Manajemen Pengembalian (Retur)" />
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Form Input Retur -->
      <div class="md:col-span-1">
        <ComponentCard title="Input Barang Retur">
          <form @submit.prevent="submitReturn" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Referensi Order</label>
              <input v-model="newReturn.orderReference" required class="w-full p-2.5 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" placeholder="Contoh: ORD-12345" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Nama Customer</label>
              <input v-model="newReturn.customerName" class="w-full p-2.5 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
            </div>
            
            <div class="pt-4 border-t dark:border-gray-800">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">Scan Barang Yang Dikembalikan</label>
               <QRScanner :onScanSuccess="handleScanReturn" />
            </div>

            <div class="pt-4 border-t dark:border-gray-800">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-bold text-gray-800 dark:text-white">Daftar Barang Scan ({{ newReturn.items.length }})</span>
              </div>
              <div v-for="(item, idx) in newReturn.items" :key="idx" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2 relative group border border-transparent hover:border-error-200 transition-colors">
                <button type="button" @click="newReturn.items.splice(idx, 1)" class="absolute top-2 right-2 text-gray-400 hover:text-error-500 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                <div class="space-y-2">
                  <div class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                     <span class="text-lg">🏷️</span> {{ item.sku }}
                  </div>
                  <div>
                    <select v-model="item.condition" class="w-full p-2 text-xs rounded-lg border border-gray-200 bg-white dark:bg-dark-900 dark:border-gray-700 dark:text-white focus:ring focus:ring-brand-500/20">
                      <option value="GOOD">Kondisi Bagus (Bisa Restock)</option>
                      <option value="DAMAGED">Kondisi Rusak (Karantina/Buang)</option>
                      <option value="REFURBISH">Perlu Perbaikan</option>
                    </select>
                  </div>
                </div>
              </div>
              <div v-if="newReturn.items.length === 0" class="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <p class="text-xs text-gray-400 italic">Belum ada barang di-scan.</p>
              </div>
            </div>

            <button type="submit" :disabled="loading" class="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors">
              {{ loading ? 'Memproses...' : 'Catat Pengembalian' }}
            </button>
          </form>
        </ComponentCard>
      </div>

      <!-- Daftar Retur -->
      <div class="md:col-span-2">
        <ComponentCard title="Riwayat & Status Retur">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th class="px-4 py-3 text-left font-medium text-gray-500">Ref / Customer</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500">Barang</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th class="px-4 py-3 text-right font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="ret in returns" :key="ret._id">
                  <td class="px-4 py-4">
                    <div class="font-bold text-gray-800 dark:text-white">{{ ret.orderReference }}</div>
                    <div class="text-xs text-gray-400">{{ ret.customerName }}</div>
                  </td>
                  <td class="px-4 py-4">
                    <div v-for="it in ret.items" :key="it._id" class="text-xs font-bold bg-gray-100 dark:bg-gray-800 inline-block px-2 py-1 rounded mr-1 mb-1">
                      {{ it.item?.sku }} ({{ it.condition }})
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span :class="{
                      'bg-blue-50 text-blue-700': ret.status === 'RECEIVED',
                      'bg-success-50 text-success-700': ret.status === 'RESTOCKED',
                      'bg-error-50 text-error-700': ret.status === 'REJECTED'
                    }" class="px-2 py-0.5 rounded-full text-xs font-medium">
                      {{ ret.status }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-right">
                    <button v-if="ret.status === 'RECEIVED'" @click="openRestockModal(ret)" class="text-xs text-brand-500 font-bold hover:underline">Restock</button>
                  </td>
                </tr>
                <tr v-if="returns.length === 0">
                  <td colspan="4" class="px-4 py-10 text-center text-gray-400 italic">Belum ada data pengembalian.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </div>

    <!-- Restock Modal -->
    <div v-if="selectedReturn" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Kembalikan ke Stok</h3>
        <p class="text-sm text-gray-500 mb-6">Pilih lokasi penyimpanan untuk menaruh barang yang akan di-restock (hanya barang kondisi "Bagus").</p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Lokasi Rak</label>
            <select v-model="restockLocation" class="w-full p-3 rounded-lg border dark:bg-dark-900 dark:border-gray-700">
              <option v-for="loc in locations" :key="loc._id" :value="loc.name">{{ loc.name }}</option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button @click="selectedReturn = null" class="flex-1 py-3 bg-gray-100 dark:bg-gray-800 font-bold rounded-xl">Batal</button>
            <button @click="processRestock" class="flex-1 py-3 bg-success-500 text-white font-bold rounded-xl">Konfirmasi</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import ComponentCard from '@/components/common/ComponentCard.vue';
import QRScanner from '@/components/common/QRScanner.vue';
import api from '@/services/api';
import Swal from 'sweetalert2';

const returns = ref<any[]>([]);
const locations = ref<any[]>([]);
const loading = ref(false);
const selectedReturn = ref<any>(null);
const restockLocation = ref('');

const newReturn = ref({
  orderReference: '',
  customerName: '',
  items: [] as any[]
});

const fetchReturns = async () => {
  const [retRes, locRes] = await Promise.all([
    api.get('/returns'),
    api.get('/inventory/locations')
  ]);
  returns.value = retRes.data;
  locations.value = locRes.data;
};

const handleScanReturn = (scannedSku: string) => {
  const existing = newReturn.value.items.find((i: any) => i.sku === scannedSku);
  if (existing) {
    Swal.fire('Perhatian', 'SKU ini sudah ada di dalam daftar retur!', 'warning');
  } else {
    newReturn.value.items.push({ sku: scannedSku, quantity: 1, condition: 'GOOD' });
  }
};

const submitReturn = async () => {
  loading.value = true;
  try {
    // Process SKU to match items
    const itemsWithId = await Promise.all(newReturn.value.items.map(async (row) => {
      const itemRes = await api.get('/inventory/items');
      const found = itemRes.data.find((i: any) => i.sku === row.sku);
      if (!found) throw new Error(`SKU ${row.sku} tidak ditemukan`);
      return { ...row, item: found._id };
    }));

    await api.post('/returns', { ...newReturn.value, items: itemsWithId });
    Swal.fire('Berhasil', 'Retur berhasil dicatat!', 'success');
    newReturn.value = { orderReference: '', customerName: '', items: [] };
    fetchReturns();
  } catch (err: any) {
    Swal.fire('Gagal', err.message || 'Gagal menyimpan retur', 'error');
  } finally {
    loading.value = false;
  }
};

const openRestockModal = (ret: any) => {
  selectedReturn.value = ret;
};

const processRestock = async () => {
  try {
    await api.patch(`/returns/${selectedReturn.value._id}/restock`, { locationName: restockLocation.value });
    Swal.fire('Berhasil', 'Barang berhasil dikembalikan ke stok!', 'success');
    selectedReturn.value = null;
    fetchReturns();
  } catch (err) {
    Swal.fire('Gagal', 'Gagal melakukan restocking', 'error');
  }
};

onMounted(fetchReturns);
</script>
