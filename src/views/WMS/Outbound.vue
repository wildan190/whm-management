<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="w-full mx-auto">
      <!-- Step Indicator -->
      <div class="mb-8 flex items-center justify-between relative">
        <div v-for="step in 3" :key="step" class="flex flex-col items-center z-1">
          <div :class="[
            'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300',
            currentStep >= step ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
          ]">
            {{ step }}
          </div>
          <span class="mt-2 text-xs font-medium" :class="currentStep >= step ? 'text-brand-500' : 'text-gray-400'">
            {{ stepLabels[step-1] }}
          </span>
        </div>
        <!-- Progress Line -->
        <div class="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-0"></div>
        <div :style="{ width: ((currentStep - 1) / 2 * 100) + '%' }" class="absolute top-5 left-0 h-0.5 bg-brand-500 transition-all duration-500 -z-0"></div>
      </div>

      <!-- Success State -->
      <div v-if="currentStep === 4" class="text-center py-10 space-y-6">
        <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success-50 text-success-500 mb-4 text-4xl">✓</div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Pengiriman Berhasil!</h3>
        <p class="text-gray-500">Barang telah dicatat keluar dan stok telah diperbarui.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <button @click="printLabel" class="flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors">
            <span>🖨️ Cetak Label Pengiriman</span>
          </button>
          <button @click="resetFlow" class="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Selesai
          </button>
        </div>
      </div>

      <!-- Step 1: Scanning -->
      <div v-if="currentStep === 1" class="space-y-6">
        <ComponentCard title="Langkah 1: Pemindaian Barang">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <p class="text-sm text-gray-500">Gunakan kamera atau input manual untuk menambahkan barang ke daftar pengiriman.</p>
              <div class="flex gap-2">
                <input v-model="manualSku" @keyup.enter="addByManual" placeholder="Masukkan SKU Manual" class="flex-1 p-3 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
                <button @click="addByManual" class="px-4 py-2 bg-brand-500 text-white rounded-lg">Tambah</button>
              </div>
              <div v-if="lines.length > 0" class="mt-6 border dark:border-gray-800 rounded-xl overflow-hidden">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th class="px-4 py-2">Barang</th>
                      <th class="px-4 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(line, index) in lines" :key="index" class="border-t dark:border-gray-800">
                      <td class="px-4 py-3">{{ line.sku }}</td>
                      <td class="px-4 py-3 text-right">
                        <button @click="lines.splice(index, 1)" class="text-error-500 hover:underline">Hapus</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <QRScanner :onScanSuccess="handleScan" />
            </div>
          </div>
          <div class="mt-8 flex justify-end">
            <button @click="nextStep" :disabled="lines.length === 0" class="px-6 py-3 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 disabled:opacity-50">
              Lanjut ke Verifikasi
            </button>
          </div>
        </ComponentCard>
      </div>

      <!-- Step 2: Verification -->
      <div v-if="currentStep === 2" class="space-y-6">
        <ComponentCard title="Langkah 2: Verifikasi Packing">
          <div class="space-y-4">
            <p class="text-sm text-gray-500">Pastikan semua barang sudah sesuai sebelum diproses keluar.</p>
            <div class="bg-brand-50 dark:bg-brand-500/5 p-4 rounded-xl border border-brand-100 dark:border-brand-500/20">
              <h4 class="font-bold text-brand-700 dark:text-brand-400 mb-2">Instruksi Pengambilan (FEFO)</h4>
              <ul class="space-y-4">
                <li v-for="line in lines" :key="line.sku" class="text-sm">
                  <div class="font-bold text-gray-800 dark:text-white mb-1">{{ line.sku }}</div>
                  <div class="pl-4 border-l-2 border-brand-200 space-y-1">
                    <div v-for="(suggestion, idx) in getFefoSuggestions(line.sku, line.quantity)" :key="idx" class="flex justify-between items-center text-xs">
                      <div>Ambil {{ suggestion.qty }} dari <strong>{{ suggestion.loc }}</strong></div>
                      <div class="flex items-center gap-2">
                        <span class="text-gray-400">Exp: {{ suggestion.exp }}</span>
                        <button @click="speakInstruction(suggestion, line.sku)" class="text-brand-500 hover:scale-110 transition-transform">🔊</button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Catatan Packing (Opsional)</label>
              <textarea v-model="notes" rows="3" class="w-full p-3 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" placeholder="Contoh: Fragile, Gunakan Bubble Wrap..."></textarea>
            </div>
          </div>
          <div class="mt-8 flex justify-between">
            <button @click="currentStep = 1" class="px-6 py-3 bg-gray-200 dark:bg-white/10 dark:text-white rounded-lg">Kembali</button>
            <button @click="nextStep" class="px-6 py-3 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600">Lanjut ke Pengiriman</button>
          </div>
        </ComponentCard>
      </div>

      <!-- Step 3: Finalize -->
      <div v-if="currentStep === 3" class="space-y-6">
        <ComponentCard title="Langkah 3: Detail Pengiriman">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Nama Penerima</label>
                <input v-model="shipping.receiver" required class="w-full p-3 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Kurir / Jasa Kirim</label>
                <input v-model="shipping.carrier" placeholder="JNE, Sicepat, dll" class="w-full p-3 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Metode Pengurangan Stok</label>
                <select v-model="shipping.method" class="w-full p-3 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white">
                  <option value="FIFO">First-In First-Out (FIFO)</option>
                  <option value="SCAN">Metode Manual / Scan</option>
                </select>
              </div>
            </div>
          </div>
          <div class="mt-8 flex justify-between">
            <button @click="currentStep = 2" class="px-6 py-3 bg-gray-200 dark:bg-white/10 dark:text-white rounded-lg">Kembali</button>
            <button @click="finalizeOutbound" :disabled="loading" class="px-8 py-3 bg-success-500 text-white font-bold rounded-lg hover:bg-success-600 disabled:opacity-50">
              {{ loading ? 'Memproses...' : 'Konfirmasi Pengiriman' }}
            </button>
          </div>
        </ComponentCard>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import QRScanner from "@/components/common/QRScanner.vue";
