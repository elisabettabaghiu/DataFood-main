import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { WishlistService } from '../../service/wishlist.service';
import { AuthService } from '../../service/auth.service';
import { Prodotto } from '../../dto/prodotto.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, ProductCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent {
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);

  get items(): Prodotto[] {
    return this.wishlistService.items();
  }

  get isLoggedIn(): boolean {
    return this.authService.getCurrentUser() !== null;
  }

  removeFromWishlist(prodotto: Prodotto): void {
    this.wishlistService.remove(prodotto);
  }

  onSearchChange(value: string): void {
    // La lista desideri al momento non prevede la ricerca.
  }
}