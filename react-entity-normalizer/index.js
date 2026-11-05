/**
 * Преобразует плоский массив в нормализованную структуру.
 * @param {Array<{ id: string }>} array
 * @returns {{ byId: Record<string, Object>, allIds: string[] }}
 */
export function normalizeEntities(array) {
  if (!Array.isArray(array)) {
    throw new TypeError("Входной параметр должен быть массивом");
  }

  return {
    byId: Object.fromEntries(array.map((item) => [item.id, { ...item }])),
    allIds: array.map((item) => item.id),
  };
}

/**
 * Точечно обновляет поля сущности за O(1) с сохранением ссылочной целостности.
 * @param {Object} state - Нормализованный стейт
 * @param {string} id - ID обновляемой сущности
 * @param {Object} patch - Объект с новыми полями
 */
export function patchEntityById(state, id, patch) {
  const currentEntity = state.byId[id];

  if (!currentEntity) {
    console.warn(`Сущность с ID "${id}" не найдена.`);
    return state;
  }

  return {
    ...state,
    byId: {
      ...state.byId,
      [id]: {
        ...currentEntity,
        ...patch,
        updatedAt: Date.now(),
      },
    },
  };
}

/**
 * Удаляет сущность из словаря и индексного массива за O(1) / O(N).
 * @param {Object} state
 * @param {string} idToDelete
 */
export function removeEntityById(state, idToDelete) {
  if (!state.byId[idToDelete]) {
    return state;
  }

  const { [idToDelete]: removed, ...remainingById } = state.byId;

  return {
    byId: remainingById,
    allIds: state.allIds.filter((id) => id !== idToDelete),
  };
}

// ==========================================
// Блок демонстрации и верификации
// ==========================================
console.log("=== ТЕСТИРОВАНИЕ РЕШЕНИЯ ЗАДАЧИ №24 ===");

const rawData = [
  { id: "usr_101", name: "Алексей", status: "active" },
  { id: "usr_102", name: "Мария", status: "pending" },
];

const normalizedState = normalizeEntities(rawData);
console.log("1. Нормализованное состояние:", JSON.stringify(normalizedState, null, 2));

const nextState = patchEntityById(normalizedState, "usr_102", { status: "active" });
console.log("\n2. Состояние после точечного патча usr_102:", JSON.stringify(nextState, null, 2));

console.log("\n3. Проверка ссылочной целостности (иммутабельность):");
console.log("Корень изменился (рендер в React):", normalizedState !== nextState);
console.log("Целевая сущность usr_102 обновлена:", normalizedState.byId["usr_102"] !== nextState.byId["usr_102"]);
console.log("Соседняя ветка usr_101 сохранила ссылку:", normalizedState.byId["usr_101"] === nextState.byId["usr_101"]);
console.log("Порядок allIds сохранил ссылку:", normalizedState.allIds === nextState.allIds);