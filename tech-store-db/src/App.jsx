import React, { useState } from "react";

// ==========================================
// 1. СЛОЙ KV (Key-Value Storage - Рекомендации O(1))
// ==========================================
const KEY_VALUE_RECOMMENDATIONS = {
    101: [201, 202], // Смартфон -> Чехол, Защитное стекло
    102: [203, 204], // Ноутбук -> Беспроводная мышь, Сумка для ноутбука
    103: [205],      // Планшет -> Стилус
};

// ==========================================
// 2. ИСХОДНЫЕ ДАННЫЕ OLTP (Реляционный склад и товары)
// ==========================================
const INITIAL_PRODUCTS = [
    { id: 101, name: "Смартфон Pro Max", price: 80000, cost: 55000, stock: 12, category: "main" },
    { id: 102, name: "Игровой ноутбук 15\"", price: 120000, cost: 90000, stock: 5, category: "main" },
    { id: 103, name: "Планшет Air 10\"", price: 45000, cost: 32000, stock: 8, category: "main" },
    { id: 201, name: "Чехол силиконовый", price: 1500, cost: 300, stock: 45, category: "accessory" },
    { id: 202, name: "Стекло защитное 9H", price: 1000, cost: 150, stock: 60, category: "accessory" },
    { id: 203, name: "Мышь беспроводная", price: 3500, cost: 1800, stock: 20, category: "accessory" },
    { id: 204, name: "Рюкзак для ноутбука", price: 5000, cost: 2200, stock: 14, category: "accessory" },
    { id: 205, name: "Стилус емкостный", price: 6000, cost: 3500, stock: 10, category: "accessory" },
];

const INITIAL_ORDERS = [
    { id: "ORD-901", customerId: "CUST-1", customerName: "Иван С.", cohort: "2024-01", date: "2024-01-15", total: 81500, costTotal: 55300, items: ["Смартфон Pro Max", "Чехол силиконовый"] },
    { id: "ORD-902", customerId: "CUST-2", customerName: "Ольга М.", cohort: "2024-01", date: "2024-02-10", total: 125000, costTotal: 92200, items: ["Игровой ноутбук 15\"", "Рюкзак для ноутбука"] },
    { id: "ORD-903", customerId: "CUST-1", customerName: "Иван С.", cohort: "2024-01", date: "2024-03-01", total: 3500, costTotal: 1800, items: ["Мышь беспроводная"] },
    { id: "ORD-904", customerId: "CUST-3", customerName: "Артем Д.", cohort: "2024-02", date: "2024-02-18", total: 51000, costTotal: 35500, items: ["Планшет Air 10\"", "Стилус емкостный"] },
];

