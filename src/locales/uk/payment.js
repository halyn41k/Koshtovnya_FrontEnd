// locales/uk.js
export default {
  payment: {
        itemsTotal: 'Сума товарів',

freeDeliveryHintStyled: '💡 Безкоштовна доставка при замовленні від {thresholdText}',
    freeDeliveryEligibleStyled: '🎉 У вас безкоштовна доставка! Замовлення від {thresholdText}',
    paymentTitle: 'Оплата',
    title: 'Сума до оплати',
    delivery: 'Доставка',
    courier: 'Кур\'єр',
    total: 'Загальна сума',
    submit: 'Оформити замовлення',
    tooltip: 'Заповніть усі кроки оформлення',
    deliveryMethod: 'Спосіб доставки',
    selectDeliveryMethod: 'Оберіть спосіб доставки',
    city: 'Місто',
    enterCity: 'Введіть місто',
    street: 'Вулиця',
    enterStreet: 'Введіть вулицю',
    houseNumber: 'Номер будинку',
    houseNumberPlaceholder: 'Номер будинку',
    warehouse: 'Відділення',
    postomat: 'Поштомат',
    selectWarehouse: 'Оберіть відділення',
    storeCity: 'Коломия',
    address: 'Адреса',
    storeAddress: 'вул. Степана Бандери 22',


    steps: {
      personalInfo: 'Особиста інформація',
      delivery: 'Поштове відділення',
      payment: 'Оплата',
      next: 'Далі',
      finish: 'Завершити',
    },
    fields: {
      
      firstName: {
        label: "Ім'я",
        placeholder: "Введіть ім'я"
      },
      lastName: {
        label: 'Прізвище',
        placeholder: 'Введіть прізвище'
      },
      secondName: {
        label: 'По батькові',
        placeholder: 'Введіть по батькові'
      },
      phone: {
        label: 'Телефон',
        placeholder: 'Введіть номер телефону'
      }
    },
    fieldsValid: {
     "firstName":   { "label": "Ім'я" },
      "lastName":    { "label": "Прізвище" },
      "secondName":  { "label": "По батькові" },
      "phone":       { "label": "Номер телефону" },
      "deliveryType":{ "label": "Спосіб доставки" },
      "city":        { "label": "Місто" },
      "street":      { "label": "Вулиця" },
      "houseNumber": { "label": "Номер будинку" },
      "warehouse":   { "label": "Відділення" }
      
    },
    methodsTitle: 'Спосіб оплати',
    paymentOptions: {
      postPayment: 'Післяоплата',
      cardPayment: 'Оплата картою'
    },
    cardTypeLabel: 'Тип картки',
    cardTypePlaceholder: 'Оберіть тип картки',
    
    errors: {
            "required": "Поле «{fieldsValid}» обов'язкове",
            invalid:  "Неправильний формат поля «{fieldsValid}»",
      "select": "Оберіть «{fieldsValid}»",
      "enter": "Введіть «{fieldsValid}»",
      paymentMethodRequired: 'Оберіть спосіб оплати',
      cardTypeRequired: 'Оберіть тип картки'
    },
    
     paymentConfirmed: {
    header: 'Оплата підтверджена',
    message1: 'Ви успішно здійснили оплату. Зачекайте, будь ласка, вас перенаправляють...',
    message2: 'Якщо перенаправлення не відбулося, перейдіть за посиланням',
    orderHistoryLink: 'Історія замовлень'
  },
   "orderReview": {
      "title": "Будь ласка, перегляньте товари перед оформленням замовлення",
      "unit": "шт.",
      "quantityLabel": "Кількість",
      "emptyCart": "Ваш кошик порожній"
    },
   orderSummary: {
    header: 'Підсумкова інформація',
    userLabel: 'Ім’я користувача',
    phoneLabel: 'Телефон',
    deliveryDetails: 'Деталі доставки',
    cityLabel: 'Місто',
    streetLabel: 'Вулиця та номер',
    deliveryTypeLabel: 'Спосіб доставки',
    warehouseLabel: 'Відділення',
    notProvided: 'Не вказано'
  }
  }
};
