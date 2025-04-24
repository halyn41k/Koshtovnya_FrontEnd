<template>
  <div class="loader-overlay">
    <img :src="logo" alt="Logo" class="logo">
  </div>
</template>

<script>
import logo from '@/assets/logo1.webp';

export default {
  name: 'Loader',
  data() {
    return {
      logo,
    };
  },
};
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  top: 0px;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5); /* Напівпрозорий білий фон для всієї сторінки */
  z-index: 3;
}

.logo {
  max-width: 150px; /* Зменшено у два рази */
  height: 150px;
}
</style>
