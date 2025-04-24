<!-- Toast.vue (опціонально) -->
<template>
    <div class="toast">
      <img src="@/assets/icons/success.svg" alt="Success" class="toast-icon" />
      <span class="toast-text">Користувач створений</span>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Toast'
  };
  </script>
  
  <style scoped>
  .toast {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 300px;
    height: 44px;
    background-color: #3C6B1F;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    z-index: 2000;
  }
  .toast-icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .toast-text {
    font-family: Montserrat, sans-serif;
    font-size: 14px;
    color: #000;
  }
  </style>
  