<template>
  <div
    @click.self="$emit('close')"
    class="fixed inset-0 flex items-center justify-center z-50"
    style="background-color: rgba(0,0,0,0.2);"
  >
    <div class="relative bg-white rounded-lg p-6 w-full max-w-md mx-4 font-montserrat">
      <!-- Кнопка закриття -->
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >✕</button>

      <!-- Заголовок -->
      <h2 class="text-2xl font-semibold mb-6">{{ $t('admin.profile.title') }}</h2>

      <!-- Поля форми -->
      <div class="space-y-4">
        <div class="flex flex-col">
          <label for="first_name" class="mb-1 font-medium">{{ $t('admin.profile.firstName') }}:</label>
          <input
  id="first_name"
  type="text"
  v-model="localFirstName"
  placeholder="Введіть ім’я"
  class="h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-pink-200"
/>

        </div>
        <div class="flex flex-col">
          <label for="last_name" class="mb-1 font-medium">{{ $t('admin.profile.lastName') }}:</label>
          <input
            id="last_name"
            type="text"
            placeholder="Введіть прізвище"
            v-model="localLastName"
            class="h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-pink-200"
          />
        </div>
        <div class="flex flex-col">
          <label for="second_name" class="mb-1 font-medium">{{ $t('admin.profile.patronymic') }}:</label>
          <input
            id="second_name"
            type="text"
            v-model="localSecondName"
            placeholder="Введіть по батькові"
            class="h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-pink-200"
          />
        </div>
        <div class="flex flex-col">
          <label for="role" class="mb-1 font-medium">{{ $t('admin.profile.role') }}:</label>
          <input
            id="role"
            type="text"
            v-model="localRole"
            readonly
            class="h-10 px-3 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div class="flex flex-col">
          <label for="email" class="mb-1 font-medium">{{ $t('admin.profile.email') }}:</label>
          <input
            id="email"
            type="email"
            v-model="localEmail"
            placeholder="Введіть email"
            readonly
            class="h-10 px-3 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
      </div>

      <!-- Кнопки -->
      <div class="mt-6 flex space-x-4">
        <button
          @click="updateAdmin"
          class="flex-1 h-10 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >{{ $t('admin.profile.update') }}</button>
        <button
          @click="changePassword"
          class="flex-1 h-10 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >{{ $t('admin.profile.changePassword') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminProfileCard',
  data() {
    return {
      localFirstName: '',
      localLastName: '',
      localSecondName: '',
      localRole: '',
      localEmail: ''
    };
  },
  methods: {
    async fetchAdminProfile() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(this.$t('admin.profile.unauthorized'));
        return;
      }
      try {
        const res = await fetch(
          'https://koshtovnya.api-dev.bmax-edu.website/api/admin/profile',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!res.ok) throw new Error(res.status);
        const { user: profile } = await res.json();
        this.localFirstName  = profile.first_name  || '';
        this.localLastName   = profile.last_name   || '';
        this.localSecondName = profile.second_name || '';
        this.localRole       = profile.role        || '';
        this.localEmail      = profile.email       || '';
      } catch (err) {
        console.error(err);
        alert(this.$t('admin.profile.loadError'));
      }
    },
    async updateAdmin() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(this.$t('admin.profile.unauthorized'));
        return;
      }
      const payload = {
        first_name:  this.localFirstName,
        last_name:   this.localLastName,
        second_name: this.localSecondName
      };
      try {
        const res = await fetch(
          'https://koshtovnya.api-dev.bmax-edu.website/api/admin/profile',
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          }
        );
        if (!res.ok) throw new Error(res.status);
        alert(this.$t('admin.profile.updated'));
        this.fetchAdminProfile();
      } catch (err) {
        console.error(err);
        alert(this.$t('admin.profile.updateError'));
      }
    },
    changePassword() {
      this.$router.push({ name: 'ChangePassword' });
    }
  },
  mounted() {
    this.fetchAdminProfile();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
