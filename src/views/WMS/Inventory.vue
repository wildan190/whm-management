<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90">Level Stok</h2>
        <div class="space-x-2">
          <button @click="showAddItem = true" class="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600">Tambah Barang</button>
          <button @click="showAddLocation = true" class="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white rounded-lg text-sm hover:bg-gray-300">Tambah Lokasi</button>
        </div>
      </div>

      <!-- Product Summary Table -->
      <ComponentCard title="Ringkasan Ketersediaan per Kategori / Produk">
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th class="px-5 py-3 text-left font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider">Nama Produk</th>
                  <th class="px-5 py-3 text-left font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider">Kategori</th>
                  <th class="px-5 py-3 text-center font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider">Tersedia (Ready)</th>
                  <th class="px-5 py-3 text-center font-bold text-gray-800 text-theme-xs dark:text-gray-200 uppercase tracking-wider">Karantina / Rusak</th>
                  <th class="px-5 py-3 text-right font-bold text-brand-600 text-theme-xs dark:text-brand-400 uppercase tracking-wider bg-brand-50/50 dark:bg-brand-900/10">Total Fisik (SKU)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(summary, idx) in productSummary" :key="idx" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td class="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 font-bold">{{ summary.name }}</td>
                  <td class="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{{ summary.category || '-' }}</td>
                  <td class="px-5 py-4 text-theme-sm text-center">
                    <span v-if="summary.available > 0" class="inline-flex bg-success-50 text-success-700 px-3 py-1 rounded-md font-bold text-xs">{{ summary.available }}</span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-5 py-4 text-theme-sm text-center">
                    <span v-if="(summary.quarantine + summary.damaged) > 0" class="inline-flex bg-warning-50 text-warning-700 px-3 py-1 rounded-md font-bold text-xs">{{ summary.quarantine + summary.damaged }}</span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                  <td class="px-5 py-4 text-theme-sm text-right bg-brand-50/20 dark:bg-brand-900/5 font-bold text-gray-800 dark:text-white/90 border-l border-brand-100 dark:border-brand-900/30">
                    {{ summary.total }} Unit
                  </td>
                </tr>
                <tr v-if="productSummary.length === 0">
                  <td colspan="5" class="px-5 py-8 text-center text-gray-500 italic">Belum ada kelompok data barang.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>
      
      <div class="pt-4 border-t dark:border-gray-800">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white/90 mb-1">Daftar Identitas Fisik SKU</h3>
        <p class="text-sm text-gray-500 mb-4">Cari, kelola spesifikasi, karantina, dan lacak jejak setiap entitas SKu di gudang Anda melalui tabel satuan di bawah ini.</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-4 mt-2">
        <div class="flex-1">
          <input v-model="searchQuery" placeholder="Cari Nama Barang atau SKU..." class="w-full p-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white" />
        </div>
        <div class="w-full sm:w-48">
          <select v-model="statusFilter" class="w-full p-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
            <option value="ALL">Semua Status</option>
            <option value="AVAILABLE">Tersedia</option>
            <option value="QUARANTINE">Masa Karantina</option>
          </select>
        </div>
      </div>

      <!-- Items Table -->
      <ComponentCard title="Inventaris Gudang">
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">SKU</th>
                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nama Barang</th>
                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">Lokasi</th>
                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">Batch / Kadaluwarsa</th>

                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</th>
                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="stock in filteredStocks" :key="stock._id">
                  <td class="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">{{ stock.item?.sku }}</td>
                  <td class="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">{{ stock.item?.name }}</td>
                  <td class="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">{{ stock.location?.name }}</td>
                  <td class="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                    <div class="font-medium">{{ stock.batchNumber || '-' }}</div>
                    <div class="text-xs text-gray-400">{{ stock.expiryDate ? new Date(stock.expiryDate).toLocaleDateString() : 'N/A' }}</div>
                  </td>

                  <td class="px-5 py-4 text-theme-sm">
                    <span :class="{
                      'bg-success-50 text-success-700': stock.status === 'AVAILABLE',
                      'bg-warning-50 text-warning-700': stock.status === 'QUARANTINE',
                      'bg-error-50 text-error-700': stock.status === 'DAMAGED'
                    }" class="px-2 py-0.5 rounded-full text-xs font-medium">
                      {{ stock.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right flex justify-end gap-3">
                    <button @click="showDetail(stock)" class="text-xs text-brand-500 font-bold hover:underline">Detail</button>
                    <button v-if="stock.status === 'AVAILABLE'" @click="toggleStatus(stock._id, 'QUARANTINE')" class="text-xs text-warning-500 hover:underline">Karantina</button>
                    <button v-else @click="toggleStatus(stock._id, 'AVAILABLE')" class="text-xs text-success-500 hover:underline">Lepas</button>
                  </td>
                </tr>
                <tr v-if="filteredStocks.length === 0">
                  <td colspan="5" class="px-5 py-8 text-center text-gray-500 italic">Inventaris tidak ditemukan. Lakukan proses Barang Masuk untuk menambah stok.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>
    </div>

    <!-- Modal Detail Barang -->
    <div v-if="selectedStock" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-2xl shadow-xl border dark:border-gray-800 max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold dark:text-white">{{ selectedStock.item?.name }}</h3>
            <p class="text-sm text-gray-500">{{ selectedStock.item?.sku }} • {{ selectedStock.item?.category || 'Umum' }}</p>
          </div>
          <button @click="selectedStock = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
          <!-- Info Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p class="text-xs text-gray-500 uppercase font-bold">Lokasi Rak</p>
              <p class="font-bold dark:text-white mt-1">{{ selectedStock.location?.name }}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p class="text-xs text-gray-500 uppercase font-bold">Status</p>
              <p class="font-bold dark:text-white mt-1">{{ selectedStock.status }}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p class="text-xs text-gray-500 uppercase font-bold">Batch ID</p>
              <p class="font-bold dark:text-white mt-1 truncate" :title="selectedStock.batchNumber">{{ selectedStock.batchNumber || '-' }}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p class="text-xs text-gray-500 uppercase font-bold">Kadaluwarsa</p>
              <p class="font-bold dark:text-white mt-1">{{ selectedStock.expiryDate ? new Date(selectedStock.expiryDate).toLocaleDateString() : '-' }}</p>
            </div>
          </div>

          <div class="flex gap-4 border dark:border-gray-800 p-4 rounded-2xl">
             <div class="w-24 h-24 flex-shrink-0 bg-white border dark:border-gray-800 rounded-xl flex items-center justify-center p-2">
               <img v-if="qrCodes[selectedStock.item?.sku]" :src="qrCodes[selectedStock.item?.sku]" class="w-full h-full object-contain" />
               <span v-else class="text-xs text-gray-400">No QR</span>
             </div>
             <div class="flex-1">
               <h4 class="text-sm font-bold text-gray-800 dark:text-white mb-1">Deskripsi Produk</h4>
               <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ selectedStock.item?.description || 'Tidak ada deskripsi.' }}</p>
               <div class="mt-3 pt-3 border-t dark:border-gray-800 flex gap-6">
                  <p class="text-sm font-bold text-gray-500">Merek: <span class="text-gray-800 dark:text-white">{{ selectedStock.item?.brand || '-' }}</span></p>
                  <p class="text-sm font-bold text-gray-500">ABC Class: <span class="text-brand-500">{{ selectedStock.item?.abcClass || '-' }}</span></p>
               </div>
             </div>
          </div>

          <div>
             <h4 class="text-sm font-bold text-gray-800 dark:text-white mb-3">Riwayat Transaksi (Log)</h4>
             <div v-if="stockTransactions.length > 0" class="space-y-3">
               <div v-for="tx in stockTransactions" :key="tx._id" class="flex justify-between items-center p-3 text-sm border dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/20">
                 <div class="flex items-center gap-3">
                   <span :class="tx.type === 'INBOUND' ? 'text-success-500 bg-success-50' : 'text-gray-500 bg-gray-200 dark:bg-gray-800 dark:text-gray-300'" class="px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">
                     {{ tx.type }}
                   </span>
                   <span class="text-gray-500 dark:text-gray-400">{{ new Date(tx.createdAt).toLocaleString() }}</span>
                 </div>
                 <div class="font-bold text-gray-800 dark:text-white">
                   {{ tx.type === 'INBOUND' ? '+' : '-' }} {{ getTxQuantity(tx, selectedStock) }} unit
                 </div>
               </div>
             </div>
             <div v-else class="text-xs text-gray-500 italic p-4 text-center border-dashed border-2 dark:border-gray-800 rounded-xl">Belum ada riwayat transaksi.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Barang -->
    <div v-if="showAddItem" class="fixed inset-0 z-99 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-xl border dark:border-gray-800">
        <h3 class="text-lg font-bold mb-4 dark:text-white">Tambah Barang Baru</h3>
        <div class="space-y-4">
          <input v-model="newItem.name" placeholder="Nama Barang" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
          <div class="grid grid-cols-2 gap-4">
            <input v-model="newItem.category" placeholder="Kategori" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
            <input v-model="newItem.brand" placeholder="Merek / Brand" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
          </div>
          <input v-model.number="newItem.price" type="number" placeholder="Harga" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
          <textarea v-model="newItem.description" placeholder="Deskripsi Barang" rows="2" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white"></textarea>
          
          <div class="p-3 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
             <label class="text-xs font-bold text-gray-500 uppercase">Identitas Barang (Barcode/SKU)</label>
             <div class="flex gap-2">
               <input v-model="newItem.sku" placeholder="Scan Barcode / SKU..." class="flex-1 p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
               <button @click="generateSKU" class="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-bold dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">Auto Generate</button>
             </div>
          </div>
          <div class="flex space-x-2">
            <button @click="addItem" class="flex-1 py-2 bg-brand-500 text-white rounded-lg">Simpan</button>
            <button @click="showAddItem = false" class="flex-1 py-2 bg-gray-200 dark:bg-white/10 dark:text-white rounded-lg">Batal</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Lokasi -->
    <div v-if="showAddLocation" class="fixed inset-0 z-99 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-xl border dark:border-gray-800">
        <h3 class="text-lg font-bold mb-4 dark:text-white">Tambah Lokasi Baru</h3>
        <div class="space-y-4">
          <input v-model="newLocation.name" placeholder="Nama Lokasi (contoh: A-01-01)" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
          <input v-model="newLocation.description" placeholder="Deskripsi (Opsional)" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
          <div class="flex space-x-2">
            <button @click="addLocation" class="flex-1 py-2 bg-brand-500 text-white rounded-lg">Simpan</button>
            <button @click="showAddLocation = false" class="flex-1 py-2 bg-gray-200 dark:bg-white/10 dark:text-white rounded-lg">Batal</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import api from "@/services/api";
