import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { WishlistService } from '../../service/wishlist.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  email = '';
  password = '';
  nome = '';
  cognome = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  register(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // Evito chiamate HTTP con campi mancanti o vuoti
    if (!this.email || !this.password || !this.nome || !this.cognome) {
      this.errorMessage = 'Compila tutti i campi prima di registrarti.';
      return;
    }

    this.authService.register({
      email: this.email,
      password: this.password,
      nome: this.nome,
      cognome: this.cognome
    }).subscribe({
      next: (user) => {
        console.log('Registrazione ok', user);
        this.successMessage = 'Registrazione completata con successo.';
        this.errorMessage = '';
        // Come nel login, salvo l'utente nel localStorage cosi risulta subito loggato
        this.authService.saveCurrentUser(user);
        // Aggiorno subito la lista desideri in base al nuovo utente
        this.wishlistService.loadForCurrentUser();
        // Dopo la registrazione riuscita torno alla homepage
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error('Errore registrazione', err);
        this.successMessage = '';
        if (err?.status === 409) {
          this.errorMessage = 'Email gia registrata. Usa un altra email.';
          return;
        }
        this.errorMessage = 'Errore durante la registrazione. Riprova.';
      }
    });
  }
}
