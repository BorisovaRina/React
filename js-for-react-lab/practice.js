// ========================================================
// 02. Стрелочные функции и неявный возврат объектов
// ========================================================
const formatCurrency = (amount, currency = "RUB") =>
  `${amount.toLocaleString("ru-RU")} ${currency}`;

// Круглые скобки ({ ... }) обязательны, чтобы вернуть объект, а не блок кода
const createProduct = (id, title, price) => ({
  id,
  title,
  price,
  formattedPrice: formatCurrency(price),
  inStock: true,
});

console.log("=== 02. Стрелочные функции ===");
console.log(formatCurrency(150000)); // "150 000 RUB"
console.log(createProduct(101, "MacBook Air M3", 125000));
console.log();

// ========================================================
// 03. Деструктуризация объектов и массивов
// ========================================================
const incomingProps = {
  id: "btn-42",
  label: "Оформить заказ",
  variant: "success",
  config: { timeout: 3000 },
};

// Извлечение полей с дефолтным значением и вложенной деструктуризацией
function renderButtonProps({
  label,
  variant = "primary",
  config: { timeout },
}) {
  console.log(`Кнопка: "${label}" | Стиль: ${variant} | Таймаут: ${timeout}`);
}

// Эмуляция хука useState через кортеж [значение, сеттер]
function mockUseState(initialValue) {
  let val = initialValue;
  const setter = (newVal) => {
    val = newVal;
  };
  return [val, setter];
}

console.log("=== 03. Деструктуризация ===");
renderButtonProps(incomingProps);
const [currentCount, setCount] = mockUseState(10);
console.log("Начальный счетчик:", currentCount); // 10
console.log();

// ========================================================
// 04. Spread и Rest: Иммутабельное обновление объектов
// ========================================================
const initialUser = {
  id: 1,
  name: "Алексей",
  role: "Junior Developer",
};

// 1. Создание нового объекта без мутации исходного через Spread
const promotedUser = {
  ...initialUser,
  role: "Middle React Developer",
  updatedAt: Date.now(),
};

console.log("=== 04. Spread и Rest ===");
console.log("Ссылки равны?", initialUser === promotedUser); // false (React фиксирует изменение)
console.log("Исходный объект остался цел:", initialUser.role); // "Junior Developer"

// 2. Сбор остаточных пропсов через Rest
const { id, role, ...displayData } = promotedUser;
console.log("Остаточные свойства (Rest):", displayData);
console.log();

// ========================================================
// 05. Иммутабельные операции с массивами (.map, .filter, .reduce)
// ========================================================
const initialCart = [
  { id: 1, name: "Клавиатура", price: 4000, quantity: 1 },
  { id: 2, name: "Мышь", price: 2500, quantity: 2 },
  { id: 3, name: "Коврик", price: 1000, quantity: 1 },
];

// А. ДОБАВЛЕНИЕ (Add) -> Spread в новый массив
const newItem = { id: 4, name: "Наушники", price: 6000, quantity: 1 };
const cartAfterAdd = [...initialCart, newItem];

// Б. УДАЛЕНИЕ (Delete) -> .filter() по ID
const removeId = 2;
const cartAfterDelete = cartAfterAdd.filter((item) => item.id !== removeId);

// В. ИЗМЕНЕНИЕ (Update) -> .map() с проверкой ID
const targetId = 1;
const cartAfterUpdate = cartAfterDelete.map((item) =>
  item.id === targetId ? { ...item, quantity: item.quantity + 1 } : item,
);

// Г. ПОДСЧЕТ ИТОГА (Compute total) -> .reduce()
const totalPrice = cartAfterUpdate.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0,
);

console.log("=== 05. CRUD корзины товаров ===");
console.log("Итоговая корзина:", cartAfterUpdate);
console.log(`Общая сумма: ${totalPrice} руб.`); // 15 000 руб.
