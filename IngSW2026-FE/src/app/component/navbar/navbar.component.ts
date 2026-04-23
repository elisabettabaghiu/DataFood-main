import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';
import { WishlistService } from '../../service/wishlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Output() searchChange = new EventEmitter<string>();

  searchText = '';
  // Flag UI locale: quando true mostriamo i pulsanti di conferma logout.
  logoutConfirmationVisible = false;
  // Flag per determinare se siamo nella pagina wishlist
  isOnWishlistPage = false;

  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private router = inject(Router);

  ngOnInit(): void {
    // Monitora i cambiamenti di rotta per determinare se siamo nella wishlist
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isOnWishlistPage = event.url === '/wishlist';
    });

    // Carica la wishlist per l'utente corrente se già loggato
    this.wishlistService.loadForCurrentUser();
  }

  get currentUser() {
    // Lo leggiamo dal service cosi tutta la logica di persistenza resta centralizzata.
    return this.authService.getCurrentUser();
  }

  get wishlistCount(): number {
    return this.wishlistService.count();
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchText);
  }

  requestLogout(): void {
    // Primo click su logout: non usciamo subito, chiediamo conferma.
    this.logoutConfirmationVisible = true;
  }

  cancelLogout(): void {
    // Se annulla, torniamo alla navbar compatta senza perdere utente.
    this.logoutConfirmationVisible = false;
  }

  confirmLogout(): void {
    // Logout confermato: pulizia stato wishlist e redirect al catalogo.
    this.wishlistService.clearOnLogout();
    this.authService.logout();
    this.logoutConfirmationVisible = false;
    this.router.navigateByUrl('/');
  }
}
