<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-8 max-w-5xl mx-auto pb-10">
      
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-brand-500 to-brand-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <h1 class="text-3xl sm:text-4xl font-bold mb-4">Panduan Penggunaan WMS</h1>
        <p class="text-brand-100 text-lg max-w-2xl">Selamat datang di Pusat Bantuan Internal (*Guide*) Sistem Manajemen Gudang. Pelajari modul dan fitur sistem logistik ini untuk memaksimalkan efisiensi pekerja dan keakuratan stok Anda.</p>
      </div>

      <!-- Quick Navigation -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="#inventaris" class="p-4 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-center hover:border-brand-500 hover:text-brand-500 transition-colors font-bold text-sm">📦 Inventaris</a>
        <a href="#inbound" class="p-4 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-center hover:border-brand-500 hover:text-brand-500 transition-colors font-bold text-sm">📥 Barang Masuk</a>
        <a href="#outbound" class="p-4 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-center hover:border-brand-500 hover:text-brand-500 transition-colors font-bold text-sm">📤 Barang Keluar</a>
        <a href="#reports" class="p-4 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-center hover:border-brand-500 hover:text-brand-500 transition-colors font-bold text-sm">📈 Laporan Data</a>
      </div>

      <!-- Concept 1: Konsep 1 SKU -->
      <ComponentCard title="Konsep Fundamental: 1 SKU = 1 Jenis Entitas / Produk" class="border-l-4 border-l-warning-500">
        <div class="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400">
          <p>Sistem ini dirancang dengan metode <strong>Unique Entity</strong>. Artinya, tidak ada input "Jumlah (QTY)" langsung saat melakukan penambahan daftar stok atau saat melakukan pemindaian (Scan).</p>
          <ul class="list-disc pl-5 space-y-2 mt-2">
            <li>Satu kali bunyi <em>beep</em> dari Scanner Barcode berarti Anda merekam 1 unit barang.</li>
            <li>Jika barang rusak, Anda dapat menekan tombol <strong>Karantina</strong> pada Inventaris agar barang tersebut dicegah keluar pada tahapan Outbound.</li>
            <li>SKU (*Stock Keeping Unit*) digunakan sebagai pengenal permanen (Identitas).</li>
          </ul>
        </div>
      </ComponentCard>

      <!-- Module: Inventaris -->
      <div id="inventaris" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span class="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">📦</span> Manajemen Inventaris
        </h2>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 space-y-6">
          
          <div>
            <h3 class="text-lg font-bold mb-2">1. Menambah & Mengelola Barang</h3>
            <p class="text-sm text-gray-500 mb-4">Gunakan tombol <span class="bg-brand-50 text-brand-600 px-2 py-0.5 rounded text-xs font-bold">Tambah Barang</span> di pojok kanan atas tabel. Anda akan diminta mengisi nama, merk, harga, dan kode Identitas (Barcode/SKU).</p>
            <div class="bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-xl">
              <p class="text-sm text-blue-700 dark:text-blue-400"><strong>💡 Tip:</strong> Jika produk tidak memiliki Barcode fisik bawaan produsen, manfaatkan tombol <strong>Auto Generate</strong> pada form untuk membuat SKU unik otomatis dari sistem!</p>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-bold mb-2">2. Mencari & Melihat Rincian (Detail Layar Kaca)</h3>
            <p class="text-sm text-gray-500 mb-2">Gunakan kotak pencarian *(Search)* untuk menemukan barang secara instan. Untuk melihat informasi mendalam:</p>
            <ol class="list-decimal pl-5 text-sm text-gray-500 space-y-2 font-medium">
              <li>Tekan tombol aksi <strong>Detail</strong> pada baris barang di tabel.</li>
              <li>Layar Pop-up akan terbuka menampilkan QR Code statik (Dapat dicetak untuk ditempel pada unit barang jika perlu), letak spesifik rak, kedaluwarsa, dan status persediaan.</li>
              <li>Di paling bawah Modal Detail, terdapat fitur <strong>Timeline Histori</strong> yang mencatat jejak setiap transaksi keluar atau masuk dari satu fisik barang tersebut!</li>
            </ol>
          </div>

        </div>
      </div>

      <!-- Module: Inbound -->
      <div id="inbound" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span class="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">📥</span> Penerimaan (Barang Masuk)
        </h2>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800">
          <p class="text-sm text-gray-500 mb-4">Proses <em>Inbound</em> memastikan barang yang dikirim dari truk/supplier dicatat ke gudang.</p>
          <ul class="space-y-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <li class="flex gap-4 p-4 border dark:border-gray-800 rounded-xl">
              <div class="text-2xl">📸</div>
              <div>
                <strong class="text-gray-800 dark:text-white block mb-1">Scanning Langsung (Individual)</strong>
                Gunakan kamera bawaan perangkat (HP/Laptop) atau alat *Scanner Gun* eksternal untuk melakukan tembak Barcode. Sistem otomatis mengenalinya dan memindahkannya ke antrean penerimaan. Jangan khawatir atas duplikasi, sistem akan menolaknya dengan peringatan!
              </div>
            </li>
            <li class="flex gap-4 p-4 border dark:border-gray-800 rounded-xl">
              <div class="text-2xl">⚡</div>
              <div>
                <strong class="text-gray-800 dark:text-white block mb-1">Simulasi RFID (Upload Massal)</strong>
                Jika Anda memiliki gawang pintu RFID yang membedai pallet lewat (atau punya senarai ribuan SKU dalam file Excel), atur ke 'Mode RFId'. Cukup masukkan serangkaian teks SKU (1 baris per barang), lalu tekan proses untuk menerimanya sekaligus.
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Module: Outbound -->
      <div id="outbound" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span class="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">📤</span> Pengiriman (Barang Keluar)
        </h2>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800">
          <p class="text-sm text-gray-500 mb-4">Metode <strong>Outbound</strong> merupakan siklus pengambilan keranjang barang dari rak untuk diserahkan ke jasa kurir logistik.</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border dark:border-gray-800 p-4 rounded-xl text-center group cursor-pointer hover:border-brand-500 bg-gray-50 dark:bg-gray-800/10">
              <div class="w-10 h-10 bg-brand-100 dark:bg-brand-500/20 text-brand-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">1</div>
              <h4 class="font-bold text-gray-800 dark:text-white mb-2">Scanning Barang</h4>
              <p class="text-xs text-gray-500">Sama seperti Inbound. Masukkan atau *scan* identitas unit (SKU) yang akan dikurangkan.</p>
            </div>
            <div class="border dark:border-gray-800 p-4 rounded-xl text-center group cursor-pointer hover:border-brand-500 bg-gray-50 dark:bg-gray-800/10">
              <div class="w-10 h-10 bg-brand-100 dark:bg-brand-500/20 text-brand-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">2</div>
              <h4 class="font-bold text-gray-800 dark:text-white mb-2">Instruksi FEFO</h4>
              <p class="text-xs text-gray-500">Sistem otomatis memberi tahu Anda harus mengambil dari rak mana dulu! (Kalkulasi <em>First Expired First Out</em> berdasarkan masa basi). Anda bahkan bisa menekan simbol speaker (🔊) agar sistem membacakannya via suara (*Voice-Assisted Picking*)!</p>
            </div>
            <div class="border dark:border-gray-800 p-4 rounded-xl text-center group cursor-pointer hover:border-brand-500 bg-gray-50 dark:bg-gray-800/10">
              <div class="w-10 h-10 bg-brand-100 dark:bg-brand-500/20 text-brand-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">3</div>
              <h4 class="font-bold text-gray-800 dark:text-white mb-2">Cetak Resi & Selesai</h4>
              <p class="text-xs text-gray-500">Setelah mengisi nama penerima & vendor kurir (JNT/Sicepat/Lalamove dll), tekan Konfirmasi dan cetak label pengiriman otomatis PDF.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Module: Reports -->
      <div id="reports" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span class="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">📈</span> Laporan & Evaluasi Pekerja
        </h2>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800">
          <p class="text-sm text-gray-500 mb-6">Menggunakan ApexCharts untuk membangun dasbor cerdas dari data-data terstruktur Anda.</p>
          <ul class="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <li><strong>Grafik Donat (Kesehatan Persediaan):</strong> Jika porsi <em>Stok Rendah</em> (Kuning) terlalu besar, hubungi unit Purchasing Anda segera!</li>
            <li><strong>Grafik Garis Tren:</strong> Jika kurva Outbound selalu memimpin jauh di atas Inbound secara stabil, maka penjualan sedang meledak!</li>
            <li><strong>Produktivitas Tenaga Kerja (KPI):</strong> Memantau beban kerja. Menggunakan parameter <em>Unit per Jam</em>, sistem mengevaluasi kecepatan setiap staf saat mengeksekusi Transaksi Inbound & Outbound. Sangat membantu untuk alokasi <em>reward</em> & bonus.</li>
          </ul>
        </div>
      </div>

      <div class="text-center pt-8 border-t dark:border-gray-800 text-gray-400 text-xs mt-8">
        Hak Cipta &copy; 2026 WHM Enterprise Management - Internal Distribution Only.
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const currentPageTitle = ref("Buku Panduan Internal (Guide)");
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
