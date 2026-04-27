package it.unife.sample.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem implements Serializable {

    // Dati base dell'articolo nel carrello.
    private Long productId;
    // Nome del prodotto.
    private String nome;
    // Prezzo unitario memorizzato in sessione.
    private double prezzo;
    // Quantità scelta.
    private int quantita;
}
