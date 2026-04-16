<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="w-full mx-auto space-y-6">
      <div class="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border dark:border-gray-800">
        <div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">Form Barang Masuk</h2>
          <p class="text-sm text-gray-500">Terima barang baru atau stok tambahan melalui pemindaian.</p>
        </div>
        <button @click="isRfidMode = !isRfidMode" class="px-4 py-2 text-xs font-bold rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-50 transition-colors">
          {{ isRfidMode ? 'Mode Manual' : 'Simulasi RFID / Scan Massal' }}
        </button>
      </div>

      <div v-if="isRfidMode" class="mb-6">
        <ComponentCard title="RFID / Scan Massal">
          <p class="text-xs text-gray-500 mb-2">Tempelkan daftar SKU di bawah ini (satu SKU per baris) untuk simulasi pemindaian RFID massal.</p>
          <textarea v-model="rfidInput" rows="5" class="w-full p-3 rounded-lg border dark:bg-dark-900 border-dashed border-brand-300" placeholder="SKU-001&#10;SKU-002&#10;SKU-003"></textarea>
          <div class="flex justify-end mt-2">
            <button @click="processRfid" class="px-6 py-2 bg-brand-500 text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-colors">Proses Semua</button>
          </div>
        </ComponentCard>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <!-- Scanner Section -->
        <ComponentCard title="Scanner Barang">
          <p class="text-sm text-gray-500 mb-4 font-medium italic">Scan Barcode / QR Code dari produk eksternal.</p>
          <QRScanner :onScanSuccess="handleScanner" />
          <div class="mt-4 p-4 bg-brand-50 dark:bg-brand-500/5 rounded-xl border border-brand-100 dark:border-brand-500/20">
            <h4 class="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-2">Status Scan Terakhir</h4>
            <div v-if="lines.length > 0" class="flex items-center gap-3">
              <div class="text-2xl">📦</div>
              <div>
                <div class="font-bold text-gray-800 dark:text-white">{{ lines[lines.length-1].sku }}</div>
                <div class="text-xs text-gray-400">{{ lines[lines.length-1].itemName || 'Mencari data...' }}</div>
              </div>
            </div>
            <div v-else class="text-xs text-gray-400 italic">Belum ada barang yang di-scan.</div>
          </div>
        </ComponentCard>

        <!-- Details Section -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1">Rincian Penerimaan</h3>
          <div v-for="(line, idx) in lines" :key="idx" class="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border dark:border-gray-800 space-y-4 relative group">
            <button @click="lines.splice(idx, 1)" class="absolute top-4 right-4 text-gray-400 hover:text-error-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
            </button>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">SKU / Code</label>
                <input v-model="line.sku" @change="lookupItem(idx)" class="w-full p-2 text-sm rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
               <div>
                  <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">Lokasi Rak</label>
                  <select v-model="line.locationName" class="w-full p-2 text-sm rounded-lg border dark:bg-dark-900 dark:border-gray-700">
                    <option v-for="loc in locations" :key="loc._id" :value="loc.name">{{ loc.name }}</option>
                  </select>
               </div>
               <div>
                  <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">Batch #</label>
                  <input v-model="line.batchNumber" placeholder="Batch-..." class="w-full p-2 text-sm rounded-lg border dark:bg-dark-900 dark:border-gray-700" />
               </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">Tgl Kadaluwarsa</label>
              <input v-model="line.expiryDate" type="date" class="w-full p-2 text-sm rounded-lg border dark:bg-dark-900 dark:border-gray-700" />
            </div>
            <div v-if="line.itemName" class="flex items-center gap-2 text-[10px] bg-success-50 dark:bg-success-500/5 text-success-600 p-2 rounded-lg border border-success-100">
              <span class="font-bold">✓ PRODUK TERDAFTAR:</span> {{ line.itemName }}
            </div>
             <div v-if="getSuggestion(line.sku)" class="text-[10px] bg-brand-50 text-brand-600 p-2 rounded-lg border border-brand-100 italic">
               💡 Slotting: Area {{ getSuggestion(line.sku) }} direkomendasikan.
            </div>
          </div>
          <button @click="addLine" class="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400 text-xs font-bold hover:bg-gray-50 transition-colors uppercase tracking-widest">+ Tambah Baris Manual</button>
        </div>
      </div>

      <div class="flex justify-end pt-8">
        <button @click="submitInbound" :disabled="loading || lines.length === 0" class="flex items-center gap-2 px-12 py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/20 hover:bg-brand-600 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95">
          <span v-if="!loading">📦 Selesaikan Inbound</span>
          <span v-else>Memproses...</span>
        </button>
      </div>

      <!-- Transaction Log -->
      <ComponentCard title="Riwayat Penerimaan Terakhir">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead>
              <tr class="text-gray-400 border-b dark:border-gray-800">
                <th class="pb-3 pr-4">Petugas</th>
                <th class="pb-3 px-4">Jumlah</th>
                <th class="pb-3 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions.filter(t => t.type === 'INBOUND').slice(0, 3)" :key="tx._id" class="border-b dark:border-gray-800 last:border-0">
                <td class="py-3 pr-4 font-bold text-gray-800 dark:text-white">{{ tx.user?.username }}</td>
                <td class="py-3 px-4 text-gray-500">{{ tx.items.length }} Item masuk</td>
                <td class="py-3 text-right text-xs text-gray-400">{{ new Date(tx.createdAt).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import QRScanner from "@/components/common/QRScanner.vue";
import api from "@/services/api";
import Swal from 'sweetalert2';

const currentPageTitle = ref("Barang Masuk");
const loading = ref(false);
const locations = ref<any[]>([]);
const transactions = ref<any[]>([]);

const lines = ref<any[]>([]);
const itemSuggestions = ref<Record<string, string>>({});
const startTime = ref<Date | null>(null);
const isRfidMode = ref(false);
const rfidInput = ref('');

const getSuggestion = (sku: string) => itemSuggestions.value[sku];

const fetchInitialData = async () => {
  startTime.value = new Date();
  try {
    const [locRes, txRes, itemRes] = await Promise.all([
      api.get('/inventory/locations'),
      api.get('/transactions'),
      api.get('/inventory/items')
    ]);
    locations.value = locRes.data;
    transactions.value = txRes.data;
    
    // Map suggestions based on ABC class
    itemRes.data.forEach((item: any) => {
      if (item.abcClass === 'A') {
        const nearLoc = locations.value.sort((a, b) => (a.distanceFromDock || 0) - (b.distanceFromDock || 0))[0];
        itemSuggestions.value[item.sku] = nearLoc ? nearLoc.name : '';
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const addLine = () => {
  lines.value.push({ sku: '', locationName: '', quantity: 1, batchNumber: '', expiryDate: '' });
};

const processRfid = () => {
  const skus = rfidInput.value.split('\n').filter(s => s.trim());
  skus.forEach(sku => {
    lines.value.push({ 
      sku: sku.trim(), 
      locationName: 'A-01', 
      quantity: 1, 
      batchNumber: 'RFID-BATCH', 
      expiryDate: '',
      itemName: ''
    });
  });
  rfidInput.value = '';
  isRfidMode.value = false;
};

const handleScanner = (scannedCode: string) => {
  const existingIndex = lines.value.findIndex(l => l.sku === scannedCode);
  if (existingIndex !== -1) {
    Swal.fire('Perhatian', 'SKU ini sudah dimasukkan ke daftar!', 'warning');
  } else {
    lines.value.push({
      sku: scannedCode,
      locationName: 'A-01',
      quantity: 1,
      batchNumber: '',
      expiryDate: '',
      itemName: ''
    });
    lookupItem(lines.value.length - 1);
  }
};

const lookupItem = async (index: number) => {
  const line = lines.value[index];
  if (!line.sku) return;
  
  try {
    const res = await api.get('/inventory/items');
    const found = res.data.find((i: any) => i.sku === line.sku || i.barcode === line.sku);
    if (found) {
      line.itemName = found.name;
      line.sku = found.sku; // Standardize to SKU
      // Auto suggest location
      if (found.abcClass === 'A') {
        const nearLoc = locations.value.sort((a, b) => (a.distanceFromDock || 0) - (b.distanceFromDock || 0))[0];
        line.locationName = nearLoc ? nearLoc.name : 'A-01';
      }
    }
  } catch (err) {
    console.error('Lookup failed', err);
  }
};

const submitInbound = async () => {
  loading.value = true;
  try {
    await api.post('/transactions/inbound', { 
      items: lines.value,
      startTime: startTime.value
    });
    Swal.fire('Berhasil', 'Barang masuk berhasil diproses!', 'success');
    lines.value = [{ sku: '', locationName: '', quantity: 1, batchNumber: '', expiryDate: '' }];
    fetchInitialData();
  } catch (err: any) {
    Swal.fire('Gagal', err.response?.data?.message || 'Gagal memproses barang masuk', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInitialData);
</script>
