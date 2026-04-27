package it.unife.sample.backend.dto;

import lombok.Data;

@Data
public class CartUpdateRequestDTO {
    // Id del prodotto da aggiornare.
    private Long productId;
    // Nuova quantità inserita dal frontend.
    private int quantita;
}
