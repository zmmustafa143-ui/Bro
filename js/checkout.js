// js/checkout.js - Handles Checkout, Areas, and Validation

const CheckoutApp = {
    cart: [],
    realProducts: [],
    areas: [],
    settings: {},
    deliverySettings: {},
    
    subtotal: 0,
    deliveryFee: 0,
    grandTotal: 0,
    selectedAreaObj: null,

    init: async function() {
        // 1. Check if cart is empty. If yes, send back to menu.
        this.cart = JSON.parse(localStorage.getItem('fastFoodCart')) || [];
        if (this.cart.length === 0) {
            alert("Your cart is empty! Redirecting to menu.");
            window.location.href = 'menu.html';
            return;
        }

        // 2. Load necessary data
        this.realProducts = await App.fetchJSON('data/products.json') || [];
        this.areas = await App.fetchJSON('data/delivery-areas.json') || [];
        this.settings = await App.fetchJSON('data/settings.json') || {};
        this.deliverySettings = await App.fetchJSON('data/delivery-settings.json') || {};

        // 3. Render initial order summary
        this.renderSummary();

        // 4. Populate Area Dropdown
        this.populateAreas();

        // 5. Event Listeners
        document.getElementById('delivery-area').addEventListener('change', (e) => this.handleAreaChange(e.target.value));
        document.getElementById('order-form').addEventListener('submit', (e) => this.processOrder(e));
    },

    renderSummary: function() {
        const itemsContainer = document.getElementById('checkout-items');
        itemsContainer.innerHTML = '';
        this.subtotal = 0;

        let validCart = [];

        this.cart.forEach(cartItem => {
            const realProduct = this.realProducts.find(p => p.id === cartItem.id);
            if (realProduct && realProduct.available) {
                const itemTotal = realProduct.price * cartItem.quantity;
                this.subtotal += itemTotal;
                validCart.push(cartItem);

                itemsContainer.innerHTML += `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>${cartItem.quantity}x ${realProduct.title}</span>
                        <span>${App.formatMoney(itemTotal)}</span>
                    </div>
                `;
            }
        });

        // Update UI
        document.getElementById('chk-subtotal').innerText = App.formatMoney(this.subtotal);
        this.calculateGrandTotal();
    },

    populateAreas: function() {
        const areaSelect = document.getElementById('delivery-area');
        
        // Sort areas based on sortOrder
        this.areas.sort((a, b) => a.sortOrder - b.sortOrder);

        this.areas.forEach(area => {
            // Only add if delivery is available AND area is allowed in settings
            if (area.deliveryAvailable && this.deliverySettings.allowedAreaIds.includes(area.id)) {
                const option = document.createElement('option');
                option.value = area.id;
                option.textContent = `${area.name} - ${App.formatMoney(area.deliveryCharge)}`;
                areaSelect.appendChild(option);
            }
        });
    },

    handleAreaChange: function(areaId) {
        const alertBox = document.getElementById('min-order-alert');
        const submitBtn = document.getElementById('place-order-btn');
        
        if (!areaId) {
            this.deliveryFee = 0;
            this.selectedAreaObj = null;
            document.getElementById('chk-delivery').innerText = 'Select Area';
            alertBox.style.display = 'none';
            submitBtn.disabled = true;
            this.calculateGrandTotal();
            return;
        }

        this.selectedAreaObj = this.areas.find(a => a.id === areaId);
        this.deliveryFee = this.selectedAreaObj.deliveryCharge;
        
        // Update Delivery UI
        document.getElementById('chk-delivery').innerText = App.formatMoney(this.deliveryFee);
        
        // Check Minimum Order Rule
        if (this.deliverySettings.minimumOrderEnabled && this.subtotal < this.selectedAreaObj.minimumOrder) {
            // Show Alert
            document.getElementById('alert-area-name').innerText = this.selectedAreaObj.name;
            document.getElementById('alert-min-amount').innerText = App.formatMoney(this.selectedAreaObj.minimumOrder);
            alertBox.style.display = 'block';
            
            // Disable Button
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.innerText = 'Minimum Order Not Met';
        } else {
            // Hide Alert & Enable Button
            alertBox.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerText = 'Place Order on WhatsApp';
        }

        this.calculateGrandTotal();
    },

    calculateGrandTotal: function() {
        this.grandTotal = this.subtotal + this.deliveryFee;
        document.getElementById('chk-total').innerText = App.formatMoney(this.grandTotal);
    },

    processOrder: function(e) {
        e.preventDefault(); // Prevent page reload

        // Final sanity checks
        if (!this.selectedAreaObj) {
            alert("Please select a valid delivery area.");
            return;
        }
        if (this.subtotal < this.selectedAreaObj.minimumOrder) {
            alert("Order subtotal is below the minimum required for this area.");
            return;
        }

        // Collect Form Data
        const orderData = {
            name: document.getElementById('cust-name').value.trim(),
            phone: document.getElementById('cust-phone').value.trim(),
            area: this.selectedAreaObj,
            address: document.getElementById('cust-address').value.trim(),
            notes: document.getElementById('cust-notes').value.trim(),
            subtotal: this.subtotal,
            deliveryFee: this.deliveryFee,
            grandTotal: this.grandTotal,
            items: this.cart
        };

        // SAVE order temporarily and go to Phase 5 (WhatsApp Generator)
        // For now, we will log it and prepare for the next step
        console.log("Validation Successful! Order Data Prepared:", orderData);
        alert("Phase 4 Complete! Validation works. Next, we will generate the WhatsApp Message.");
        
        // In Phase 5, we will trigger WhatsApp link generation here.
    }
};

// Initialize Checkout
document.addEventListener('DOMContentLoaded', () => {
    CheckoutApp.init();
});
