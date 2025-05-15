import { config } from '@vue/test-utils';
import { createApp } from 'vue';

// Емуляція глобального Vue (для сумісності з бібліотеками)
global.Vue = createApp({});

// Замокати $t, $tc, якщо є i18n
config.global.mocks = {
  $t: (msg) => msg,
  $tc: (msg) => msg,
};
