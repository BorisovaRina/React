
const { products } = require("./array-lab.js");

const getProductById = (list, id) => list.find(item => item.id === id);

const filterCatalog = (list, { category, onlyInStock = false }) => {
  return list.filter(item => {
    const matchesCategory = category ? item.category === category : true;
    const matchesStock = onlyInStock ? item.inStock : true;
    return matchesCategory && matchesStock;
  });
};

const updateProductPrice = (list, id, newPrice) => {
  return list.map(item =>
    item.id === id ? { ...item, price: newPrice } : item
  );
};

const activeAccessories = filterCatalog(products, {
  category: "accessories",
  onlyInStock: true
});

const updatedList = updateProductPrice(products, "p1", 7990);

console.log("Аксессуары в наличии:", activeAccessories.length); // 2 товара
console.log("Новая цена p1:", getProductById(updatedList, "p1")?.price); // 7990