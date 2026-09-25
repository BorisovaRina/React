const { products } = require("./array-lab.js");

const productTitles = products.map(item => item.title);
console.log("1. Названия товаров:", productTitles);

const productsWithDiscount = products.map(item => ({
  ...item,
  discountPrice: item.price * 0.85,
  formattedPrice: `${item.price.toLocaleString("ru-RU")} ₽`
}));
console.log("2. Товары со скидкой:", productsWithDiscount);

const mockJsxList = products.map((item, index) =>
  `<li key="${item.id}" data-index="${index}">${item.title} — ${item.price}₽</li>`
);
console.log("3. Эмуляция JSX:", mockJsxList[0]);