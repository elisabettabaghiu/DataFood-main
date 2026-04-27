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

  // Signal reattivo con i prodotti presenti nella lista desideri.
  private _items = signal<Prodotto[]>([]);

  // Tiene traccia dell'id dell'utente attualmente loggato.
  private _currentUserId = signal<number | null>(null);

  // Indica se stiamo caricando i dati dal backend.
  private _loading = signal<boolean>(false);

  // Espone la lista in sola lettura ai componenti.
  readonly items = computed(() => this._items());

  // Conteggio rapido degli elementi, utile per badge/navbar.
  readonly count = computed(() => this._items().length);

  // Espone lo stato di caricamento in sola lettura.
  readonly loading = computed(() => this._loading());

  constructor() {
    // All'avvio prova a caricare la lista desideri dell'utente loggato.
    this.loadForCurrentUser();
  }

  // Carica dal database la lista desideri dell'utente corrente.
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

  // Chiamata HTTP al backend per ottenere la lista desideri.
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

  // Controlla se un prodotto e gia presente nella lista desideri.
  isInWishlist(prodotto: Prodotto): boolean {
    return this._items().some(p => p.id === prodotto.id);
  }

  // Aggiunge o rimuove un prodotto con logica toggle.
  toggle(prodotto: Prodotto): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('Effettua il login per modificare la lista desideri');
      return false;
    }

    const currentItems = this._items();
    const exists = currentItems.some(p => p.id === prodotto.id);

    if (exists) {
      // Se esiste gia, lo rimuoviamo sia localmente che sul backend.
      this.removeFromBackend(user.id, prodotto.id);
      this._items.set(currentItems.filter(p => p.id !== prodotto.id));
      return false;
    } else {
      // Se non esiste, lo aggiungiamo localmente e sul backend.
      this.addToBackend(user.id, prodotto.id);
      this._items.set([...currentItems, prodotto]);
      return true;
    }
  }

  // Chiamata POST per aggiungere un prodotto alla lista desideri.
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

  // Chiamata DELETE per rimuovere un prodotto dalla lista desideri.
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

  // Rimozione esplicita usata nella pagina lista desideri.
  remove(prodotto: Prodotto): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const currentItems = this._items();
    this._items.set(currentItems.filter(p => p.id !== prodotto.id));
    
    // Mantiene allineato anche lo stato nel database.
    this.removeFromBackend(user.id, prodotto.id);
  }

  // Svuota completamente lo stato locale della lista desideri.
  clear(): void {
    this._items.set([]);
  }

  // Pulizia al logout: non elimina i dati nel database.
  clearOnLogout(): void {
    // Qui puliamo solo lo stato locale in memoria.
    this._currentUserId.set(null);
    this._items.set([]);
  }
}