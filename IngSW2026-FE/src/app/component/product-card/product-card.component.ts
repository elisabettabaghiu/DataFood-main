import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prodotto } from '../../dto/prodotto.model';
import { WishlistService } from '../../service/wishlist.service';
import { AuthService } from '../../service/auth.service';

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

  quantity = 1;

  // Computed: verifica se questo prodotto è nella wishlist
  get wishlistSelected(): boolean {
    return this.wishlistService.isInWishlist(this.prodotto);
  }

  // Verifica se l'utente è loggato
  get isLoggedIn(): boolean {
    return this.authService.getCurrentUser() !== null;
  }

  decrementQuantity(): void {
    if (this.quantity > 0) {
      this.quantity -= 1;
    }
  }

  incrementQuantity(): void {
    this.quantity += 1;
  }

  toggleWishlist(): void {
    // Solo gli utenti loggati possono aggiungere alla wishlist
    if (!this.isLoggedIn) {
      alert('Effettua il login per aggiungere prodotti alla wishlist');
      return;
    }
    this.wishlistService.toggle(this.prodotto);
  }

  addToCart(): void {
    // Placeholder locale: conferma la quantita selezionata.
    if (this.quantity === 0) {
      return;
    }
  }
}
