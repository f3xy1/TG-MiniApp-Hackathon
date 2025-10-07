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

    // Создание модального окна
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="back-button"><img src="icons/back.svg" alt="Back"></button>
                <h2>Детали товара</h2>
                <img src="icons/bin.svg" alt="Cart" class="cart-icon">
            </div>
            <div class="modal-image"><img src="icons/placeholder_big.svg" alt="Product Image"></div>
            <div class="modal-name"></div>
            <div class="modal-price"></div>
            <h3>Характеристики</h3>
            <div class="modal-specs"></div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'none';

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
            element.addEventListener('input', () => fetchProducts());
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

        let html = '<div class="products-container">';
        products.forEach(product => {
            html += `
                <div class="product-item" onclick="showProductDetails('${product.id}', '${product.stockCity}', '${product.name || ''}', '${product.gost || ''}', '${product.steelGrade || ''}', '${product.diameter || ''}', '${product.pipeWallThickness || ''}', '${product.typeName || ''}', '${product.stockCity || ''}', '${product.priceT || ''}', '${product.inStockT || ''}')">
                    <div class="product-image">
                        <img src="icons/placeholder_small.svg" alt="Product Image">
                    </div>
                    <div class="product-details">
                        <div class="product-name">${product.name || ''}</div>
                        <div class="product-specs">
                            <span>ГОСТ: ${product.gost || ''}</span>
                            <span>Марка стали: ${product.steelGrade || ''}</span>
                            <span>Диаметр: ${product.diameter || ''} мм</span>
                            <span>Толщина стенки: ${product.pipeWallThickness || ''} мм</span>
                        </div>
                        <div class="product-price">Цена: ${product.priceT || ''} Р/т</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        productsDiv.innerHTML = html;
    }

    window.showProductDetails = function(id, stockCity, name, gost, steelGrade, diameter, pipeWallThickness, typeName, stock, priceT, inStockT) {
        const modal = document.querySelector('.modal');
        modal.querySelector('.modal-name').textContent = name;
        modal.querySelector('.modal-price').textContent = `Цена: ${priceT} Р/т`;
        const specsGrid = modal.querySelector('.modal-specs');
        specsGrid.innerHTML = `
            <div class="spec-row"><span class="spec-label">Склад:</span><span class="spec-value">${stock || ''}</span></div>
            <div class="spec-row"><span class="spec-label">Вид продукции:</span><span class="spec-value">${typeName || ''}</span></div>
            <div class="spec-row"><span class="spec-label">Диаметр:</span><span class="spec-value">${diameter || ''} мм</span></div>
            <div class="spec-row"><span class="spec-label">Толщина стенки:</span><span class="spec-value">${pipeWallThickness || ''} мм</span></div>
            <div class="spec-row"><span class="spec-label">ГОСТ:</span><span class="spec-value">${gost || ''}</span></div>
            <div class="spec-row"><span class="spec-label">Марка стали:</span><span class="spec-value">${steelGrade || ''}</span></div>
            <div class="spec-row"><span class="spec-label">В наличии:</span><span class="spec-value">${inStockT || ''} т</span></div>
        `;
        modal.style.display = 'block';

        modal.querySelector('.back-button').onclick = () => {
            modal.style.display = 'none';
        };
    };

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