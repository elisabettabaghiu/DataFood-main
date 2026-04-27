import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { WishlistService } from '../../service/wishlist.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  login(): void {
    // Controllo base per evitare chiamate HTTP con campi vuoti
    if (!this.email || !this.password) {
      return;
    }

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (user) => {
        console.log('Login ok', user);
        // Se il login va bene, salvo l'utente e torno al catalogo
        this.authService.saveCurrentUser(user);
        // Ricarico la wishlist dal database per l'utente appena loggato
        this.wishlistService.loadForCurrentUser();
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        // Tengo il log semplice per debug da console durante sviluppo
        console.error('Errore login', err);
      }
    });
  }
}