export default function App() {
    const [activeTab, setActiveTab] = useState("oltp"); // 'oltp' | 'dwh' | 'kv'
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [cart, setCart] = useState([]);
    const [selectedMainProduct, setSelectedMainProduct] = useState(101);

    // OLTP: Добавление в корзину
    const addToCart = (productId) => {
        const product = products.find((p) => p.id === productId);
        if (!product || product.stock <= 0) return;

        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === productId);
            if (existing) {
                if (existing.qty >= product.stock) return prevCart;
                return prevCart.map((item) => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prevCart, { ...product, qty: 1 }];
        });
    };

    // OLTP: Транзакция оформления заказа со списанием остатков
    const checkoutOrder = () => {
        if (cart.length === 0) return;

        // Списание со склада
        const updatedProducts = products.map((prod) => {
            const cartItem = cart.find((item) => item.id === prod.id);
            if (cartItem) {
                return { ...prod, stock: prod.stock - cartItem.qty };
            }
            return prod;
        });

        const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
        const costTotal = cart.reduce((acc, item) => acc + item.cost * item.qty, 0);

        const newOrder = {
            id: `ORD-${Date.now().toString().slice(-4)}`,
            customerId: "CUST-1",
            customerName: "Иван С. (Текущий)",
            cohort: "2024-01",
            date: new Date().toISOString().split("T")[0],
            total,
            costTotal,
            items: cart.map((i) => `${i.name} (x${i.qty})`),
        };

        setProducts(updatedProducts);
        setOrders([newOrder, ...orders]);
        setCart([]);
    };

    // DWH: Расчет маржи и LTV
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalCost = orders.reduce((acc, o) => acc + o.costTotal, 0);
    const totalMargin = totalRevenue - totalCost;
    const marginPercentage = ((totalMargin / totalRevenue) * 100).toFixed(1);

    // DWH: Группировка LTV по клиентам
    const ltvReport = orders.reduce((acc, order) => {
        if (!acc[order.customerId]) {
            acc[order.customerId] = { name: order.customerName, totalSpent: 0, ordersCount: 0 };
        }
        acc[order.customerId].totalSpent += order.total;
        acc[order.customerId].ordersCount += 1;
        return acc;
    }, {});

    // DWH: Когортный анализ (выручка по когортам регистрации)
    const cohortReport = orders.reduce((acc, order) => {
        acc[order.cohort] = (acc[order.cohort] || 0) + order.total;
        return acc;
    }, {});

    // KV: Выборка сопутствующих товаров по ключу O(1)
    const relatedProductIds = KEY_VALUE_RECOMMENDATIONS[selectedMainProduct] || [];
    const recommendedItems = products.filter((p) => relatedProductIds.includes(p.id));

    return (
        <div style={{ fontFamily: "Segoe UI, sans-serif", padding: "24px", maxWidth: "1100px", margin: "0 auto", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <header style={{ marginBottom: "20px" }}>
                <h1 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>Архитектура БД: Интернет-магазин техники</h1>
                <p style={{ margin: 0, color: "#475569" }}>Моделирование трех контуров данных: Транзакционный (OLTP), Аналитический (DWH), Быстрый доступ (Key-Value).</p>
            </header>

            {/* Навигация по слоям */}
            <nav style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                {[
                    { key: "oltp", label: "1. OLTP (Корзина, Заказы, Склад)" },
                    { key: "dwh", label: "2. DWH (Когорты, LTV, Маржа)" },
                    { key: "kv", label: "3. КВ (Рекомендации O(1))" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: "10px 18px",
                            cursor: "pointer",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: activeTab === tab.key ? "#2563eb" : "#ffffff",
                            color: activeTab === tab.key ? "#ffffff" : "#334155",
                            fontWeight: 600,
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Вкладка 1: OLTP */}
            {activeTab === "oltp" && (
                <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
                    <div>
                        <div style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                            <h3 style={{ marginTop: 0 }}>Складские остатки и каталог (OLTP Products)</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                        <th style={{ padding: "8px" }}>Товар</th>
                                        <th>Цена</th>
                                        <th>Остаток</th>
                                        <th>Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => (
                                        <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "8px" }}>{p.name}</td>
                                            <td>{p.price.toLocaleString()} ₽</td>
                                            <td style={{ color: p.stock < 5 ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>{p.stock} шт.</td>
                                            <td>
                                                <button
                                                    disabled={p.stock <= 0}
                                                    onClick={() => addToCart(p.id)}
                                                    style={{ padding: "4px 10px", backgroundColor: p.stock > 0 ? "#0284c7" : "#94a3b8", color: "#fff", border: "none", borderRadius: "4px", cursor: p.stock > 0 ? "pointer" : "not-allowed" }}
                                                >
                                                    В корзину
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ marginTop: 0 }}>Транзакционный журнал заказов (OLTP Orders)</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
                                {orders.map((o) => (
                                    <div key={o.id} style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px" }}>
                                        <strong>{o.id}</strong> — {o.customerName} ({o.date}) | <b>{o.total.toLocaleString()} ₽</b>
                                        <div style={{ color: "#64748b" }}>Состав: {o.items.join(", ")}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ marginTop: 0 }}>Текущая транзакция: Корзина</h3>
                            {cart.length === 0 ? (
                                <p style={{ color: "#94a3b8" }}>Корзина пуста. Добавьте товары из каталога.</p>
                            ) : (
                                <>
                                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
                                        {cart.map((item) => (
                                            <li key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                                <span>{item.name} × {item.qty}</span>
                                                <b>{(item.price * item.qty).toLocaleString()} ₽</b>
                                            </li>
                                        ))}
                                    </ul>
                                    <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "10px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                                        <span>Итого:</span>
                                        <strong style={{ fontSize: "18px", color: "#0f172a" }}>
                                            {cart.reduce((sum, i) => sum + i.price * i.qty, 0).toLocaleString()} ₽
                                        </strong>
                                    </div>
                                    <button
                                        onClick={checkoutOrder}
                                        style={{ width: "100%", padding: "12px", backgroundColor: "#16a34a", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}
                                    >
                                        Оформить заказ (Списать остатки)
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Вкладка 2: DWH */}
            {activeTab === "dwh" && (
                <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Витрина агрегатов маржинальности */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                        <div style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ color: "#64748b", fontSize: "13px" }}>Общая выручка (DWH Revenue)</div>
                            <h2 style={{ margin: "6px 0 0 0", color: "#0f172a" }}>{totalRevenue.toLocaleString()} ₽</h2>
                        </div>
                        <div style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ color: "#64748b", fontSize: "13px" }}>Себестоимость товаров (COGS)</div>
                            <h2 style={{ margin: "6px 0 0 0", color: "#dc2626" }}>{totalCost.toLocaleString()} ₽</h2>
                        </div>
                        <div style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ color: "#64748b", fontSize: "13px" }}>Валовая маржа (Margin)</div>
                            <h2 style={{ margin: "6px 0 0 0", color: "#16a34a" }}>{totalMargin.toLocaleString()} ₽ ({marginPercentage}%)</h2>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {/* LTV Отчет */}
                        <div style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ marginTop: 0 }}>Аналитическая витрина: LTV покупателей</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                        <th style={{ padding: "8px" }}>Клиент</th>
                                        <th>Заказов</th>
                                        <th>LTV (Всего покупок)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(ltvReport).map(([id, info]) => (
                                        <tr key={id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "8px" }}>{info.name}</td>
                                            <td>{info.ordersCount}</td>
                                            <td style={{ fontWeight: "bold" }}>{info.totalSpent.toLocaleString()} ₽</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Когортный отчет */}
                        <div style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ marginTop: 0 }}>Когортный анализ (По месяцу первой покупки)</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                        <th style={{ padding: "8px" }}>Когорта</th>
                                        <th>Выручка когорты</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(cohortReport).map(([cohort, sum]) => (
                                        <tr key={cohort} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "8px" }}>Когорта {cohort}</td>
                                            <td style={{ fontWeight: "bold" }}>{sum.toLocaleString()} ₽</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {/* Вкладка 3: Key-Value */}
            {activeTab === "kv" && (
                <section style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ marginTop: 0 }}>КВ-хранилище (Key-Value Cache): Рекомендации сопутствующих товаров</h3>
                    <p style={{ color: "#475569", fontSize: "14px" }}>
                        Эмуляция Redis-кэша со сложностью $O(1)$. Ключом выступает <code>productId</code> основного устройства, значением — массив <code>ID</code> аксессуаров.
                    </p>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: 600, marginRight: "12px" }}>Выберите просматриваемый товар (Ключ в KV):</label>
                        <select
                            value={selectedMainProduct}
                            onChange={(e) => setSelectedMainProduct(Number(e.target.value))}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        >
                            <option value={101}>ID 101: Смартфон Pro Max</option>
                            <option value={102}>ID 102: Игровой ноутбук 15"</option>
                            <option value={103}>ID 103: Планшет Air 10"</option>
                        </select>
                    </div>

                    <div style={{ backgroundColor: "#f1f5f9", padding: "14px", borderRadius: "6px", fontFamily: "Consolas, monospace", fontSize: "13px", marginBottom: "20px" }}>
                        GET recommendations:{selectedMainProduct} {"->"} <b>{JSON.stringify(relatedProductIds)}</b>
                    </div>

                    <h4>Рекомендованные сопутствующие аксессуары (Выгрузка из каталога):</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
                        {recommendedItems.map((item) => (
                            <div key={item.id} style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "14px", backgroundColor: "#fff" }}>
                                <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.name}</div>
                                <div style={{ color: "#0284c7", fontWeight: "bold" }}>{item.price.toLocaleString()} ₽</div>
                                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "6px" }}>Остаток на складе: {item.stock} шт.</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}