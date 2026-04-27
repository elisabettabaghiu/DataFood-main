import { CartItem } from './cart-item.model';

export interface Cart {
  // Lista dei prodotti inseriti nella sessione.
  items: CartItem[];
  // Totale del carrello.
  totale: number;
}
