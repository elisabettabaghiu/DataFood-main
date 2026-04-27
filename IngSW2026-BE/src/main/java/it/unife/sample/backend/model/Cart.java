package it.unife.sample.backend.model;

import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class Cart implements Serializable {

    // Lista degli articoli presenti nel carrello.
    private List<CartItem> items = new ArrayList<>();

    public void addItem(CartItem newItem) {
        // Se il prodotto esiste già, aumentiamo la quantità.
        CartItem existing = findItemByProductId(newItem.getProductId());
        if (existing != null) {
            existing.setQuantita(existing.getQuantita() + newItem.getQuantita());
            return;
        }
        // Altrimenti aggiungiamo una nuova riga al carrello.
        items.add(newItem);
    }

    public void removeItem(Long productId) {
        // Elimina il prodotto dalla lista se è presente.
        items.removeIf(item -> item.getProductId().equals(productId));
    }

    public void updateQuantity(Long productId, int quantita) {
        if (quantita <= 0) {
            // Quantità zero o negativa: il prodotto sparisce dal carrello.
            removeItem(productId);
            return;
        }

        // Aggiorna la quantità del prodotto già presente.
        CartItem existing = findItemByProductId(productId);
        if (existing != null) {
            existing.setQuantita(quantita);
        }
    }

    public double getTotal() {
        // Somma semplice: prezzo unitario per quantità per ogni riga.
        return items.stream()
                .mapToDouble(item -> item.getPrezzo() * item.getQuantita())
                .sum();
    }

    private CartItem findItemByProductId(Long productId) {
        // Cerca una riga del carrello tramite id prodotto.
        return items.stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);
    }
}
