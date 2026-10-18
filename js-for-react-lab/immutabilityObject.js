// 04. Spread и Rest: Иммутабельное обновление объектов
const initialUser = {
  id: 1,
  name: "Алексей",
  role: "Junior Developer",
};

const promotedUser = {
  ...initialUser,
  role: "Middle React Developer",
  updatedAt: Date.now(),
};

console.log("Ссылки равны?", initialUser === promotedUser);
console.log("Исходный объект остался цел:", initialUser.role);

const { id, role, ...displayData } = promotedUser;
console.log("Остаточные свойства (Rest):", displayData);
