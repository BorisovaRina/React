const { products } = require("./array-lab.js");

const inStockOnly = products.filter(item => item.inStock);
console.log(`1. В наличии товаров: ${inStockOnly.length}`);

const affordableAccessories = products.filter(
  item => item.category === "accessories" && item.price < 6000
);
console.log("2. Бюджетные аксессуары:", affordableAccessories);

const idToDelete = "p3";
const remainingProducts = products.filter(item => item.id !== idToDelete);
console.log("3. Товары после удаления p3:", remainingProducts.length); 