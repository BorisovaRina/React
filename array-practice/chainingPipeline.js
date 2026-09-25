const { products } = require("./array-lab.js");

const showcaseProducts = products
  .filter(item => item.inStock && item.rating >= 4.5)
  .map(item => ({
    badge: "🔥 Хит",
    displayName: `${item.title} (${item.rating})`,
    finalPrice: `${item.price.toLocaleString("ru-RU")} ₽`
  }));

console.log("Витрина хитов:", showcaseProducts);