package it.unife.sample.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class WishlistDTO {
    private Integer id;
    private Integer utenteId;
    private List<ProdottoDTO> prodotti;
}