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

    // js/checkout.js - Complete Checkout & WhatsApp Generator Engine

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
        // 1. Check if cart is empty
        this.cart = JSON.parse(localStorage.getItem('fastFoodCart')) || [];
        if (this.cart.length === 0) {
            alert("Your cart is empty! Redirecting to menu.");
            window.location.href = 'menu.html';
            return;
        }

        // 2. Load settings and data
        this.realProducts = await App.fetchJSON('data/products.json') || [];
        this.areas = await App.fetchJSON('data/delivery-areas.json') || [];
        this.settings = await App.fetchJSON('data/settings.json') || {};
        this.deliverySettings = await App.fetchJSON('data/delivery-settings.json') || {};

        // 3. Render initial order summary
        this.renderSummary();

        // 4. Populate Area Dropdown
        this.populateAreas();

        // 5. Setup Listeners
        document.getElementById('delivery-area').addEventListener('change', (e) => this.handleAreaChange(e.target.value));
        document.getElementById('order-form').addEventListener('submit', (e) => this.processOrder(e));
    },

    renderSummary: function() {
        const itemsContainer = document.getElementById('checkout-items');
        itemsContainer.innerHTML = '';
        this.subtotal = 0;

        this.cart.forEach(cartItem => {
            const realProduct = this.realProducts.find(p => p.id === cartItem.id);
            if (realProduct && realProduct.available) {
                const itemTotal = realProduct.price * cartItem.quantity;
                this.subtotal += itemTotal;

                itemsContainer.innerHTML += `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>${cartItem.quantity}x ${realProduct.title}</span>
                        <span>${App.formatMoney(itemTotal)}</span>
                    </div>
                `;
            }
        });

        document.getElementById('chk-subtotal').innerText = App.formatMoney(this.subtotal);
        this.calculateGrandTotal();
    },

    populateAreas: function() {
        const areaSelect = document.getElementById('delivery-area');
        this.areas.sort((a, b) => a.sortOrder - b.sortOrder);

        this.areas.forEach(area => {
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
        
        document.getElementById('chk-delivery').innerText = App.formatMoney(this.deliveryFee);
        
        if (this.deliverySettings.minimumOrderEnabled && this.subtotal < this.selectedAreaObj.minimumOrder) {
            document.getElementById('alert-area-name').innerText = this.selectedAreaObj.name;
            document.getElementById('alert-min-amount').innerText = App.formatMoney(this.selectedAreaObj.minimumOrder);
            alertBox.style.display = 'block';
            
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.innerText = 'Minimum Order Not Met';
        } else {
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

    // Generates Unique Local Reference (e.g., FF-20261010-8421)
    generateOrderReference: function() {
        const now = new Date();
        const dateStr = now.toISOString().slice(0,10).replace(/-/g, "");
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `FF-${dateStr}-${rand}`;
    },

    processOrder: function(e) {
        e.preventDefault();

        if (!this.selectedAreaObj) {
            alert("Please select a delivery village/area.");
            return;
        }

        if (this.subtotal < this.selectedAreaObj.minimumOrder) {
            alert("Minimum order not met for this area.");
            return;
        }

        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const address = document.getElementById('cust-address').value.trim();
        const notes = document.getElementById('cust-notes').value.trim() || "None";
        const orderRef = this.generateOrderReference();

        // Local Pakistan Date & Time String
        const now = new Date();
        const orderTime = now.toLocaleString("en-PK", {
            timeZone: this.settings.timezone || "Asia/Karachi",
            dateStyle: "medium",
            timeStyle: "short"
        });

        // 1. Build Itemized Text
        let itemsText = "";
        let verifiedItems = [];
        let itemIndex = 1;

        this.cart.forEach(cartItem => {
            const realProduct = this.realProducts.find(p => p.id === cartItem.id);
            if (realProduct && realProduct.available) {
                const lineTotal = realProduct.price * cartItem.quantity;
                
                itemsText += `${itemIndex}. ${realProduct.title}\n`;
                itemsText += `   Quantity: ${cartItem.quantity}\n`;
                itemsText += `   Unit Price: ${App.formatMoney(realProduct.price)}\n`;
                itemsText += `   Line Total: ${App.formatMoney(lineTotal)}\n\n`;

                verifiedItems.push({
                    title: realProduct.title,
                    quantity: cartItem.quantity,
                    price: realProduct.price,
                    lineTotal: lineTotal
                });

                itemIndex++;
            }
        });

        // 2. Build the Complete WhatsApp Message according to specifications
        const rawMessage = 
`*NEW FAST FOOD ORDER*
Order Reference: ${orderRef}
Date: ${orderTime} (PKT)

*CUSTOMER DETAILS*
Name: ${name}
Phone: ${phone}
Village: ${this.selectedAreaObj.name}
Address: ${address}

*ORDER ITEMS*
${itemsText}*BILL SUMMARY*
Food Subtotal: ${App.formatMoney(this.subtotal)}
Discount: Rs. 0
Delivery Charges: ${App.formatMoney(this.deliveryFee)}
*GRAND TOTAL: ${App.formatMoney(this.grandTotal)}*

Payment: CASH ON DELIVERY
Customer Notes: ${notes}

Please confirm this order and delivery availability.`;

        // 3. Encode Message for WhatsApp
        const shopWhatsApp = this.settings.whatsappNumber || "923001234567";
        const encodedMessage = encodeURIComponent(rawMessage);
        const waUrl = `https://wa.me/${shopWhatsApp}?text=${encodedMessage}`;

        // 4. Store details in sessionStorage for order-success.html
        const orderSummaryData = {
            orderRef: orderRef,
            name: name,
            phone: phone,
            village: this.selectedAreaObj.name,
            address: address,
            notes: notes,
            items: verifiedItems,
            subtotal: this.subtotal,
            deliveryFee: this.deliveryFee,
            grandTotal: this.grandTotal,
            waUrl: waUrl
        };
        sessionStorage.setItem('lastPlacedOrder', JSON.stringify(orderSummaryData));

        // 5. Empty the Cart (Order is submitted)
        localStorage.removeItem('fastFoodCart');
        App.updateCartCount();

        // 6. Open WhatsApp in new tab and forward user to order-success.html
        window.open(waUrl, '_blank');
        window.location.href = 'order-success.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CheckoutApp.init();
});
