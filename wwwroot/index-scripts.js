document.addEventListener('DOMContentLoaded', () => {
    const cartSection = document.querySelector('.cart-section');
    const filterSection = document.querySelector('.filter-section');
    const binButton = document.querySelector('.bin-button');
    const filterButton = document.querySelector('.filter-button');
    const searchInput = document.getElementById('search');
    const searchIcon = document.querySelector('.search-icon');
    const resultsInfo = document.createElement('div');
    resultsInfo.className = 'results-info';
    resultsInfo.style.display = 'none';
    document.querySelector('.search-bar').after(resultsInfo);

    // Скрываем корзину и фильтры по умолчанию
    cartSection.style.display = 'none';
    filterSection.style.display = 'none';

    // Логика кнопки корзины
    binButton.addEventListener('click', () => {
        cartSection.style.display = cartSection.style.display === 'none' ? 'block' : 'none';
        if (cartSection.style.display === 'none') {
            filterSection.style.display = 'none';
        }
    });

    // Логика кнопки фильтров
    filterButton.addEventListener('click', () => {
        filterSection.style.display = filterSection.style.display === 'none' ? 'block' : 'none';
        if (filterSection.style.display === 'none') {
            cartSection.style.display = 'none';
        }
    });

    // Кнопка очистки фильтров
    const clearFiltersButton = document.createElement('button');
    clearFiltersButton.textContent = 'Очистить фильтры';
    clearFiltersButton.style.marginTop = '10px';
    clearFiltersButton.addEventListener('click', () => {
        document.getElementById('stock').value = '';
        document.getElementById('type').value = '';
        document.getElementById('diameter').value = '';
        document.getElementById('wallThickness').value = '';
        document.getElementById('gost').value = '';
        document.getElementById('steelGrade').value = '';
        fetchProducts();
    });
    filterSection.appendChild(clearFiltersButton);

    // Автоматическое обновление при изменении фильтров
    const filterElements = [
        document.getElementById('stock'),
        document.getElementById('type'),
        document.getElementById('diameter'),
        document.getElementById('wallThickness'),
        document.getElementById('gost'),
        document.getElementById('steelGrade')
    ];
    filterElements.forEach(element => {
        element.addEventListener('change', () => fetchProducts());
        if (element.tagName === 'INPUT') {
            element.addEventListener('input', () => fetchProducts()); // Для input также реагируем на ввод
        }
    });

    // Логика поиска
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        fetchProducts(searchTerm);
    }

    searchIcon.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    async function fetchProducts(searchTerm = '') {
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
        if (searchTerm) query.append('search', searchTerm);

        try {
            const response = await fetch(`https://tg-miniapp-hack.loca.lt/api/products?${query.toString()}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            let products = await response.json();

            // Клиентская фильтрация (оставлена на случай, если сервер не фильтрует)
            if (searchTerm) {
                products = products.filter(product => {
                    const searchableFields = [
                        product.name || '',
                        product.gost || '',
                        product.steelGrade || '',
                        product.diameter || '',
                        product.pipeWallThickness || '',
                        product.typeName || '',
                        product.stockCity || ''
                    ].join(' ').toLowerCase();
                    return searchableFields.includes(searchTerm);
                });
            }

            displayProducts(products, searchTerm);
            document.getElementById('error').textContent = '';
            resultsInfo.style.display = 'block'; // Показываем всегда
            resultsInfo.textContent = `Найдено: ${products.length} позиций`;
        } catch (error) {
            document.getElementById('error').textContent = error.message;
            document.getElementById('products').innerHTML = '';
            resultsInfo.style.display = 'none';
        }
    }

    function displayProducts(products, searchTerm) {
        const productsDiv = document.getElementById('products');
        if (products.length === 0) {
            productsDiv.innerHTML = '<p>Товары не найдены.</p>';
            return;
        }

        let html = '<table>';
        html += '<tr><th data-label="Название">Название</th><th data-label="ГОСТ">ГОСТ</th><th data-label="Марка стали">Марка стали</th><th data-label="Диаметр (мм)">Диаметр (мм)</th><th data-label="Толщина стенки (мм)">Толщина стенки (мм)</th><th data-label="Тип">Тип</th><th data-label="Склад">Склад</th><th data-label="Цена (т)">Цена (т)</th><th data-label="В наличии (т)">В наличии (т)</th><th data-label="Добавить">Добавить</th></tr>';
        products.forEach(product => {
            html += `<tr>
                <td data-label="Название">${product.name || ''}</td>
                <td data-label="ГОСТ">${product.gost || ''}</td>
                <td data-label="Марка стали">${product.steelGrade || ''}</td>
                <td data-label="Диаметр (мм)">${product.diameter || ''}</td>
                <td data-label="Толщина стенки (мм)">${product.pipeWallThickness || ''}</td>
                <td data-label="Тип">${product.typeName || ''}</td>
                <td data-label="Склад">${product.stockCity || ''}</td>
                <td data-label="Цена (т)">${product.priceT || ''}</td>
                <td data-label="В наличии (т)">${product.inStockT || ''}</td>
                <td data-label="Добавить">
                    <input type="number" id="quantityTons-${product.id}" step="0.01" min="0" placeholder="Тонны">
                    <input type="number" id="quantityMeters-${product.id}" step="0.01" min="0" placeholder="Метры">
                    <button onclick="addToCart('${product.id}', '${product.stockCity}')">Добавить</button>
                </td>
            </tr>`;
        });
        html += '</table>';
        productsDiv.innerHTML = html;
    }

    // Функции из script.js (оставлены без изменений)
    window.addToCart = async function(nomenclatureID, stockID) {
        const quantityTons = parseFloat(document.getElementById(`quantityTons-${nomenclatureID}`).value) || 0;
        const quantityMeters = parseFloat(document.getElementById(`quantityMeters-${nomenclatureID}`).value) || 0;

        if (quantityTons === 0 && quantityMeters === 0) {
            document.getElementById('error').textContent = 'Укажите количество в тоннах или метрах.';
            return;
        }

        const cartItem = { nomenclatureID, stockID, quantityTons, quantityMeters };

        try {
            const response = await fetch('https://tg-miniapp-hack.loca.lt/api/cart', {
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
    };

    window.displayCart = function() {
        const cartDiv = document.querySelector('.cart-section');
        if (cart.length === 0) {
            cartDiv.innerHTML = '<p>Корзина пуста.</p>';
            return;
        }

        let html = '<table>';
        html += '<tr><th data-label="Товар">Товар</th><th data-label="Склад">Склад</th><th data-label="Количество (т)">Количество (т)</th><th data-label="Количество (м)">Количество (м)</th><th data-label="Цена">Цена</th><th data-label="Удалить">Удалить</th></tr>';
        cart.forEach((item, index) => {
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
    };

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        displayCart();
        if (cart.length === 0) {
            document.getElementById('orderButton').style.display = 'none';
        }
    };

    window.showOrderForm = function() {
        document.getElementById('orderForm').style.display = 'block';
    };

    window.submitOrder = async function() {
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
            }))
        };

        try {
            const response = await fetch('https://tg-miniapp-hack.loca.lt/api/orders', {
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
    };
});