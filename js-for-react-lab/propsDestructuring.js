// 03. Деструктуризация объектов и массивов
const incomingProps = {
  id: "btn-42",
  label: "Оформить заказ",
  variant: "success",
  config: { timeout: 3000 },
};

function renderButtonProps({
  label,
  variant = "primary",
  config: { timeout },
}) {
  console.log(`Кнопка: "${label}" | Стиль: ${variant} | Таймаут: ${timeout}`);
}

function mockUseState(initialValue) {
  let val = initialValue;
  const setter = (newVal) => {
    val = newVal;
  };
  return [val, setter];
}

renderButtonProps(incomingProps);
const [currentCount, setCount] = mockUseState(10);
console.log("Начальный счетчик:", currentCount);
