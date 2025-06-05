<template>
  <section class="welcome-section">
    <p class="welcome-description">
      {{ $t('admin.panel.welcome') }}
    </p>
  </section>
</template>

<script>
export default {
  name: 'WelcomeAdmin',
};
</script>

<style scoped>
.welcome-section {
  margin: 20px;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
  min-height: 400px;
}

.welcome-title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 20px;
}

.welcome-description {
  font-size: 20px;
}
</style>
