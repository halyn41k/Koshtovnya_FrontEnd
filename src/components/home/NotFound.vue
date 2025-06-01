<template>
  <div class="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden font-montserrat">
    <!-- Орнаменти -->
    <div class="absolute inset-0">
      <div
        v-for="(pixel, index) in pixels"
        :key="index"
        class="w-5 h-5 absolute cursor-grab border"
        :style="{
          top: pixel.y + 'px',
          left: pixel.x + 'px',
          backgroundColor: pixel.color
        }"
        @mousedown="startDrag(index, $event)"
      ></div>
    </div>

    <!-- Текст 404 -->
    <h1 class="font-kyiv text-7xl text-[#A01212] z-10">404</h1>
    <p class="text-xl text-gray-800 mt-4 z-10">Сторінку не знайдено 😢</p>
    <router-link
      to="/"
      class="mt-6 inline-block bg-[#A01212] text-white px-5 py-2 rounded-lg z-10 hover:bg-[#6B1F1F] transition"
    >
      На головну
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  data() {
    const red = '#A01212';
    const black = '#000000';
    const white = '#FFFFFF';

    const createPattern = (shape, offsetX, offsetY) =>
      shape.map(p => ({
        x: offsetX + p.x,
        y: offsetY + p.y,
        color: p.color
      }));

    const cross = [
      { x: 0, y: 0, color: red },
      { x: -20, y: 0, color: black },
      { x: 20, y: 0, color: black },
      { x: 0, y: -20, color: black },
      { x: 0, y: 20, color: black }
    ];

    const diamond = [
      { x: 0, y: 0, color: red },
      { x: -20, y: -20, color: white },
      { x: 20, y: -20, color: white },
      { x: -20, y: 20, color: white },
      { x: 20, y: 20, color: white }
    ];

    const star = [
      { x: 0, y: 0, color: red },
      { x: -20, y: 0, color: black },
      { x: 20, y: 0, color: black },
      { x: 0, y: -20, color: black },
      { x: 0, y: 20, color: black },
      { x: -20, y: -20, color: white },
      { x: 20, y: -20, color: white },
      { x: -20, y: 20, color: white },
      { x: 20, y: 20, color: white }
    ];

   const patterns = [
  // Центр та лівий бік
  createPattern(cross, 100, 150),
  createPattern(diamond, 250, 80),
  createPattern(star, 400, 200),
  createPattern(cross, 600, 120),
  createPattern(diamond, 850, 90),
  createPattern(cross, 300, 420),
  createPattern(diamond, 1000, 220),
  createPattern(star, 200, 300),
  createPattern(cross, 550, 500),

  // Додано правий нижній бік:
  createPattern(star, 1100, 600),
  createPattern(cross, 950, 520),
  createPattern(diamond, 1200, 680),
  createPattern(cross, 1050, 740),
  createPattern(star, 1180, 780)
];


    return {
      pixels: patterns.flat(),
      draggingIndex: null,
      offsetX: 0,
      offsetY: 0
    };
  },
  methods: {
    startDrag(index, event) {
      this.draggingIndex = index;
      this.offsetX = event.clientX - this.pixels[index].x;
      this.offsetY = event.clientY - this.pixels[index].y;
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(event) {
      if (this.draggingIndex !== null) {
        this.pixels[this.draggingIndex].x = event.clientX - this.offsetX;
        this.pixels[this.draggingIndex].y = event.clientY - this.offsetY;
      }
    },
    stopDrag() {
      this.draggingIndex = null;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

.font-kyiv {
  font-family: 'KyivType Titling Black2', sans-serif;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
