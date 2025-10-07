let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    const cartSection = document.querySelector('.cart-section');
    const filterSection = document.querySelector('.filter-section');
    const binButton = document.querySelector('.bin-button');
    const filterButton = document.querySelector('.filter-button');
    const searchInput = document.getElementById('search');
    const searchIcon = document.querySelector('.search-icon');
    const orderButton = document.getElementById('orderButton');

    // Проверка наличия элементов DOM
    if (!cartSection) console.error('Ошибка: элемент .cart-section не найден в DOM');
    if (!filterSection) console.error('Ошибка: элемент .filter-section не найден в DOM');
    if (!binButton) console.error('Ошибка: элемент .bin-button не найден в DOM');
    if (!filterButton) console.error('Ошибка: элемент .filter-button не найден в DOM');
    if (!searchInput) console.error('Ошибка: элемент #search не найден в DOM');
    if (!searchIcon) console.error('Ошибка: элемент .search-icon не найден в DOM');
    if (!orderButton) console.error('Ошибка: элемент #orderButton не найден в DOM');

    const resultsInfo = document.createElement('div');
    resultsInfo.className = 'results-info';
    resultsInfo.style.display = 'none';
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.after(resultsInfo);
    } else {
        console.error('Ошибка: элемент .search-bar не найден в DOM');
    }

    // Создание модального окна для деталей товара
    const productModal = document.createElement('div');
    productModal.className = 'modal product-modal';
    productModal.innerHTML = `
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
            <div class="modal-order">
                <h3>Заказать</h3>
                <div class="order-toggle">
                    <input type="radio" id="unit-tons" name="unitType" value="tons" checked>
                    <label for="unit-tons">Тонны</label>
                    <input type="radio" id="unit-meters" name="unitType" value="meters">
                    <label for="unit-meters">Метры</label>
                </div>
                <div class="order-input">
                    <label>Количество в тоннах</label>
                    <input type="number" id="quantity" min="0" step="1" placeholder="Введите количество">
                </div>
                <button id="addToCartButton">Добавить в корзину</button>
            </div>
        </div>
    `;
    document.body.appendChild(productModal);
    productModal.style.display = 'none';

    // Создание модального окна для корзины
    const cartModal = document.createElement('div');
    cartModal.className = 'modal cart-modal';
    cartModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="back-button"><img src="icons/back.svg" alt="Back"></button>
                <h2>Корзина</h2>
            </div>
            <div class="cart-content"></div>
            <button id="cartOrderButton" style="display: none;">Оформить заказ</button>
        </div>
    `;
    document.body.appendChild(cartModal);
    cartModal.style.display = 'none';

    // Скрываем корзину и фильтры по умолчанию
    if (cartSection) cartSection.style.display = 'none';
    if (filterSection) filterSection.style.display = 'none';

    // Логика кнопки корзины
    if (binButton) {
        binButton.addEventListener('click', () => {
            if (cartModal) {
                cartModal.style.display = 'block';
                displayCart();
                if (filterSection) {
                    filterSection.style.display = 'none';
                }
            }
        });
    }

    // Логика кнопки фильтров
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            if (filterSection) {
                filterSection.style.display = filterSection.style.display === 'none' ? 'block' : 'none';
                if (cartSection && filterSection.style.display === 'none') {
                    cartSection.style.display = 'none';
                }
                if (cartModal) {
                    cartModal.style.display = 'none';
                }
            }
        });
    }

    // Кнопка очистки фильтров
    const clearFiltersButton = document.createElement('button');
    clearFiltersButton.textContent = 'Очистить фильтры';
    clearFiltersButton.style.marginTop = '10px';
    clearFiltersButton.addEventListener('click', () => {
        const stock = document.getElementById('stock');
        const type = document.getElementById('type');
        const diameter = document.getElementById('diameter');
        const wallThickness = document.getElementById('wallThickness');
        const gost = document.getElementById('gost');
        const steelGrade = document.getElementById('steelGrade');
        if (stock) stock.value = '';
        if (type) type.value = '';
        if (diameter) diameter.value = '';
        if (wallThickness) wallThickness.value = '';
        if (gost) gost.value = '';
        if (steelGrade) steelGrade.value = '';
        fetchProducts();
    });
    if (filterSection) filterSection.appendChild(clearFiltersButton);

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
        if (element) {
            element.addEventListener('change', () => fetchProducts());
            if (element.tagName === 'INPUT') {
                element.addEventListener('input', () => fetchProducts());
            }
        } else {
            console.warn('Элемент фильтра не найден:', element);
        }
    });

    // Логика поиска
    function performSearch() {
        if (searchInput) {
            const searchTerm = searchInput.value.trim().toLowerCase();
            fetchProducts(searchTerm);
        } else {
            console.error('Ошибка: searchInput не найден');
        }
    }

    if (searchIcon) searchIcon.addEventListener('click', performSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    async function fetchProducts(searchTerm = '') {
        const stock = document.getElementById('stock');
        const type = document.getElementById('type');
        const diameter = document.getElementById('diameter');
        const wallThickness = document.getElementById('wallThickness');
        const gost = document.getElementById('gost');
        const steelGrade = document.getElementById('steelGrade');

        const query = new URLSearchParams();
        if (stock && stock.value) query.append('stock', stock.value);
        if (type && type.value) query.append('type', type.value);
        if (diameter && diameter.value) query.append('diameter', diameter.value);
        if (wallThickness && wallThickness.value) query.append('wallThickness', wallThickness.value);
        if (gost && gost.value) query.append('gost', gost.value);
        if (steelGrade && steelGrade.value) query.append('steelGrade', steelGrade.value);
        if (searchTerm) query.append('search', searchTerm);

        try {
            const response = await fetch(`https://tg-miniapp-hack.loca.lt/api/products?${query.toString()}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            let products = await response.json();

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
            if (resultsInfo) {
                resultsInfo.style.display = 'block';
                resultsInfo.textContent = `Найдено: ${products.length} позиций`;
            }
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
            document.getElementById('error').textContent = error.message;
            document.getElementById('products').innerHTML = '';
            if (resultsInfo) resultsInfo.style.display = 'none';
        }
    }

    function displayProducts(products, searchTerm) {
        const productsDiv = document.getElementById('products');
        if (!productsDiv) {
            console.error('Ошибка: элемент #products не найден в DOM');
            return;
        }
        if (products.length === 0) {
            productsDiv.innerHTML = '<p>Товары не найдены.</p>';
            return;
        }

        let html = '<div class="products-container">';
        products.forEach(product => {
            html += `
                <div class="product-item" onclick="showProductDetails('${product.id}', '${product.stockID}', '${product.name || ''}', '${product.gost || ''}', '${product.steelGrade || ''}', '${product.diameter || ''}', '${product.pipeWallThickness || ''}', '${product.typeName || ''}', '${product.stockCity || ''}', '${product.priceT || ''}', '${product.inStockT || ''}', '${product.avgTubeLength || ''}', '${product.avgTubeWeight || ''}')">
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

    window.showProductDetails = function(id, stockID, name, gost, steelGrade, diameter, pipeWallThickness, typeName, stockCity, priceT, inStockT, avgTubeLength, avgTubeWeight) {
        const modal = document.querySelector('.product-modal');
        if (!modal) {
            console.error('Ошибка: элемент .product-modal не найден в DOM');
            return;
        }
        modal.querySelector('.modal-name').textContent = name;
        modal.querySelector('.modal-price').textContent = `Цена: ${priceT} Р/т`;
        const specsGrid = modal.querySelector('.modal-specs');
        if (specsGrid) {
            specsGrid.innerHTML = `
                <div class="spec-row"><span class="spec-label">Склад:</span><span class="spec-value">${stockCity || ''}</span></div>
                <div class="spec-row"><span class="spec-label">Вид продукции:</span><span class="spec-value">${typeName || ''}</span></div>
                <div class="spec-row"><span class="spec-label">Диаметр:</span><span class="spec-value">${diameter || ''} мм</span></div>
                <div class="spec-row"><span class="spec-label">Толщина стенки:</span><span class="spec-value">${pipeWallThickness || ''} мм</span></div>
                <div class="spec-row"><span class="spec-label">ГОСТ:</span><span class="spec-value">${gost || ''}</span></div>
                <div class="spec-row"><span class="spec-label">Марка стали:</span><span class="spec-value">${steelGrade || ''}</span></div>
                <div class="spec-row"><span class="spec-label">В наличии:</span><span class="spec-value">${inStockT || ''} т</span></div>
            `;
        }
        const quantityInput = modal.querySelector('#quantity');
        if (quantityInput) {
            quantityInput.setAttribute('step', modal.querySelector('#unit-tons').checked ? (avgTubeWeight || 1) : (avgTubeLength || 1));
        }
        const addToCartButton = modal.querySelector('#addToCartButton');
        if (addToCartButton) {
            addToCartButton.onclick = () => addToCart(id, stockID, name, stockCity, priceT, avgTubeWeight, avgTubeLength);
        }
        modal.querySelectorAll('input[name="unitType"]').forEach(radio => {
            radio.onchange = () => {
                if (quantityInput) {
                    quantityInput.setAttribute('step', radio.value === 'tons' ? (avgTubeWeight || 1) : (avgTubeLength || 1));
                    quantityInput.value = '';
                    const orderInputLabel = modal.querySelector('.order-input label');
                    if (orderInputLabel) {
                        orderInputLabel.textContent = `Количество в ${radio.value === 'tons' ? 'тоннах' : 'метрах'}`;
                    }
                }
            };
        });
        const orderInputLabel = modal.querySelector('.order-input label');
        if (orderInputLabel) {
            orderInputLabel.textContent = 'Количество в тоннах';
        }
        modal.style.display = 'block';

        const backButton = modal.querySelector('.back-button');
        if (backButton) {
            backButton.onclick = () => {
                modal.style.display = 'none';
            };
        }
    };

    window.addToCart = async function(nomenclatureID, stockID, name, stockCity, priceT, avgTubeWeight, avgTubeLength) {
        if (!Array.isArray(cart)) {
            console.error('Ошибка: cart не является массивом, текущий тип:', typeof cart, cart);
            cart = [];
        }

        const modal = document.querySelector('.product-modal');
        if (!modal) {
            console.error('Ошибка: элемент .product-modal не найден в DOM');
            document.getElementById('error').textContent = 'Ошибка: модальное окно не найдено';
            return;
        }

        const unitTypeInput = modal.querySelector('input[name="unitType"]:checked');
        const quantityInput = modal.querySelector('#quantity');
        if (!unitTypeInput || !quantityInput) {
            console.error('Ошибка: элементы unitType или quantity не найдены в модальном окне');
            document.getElementById('error').textContent = 'Ошибка: не удалось получить данные о количестве';
            return;
        }

        const unitType = unitTypeInput.value;
        const quantity = parseFloat(quantityInput.value) || 0;

        if (quantity === 0) {
            document.getElementById('error').textContent = 'Укажите количество.';
            return;
        }

        if (unitType === 'tons' && Math.abs(quantity % avgTubeWeight) > 0.0001) {
            document.getElementById('error').textContent = `Количество в тоннах должно быть кратно ${avgTubeWeight}.`;
            return;
        }
        if (unitType === 'meters' && Math.abs(quantity % avgTubeLength) > 0.0001) {
            document.getElementById('error').textContent = `Количество в метрах должно быть кратно ${avgTubeLength}.`;
            return;
        }

        const cartItem = {
            NomenclatureID: nomenclatureID,
            StockID: stockID,
            QuantityTons: unitType === 'tons' ? quantity : 0,
            QuantityMeters: unitType === 'meters' ? quantity : 0,
            Price: 0
        };

        try {
            console.log('Отправка запроса в /api/cart:', JSON.stringify(cartItem));
            const response = await fetch('https://tg-miniapp-hack.loca.lt/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cartItem)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка добавления в корзину: ${errorText}`);
            }
            const result = await response.json();
            console.log('Полный ответ сервера:', JSON.stringify(result, null, 2));

            const normalizedItem = {
                NomenclatureID: result.NomenclatureID || result.nomenclatureID || nomenclatureID,
                StockID: result.StockID || result.stockID || stockID,
                QuantityTons: result.QuantityTons || result.quantityTons || 0,
                QuantityMeters: result.QuantityMeters || result.quantityMeters || 0,
                Price: result.Price || result.price || 0,
                Name: name,
                StockCity: stockCity
            };
            cart.push(normalizedItem);
            console.log('Товар добавлен в cart:', normalizedItem);
            console.log('Текущее состояние cart:', cart);
            displayCart();
            if (orderButton) {
                orderButton.style.display = 'block';
            } else {
                console.error('Ошибка: элемент #orderButton не найден при попытке показать кнопку');
            }
            document.getElementById('error').textContent = '';
            modal.style.display = 'none';
            quantityInput.value = '';
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            document.getElementById('error').textContent = error.message;
        }
    };

    window.displayCart = function() {
        const cartModal = document.querySelector('.cart-modal');
        if (!cartModal) {
            console.error('Ошибка: элемент .cart-modal не найден в DOM');
            return;
        }
        const cartContent = cartModal.querySelector('.cart-content');
        if (!cartContent) {
            console.error('Ошибка: элемент .cart-content не найден в DOM');
            return;
        }

        if (!Array.isArray(cart) || cart.length === 0) {
            cartContent.innerHTML = '<p>Корзина пуста.</p>';
            const cartOrderButton = cartModal.querySelector('#cartOrderButton');
            if (cartOrderButton) {
                cartOrderButton.style.display = 'none';
            }
            cartModal.style.display = 'block';
            const backButton = cartModal.querySelector('.back-button');
            if (backButton) {
                backButton.onclick = () => {
                    cartModal.style.display = 'none';
                };
            }
            return;
        }

        console.log('Отображение корзины, содержимое cart:', cart);
        let html = '<div class="cart-items">';
        let totalPrice = 0;
        cart.forEach((item, index) => {
            const name = item.Name || 'Неизвестный товар';
            const stockCity = item.StockCity || 'Неизвестный склад';
            const quantityTons = (item.QuantityTons || 0).toFixed(3);
            const quantityMeters = (item.QuantityMeters || 0).toFixed(2);
            const price = (item.Price || 0).toFixed(2);

            totalPrice += parseFloat(price);
            console.log(`Элемент корзины ${index}:`, { name, stockCity, quantityTons, quantityMeters, price });
            // Truncate name to 20 characters with ellipsis and add tooltip
            const truncatedName = name.length > 20 ? name.substring(0, 20) + '...' : name;
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name" title="${name}">${truncatedName}</div>
                        <div class="cart-item-stock">Склад: ${stockCity}</div>
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-quantity">Тонны: ${quantityTons}</div>
                        <div class="cart-item-quantity">Метры: ${quantityMeters}</div>
                        <div class="cart-item-price">Цена: ${price} ₽</div>
                    </div>
                    <button class="remove-button" onclick="removeFromCart(${index})">Удалить</button>
                </div>
            `;
        });
        html += `
            <div class="cart-total">
                <strong>Итого: ${totalPrice.toFixed(2)} ₽</strong>
            </div>
        </div>`;
        cartContent.innerHTML = html;

        const cartOrderButton = cartModal.querySelector('#cartOrderButton');
        if (cartOrderButton) {
            cartOrderButton.style.display = 'block';
            cartOrderButton.onclick = () => {
                cartModal.style.display = 'none';
                showOrderForm();
            };
        }

        const backButton = cartModal.querySelector('.back-button');
        if (backButton) {
            backButton.onclick = () => {
                cartModal.style.display = 'none';
            };
        }
    };

    window.removeFromCart = function(index) {
        if (!Array.isArray(cart)) {
            console.error('Ошибка: cart не является массивом при удалении');
            cart = [];
        }
        cart.splice(index, 1);
        displayCart();
        if (cart.length === 0 && orderButton) {
            orderButton.style.display = 'none';
        }
    };

    window.showOrderForm = function() {
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.style.display = 'block';
        } else {
            console.error('Ошибка: элемент #orderForm не найден в DOM');
        }
    };

    window.submitOrder = function() {
        if (!Array.isArray(cart)) {
            console.error('Ошибка: cart не является массивом при отправке заказа');
            cart = [];
        }
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const inn = document.getElementById('inn');
        const phone = document.getElementById('phone');
        const email = document.getElementById('email');

        if (!firstName || !lastName || !inn || !phone || !email) {
            console.error('Ошибка: одно или несколько полей формы заказа не найдены');
            document.getElementById('error').textContent = 'Ошибка: поля формы заказа не найдены';
            return;
        }

        const order = {
            firstName: firstName.value,
            lastName: lastName.value,
            inn: inn.value,
            phone: phone.value,
            email: email.value,
            items: cart.map(item => ({
                NomenclatureID: item.NomenclatureID,
                StockID: item.StockID,
                QuantityTons: item.QuantityTons,
                QuantityMeters: item.QuantityMeters,
                Price: item.Price
            }))
        };

        fetch('https://tg-miniapp-hack.loca.lt/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка оформления заказа');
            return response.json();
        })
        .then(result => {
            document.getElementById('error').textContent = '';
            alert('Заказ успешно оформлен!');
            cart = [];
            displayCart();
            if (orderButton) {
                orderButton.style.display = 'none';
            }
            const orderForm = document.getElementById('orderForm');
            if (orderForm) {
                orderForm.style.display = 'none';
            }
            tg.close();
        })
        .catch(error => {
            console.error('Ошибка оформления заказа:', error);
            document.getElementById('error').textContent = error.message;
        });
    };

    // Инициализация Telegram Web App
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    // Заполнение полей формы заказа данными из Telegram
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    if (tg.initDataUnsafe.user && firstName && lastName) {
        firstName.value = tg.initDataUnsafe.user.first_name || '';
        lastName.value = tg.initDataUnsafe.user.last_name || '';
    }

    // Начальная загрузка продуктов
    fetchProducts();
});