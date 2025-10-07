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
        const response = await fetch(`https://unlucky-cobra-77.loca.lt/api/products?${query.toString()}`);
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
            <td data-label="">
                <input type="number" id="quantityTons-${product.id}" step="${product.avgTubeWeight}" min="0" placeholder="Тонны (шаг ${product.avgTubeWeight})">
                <input type="number" id="quantityMeters-${product.id}" step="${product.avgTubeLength}" min="0" placeholder="Метры (шаг ${product.avgTubeLength})">
                <button onclick="addToCart('${product.id}', '${product.stockID}', '${product.name.replace(/'/g, "\\'")}', '${product.stockCity.replace(/'/g, "\\'")}')">Добавить</button>
            </td>
        </tr>`;
    });
    html += '</table>';
    productsDiv.innerHTML = html;
}

async function addToCart(nomenclatureID, stockID, name, stockCity) {
    const quantityTonsInput = document.getElementById(`quantityTons-${nomenclatureID}`);
    const quantityMetersInput = document.getElementById(`quantityMeters-${nomenclatureID}`);
    const quantityTons = parseFloat(quantityTonsInput.value) || 0;
    const quantityMeters = parseFloat(quantityMetersInput.value) || 0;

    if (quantityTons === 0 && quantityMeters === 0) {
        document.getElementById('error').textContent = 'Укажите количество в тоннах или метрах.';
        return;
    }

    if (quantityTons < 0 || quantityMeters < 0) {
        document.getElementById('error').textContent = 'Количество не может быть отрицательным.';
        return;
    }

    const cartItem = {
        NomenclatureID: nomenclatureID,
        StockID: stockID,
        QuantityTons: quantityTons,
        QuantityMeters: quantityMeters,
        Price: 0
    };

    try {
        const response = await fetch('https://unlucky-cobra-77.loca.lt/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartItem)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка добавления в корзину: ${errorText}`);
        }
        const result = await response.json();
        console.log('Ответ сервера /api/cart:', result); // Логирование ответа сервера
        // Убедимся, что свойства соответствуют модели CartItem
        const normalizedItem = {
            NomenclatureID: result.NomenclatureID || result.nomenclatureID || nomenclatureID,
            StockID: result.StockID || result.stockID || stockID,
            QuantityTons: result.QuantityTons || result.quantityTons || quantityTons,
            QuantityMeters: result.QuantityMeters || result.quantityMeters || quantityMeters,
            Price: result.Price || result.price || 0,
            Name: name, // Добавляем Name
            StockCity: stockCity // Добавляем StockCity
        };
        cart.push(normalizedItem);
        displayCart();
        document.getElementById('orderButton').style.display = 'block';
        document.getElementById('error').textContent = '';
        quantityTonsInput.value = '';
        quantityMetersInput.value = '';
    } catch (error) {
        console.error('Ошибка в addToCart:', error);
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
    cart.forEach((item, index) => {
        // Проверяем, что свойства определены, или используем значение по умолчанию
        const name = item.Name || 'Неизвестный товар';
        const stockCity = item.StockCity || 'Неизвестный склад';
        const quantityTons = item.QuantityTons || 0;
        const quantityMeters = item.QuantityMeters || 0;
        const price = item.Price || 0;

        html += `<tr>
            <td data-label="Товар">${name}</td>
            <td data-label="Склад">${stockCity}</td>
            <td data-label="Количество (т)">${quantityTons}</td>
            <td data-label="Количество (м)">${quantityMeters}</td>
            <td data-label="Цена">${price}</td>
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
        items: cart.map(item => ({
            NomenclatureID: item.NomenclatureID,
            StockID: item.StockID,
            QuantityTons: item.QuantityTons,
            QuantityMeters: item.QuantityMeters,
            Price: item.Price
        })) // Убираем Name и StockCity из отправляемых данных, так как сервер ожидает только поля CartItem
    };

    try {
        const response = await fetch('https://unlucky-cobra-77.loca.lt/api/orders', {
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