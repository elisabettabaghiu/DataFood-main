import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';
import { WishlistService } from '../../service/wishlist.service';
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Output() searchChange = new EventEmitter<string>();

  // Testo della ricerca nella barra in alto.
  searchText = '';
  // Flag UI locale: quando true mostriamo i pulsanti di conferma logout.
  logoutConfirmationVisible = false;
  // Flag per determinare se siamo nella pagina wishlist
  isOnWishlistPage = false;
  // Flag per determinare se siamo nella pagina carrello
  isOnCartPage = false;

  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private router = inject(Router);

  ngOnInit(): void {
    // Ascoltiamo i cambi di pagina per capire dove siamo.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isOnWishlistPage = event.url === '/wishlist';
      this.isOnCartPage = event.url === '/cart';
    });

    // Se l'utente è già loggato, riallineiamo la wishlist in alto.
    this.wishlistService.loadForCurrentUser();
  }

  get currentUser() {
    // Recuperiamo l'utente loggato dal localStorage.
    return this.authService.getCurrentUser();
  }

  get wishlistCount(): number {
    // Numero elementi presenti nella wishlist.
    return this.wishlistService.count();
  }

  get cartCount(): number {
    // Numero totale di pezzi nel carrello.
    return this.cartService.count();
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchText);
  }

  requestLogout(): void {
    // Primo click: chiediamo conferma prima di uscire.
    this.logoutConfirmationVisible = true;
  }

  cancelLogout(): void {
    // Se annulla, chiudiamo solo il popup.
    this.logoutConfirmationVisible = false;
  }

  confirmLogout(): void {
    // Logout confermato: svuotiamo gli stati locali e torniamo al catalogo.
    this.wishlistService.clearOnLogout();
    this.cartService.clearOnLogout().subscribe();
    this.authService.logout();
    this.logoutConfirmationVisible = false;
    this.router.navigateByUrl('/');
  }
}
