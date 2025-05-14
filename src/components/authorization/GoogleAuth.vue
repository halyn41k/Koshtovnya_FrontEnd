<script>
export default {
  name: 'GoogleAuth',
  mounted() {
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token');
    const userJson = query.get('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        console.log('Query:', window.location.search);
console.log('Token:', token);
console.log('User (raw):', userJson);

        // Зберігаємо токен і користувача
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // 🔥 Оптимізований редирект на основі ролі
        const role = user?.role;
        if (role === 'admin' || role === 'superadmin' || role === 'manager') {
          this.$router.push('/admin');
        } else {
          this.$router.push('/account');
        }
      } catch (e) {
        console.error('Помилка парсингу юзера:', e);
        alert('Помилка авторизації.');
        this.$router.push('/login');
      }
    } else {
      alert('Не знайдено токен або дані користувача.');
      this.$router.push('/login');
    }
  }
};
</script>
