import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prodotto } from '../../dto/prodotto.model';
import { WishlistService } from '../../service/wishlist.service';
import { AuthService } from '../../service/auth.service';
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) prodotto!: Prodotto;

  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  // Quantità scelta dall'utente prima di aggiungere al carrello.
  quantity = 1;
  // Messaggio breve mostrato sotto il pulsante carrello.
  cartFeedbackMessage = '';
  // Tipo del messaggio: serve solo per il colore.
  cartFeedbackType: 'success' | 'error' | '' = '';
  // Timer usato per far sparire il feedback dopo poco tempo.
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  // Computed: verifica se questo prodotto è nella wishlist
  get wishlistSelected(): boolean {
    return this.wishlistService.isInWishlist(this.prodotto);
  }

  // Verifica se l'utente è loggato
  get isLoggedIn(): boolean {
    return this.authService.getCurrentUser() !== null;
  }

  decrementQuantity(): void {
    // Evitiamo di scendere sotto zero.
    if (this.quantity > 0) {
      this.quantity -= 1;
    }
  }

  incrementQuantity(): void {
    // Ogni click aumenta di uno la quantità.
    this.quantity += 1;
  }

  toggleWishlist(): void {
    // Solo gli utenti loggati possono usare la wishlist.
    if (!this.isLoggedIn) {
      alert('Effettua il login per aggiungere prodotti alla wishlist');
      return;
    }
    this.wishlistService.toggle(this.prodotto);
  }

  addToCart(): void {
    if (!this.prodotto || this.quantity <= 0) {
      return;
    }

    // Solo gli utenti loggati possono aggiungere prodotti al carrello
    if (!this.isLoggedIn) {
      alert('Effettua il login per aggiungere prodotti al carrello');
      return;
    }

    // Puliamo il messaggio precedente prima di mostrare quello nuovo.
    this.setCartFeedback('', '');

    // Prima aggiunta, il backend crea la riga del prodotto in sessione
    this.cartService.addToCart(this.prodotto.id).subscribe({
      next: (cart) => {
        if (this.quantity > 1) {
          const item = cart.items.find((current) => current.productId === this.prodotto.id);
          if (!item) {
            this.setCartFeedback('Prodotto aggiunto al carrello', 'success');
            return;
          }

          // Aggiorna in un secondo step la quantita totale desiderata
          const targetQuantity = item.quantita + (this.quantity - 1);
          this.cartService.updateQuantity(this.prodotto.id, targetQuantity).subscribe({
            next: () => this.setCartFeedback('Prodotto aggiunto al carrello', 'success'),
            error: () => this.setCartFeedback('Impossibile aggiornare la quantità', 'error')
          });
          return;
        }

        this.setCartFeedback('Prodotto aggiunto al carrello', 'success');
      },
      error: () => this.setCartFeedback('Prodotto non disponibile', 'error')
    });
  }

  private setCartFeedback(message: string, type: 'success' | 'error' | ''): void {
    // Se c'era già un timer attivo, lo fermiamo prima.
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }

    // Aggiorniamo il messaggio visibile a video.
    this.cartFeedbackMessage = message;
    this.cartFeedbackType = type;

    if (!message) {
      return;
    }

    // Dopo poco il messaggio sparisce da solo.
    this.feedbackTimer = setTimeout(() => {
      this.cartFeedbackMessage = '';
      this.cartFeedbackType = '';
      this.feedbackTimer = null;
    }, 2200);
  }
}
