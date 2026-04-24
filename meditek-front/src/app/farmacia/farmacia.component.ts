import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  createdAt: string;
}

@Component({
  selector: 'app-farmacia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './farmacia.component.html',
  styleUrls: ['./farmacia.component.scss']
})
export class FarmaciaComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'all';
  cart: { product: Product, quantity: number }[] = [];
  showCart: boolean = false;
  showCheckoutModal: boolean = false;
  checkoutForm = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  categories = ['all', 'Medicamentos', 'Equipos', 'Insumos'];

  constructor() { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCart();
  }

  loadProducts(): void {
    // Cargar productos del admin (farmacia)
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      this.products = JSON.parse(storedProducts);
    } else {
      // Productos de ejemplo si no hay
      this.products = [
        { id: 1, name: 'Paracetamol 500mg', price: 15.00, stock: 100, description: 'Analgésico y antipirético', createdAt: new Date().toISOString() },
        { id: 2, name: 'Ibuprofeno 400mg', price: 25.00, stock: 80, description: 'Antiinflamatorio', createdAt: new Date().toISOString() },
        { id: 3, name: 'Amoxicilina 500mg', price: 35.00, stock: 50, description: 'Antibiótico', createdAt: new Date().toISOString() },
        { id: 4, name: 'Termómetro Digital', price: 45.00, stock: 30, description: 'Termómetro digital de alta precisión', createdAt: new Date().toISOString() },
        { id: 5, name: 'Mascarillas KN95', price: 8.00, stock: 200, description: 'Protección respiratoria', createdAt: new Date().toISOString() }
      ];
    }
    this.filterProducts();
  }

  loadCart(): void {
    const storedCart = localStorage.getItem('farmacia_cart');
    if (storedCart) {
      this.cart = JSON.parse(storedCart);
    }
  }

  saveCart(): void {
    localStorage.setItem('farmacia_cart', JSON.stringify(this.cart));
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  addToCart(product: Product): void {
    const existingItem = this.cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
      } else {
        alert('No hay suficiente stock disponible');
        return;
      }
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.saveCart();
    alert(`✅ ${product.name} agregado al carrito`);
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.saveCart();
  }

  updateQuantity(index: number, quantity: number): void {
    const item = this.cart[index];
    if (quantity > 0 && quantity <= item.product.stock) {
      item.quantity = quantity;
      this.saveCart();
    } else if (quantity > item.product.stock) {
      alert('No hay suficiente stock');
    }
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  openCheckout(): void {
    if (this.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Cargar datos del usuario logueado
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.checkoutForm.name = userData.name || '';
        this.checkoutForm.email = userData.email || '';
      } catch (e) { }
    }

    this.showCheckoutModal = true;
  }

  processCheckout(): void {
    if (!this.checkoutForm.name || !this.checkoutForm.email || !this.checkoutForm.address) {
      alert('Por favor complete todos los campos');
      return;
    }

    // Actualizar stock de productos
    this.cart.forEach(cartItem => {
      const product = this.products.find(p => p.id === cartItem.product.id);
      if (product) {
        product.stock -= cartItem.quantity;
      }
    });

    // Guardar productos actualizados
    localStorage.setItem('products', JSON.stringify(this.products));

    // Generar comprobante
    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      customer: this.checkoutForm,
      items: [...this.cart],
      total: this.getCartTotal()
    };

    // Guardar historial de pedidos
    const orders = localStorage.getItem('farmacia_orders');
    const allOrders = orders ? JSON.parse(orders) : [];
    allOrders.push(order);
    localStorage.setItem('farmacia_orders', JSON.stringify(allOrders));

    // Limpiar carrito
    this.cart = [];
    this.saveCart();

    // Simular envío de correo
    alert(`📧 ¡Pedido realizado con éxito!\n\nResumen:\n${this.generateOrderSummary(order)}\n\nSe ha enviado un correo con los detalles a ${this.checkoutForm.email}\n\n📦 Tu pedido será entregado en: ${this.checkoutForm.address}`);

    this.closeCheckout();
    this.loadProducts();
    this.filterProducts();
  }

  generateOrderSummary(order: any): string {
    let summary = '';
    order.items.forEach((item: any) => {
      summary += `${item.quantity}x ${item.product.name} - S/ ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    summary += `\nTotal: S/ ${order.total.toFixed(2)}`;
    return summary;
  }

  clearCart(): void {
    if (confirm('¿Vaciar carrito completamente?')) {
      this.cart = [];
      this.saveCart();
    }
  }

  closeCheckout(): void {
    this.showCheckoutModal = false;
    this.checkoutForm = {
      name: '',
      email: '',
      phone: '',
      address: ''
    };
  }

  toggleCart(): void {
    this.showCart = !this.showCart;
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }

  closeModalOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.showCheckoutModal = false;
    }
  }
}