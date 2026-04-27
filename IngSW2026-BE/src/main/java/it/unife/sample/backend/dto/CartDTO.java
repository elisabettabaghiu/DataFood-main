package it.unife.sample.backend.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CartDTO {
    // Lista degli articoli visibili dal frontend.
    private List<CartItemDTO> items = new ArrayList<>();
    // Totale finale del carrello.
    private double totale;
}
