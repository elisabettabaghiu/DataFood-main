package it.unife.sample.backend.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    // Id del prodotto nel database.
    private Long productId;
    // Nome mostrato a video.
    private String nome;
    // Prezzo unitario letto dal DB.
    private double prezzo;
    // Quantità scelta dall'utente.
    private int quantita;
}
