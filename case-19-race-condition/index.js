/**
 * Эмуляция сетевого запроса с настраиваемой задержкой
 */
function mockSearchApi(query, delayMs, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve({ query, results: [`Результат 1 для "${query}"`, `Результат 2 для "${query}"`] });
    }, delayMs);

    // Если сигнал уже отменен или отменяется во время ожидания:
    if (signal?.aborted) {
      clearTimeout(timer);
      reject(new DOMException("Запрос отменен", "AbortError"));
    }

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Запрос отменен", "AbortError"));
    });
  });
}

/**
 * Сервис поиска с отменой предыдущих запросов
 */
function createSearchService() {
  let activeAbortController = null;

  return async function search(query, mockDelay) {
    // 1. Отменяем предыдущий активный запрос
    if (activeAbortController) {
      activeAbortController.abort();
    }

    // 2. Создаем новый контроллер для текущего запроса
    activeAbortController = new AbortController();
    const { signal } = activeAbortController;

    try {
      console.log(`[HTTP Request] Отправлен запрос: "${query}" (Ожидаемая задержка: ${mockDelay}мс)`);
      const response = await mockSearchApi(query, mockDelay, signal);
      
      activeAbortController = null;
      return response;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log(`[ABORTED] Запрос для "${query}" успешно отменен более новым запросом.`);
        return null;
      }
      activeAbortController = null;
      throw error;
    }
  };
}

// ==========================================
// Сценарий воспроизведения и предотвращения Race Condition
// ==========================================
async function runRaceConditionSimulation() {
  console.log("=== ЭМУЛЯЦИЯ ПОИСКА: ПРЕДОТВРАЩЕНИЕ RACE CONDITION ===\n");

  const search = createSearchService();

  // 1. Пользователь начал вводить "rea" (запрос медленный, 1000мс)
  const slowRequest = search("rea", 1000).then((data) => {
    if (data) console.log(`\n>>> [UI UPDATE]: Экран обновлен данными для "${data.query}"`);
  });

  // 2. Спустя 200мс пользователь дописал "react" (запрос быстрый из кэша, 300мс)
  setTimeout(() => {
    search("react", 300).then((data) => {
      if (data) console.log(`\n>>> [UI UPDATE]: Экран обновлен актуальными данными для "${data.query}"`);
    });
  }, 200);
}

runRaceConditionSimulation();