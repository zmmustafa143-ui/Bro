// js/products.js - Handles Menu Page rendering and filtering

const MenuApp = {
    products: [],
    categories: [],
    activeCategory: 'all',

    init: async function() {
        // Load data from JSON files
        this.categories = await App.fetchJSON('data/categories.json') || [];
        this.products = await App.fetchJSON('data/products.json') || [];

        // Sort data based on sortOrder
        this.categories.sort((a, b) => a.sortOrder - b.sortOrder);
        this.products.sort((a, b) => a.sortOrder - b.sortOrder);

        this.renderCategories();
        this.renderProducts();
    },

    renderCategories: function() {
        const container = document.getElementById('category-container');
        if (!container) return;

        container.innerHTML = '';

        // Add "All" button
        const allBtn = document.createElement('button');
        allBtn.className = `filter-btn ${this.activeCategory === 'all' ? 'active' : ''}`;
        allBtn.innerText = 'All';
        allBtn.onclick = () => this.filterMenu('all');
        container.appendChild(allBtn);

        // Add dynamically loaded active categories
        this.categories.forEach(cat => {
            if (cat.active) {
                const btn = document.createElement('button');
                btn.className = `filter-btn ${this.activeCategory === cat.id ? 'active' : ''}`;
                btn.innerText = cat.title;
                btn.onclick = () => this.filterMenu(cat.id);
                container.appendChild(btn);
            }
        });
    },

    filterMenu: function(categoryId) {
        this.activeCategory = categoryId;
        this.renderCategories(); // Update active button styling
        this.renderProducts();   // Re-render grid
    },

    renderProducts: function() {
        const container = document.getElementById('product-container');
        if (!container) return;

        container.innerHTML = '';

        // Filter products based on selected category
        const filteredProducts = this.activeCategory === 'all' 
            ? this.products 
            : this.products.filter(p => p.category === this.activeCategory);

        // Check if available
        const visibleProducts = filteredProducts.filter(p => p.available);

        if (visibleProducts.length === 0) {
            container.innerHTML = `<div class="empty-state">No items found in this category.</div>`;
            return;
        }

        // Generate HTML for each product
        visibleProducts.forEach(product => {
            // Default image fallback if none exists
            const imgSrc = product.image ? product.image : 'https://placehold.co/300x200?text=Food+Image';
            
            const card = document.createElement('div');
            card.className = 'product-card';
            
            card.innerHTML = `
                <div class="card-top">
                    <img src="${imgSrc}" alt="${product.title}" onerror="this.src='https://placehold.co/300x200?text=Image+Not+Found'">
                </div>
                <div class="card-bottom">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-price">${App.formatMoney(product.price)}</div>
                    
                    <button class="add-to-cart-btn" onclick="MenuApp.addToCart('${product.id}')" aria-label="Add ${product.title} to cart">
                        🛒
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    addToCart: function(productId) {
        // Find product
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Get existing cart
        let cart = JSON.parse(localStorage.getItem('fastFoodCart')) || [];
        
        // Check if item already exists
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            // Store only ID, Title, Price, Image and Quantity (Re-validated at checkout)
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        // Save back to local storage
        localStorage.setItem('fastFoodCart', JSON.stringify(cart));
        
        // Update global cart counter
        App.updateCartCount();

        // Optional: Show a small temporary alert/toast
        alert(`${product.title} added to cart!`);
    }
};

// Initialize menu when page loads
document.addEventListener('DOMContentLoaded', () => {
    MenuApp.init();
});
