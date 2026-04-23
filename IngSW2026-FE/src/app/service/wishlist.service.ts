import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Prodotto } from '../dto/prodotto.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private authService = inject(AuthService);
  
  // Chiave base per localStorage
  private readonly STORAGE_KEY_BASE = 'userWishlist';

  // Signal reattivo per la lista dei prodotti nella wishlist
  private _items = signal<Prodotto[]>([]);

  // Signal per tracciare l'utente corrente
  private _currentUserId = signal<number | null>(null);

  // Computed: lista dei prodotti (solo lettura)
  readonly items = computed(() => this._items());

  // Computed: count per display rapido
  readonly count = computed(() => this._items().length);

  constructor() {
    // Effect per sincronizzare automaticamente con localStorage
    effect(() => {
      const userId = this._currentUserId();
      if (userId) {
        localStorage.setItem(this.getStorageKey(userId), JSON.stringify(this._items()));
      }
    });

    // Carica la wishlist per l'utente corrente se già loggato
    this.loadForCurrentUser();
  }

  // Carica la wishlist per l'utente attualmente loggato
  loadForCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this._currentUserId.set(user.id);
      this._items.set(this.loadFromStorage(user.id));
    } else {
      this._currentUserId.set(null);
      this._items.set([]);
    }
  }

  // Genera la chiave di storage per un utente specifico
  private getStorageKey(userId: number): string {
    return `${this.STORAGE_KEY_BASE}_${userId}`;
  }

  // Computed: verifica se un prodotto è nella wishlist
  isInWishlist(prodotto: Prodotto): boolean {
    return this._items().some(p => p.id === prodotto.id);
  }

  // Aggiungi o rimuovi prodotto (toggle)
  toggle(prodotto: Prodotto): boolean {
    const currentItems = this._items();
    const exists = currentItems.some(p => p.id === prodotto.id);

    if (exists) {
      // Rimuovi
      this._items.set(currentItems.filter(p => p.id !== prodotto.id));
      return false;
    } else {
      // Aggiungi
      this._items.set([...currentItems, prodotto]);
      return true;
    }
  }

  // Rimuovi prodotto esplicitamente
  remove(prodotto: Prodotto): void {
    const currentItems = this._items();
    this._items.set(currentItems.filter(p => p.id !== prodotto.id));
  }

  // Svuota completamente la wishlist
  clear(): void {
    this._items.set([]);
  }

  // Pulisci la wishlist (usato al logout)
  clearOnLogout(): void {
    this._currentUserId.set(null);
    this._items.set([]);
  }

  // Carica da localStorage per un utente specifico
  private loadFromStorage(userId: number): Prodotto[] {
    const stored = localStorage.getItem(this.getStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  }
}