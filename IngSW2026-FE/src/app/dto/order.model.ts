import { OrderItem } from './order-item.model';

export interface Order {
  // Id ordine generato dal database
  id: number;
  // Data creazione ordine
  data: string;
  // Stato ordine in_lavorazione completato annullato
  status: string;
  // Totale ordine calcolato lato backend
  totale: number;
  // Prodotti contenuti nell'ordine
  items: OrderItem[];
}
