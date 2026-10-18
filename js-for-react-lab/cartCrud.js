// 05. Иммутабельные операции с массивами (.map, .filter, .reduce)
const initialCart = [
  { id: 1, name: "Клавиатура", price: 4000, quantity: 1 },
  { id: 2, name: "Мышь", price: 2500, quantity: 2 },
  { id: 3, name: "Коврик", price: 1000, quantity: 1 },
];

// А. Добавление (Spread в новый массив)
const newItem = { id: 4, name: "Наушники", price: 6000, quantity: 1 };
const cartAfterAdd = [...initialCart, newItem];

// Б. Удаление (.filter() по ID)
const removeId = 2;
const cartAfterDelete = cartAfterAdd.filter((item) => item.id !== removeId);

// В. Изменение (.map() с проверкой ID)
const targetId = 1;
const cartAfterUpdate = cartAfterDelete.map((item) =>
  item.id === targetId ? { ...item, quantity: item.quantity + 1 } : item,
);

// Г. Подсчет итога (.reduce())
const totalPrice = cartAfterUpdate.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0,
);

console.log("Итоговая корзина:", cartAfterUpdate);
console.log(`Общая сумма: ${totalPrice} руб.`);
