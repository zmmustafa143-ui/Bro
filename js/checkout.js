/**
 * js/checkout.js
 * Complete Checkout, 10-Village Delivery Engine & WhatsApp Generator
 */

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
        // 1. Check if cart is empty. If empty, return to menu.
        this.cart = JSON.parse(localStorage.getItem('fastFoodCart')) || [];
        if (this.cart.length === 0) {
            alert("Your cart is currently empty! Please select food from our menu first.");
            window.location.href = 'menu.html';
            return;
        }

        // 2. Fetch necessary data files
        this.realProducts = await App.fetchJSON('data/products.json') || [];
        this.areas = await App.fetchJSON('data/delivery-areas.json') || [];
        this.settings = await App.fetchJSON('data/settings.json') || {};
        this.deliverySettings = await App.fetchJSON('data/delivery-settings.json') || {};

        // 3. Render verified order items and subtotal
        this.renderSummary();

        // 4. Fill village dropdown with permitted areas
        this.populateAreas();

        // 5. Setup Event Listeners
        const areaSelect = document.getElementById('delivery-area');
        if (areaSelect) {
            areaSelect.addEventListener('change', (e) => this.handleAreaChange(e.target.value));
        }

        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => this.processOrder(e));
        }
    },

    // Calculate subtotal securely from products.json and render list
    renderSummary: function() {
        const itemsContainer = document.getElementById('checkout-items');
        itemsContainer.innerHTML = '';
        this.subtotal = 0;

        let verifiedCart = [];

        this.cart.forEach(cartItem => {
            const realProduct = this.realProducts.find(p => p.id === cartItem.id);
            
            // Only count items that exist and are marked available
            if (realProduct && realProduct.available) {
                const lineTotal = realProduct.price * cartItem.quantity;
                this.subtotal += lineTotal;

                verifiedCart.push({
                    id: realProduct.id,
                    title: realProduct.title,
                    price: realProduct.price,
                    quantity: cartItem.quantity,
                    lineTotal: lineTotal
                });

                const itemRow = document.createElement('div');
                itemRow.style.display = 'flex';
                itemRow.style.justifyContent = 'space-between';
                itemRow.style.alignItems = 'center';
                itemRow.innerHTML = `
                    <span><strong>${cartItem.quantity}x</strong> ${realProduct.title}</span>
                    <span style="font-weight: 600;">${App.formatMoney(lineTotal)}</span>
                `;
                itemsContainer.appendChild(itemRow);
            }
        });

        // Update local cart storage with verified available items
        this.cart = verifiedCart;

        // Update Subtotal on UI
        document.getElementById('chk-subtotal').innerText = App.formatMoney(this.subtotal);
        this.calculateGrandTotal();
    },

    // Populate dropdown with active and permitted villages
    populateAreas: function() {
        const areaSelect = document.getElementById('delivery-area');
        if (!areaSelect) return;

        // Clear existing options except default
        areaSelect.innerHTML = '<option value="">-- Choose Your Area --</option>';

        // Sort areas based on sortOrder
        this.areas.sort((a, b) => a.sortOrder - b.sortOrder);

        const allowedList = this.deliverySettings.allowedAreaIds || [];

        this.areas.forEach(area => {
            // Block unavailable or disallowed villages
            if (area.deliveryAvailable && allowedList.includes(area.id)) {
                const option = document.createElement('option');
                option.value = area.id;
                option.textContent = `${area.name} (Delivery: ${App.formatMoney(area.deliveryCharge)} | Min: ${App.formatMoney(area.minimumOrder)})`;
                areaSelect.appendChild(option);
            }
        });
    },

    // Village selection change event
    handleAreaChange: function(areaId) {
        const alertBox = document.getElementById('min-order-alert');
        const submitBtn = document.getElementById('place-order-btn');
        
        if (!areaId) {
            this.deliveryFee = 0;
            this.selectedAreaObj = null;
            document.getElementById('chk-delivery').innerText = 'Select Area First';
            alertBox.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.innerText = 'Please Select Area';
            this.calculateGrandTotal();
            return;
        }

        // Find selected area
        this.selectedAreaObj = this.areas.find(a => a.id === areaId);
        this.deliveryFee = this.selectedAreaObj.deliveryCharge;
        
        // Update Delivery fee UI
        document.getElementById('chk-delivery').innerText = App.formatMoney(this.deliveryFee);
        
        // Enforce Minimum Order rule
        if (this.deliverySettings.minimumOrderEnabled && this.subtotal < this.selectedAreaObj.minimumOrder) {
            document.getElementById('alert-area-name').innerText = this.selectedAreaObj.name;
            document.getElementById('alert-min-amount').innerText = App.formatMoney(this.selectedAreaObj.minimumOrder);
            alertBox.style.display = 'block';
            
            // Disable button
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.innerText = `Min Order is ${App.formatMoney(this.selectedAreaObj.minimumOrder)}`;
        } else {
            // Hide alert & enable button
            alertBox.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerText = 'Place Order on WhatsApp';
        }

        this.calculateGrandTotal();
    },

    // Calculate final bill
    calculateGrandTotal: function() {
        this.grandTotal = this.subtotal + this.deliveryFee;
        document.getElementById('chk-total').innerText = App.formatMoney(this.grandTotal);
    },

    // Generate local unique reference
    generateOrderReference: function() {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `FF-${dateStr}-${rand}`;
    },

    // Process submission and build complete WhatsApp text
    processOrder: function(e) {
        e.preventDefault();

        // Final checks
        if (!this.selectedAreaObj) {
            alert("Please select a delivery village or area.");
            return;
        }

        if (this.subtotal < this.selectedAreaObj.minimumOrder) {
            alert(`Your subtotal must be at least ${App.formatMoney(this.selectedAreaObj.minimumOrder)} for ${this.selectedAreaObj.name}.`);
            return;
        }

        const nameInput = document.getElementById('cust-name');
        const phoneInput = document.getElementById('cust-phone');
        const addressInput = document.getElementById('cust-address');
        const notesInput = document.getElementById('cust-notes');

        const customerName = nameInput.value.trim();
        const customerPhone = phoneInput.value.trim();
        const customerAddress = addressInput.value.trim();
        const customerNotes = notesInput.value.trim() || "None";

        // Generate Order Reference & Local Time
        const orderRef = this.generateOrderReference();
        const now = new Date();
        const orderTime = now.toLocaleString("en-PK", {
            timeZone: this.settings.timezone || "Asia/Karachi",
            dateStyle: "medium",
            timeStyle: "short"
        });

        // 1. Build Itemized Food List
        let itemsListText = "";
        let verifiedItems = [];
        let counter = 1;

        this.cart.forEach(item => {
            const lineTotal = item.price * item.quantity;
            itemsListText += `${counter}. ${item.title}\n`;
            itemsListText += `   Quantity: ${item.quantity}\n`;
            itemsListText += `   Unit Price: ${App.formatMoney(item.price)}\n`;
            itemsListText += `   Line Total: ${App.formatMoney(lineTotal)}\n\n`;

            verifiedItems.push({
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                lineTotal: lineTotal
            });

            counter++;
        });

        // 2. Build the Complete WhatsApp Message according to Project Rules
        const rawMessage = 
`NEW FAST FOOD ORDER
Order Reference: ${orderRef}
Date: ${orderTime} (Local Device Time)

CUSTOMER DETAILS
Name: ${customerName}
Phone: ${customerPhone}
Village: ${this.selectedAreaObj.name}
Address: ${customerAddress}

ORDER ITEMS
${itemsListText}BILL SUMMARY
Food Subtotal: ${App.formatMoney(this.subtotal)}
Discount: Rs. 0
Delivery Charges: ${App.formatMoney(this.deliveryFee)}
GRAND TOTAL: ${App.formatMoney(this.grandTotal)}

Payment: CASH ON DELIVERY
Customer Notes: ${customerNotes}

Please confirm this order and delivery availability.`;

        // 3. Encode Message for WhatsApp wa.me Link
        const shopNumber = this.settings.whatsappNumber || "923437269309";
        const encodedText = encodeURIComponent(rawMessage);
        const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodedText}`;

        // 4. Store details in sessionStorage for order-success.html
        const orderData = {
            orderRef: orderRef,
            name: customerName,
            phone: customerPhone,
            village: this.selectedAreaObj.name,
            address: customerAddress,
            notes: customerNotes,
            items: verifiedItems,
            subtotal: this.subtotal,
            deliveryFee: this.deliveryFee,
            grandTotal: this.grandTotal,
            waUrl: whatsappUrl
        };
        sessionStorage.setItem('lastPlacedOrder', JSON.stringify(orderData));

        // 5. Empty Cart (Order has been processed)
        localStorage.removeItem('fastFoodCart');
        App.updateCartCount();

        // 6. Open WhatsApp and redirect customer to Order Success page
        window.open(whatsappUrl, '_blank');
        window.location.href = 'order-success.html';
    }
};

// Initialize Checkout on page load
document.addEventListener('DOMContentLoaded', () => {
    CheckoutApp.init();
});
