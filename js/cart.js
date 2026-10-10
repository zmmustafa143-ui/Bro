// js/cart.js - Handles Shopping Cart logic

const CartApp = {
    realProducts: [], // To verify prices securely

    init: async function() {
        // Fetch real product data to verify prices (Security against client-side modification)
        this.realProducts = await App.fetchJSON('data/products.json') || [];
        
        this.renderCart();
        
        // Setup clear cart button
        document.getElementById('clear-cart-btn').addEventListener('click', () => {
            if(confirm('Are you sure you want to empty your cart?')) {
                localStorage.removeItem('fastFoodCart');
                App.updateCartCount();
                this.renderCart();
            }
        });
    },

    getCartData: function() {
        return JSON.parse(localStorage.getItem('fastFoodCart')) || [];
    },

    saveCartData: function(cartArray) {
        localStorage.setItem('fastFoodCart', JSON.stringify(cartArray));
        App.updateCartCount(); // Update global counter
    },

    renderCart: function() {
        const cartBody = document.getElementById('cart-table-body');
        const clearBtn = document.getElementById('clear-cart-btn');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        let cart = this.getCartData();
        let subtotal = 0;
        let validCart = []; // To store items that actually exist in DB

        if (cart.length === 0) {
            cartBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px;">Your cart is empty! <br><br> <a href="menu.html" style="color: var(--primary-color);">Browse Menu</a></td></tr>`;
            clearBtn.style.display = 'none';
            checkoutBtn.style.pointerEvents = 'none';
            checkoutBtn.style.opacity = '0.5';
            this.updateSummary(0);
            return;
        }

        cartBody.innerHTML = '';
        clearBtn.style.display = 'inline-block';
        checkoutBtn.style.pointerEvents = 'auto';
        checkoutBtn.style.opacity = '1';

        cart.forEach((cartItem, index) => {
            // Find real product to get the true price and image
            const realProduct = this.realProducts.find(p => p.id === cartItem.id);
            
            if (realProduct && realProduct.available) {
                const itemTotal = realProduct.price * cartItem.quantity;
                subtotal += itemTotal;
                
                // Add valid item back to verified list
                cartItem.price = realProduct.price; // Update to true price just in case
                validCart.push(cartItem);

                const imgSrc = realProduct.image ? realProduct.image : 'https://placehold.co/100x100?text=Food';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="Product">
                        <div class="cart-item-info">
                            <img src="${imgSrc}" alt="${realProduct.title}" onerror="this.src='https://placehold.co/100x100?text=Food'">
                            <span class="cart-item-title">${realProduct.title}</span>
                        </div>
                    </td>
                    <td data-label="Price">${App.formatMoney(realProduct.price)}</td>
                    <td data-label="Quantity">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="CartApp.updateQuantity('${cartItem.id}', -1)">-</button>
                            <input type="text" class="qty-input" value="${cartItem.quantity}" readonly>
                            <button class="qty-btn" onclick="CartApp.updateQuantity('${cartItem.id}', 1)">+</button>
                        </div>
                    </td>
                    <td data-label="Total" style="font-weight: bold; color: var(--primary-color);">
                        ${App.formatMoney(itemTotal)}
                    </td>
                    <td data-label="Action">
                        <button class="remove-btn" onclick="CartApp.removeItem('${cartItem.id}')" title="Remove Item">🗑️</button>
                    </td>
                `;
                cartBody.appendChild(tr);
            }
        });

        // Update local storage with only valid, available items
        if(cart.length !== validCart.length) {
            this.saveCartData(validCart);
        }

        this.updateSummary(subtotal);
    },

    updateQuantity: function(productId, change) {
        let cart = this.getCartData();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            
            // If quantity goes to 0 or below, remove the item
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            
            this.saveCartData(cart);
            this.renderCart(); // Re-render to update UI and totals
        }
    },

    removeItem: function(productId) {
        let cart = this.getCartData();
        cart = cart.filter(item => item.id !== productId);
        this.saveCartData(cart);
        this.renderCart();
    },

    updateSummary: function(subtotal) {
        document.getElementById('summary-subtotal').innerText = App.formatMoney(subtotal);
        document.getElementById('summary-total').innerText = App.formatMoney(subtotal);
    }
};

// Initialize Cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    CartApp.init();
});
