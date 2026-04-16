<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90">Manajemen User</h2>
        <button @click="showAddUser = true" class="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600">Tambah User Baru</button>
      </div>

      <ComponentCard title="User Sistem">
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">Username</th>
                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">Peran</th>
                  <th class="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="user in users" :key="user._id">
                  <td class="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">{{ user.username }}</td>
                  <td class="px-5 py-4 text-theme-sm">
                    <span :class="user.role === 'admin' ? 'bg-brand-500/10 text-brand-500' : 'bg-gray-100 dark:bg-white/5 text-gray-500'" class="px-2 py-1 rounded-md text-xs font-bold uppercase">
                      {{ user.role === 'admin' ? 'Admin' : 'User' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-theme-sm">
                    <button v-if="user.username !== 'admin'" @click="deleteUser(user._id)" class="text-error-500 hover:text-error-600">Hapus</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>
    </div>

    <!-- Modal -->
    <div v-if="showAddUser" class="fixed inset-0 z-99 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-xl border dark:border-gray-800">
        <h3 class="text-lg font-bold mb-4 dark:text-white">Tambah User Sistem</h3>
        <div class="space-y-4">
          <input v-model="newUser.username" placeholder="Username" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
          <input v-model="newUser.password" type="password" placeholder="Password" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white" />
          <select v-model="newUser.role" class="w-full p-2 rounded-lg border dark:bg-dark-900 dark:border-gray-700 dark:text-white">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div class="flex space-x-2">
            <button @click="addUser" class="flex-1 py-2 bg-brand-500 text-white rounded-lg">Simpan User</button>
            <button @click="showAddUser = false" class="flex-1 py-2 bg-gray-200 dark:bg-white/10 dark:text-white rounded-lg">Batal</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import api from "@/services/api";
import Swal from 'sweetalert2';

const currentPageTitle = ref("Manajemen User");
const users = ref<any[]>([]);
const showAddUser = ref(false);
const newUser = ref({ username: '', password: '', role: 'user' });

const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    users.value = response.data;
  } catch (err) {
    console.error(err);
  }
};

const addUser = async () => {
  try {
    await api.post('/users', newUser.value);
    showAddUser.value = false;
    newUser.value = { username: '', password: '', role: 'user' };
    fetchUsers();
  } catch (err: any) {
    Swal.fire('Gagal', err.response?.data?.message || 'Gagal menambah user', 'error');
  }
};

const deleteUser = async (id: string) => {
  if (!confirm('Apakah Anda yakin?')) return;
  try {
    await api.delete(`/users/${id}`);
    fetchUsers();
  } catch (err) {
    Swal.fire('Gagal', 'Gagal menghapus user', 'error');
  }
};

onMounted(fetchUsers);
</script>
