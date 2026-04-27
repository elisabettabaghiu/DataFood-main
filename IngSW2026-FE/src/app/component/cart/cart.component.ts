import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CartService } from '../../service/cart.service';
import { CartItem } from '../../dto/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(CartService);

  get items(): CartItem[] {
    // Lista degli articoli letta dal service.
    return this.cartService.items();
  }

  get totale(): number {
    // Totale complessivo del carrello.
    return this.cartService.total();
  }

  onSearchChange(value: string): void {
    // Il carrello non prevede filtri testuali al momento.
  }

  increment(item: CartItem): void {
    // Aumento di una unità.
    const nextQuantity = item.quantita + 1;
    this.cartService.updateQuantity(item.productId, nextQuantity).subscribe();
  }

  decrement(item: CartItem): void {
    // Diminuiamo la quantità; se arriva a zero il backend rimuove l'item.
    const nextQuantity = item.quantita - 1;
    this.cartService.updateQuantity(item.productId, nextQuantity).subscribe();
  }

  remove(item: CartItem): void {
    // Rimozione diretta del prodotto.
    this.cartService.removeFromCart(item.productId).subscribe();
  }

  updateFromInput(item: CartItem, value: string): void {
    // Leggiamo il valore inserito a mano dall'utente.
    const parsed = Number(value);

    if (Number.isNaN(parsed) || parsed < 0) {
      // Se il valore non va bene, ricarichiamo lo stato corretto dal backend.
      this.cartService.loadCart();
      return;
    }

    // Arrotondiamo verso il basso per stare su un numero intero.
    this.cartService.updateQuantity(item.productId, Math.floor(parsed)).subscribe();
  }
}
