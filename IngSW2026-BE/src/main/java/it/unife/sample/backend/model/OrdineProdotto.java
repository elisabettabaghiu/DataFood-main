package it.unife.sample.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(OrdineProdottoId.class)
@Table(name = "ORDINE_PRODOTTO")
public class OrdineProdotto {

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_ORDINE", nullable = false)
    // Parte della chiave composta verso ORDINE
    private Ordine ordine;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_PRODOTTO", nullable = false)
    // Parte della chiave composta verso PRODOTTO
    private Prodotto prodotto;

    @Column(name = "QUANTITA", nullable = false)
    // Quantita ordinata per questo prodotto
    private Integer quantita;

    // Prezzo unitario salvato al momento del checkout
    @Column(name = "PREZZO_UNITARIO", nullable = false)
    private BigDecimal prezzoUnitario;
}
