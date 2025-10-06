let cart = [];

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Заполнение полей формы заказа данными из Telegram
if (tg.initDataUnsafe.user) {
    document.getElementById('firstName').value = tg.initDataUnsafe.user.first_name || '';
    document.getElementById('lastName').value = tg.initDataUnsafe.user.last_name || '';
}

async function fetchProducts() {
    const stock = document.getElementById('stock').value;
    const type = document.getElementById('type').value;
    const diameter = document.getElementById('diameter').value;
    const wallThickness = document.getElementById('wallThickness').value;
    const gost = document.getElementById('gost').value;
    const steelGrade = document.getElementById('steelGrade').value;

    const query = new URLSearchParams();
    if (stock) query.append('stock', stock);
    if (type) query.append('type', type);
    if (diameter) query.append('diameter', diameter);
    if (wallThickness) query.append('wallThickness', wallThickness);
    if (gost) query.append('gost', gost);
    if (steelGrade) query.append('steelGrade', steelGrade);

    try {
        const response = await fetch(`https://djltc-92-248-141-134.a.free.pinggy.link/api/products?${query.toString()}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const products = await response.json();
        displayProducts(products);
        document.getElementById('error').textContent = '';
    } catch (error) {
        document.getElementById('error').textContent = error.message;
        document.getElementById('products').innerHTML = '';
    }
}

function displayProducts(products) {
    const productsDiv = document.getElementById('products');
    if (products.length === 0) {
        productsDiv.innerHTML = '<p>Товары не найдены.</p>';
        return;
    }

    let html = '<table>';
    // Убрали шапку таблицы полностью, так как она не нужна
    products.forEach(product => {
        html += `<tr>
            <td data-label="Название">${product.name}</td>
            <td data-label="ГОСТ">${product.gost}</td>
            <td data-label="Марка стали">${product.steelGrade}</td>
            <td data-label="Диаметр (мм)">${product.diameter}</td>
            <td data-label="Толщина стенки (мм)">${product.pipeWallThickness}</td>
            <td data-label="Тип">${product.typeName}</td>
            <td data-label="Склад">${product.stockCity}</td>
            <td data-label="Цена (т)">${product.priceT}</td>
            <td data-label="В наличии (т)">${product.inStockT}</td>
            <td data-label="">  <!-- Убрали текст "Добавить" из data-label -->
                <input type="number" id="quantityTons-${product.id}" step="0.01" min="0" placeholder="Тонны">
                <input type="number" id="quantityMeters-${product.id}" step="0.01" min="0" placeholder="Метры">
                <button onclick="addToCart('${product.id}', '${product.stockCity}')">Добавить</button>
            </td>
        </tr>`;
    });
    html += '</table>';
    productsDiv.innerHTML = html;
}

async function addToCart(nomenclatureID, stockID) {
    const quantityTons = parseFloat(document.getElementById(`quantityTons-${nomenclatureID}`).value) || 0;
    const quantityMeters = parseFloat(document.getElementById(`quantityMeters-${nomenclatureID}`).value) || 0;

    if (quantityTons === 0 && quantityMeters === 0) {
        document.getElementById('error').textContent = 'Укажите количество в тоннах или метрах.';
        return;
    }

    const cartItem = {
        nomenclatureID,
        stockID,
        quantityTons,
        quantityMeters
    };

    try {
        const response = await fetch('https://djltc-92-248-141-134.a.free.pinggy.link/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartItem)
        });
        if (!response.ok) throw new Error('Ошибка добавления в корзину');
        const result = await response.json();
        cart.push(result);
        displayCart();
        document.getElementById('orderButton').style.display = 'block';
        document.getElementById('error').textContent = '';
    } catch (error) {
        document.getElementById('error').textContent = error.message;
    }
}

function displayCart() {
    const cartDiv = document.getElementById('cart');
    if (cart.length === 0) {
        cartDiv.innerHTML = '<p>Корзина пуста.</p>';
        return;
    }

    let html = '<table>';
    html += '<tr><th>Товар</th><th>Склад</th><th>Количество (т)</th><th>Количество (м)</th><th>Цена</th><th>Удалить</th></tr>';
    cart.forEach((item, index) => {
        html += `<tr>
            <td data-label="Товар">${item.nomenclatureID}</td>
            <td data-label="Склад">${item.stockID}</td>
            <td data-label="Количество (т)">${item.quantityTons}</td>
            <td data-label="Количество (м)">${item.quantityMeters}</td>
            <td data-label="Цена">${item.price}</td>
            <td data-label="Удалить"><button onclick="removeFromCart(${index})">Удалить</button></td>
        </tr>`;
    });
    html += '</table>';
    cartDiv.innerHTML = html;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
    if (cart.length === 0) {
        document.getElementById('orderButton').style.display = 'none';
    }
}

function showOrderForm() {
    document.getElementById('orderForm').style.display = 'block';
}

async function submitOrder() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const inn = document.getElementById('inn').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    const order = {
        firstName,
        lastName,
        inn,
        phone,
        email,
        items: cart
    };

    try {
        const response = await fetch('https://djltc-92-248-141-134.a.free.pinggy.link/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        if (!response.ok) throw new Error('Ошибка оформления заказа');
        const result = await response.json();
        document.getElementById('error').textContent = '';
        alert('Заказ успешно оформлен!');
        cart = [];
        displayCart();
        document.getElementById('orderButton').style.display = 'none';
        document.getElementById('orderForm').style.display = 'none';
        tg.close();
    } catch (error) {
        document.getElementById('error').textContent = error.message;
    }
}