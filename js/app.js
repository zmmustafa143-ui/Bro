// js/app.js - Global variables and functions

const App = {
    settings: {},
    
    // JSON fetcher helper
    fetchJSON: async function(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            return null;
        }
    },

    // Load global settings (Logo, currency etc)
    initGlobal: async function() {
        this.settings = await this.fetchJSON('data/settings.json') || { currencySymbol: "Rs. ", shopName: "DelishDrop" };
        
        const logoEl = document.getElementById('shop-logo');
        if (logoEl) logoEl.innerText = this.settings.shopName;

        this.updateCartCount();
    },

    // Update cart counter in the navbar
    updateCartCount: function() {
        const cart = JSON.parse(localStorage.getItem('fastFoodCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const countEl = document.getElementById('cart-count');
        if (countEl) countEl.innerText = totalItems;
    },

    // Format money
    formatMoney: function(amount) {
        return (this.settings.currencySymbol || "Rs. ") + amount.toLocaleString('en-PK');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    App.initGlobal();
});