import api from "@/services/api";
import Swal from 'sweetalert2';
import jsPDF from "jspdf";

const currentPageTitle = ref("Barang Keluar (Outbound)");
const currentStep = ref(1);
const stepLabels = ['Scanning', 'Verifikasi', 'Pengiriman'];
const loading = ref(false);
const startTime = ref<Date | null>(new Date());

const lines = ref<any[]>([]);
const manualSku = ref('');
const notes = ref('');
const shipping = ref({
  receiver: '',
  carrier: '',
  method: 'FIFO'
});

const stocks = ref<any[]>([]);

const fetchStocks = async () => {
  const res = await api.get('/inventory/stock');
  stocks.value = res.data;
};

const getFefoSuggestions = (sku: string, requiredQty: number) => {
  const itemStocks = stocks.value
    .filter(s => s.item?.sku === sku && s.status === 'AVAILABLE' && s.quantity > 0)
    .sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });

  let remaining = requiredQty;
  const picks: any[] = [];
  
  for (const s of itemStocks) {
    if (remaining <= 0) break;
    const qty = Math.min(s.quantity, remaining);
    picks.push({
      qty,
      loc: s.location?.name,
      exp: s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : 'N/A'
    });
    remaining -= qty;
  }
  return picks;
};

const handleScan = (sku: string) => {
  const existing = lines.value.find(l => l.sku === sku);
  if (existing) {
    Swal.fire('Perhatian', 'SKU ini sudah dimasukkan ke daftar!', 'warning');
  } else {
    lines.value.push({ sku, quantity: 1, locationName: 'A-01' }); // Default location logic
  }
};

const addByManual = () => {
  if (!manualSku.value) return;
  handleScan(manualSku.value);
  manualSku.value = '';
};

const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++;
};

const finalizeOutbound = async () => {
  loading.value = true;
  try {
    await api.post('/transactions/outbound', {
      items: lines.value,
      notes: notes.value,
      shipping: shipping.value,
      startTime: startTime.value
    });
    Swal.fire('Berhasil', 'Barang keluar berhasil diproses!', 'success');
    currentStep.value = 4;
  } catch (err: any) {
    Swal.fire('Gagal', err.response?.data?.message || 'Gagal memproses pengiriman', 'error');
  } finally {
    loading.value = false;
  }
};

const resetFlow = () => {
  currentStep.value = 1;
  lines.value = [];
  notes.value = '';
  shipping.value = { receiver: '', carrier: '', method: 'FIFO' };
  fetchStocks();
};

const printLabel = () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [100, 150]
  });

  doc.setFontSize(18);
  doc.text('LABEL PENGIRIMAN WMS', 10, 20);
  doc.setLineWidth(0.5);
  doc.line(10, 25, 140, 25);

  doc.setFontSize(12);
  doc.text(`Penerima: ${shipping.value.receiver}`, 10, 35);
  doc.text(`Kurir: ${shipping.value.carrier}`, 10, 45);
  doc.text(`Resi: WMS-TRK-${Math.floor(Math.random() * 9000000) + 1000000}`, 10, 55);

  doc.setFontSize(10);
  doc.text('Daftar Barang:', 10, 70);
  lines.value.forEach((l, i) => {
    doc.text(`- ${l.sku}`, 15, 76 + (i * 5));
  });

  doc.save(`label-${shipping.value.receiver}.pdf`);
};

const speakInstruction = (suggestion: any, sku: string) => {
  const text = `Ambil ${suggestion.qty} unit SKU ${sku} di lokasi ${suggestion.loc}`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  window.speechSynthesis.speak(utterance);
};

fetchStocks();
</script>
