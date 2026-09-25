const { products } = require("./array-lab.js");

const targetId = "p4";
const foundProduct = products.find(item => item.id === targetId);

console.log(`Найден: ${foundProduct?.title ?? "Товар не найден"}`);

const topRated = products.find(item => item.rating >= 4.9);
console.log("Топ товар:", topRated?.title); 

const missing = products.find(item => item.id === "p999");
console.log("Результат поиска несуществующего:", missing); 