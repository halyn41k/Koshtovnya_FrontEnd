<script>
import bus from '@/eventBus.js';
export default {
  name: 'GoogleAuth',
  
 mounted() {
  console.log('🔍 Mounted Login Component');
  bus.emit('cart-updated'); 
  document.title = this.$t('authorization.titleLogin');
  
  // Перевіряємо чи це Google callback
  const query = new URLSearchParams(window.location.search);
  const token = query.get('token');
  const userJson = query.get('user');

  console.log('🔍 URL params - token:', token ? 'EXISTS' : 'MISSING');
  console.log('🔍 URL params - user:', userJson ? 'EXISTS' : 'MISSING');

  if (token && userJson) {
    // Це Google callback - НЕ очищаємо токен
    console.log('✅ Processing Google callback...');
    this.handleGoogleCallback(token, userJson);
  } else {
    // Це звичайний вхід на сторінку логіну - очищаємо токен
    console.log('🧹 Clearing token (not Google callback)');
    localStorage.removeItem('token');
  }
}
  
};
</script>
