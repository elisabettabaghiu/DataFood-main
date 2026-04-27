export interface OrderItem {
  // Id del prodotto ordinato
  productId: number;
  // Nome prodotto salvato nello storico ordine
  nome: string;
  // Prezzo unitario al momento del checkout
  prezzo: number;
  // Quantita ordinata
  quantita: number;
}