import Swal from 'sweetalert2';
import QRCode from "qrcode";

const currentPageTitle = ref("Ringkasan Inventaris");
const stocks = ref<any[]>([]);
const qrCodes = ref<Record<string, string>>({});
const showAddItem = ref(false);
const showAddLocation = ref(false);

const searchQuery = ref('');
const statusFilter = ref('ALL');

const selectedStock = ref<any>(null);
const stockTransactions = ref<any[]>([]);

const productSummary = computed(() => {
  const map = new Map<string, any>();
  
  stocks.value.forEach(s => {
    if (!s.item) return;
    const name = s.item.name;
    if (!map.has(name)) {
      map.set(name, {
        name: name,
        category: s.item.category,
        brand: s.item.brand,
        total: 0,
        available: 0,
        quarantine: 0,
        damaged: 0
      });
    }
    const data = map.get(name);
    data.total += 1;
    if (s.status === 'AVAILABLE') data.available += 1;
    if (s.status === 'QUARANTINE') data.quarantine += 1;
    if (s.status === 'DAMAGED') data.damaged += 1;
  });
  
  return Array.from(map.values());
});

const filteredStocks = computed(() => {
  return stocks.value.filter(s => {
    const searchLower = searchQuery.value.toLowerCase();
    const matchSearch = s.item?.sku.toLowerCase().includes(searchLower) || 
                        s.item?.name.toLowerCase().includes(searchLower);
    const matchStatus = statusFilter.value === 'ALL' || s.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

const newItem = ref({ name: '', sku: '', category: '', brand: '', price: '', description: '' });
const newLocation = ref({ name: '', description: '' });

const fetchStock = async () => {
  try {
    const response = await api.get('/inventory/stock');
    stocks.value = response.data;
    
    // Generate QR Codes
    for (const stock of stocks.value) {
      if (stock.item?.sku) {
        qrCodes.value[stock.item.sku] = await QRCode.toDataURL(stock.item.sku);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const printQR = (item: any) => {
  const qrUrl = qrCodes.value[item.sku];
  if (!qrUrl) return;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak QR - ${item.name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            img { width: 300px; height: 300px; }
            h1 { font-size: 24px; margin-top: 20px; }
            p { font-size: 18px; color: #666; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <img src="${qrUrl}" />
          <h1>${item.name}</h1>
          <p>SKU: ${item.sku}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

const addItem = async () => {
  try {
    const payload = { ...newItem.value, barcode: newItem.value.sku };
    await api.post('/inventory/items', payload);
    showAddItem.value = false;
    newItem.value = { name: '', sku: '', category: '', brand: '', price: '', description: '' };
    fetchStock();
  } catch (err: any) {
    Swal.fire('Gagal', 'Gagal menambah barang: ' + (err.response?.data?.message || err.message), 'error');
  }
};

const generateSKU = () => {
  newItem.value.sku = 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const addLocation = async () => {
  try {
    await api.post('/inventory/locations', newLocation.value);
    showAddLocation.value = false;
    newLocation.value = { name: '', description: '' };
    fetchStock();
  } catch (err) {
    Swal.fire('Gagal', 'Gagal menambah lokasi', 'error');
  }
};

const toggleStatus = async (stockId: string, status: string) => {
  try {
    await api.patch(`/inventory/stock/${stockId}/status`, { status });
    fetchStock();
  } catch (err) {
    Swal.fire('Gagal', 'Gagal mengubah status stok', 'error');
  }
};

const showDetail = async (stock: any) => {
  selectedStock.value = stock;
  stockTransactions.value = [];
  try {
    const res = await api.get('/transactions');
    stockTransactions.value = res.data.filter((tx: any) => 
      tx.items.some((i: any) => i.item._id === stock.item._id)
    ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error(err);
  }
};

const getTxQuantity = (tx: any, currentStock: any) => {
  const match = tx.items.find((i: any) => i.item._id === currentStock.item._id);
  return match ? match.quantity : 0;
};

onMounted(fetchStock);
</script>
