import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Cart } from '../dto/cart.model';

interface CartUpdateRequest {
  productId: number;
  quantita: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);

  // Base URL del carrello esposto dal backend.
  private readonly apiUrl = '/api/cart';

  // Stato locale del carrello dentro Angular.
  private _cart = signal<Cart>({ items: [], totale: 0 });

  // Espone il cart completo.
  readonly cart = computed(() => this._cart());
  // Espone solo la lista degli item.
  readonly items = computed(() => this._cart().items);
  // Conteggio rapido utile per badge e controlli UI.
  readonly count = computed(() => this._cart().items.reduce((sum, item) => sum + item.quantita, 0));
  // Totale del carrello calcolato dal backend.
  readonly total = computed(() => this._cart().totale);

  constructor() {
    // Quando parte l'app proviamo a leggere il carrello già presente in sessione.
    this.loadCart();
  }

  loadCart(): void {
    this.getCart().subscribe();
  }

  getCart(): Observable<Cart> {
    // Lettura carrello dalla sessione del backend.
    return this.http.get<Cart>(this.apiUrl).pipe(
      map((cart) => this.normalizeCart(cart)),
      tap((cart) => this._cart.set(cart)),
      catchError((error) => {
        console.error('Errore nel recupero carrello:', error);
        const emptyCart = this.emptyCart();
        this._cart.set(emptyCart);
        return of(emptyCart);
      })
    );
  }

  addToCart(productId: number): Observable<Cart> {
    // Aggiunge un prodotto al carrello della sessione.
    return this.http.post<Cart>(`${this.apiUrl}/add/${productId}`, {}).pipe(
      map((cart) => this.normalizeCart(cart)),
      tap((cart) => this._cart.set(cart)),
      catchError((error) => {
        console.error('Errore aggiunta al carrello:', error);
        return of(this._cart());
      })
    );
  }

  removeFromCart(productId: number): Observable<Cart> {
    // Rimuove una riga del carrello usando l'id prodotto.
    return this.http.post<Cart>(`${this.apiUrl}/remove/${productId}`, {}).pipe(
      map((cart) => this.normalizeCart(cart)),
      tap((cart) => this._cart.set(cart)),
      catchError((error) => {
        console.error('Errore rimozione dal carrello:', error);
        return of(this._cart());
      })
    );
  }

  updateQuantity(productId: number, quantita: number): Observable<Cart> {
    const payload: CartUpdateRequest = { productId, quantita };

    // Aggiorna la quantità del prodotto nel backend.
    return this.http.post<Cart>(`${this.apiUrl}/update`, payload).pipe(
      map((cart) => this.normalizeCart(cart)),
      tap((cart) => this._cart.set(cart)),
      catchError((error) => {
        console.error('Errore aggiornamento quantita carrello:', error);
        return of(this._cart());
      })
    );
  }

  clearOnLogout(): Observable<Cart> {
    // Durante il logout svuotiamo il carrello nella sessione.
    return this.http.post<Cart>(`${this.apiUrl}/clear`, {}).pipe(
      map((cart) => this.normalizeCart(cart)),
      tap((cart) => this._cart.set(cart)),
      catchError((error) => {
        console.error('Errore pulizia carrello al logout:', error);
        const emptyCart = this.emptyCart();
        this._cart.set(emptyCart);
        return of(emptyCart);
      })
    );
  }

  private normalizeCart(cart: Cart | null | undefined): Cart {
    // Difesa semplice: se il backend risponde male, mostriamo un carrello vuoto.
    if (!cart) {
      return this.emptyCart();
    }

    const items = Array.isArray(cart.items) ? cart.items : [];
    const safeItems = items.map((item) => ({
      productId: item?.productId ?? 0,
      nome: item?.nome ?? 'Prodotto',
      prezzo: Number(item?.prezzo ?? 0),
      quantita: Number(item?.quantita ?? 0)
    }));

    return {
      items: safeItems,
      totale: Number(cart.totale ?? 0)
    };
  }

  private emptyCart(): Cart {
    // Struttura base usata quando non ci sono prodotti.
    return { items: [], totale: 0 };
  }
}
