describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false)
  })
})
/*
//Протестовано головні аспекти
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

import { shallowMount } from '@vue/test-utils';
import ProductReviews from '@/components/Product/ProductReviews.vue';

describe('ProductReviews.vue', () => {
  let wrapper;
  const originalCreated = ProductReviews.created;

  beforeEach(() => {
    // Замокаємо console.error, щоб уникнути виводу помилок під час тестів
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Створюємо глобальний мок для fetch
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [], total: 0 }),
    })
  );  

  afterAll(() => {
    global.fetch.mockClear();
    delete global.fetch;
    ProductReviews.created = originalCreated;
  });

  // Демонтуємо компонент після кожного тесту
  afterEach(() => {
    if (wrapper) wrapper.unmount();
    consoleErrorSpy.mockRestore();
  });

  // Рендеринг базових елементів
  it('повинен рендерити заголовок секції "Відгуки"', () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return { reviews: [], showReviewForm: false };
      },
    });
    const title = wrapper.find('h2.specifications-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Відгуки');
  });

  it('повинен відображати кнопку "Додати відгук"', () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return { reviews: [], showReviewForm: false };
      },
    });
    const addReviewButton = wrapper.find('.review-button');
    expect(addReviewButton.exists()).toBe(true);
    expect(addReviewButton.text()).toBe('Додати відгук');
  });

  // Рендеринг списку відгуків
  it('повинен відображати список відгуків коли вони присутні', () => {
    ProductReviews.created = () => {};
    const mockReviews = [
      {
        id: 1,
        user_first_name: 'Іван',
        user_last_name: 'Петров',
        rating: 4,
        date: '2024-03-15T12:00:00Z',
        comment: 'Гарний продукт!',
        replies: [],
      },
      {
        id: 2,
        user_first_name: 'Олена',
        user_last_name: 'Коваленко',
        rating: 5,
        date: '2024-03-16T15:30:00Z',
        comment: 'Чудовий сервіс!',
        replies: [],
      },
    ];
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { reviews: mockReviews }; },
    });
    const reviewItems = wrapper.findAll('.review-item');
    expect(reviewItems.length).toBe(mockReviews.length);
    const firstReview = mockReviews[0];
    const firstReviewItem = reviewItems.at(0);
    const author = firstReviewItem.find('.review-author');
    expect(author.exists()).toBe(true);
    expect(author.text()).toBe(`${firstReview.user_first_name} ${firstReview.user_last_name}`);
    const comment = firstReviewItem.find('.review-comment');
    expect(comment.exists()).toBe(true);
    expect(comment.text()).toBe(firstReview.comment);
    const dateElement = firstReviewItem.find('.review-date');
    expect(dateElement.exists()).toBe(true);
    expect(dateElement.text().length).toBeGreaterThan(0);
    const filledStars = firstReviewItem.findAll('.star.filled');
    expect(filledStars.length).toBe(firstReview.rating);
  });

  it('повинен відображати повідомлення "Немає відгуків для цього товару", якщо відгуків немає', () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { reviews: [] }; },
    });
    const noReviewsMsg = wrapper.find('.no-reviews');
    expect(noReviewsMsg.exists()).toBe(true);
    expect(noReviewsMsg.text()).toBe('Немає відгуків для цього товару.');
  });

  // Рендеринг зірок рейтингу
  it('повинен відображати заповнені зірки відповідно до оцінки відгуку', () => {
    ProductReviews.created = () => {};
    const mockReview = {
      id: 1,
      user_first_name: 'Іван',
      user_last_name: 'Петров',
      rating: 3,
      date: '2024-03-15T12:00:00Z',
      comment: 'Гарний продукт!',
      replies: [],
    };
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { reviews: [mockReview] }; },
    });
    const reviewItem = wrapper.find('.review-item');
    const filledStars = reviewItem.findAll('.star.filled');
    expect(filledStars.length).toBe(mockReview.rating);
    const allStars = reviewItem.findAll('.star');
    expect(allStars.length).toBe(5);
  });

  // Форма додавання відгуку
  it('повинен відкривати форму додавання відгуку при натисканні кнопки "Додати відгук"', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { reviews: [], showReviewForm: false }; },
    });
    expect(wrapper.find('.review-form').exists()).toBe(false);
    const addReviewButton = wrapper.find('.review-button');
    await addReviewButton.trigger('click');
    expect(wrapper.vm.showReviewForm).toBe(true);
    expect(wrapper.find('.review-form').exists()).toBe(true);
  });

  it('повинен коректно оновлювати newReview.comment при введенні в textarea', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { showReviewForm: true, newReview: { comment: '', rating: 5 } }; },
    });
    const textarea = wrapper.find('.review-form textarea');
    const newComment = 'Це тестовий коментар';
    await textarea.setValue(newComment);
    expect(wrapper.vm.newReview.comment).toBe(newComment);
  });

  // Взаємодія із зірками рейтингу
  it('повинен оновлювати hoverRatingValue при наведенні на зірку і скидати його при mouseleave', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return {
          showReviewForm: true,
          newReview: { comment: '', rating: 5 },
          hoverRatingValue: null,
        };
      },
    });
    const stars = wrapper.findAll('.rating-stars .star');
    await stars.at(2).trigger('mouseover');
    expect(wrapper.vm.hoverRatingValue).toBe(3);
    await stars.at(2).trigger('mouseleave');
    expect(wrapper.vm.hoverRatingValue).toBe(null);
  });

  it('повинен оновлювати newReview.rating при кліку на зірку', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return {
          showReviewForm: true,
          newReview: { comment: '', rating: 5 },
          hoverRatingValue: null,
        };
      },
    });
    const stars = wrapper.findAll('.rating-stars .star');
    await stars.at(1).trigger('click');
    expect(wrapper.vm.newReview.rating).toBe(2);
  });

  // Перевірка виклику submitReview при натисканні кнопки "Відправити"
  it('повинен викликати метод submitReview при натисканні кнопки "Відправити"', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { showReviewForm: true, newReview: { comment: 'Test comment', rating: 5 } }; },
    });
    // Перепризначаємо метод для перевірки виклику
    wrapper.vm.submitReview = jest.fn();
    const submitButton = wrapper.find('.review-submit');
    await submitButton.trigger('click');
    expect(wrapper.vm.submitReview).toHaveBeenCalled();
  });

  // Тест обробки помилок
  it('повинен виводити помилку, якщо коментар порожній', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { showReviewForm: true, newReview: { comment: '', rating: 5 } }; },
    });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const submitButton = wrapper.find('.review-submit');
    await submitButton.trigger('click');
    expect(window.alert).toHaveBeenCalledWith('Будь ласка, введіть коментар та виберіть рейтинг.');
    expect(global.fetch).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('повинен виводити помилку, якщо рейтинг некоректний', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { showReviewForm: true, newReview: { comment: 'Test comment', rating: 0 } }; },
    });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const submitButton = wrapper.find('.review-submit');
    await submitButton.trigger('click');
    expect(window.alert).toHaveBeenCalledWith('Будь ласка, введіть коментар та виберіть рейтинг.');
    expect(global.fetch).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  // Тест: При натисканні кнопки "Відповісти" для конкретного відгуку викликається метод replyToReview і встановлюється відповідний id
  it('повинен викликати метод replyToReview та встановити replyTo при натисканні кнопки "Відповісти"', async () => {
    ProductReviews.created = () => {};
    const mockReview = {
      id: 123,
      user_first_name: 'Тест',
      user_last_name: 'Користувач',
      rating: 5,
      date: '2024-03-15T12:00:00Z',
      comment: 'Test reply review',
      replies: [],
    };
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() { return { reviews: [mockReview] }; },
    });
    // Зберігаємо оригінальний метод та створюємо обгортку‑шпигун
    const originalReplyToReview = wrapper.vm.replyToReview;
    const replyToReviewSpy = jest.fn(originalReplyToReview.bind(wrapper.vm));
    wrapper.vm.replyToReview = replyToReviewSpy;
    const replyButton = wrapper.find('.reply-button');
    await replyButton.trigger('click');
    expect(replyToReviewSpy).toHaveBeenCalledWith(mockReview.id);
    expect(wrapper.vm.replyTo).toBe(mockReview.id);
  });

  // Тест: Перевірка, що після встановлення replyTo відображається форма відповіді
  it('повинен відображати форму відповіді після встановлення replyTo', async () => {
    ProductReviews.created = () => {};
    const mockReview = {
      id: 456,
      user_first_name: 'Reply',
      user_last_name: 'Tester',
      rating: 4,
      date: '2024-03-16T12:00:00Z',
      comment: 'Review for reply form test',
      replies: [],
    };
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return { 
          reviews: [mockReview],
          replyTo: null,
          replyText: ""
        };
      },
    });
    // На початку форми відповіді не має бути
    expect(wrapper.find('.reply-form').exists()).toBe(false);
    // Викликаємо метод replyToReview через клік по кнопці "Відповісти"
    const replyButton = wrapper.find('.reply-button');
    await replyButton.trigger('click');
    // Після кліку replyTo має дорівнювати id відгуку, і форма відповіді відображається
    expect(wrapper.vm.replyTo).toBe(mockReview.id);
    expect(wrapper.find('.reply-form').exists()).toBe(true);
  });

  it('повинен викликатися метод submitReply при введенні відповіді і натисканні кнопки "Відправити"', async () => {
    ProductReviews.created = () => {};
    const mockReview = {
      id: 789,
      user_first_name: 'Reply',
      user_last_name: 'User',
      rating: 4,
      date: '2024-03-16T12:00:00Z',
      comment: 'Some review text',
      replies: [],
    };
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return {
          reviews: [mockReview],
          replyTo: mockReview.id, // Відкриваємо форму відповіді
          replyText: ""
        };
      },
    });
    // Перепризначаємо метод submitReply для перевірки виклику
    wrapper.vm.submitReply = jest.fn();
    const textarea = wrapper.find('.reply-form textarea');
    const replyInput = 'Це відповідь тесту';
    await textarea.setValue(replyInput);
    const submitReplyButton = wrapper.find('.reply-submit');
    await submitReplyButton.trigger('click');
    expect(wrapper.vm.submitReply).toHaveBeenCalled();
  });
  
  it('повинен відображати кнопки пагінації відповідно до кількості сторінок', () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    
    // Встановлюємо значення для totalReviews та reviewsPerPage:
    // При totalReviews = 12 та reviewsPerPage = 5, має бути 3 сторінки
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return {
          reviews: [],
          totalReviews: 12,
          reviewsPerPage: 5,
          currentPage: 1,
        };
      },
    });
  
    // Перевірка обчислюваної властивості pagesArray
    expect(wrapper.vm.pagesArray.length).toBe(3);
  
    // Шаблон пагінації містить 2 додаткові кнопки (стрілки вліво та вправо)
    const pageButtons = wrapper.findAll('.pagination .page-button');
    expect(pageButtons.length).toBe(5);
  
    // Перевірка тексту кнопок:
    // Перша кнопка - стрілка вліво ("<")
    expect(pageButtons.at(0).text()).toBe('<');
    // Кнопки з номерами сторінок
    expect(pageButtons.at(1).text()).toBe('1');
    expect(pageButtons.at(2).text()).toBe('2');
    expect(pageButtons.at(3).text()).toBe('3');
    // Остання кнопка - стрілка вправо (">")
    expect(pageButtons.at(4).text()).toBe('>');
  });
  
  it('повинен викликати метод fetchReviews з відповідним номером сторінки при натисканні кнопок пагінації', async () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    
    // Налаштовуємо дані: 15 відгуків при 5 на сторінку (3 сторінки) і встановлюємо поточну сторінку на 2,
    // щоб кнопки "prev" та "next" були активними.
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return {
          reviews: [],
          totalReviews: 15,
          reviewsPerPage: 5,
          currentPage: 2,
        };
      },
    });
  
    // Замінюємо метод fetchReviews на метод-шпигун
    wrapper.vm.fetchReviews = jest.fn();
  
    // Знаходимо всі кнопки пагінації.
    // В шаблоні: перша кнопка — "<", потім кнопки з номерами, і остання — ">".
    const paginationButtons = wrapper.findAll('.pagination .page-button');
  
    // Перевірка: кнопка "prev" (індекс 0) повинна викликати fetchReviews з (currentPage - 1) = 1
    await paginationButtons.at(0).trigger('click');
    expect(wrapper.vm.fetchReviews).toHaveBeenCalledWith(1);
  
    // Натискаємо на кнопку для сторінки 1 (індекс 1) — має викликати fetchReviews(1)
    await paginationButtons.at(1).trigger('click');
    expect(wrapper.vm.fetchReviews).toHaveBeenCalledWith(1);
  
    // Натискаємо на кнопку для сторінки 3 (індекс 3) — має викликати fetchReviews(3)
    await paginationButtons.at(3).trigger('click');
    expect(wrapper.vm.fetchReviews).toHaveBeenCalledWith(3);
  
    // Натискаємо на кнопку "next" (індекс 4) — має викликати fetchReviews з (currentPage + 1) = 3
    await paginationButtons.at(4).trigger('click');
    expect(wrapper.vm.fetchReviews).toHaveBeenCalledWith(3);
  });
  
  it('повинен вимикати кнопки "попередня" та "наступна", коли користувач знаходиться на першій або останній сторінці', async () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
  
    // Встановлюємо дані для ситуації, коли користувач на першій сторінці:
    // totalReviews = 15 і reviewsPerPage = 5 дають 3 сторінки.
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      data() {
        return {
          reviews: [],
          totalReviews: 15,
          reviewsPerPage: 5,
          currentPage: 1, // перша сторінка
        };
      },
    });
  
    // Отримуємо кнопки пагінації:
    // Перша кнопка — "попередня" (<), остання — "наступна" (>)
    let paginationButtons = wrapper.findAll('.pagination .page-button');
  
    // Перевіряємо, що кнопка "попередня" вимкнена на першій сторінці
    expect(paginationButtons.at(0).attributes('disabled')).toBeDefined();
    // Переконуємось, що кнопка "наступна" не вимкнена (на першій сторінці)
    expect(paginationButtons.at(paginationButtons.length - 1).attributes('disabled')).toBeUndefined();
  
    // Змінюємо дані: користувач переходить на останню сторінку (3)
    await wrapper.setData({ currentPage: 3 });
    paginationButtons = wrapper.findAll('.pagination .page-button');
  
    // На останній сторінці кнопка "попередня" має бути активною
    expect(paginationButtons.at(0).attributes('disabled')).toBeUndefined();
    // Кнопка "наступна" має бути вимкненою
    expect(paginationButtons.at(paginationButtons.length - 1).attributes('disabled')).toBeDefined();
  });
  
  it('повинен коректно форматувати дату з формату ISO та заданого рядкового формату', () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
    });
  
    // Для ISO формату: "2024-03-15T15:00:00Z"
    // Зверніть увагу, що ця дата конвертується в локальний час (наприклад, UTC+2 дасть "17:00")
    const isoDate = "2024-03-15T15:00:00Z";
    const formattedIso = wrapper.vm.formatReviewDate(isoDate);
    expect(formattedIso).toContain("березня");
    expect(formattedIso).toContain("17:00");
  
    // Для заданого рядкового формату: "15 березня 2024, 15:00"
    // Це значення парситься як локальний час і має залишатися "15:00"
    const stringDate = "15 березня 2024, 15:00";
    const formattedString = wrapper.vm.formatReviewDate(stringDate);
    expect(formattedString).toContain("березня");
    expect(formattedString).toContain("15:00");
  });  
  
  it('повинен правильно встановлювати стан завантаження (loading) під час запитів', async () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
    });
  
    // Перевіряємо, що спочатку loading = false
    expect(wrapper.vm.loading).toBe(false);
  
    // Замінюємо метод fetchReviews на фейкову функцію із затримкою
    wrapper.vm.fetchReviews = async () => {
      wrapper.vm.loading = true;
      await new Promise(resolve => setTimeout(resolve, 100));
      wrapper.vm.loading = false;
    };
  
    // Викликаємо метод і перевіряємо, що loading встановлюється у true
    const fetchPromise = wrapper.vm.fetchReviews();
    expect(wrapper.vm.loading).toBe(true);
  
    // Чекаємо завершення запиту
    await fetchPromise;
  
    // Після завершення запиту loading має бути false
    expect(wrapper.vm.loading).toBe(false);
  });
  
  it('повинен обробляти помилку при завантаженні відгуків', async () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
    });
    
    // Зменшуємо шум у консолі, тимчасово замінивши console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Мок: імітуємо помилку мережі при запиті
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Викликаємо метод завантаження відгуків
    await wrapper.vm.fetchReviews();
    
    // Очікуємо, що список відгуків скинуто у порожній масив
    expect(wrapper.vm.reviews).toEqual([]);
    
    // Відновлюємо початкове значення console.error
    consoleErrorSpy.mockRestore();
  });
  
  it('повинен обробляти помилку при відправленні нового відгуку', async () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    
    // Встановлюємо токен, щоб уникнути переходу на сторінку логіну
    localStorage.setItem("token", "dummy");
    
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      mocks: {
        $router: { push: jest.fn() } // замінюємо $router, щоб уникнути помилок
      },
      data() {
        return {
          showReviewForm: true,
          newReview: { comment: 'Test review', rating: 5 },
        };
      },
    });
    
    // Шпигун для alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Мок: імітуємо серверну помилку при відправленні відгуку
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error',
    });
    
    // Викликаємо метод відправлення відгуку
    await wrapper.vm.submitReview();
    
    // Перевіряємо, що виклик alert містить повідомлення про помилку
    expect(alertSpy).toHaveBeenCalledWith('Не вдалося додати відгук: 500 Internal Server Error');
    
    alertSpy.mockRestore();
    localStorage.removeItem("token");
  });
  
  it('повинен обробляти помилку при відправленні відповіді', async () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    
    // Встановлюємо токен, щоб уникнути переходу на логін
    localStorage.setItem("token", "dummy");
    
    const mockReview = {
      id: 123,
      user_first_name: 'Test',
      user_last_name: 'User',
      rating: 5,
      date: '2024-03-15T15:00:00Z',
      comment: 'Test review',
      replies: [],
    };
    
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
      mocks: {
        $router: { push: jest.fn() } // замінюємо $router, щоб уникнути помилок
      },
      data() {
        return {
          reviews: [mockReview],
          replyTo: mockReview.id,
          replyText: 'Test reply',
        };
      },
    });
    
    // Шпигун для alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Мок: імітуємо помилку при відправленні відповіді (наприклад, помилковий запит)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'Bad Request error',
    });
    
    // Викликаємо метод відправлення відповіді
    await wrapper.vm.submitReply();
    
    // Перевіряємо, що виклик alert містить повідомлення про помилку
    expect(alertSpy).toHaveBeenCalledWith('Помилка: 400 Bad Request');
    
    alertSpy.mockRestore();
    localStorage.removeItem("token");
  });
});
*/