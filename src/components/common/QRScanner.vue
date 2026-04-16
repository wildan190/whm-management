<template>
  <div class="qr-scanner-wrapper">
    <div id="qr-reader" class="rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"></div>
    <div class="mt-4 space-y-3">
      <div v-if="cameras.length > 0">
        <label class="block text-xs font-medium text-gray-500 mb-1">Pilih Kamera</label>
        <select v-model="selectedCamera" @change="restartScanner" class="w-full p-2 text-sm rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white">
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.label }}
          </option>
        </select>
      </div>
      <div v-else class="text-xs text-warning-600 text-center bg-warning-50 p-2 rounded-lg">
        Mencari kamera...
      </div>
    </div>

    <!-- VIRTUAL SCANNER (HANYA MUNCUL DI DEV) -->
    <div v-if="isDev" class="mt-6 border border-brand-200 bg-brand-50/50 dark:bg-brand-900/10 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          Virtual Scanner (Dev Mode)
        </h4>
      </div>
      
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Gunakan SKU Tersedia (Database)</label>
          <div class="flex gap-2">
            <select v-model="selectedVirtualSku" class="flex-1 p-2 text-sm rounded-lg border dark:bg-dark-900 border-brand-200 dark:border-brand-800">
              <option value="">-- Pilih SKU / Barcode --</option>
              <option v-for="sku in dummySkus" :key="sku" :value="sku">{{ sku }}</option>
            </select>
            <button @click="triggerVirtualScan(selectedVirtualSku)" :disabled="!selectedVirtualSku" class="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-brand-600 transition-colors">
              Pindai
            </button>
          </div>
        </div>
        
        <div class="relative flex items-center py-2">
          <div class="flex-grow border-t border-brand-200 dark:border-brand-800"></div>
          <span class="flex-shrink-0 mx-4 text-brand-400 text-xs text-brand-500/50 italic">ATAU</span>
          <div class="flex-grow border-t border-brand-200 dark:border-brand-800"></div>
        </div>

        <div>
           <label class="block text-xs font-medium text-gray-500 mb-1">Tembak SKU Manual / Baru</label>
           <div class="flex gap-2">
             <input v-model="manualVirtualSku" @keyup.enter="triggerVirtualScan(manualVirtualSku)" placeholder="Tulis SKU dan tekan Enter" class="flex-1 p-2 text-sm rounded-lg border dark:bg-dark-900 border-brand-200 dark:border-brand-800 focus:ring-brand-500" />
             <button @click="triggerVirtualScan(manualVirtualSku)" :disabled="!manualVirtualSku" class="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-brand-600 transition-colors">
               Tembak
             </button>
             <button @click="triggerVirtualScan('MOCK-' + Math.floor(Math.random() * 90000 + 10000))" class="px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors" title="Generate SKU Random untuk Inbound">
               🎲 Acak
             </button>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import api from '@/services/api';

const props = defineProps<{
  onScanSuccess: (decodedText: string) => void;
}>();

const isDev = import.meta.env.DEV; // Vite var
const dummySkus = ref<string[]>([]);
const selectedVirtualSku = ref('');
const manualVirtualSku = ref('');

const cameras = ref<any[]>([]);
const selectedCamera = ref<string>('');
const scannerId = 'qr-reader';
let html5QrCode: Html5Qrcode | null = null;

const triggerVirtualScan = (skuToScan: string) => {
  if (skuToScan) {
    props.onScanSuccess(skuToScan);
    manualVirtualSku.value = ''; 
    // Beri efek notifikasi klik berhasil scan
    const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
    audio.play().catch(()=>{}); // Efek dummy
  }
};

const startScanner = async (cameraId: string) => {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode(scannerId);
  }

  try {
    await html5QrCode.start(
      cameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        props.onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Silent error for "QR not detected" in frame
      }
    );
  } catch (err) {
    console.error('Gagal menjalankan scanner:', err);
  }
};

const stopScanner = async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    await html5QrCode.stop();
  }
};

const restartScanner = async () => {
  await stopScanner();
  if (selectedCamera.value) {
    startScanner(selectedCamera.value);
  }
};

onMounted(async () => {
  // Ambil data untuk virtual scanner jika environment = dev
  if (isDev) {
    try {
      const dbItems = await api.get('/inventory/items');
      dummySkus.value = dbItems.data.map((i: any) => i.sku);
    } catch (e) {
      console.log('Gagal fetch dummy items mock', e);
    }
  }

  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length > 0) {
      cameras.value = devices;
      selectedCamera.value = devices[0].id;
      startScanner(devices[0].id);
    }
  } catch (err) {
    console.warn('Tidak ada kamera yg terdeteksi, atau permission ditolak:', err);
  }
});

onBeforeUnmount(async () => {
  await stopScanner();
});
</script>

<style scoped>
#qr-reader {
  width: 100%;
}
</style>
