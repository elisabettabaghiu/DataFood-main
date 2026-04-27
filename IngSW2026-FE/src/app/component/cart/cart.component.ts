import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CartService } from '../../service/cart.service';
import { CartItem } from '../../dto/cart-item.model';
import { OrderService } from '../../service/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);

  // Stato UI del checkout
  checkoutLoading = false;
  checkoutSuccessMessage = '';
  checkoutErrorMessage = '';

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

  checkout(): void {
    // Evita checkout se il carrello locale e gia vuoto
    if (this.items.length === 0 || this.checkoutLoading) {
      return;
    }

    this.checkoutLoading = true;
    this.checkoutSuccessMessage = '';
    this.checkoutErrorMessage = '';

    // Chiamata al backend per trasformare il carrello in ordine salvato sul DB
    this.orderService.checkout().subscribe({
      next: () => {
        this.checkoutLoading = false;
        this.checkoutSuccessMessage = 'Checkout completato ordine creato con successo';
        // Dopo checkout il backend svuota la sessione, quindi riallineiamo la UI
        this.cartService.loadCart();
      },
      error: (error) => {
        this.checkoutLoading = false;

        // 401 utente non autenticato in sessione backend
        if (error?.status === 401) {
          this.checkoutErrorMessage = 'Effettua il login prima di completare il checkout';
          return;
        }

        // 400 carrello assente o vuoto lato backend
        if (error?.status === 400) {
          this.checkoutErrorMessage = 'Carrello vuoto o non valido';
          this.cartService.loadCart();
          return;
        }

        if (error?.status === 404) {
          // 404 puo dipendere sia da endpoint non raggiungibile sia da dati non trovati lato backend
          this.checkoutErrorMessage = 'Checkout non disponibile o dati non trovati controlla backend e prodotti';
          this.cartService.loadCart();
          return;
        }

        if (error?.status === 0) {
          // Status 0: tipico caso di backend spento o proxy non raggiungibile
          this.checkoutErrorMessage = 'Backend non raggiungibile avvia il server e riprova';
          return;
        }

        this.checkoutErrorMessage = 'Errore durante il checkout riprova';
      }
    });
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
