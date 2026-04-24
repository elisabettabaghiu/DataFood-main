import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { Prodotto } from '../dto/prodotto.model';
import { AuthService } from './auth.service';

interface WishlistResponse {
  id: number;
  utenteId: number;
  prodotti: Prodotto[];
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  private readonly apiUrl = '/api/wishlist';

  // Signal reattivo per la lista dei prodotti nella wishlist
  private _items = signal<Prodotto[]>([]);

  // Signal per tracciare l'utente corrente
  private _currentUserId = signal<number | null>(null);

  // Signal per tracciare lo stato di caricamento
  private _loading = signal<boolean>(false);

  // Computed: lista dei prodotti (solo lettura)
  readonly items = computed(() => this._items());

  // Computed: count per display rapido
  readonly count = computed(() => this._items().length);

  // Computed: loading state
  readonly loading = computed(() => this._loading());

  constructor() {
    // Carica la wishlist per l'utente corrente se già loggato
    this.loadForCurrentUser();
  }

  // Carica la wishlist per l'utente attualmente loggato dal database
  loadForCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this._currentUserId.set(user.id);
      this.loadFromBackend(user.id);
    } else {
      this._currentUserId.set(null);
      this._items.set([]);
    }
  }

  // Carica la wishlist dal backend
  private loadFromBackend(userId: number): void {
    this._loading.set(true);
    
    const params = new HttpParams().set('utenteId', userId.toString());
    
    this.http.get<WishlistResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        if (response && response.prodotti) {
          this._items.set(response.prodotti);
        } else {
          this._items.set([]);
        }
        this._loading.set(false);
      }),
      catchError(error => {
        console.error('Errore nel caricamento wishlist:', error);
        this._items.set([]);
        this._loading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  // Computed: verifica se un prodotto è nella wishlist
  isInWishlist(prodotto: Prodotto): boolean {
    return this._items().some(p => p.id === prodotto.id);
  }

  // Aggiungi o rimuovi prodotto (toggle) - chiamata al backend
  toggle(prodotto: Prodotto): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('Effettua il login per modificare la wishlist');
      return false;
    }

    const currentItems = this._items();
    const exists = currentItems.some(p => p.id === prodotto.id);

    if (exists) {
      // Rimuovi dal backend
      this.removeFromBackend(user.id, prodotto.id);
      this._items.set(currentItems.filter(p => p.id !== prodotto.id));
      return false;
    } else {
      // Aggiungi al backend
      this.addToBackend(user.id, prodotto.id);
      this._items.set([...currentItems, prodotto]);
      return true;
    }
  }

  // Aggiungi prodotto al backend
  private addToBackend(utenteId: number, prodottoId: number): void {
    const params = new HttpParams()
      .set('utenteId', utenteId.toString())
      .set('prodottoId', prodottoId.toString());

    this.http.post<WishlistResponse>(this.apiUrl, {}, { params }).pipe(
      catchError(error => {
        console.error('Errore aggiunta wishlist:', error);
        return of(null);
      })
    ).subscribe();
  }

  // Rimuovi prodotto dal backend
  private removeFromBackend(utenteId: number, prodottoId: number): void {
    const params = new HttpParams()
      .set('utenteId', utenteId.toString())
      .set('prodottoId', prodottoId.toString());

    this.http.delete<WishlistResponse>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Errore rimozione wishlist:', error);
        return of(null);
      })
    ).subscribe();
  }

  // Rimuovi prodotto esplicitamente (usato dalla wishlist page)
  remove(prodotto: Prodotto): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const currentItems = this._items();
    this._items.set(currentItems.filter(p => p.id !== prodotto.id));
    
    // Sincronizza con il backend
    this.removeFromBackend(user.id, prodotto.id);
  }

  // Svuota completamente la wishlist
  clear(): void {
    this._items.set([]);
  }

  // Pulisci la wishlist (usato al logout) - NON cancella dal DB, preserva i dati
  clearOnLogout(): void {
    // Non chiamare il backend - i dati restano salvati nel database
    // Solo pulizia stato locale
    this._currentUserId.set(null);
    this._items.set([]);
  }
}