package it.unife.sample.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdineProdottoId implements Serializable {

    private Integer ordine;
    private Integer prodotto;
}
