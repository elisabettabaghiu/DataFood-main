package it.unife.sample.backend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ORDINE")
public class Ordine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    // Chiave primaria della tabella ORDINE
    private Integer id;

    @Column(name = "DATA", nullable = false)
    // Data e ora in cui viene effettuato il checkout
    private LocalDateTime data;

    @Column(name = "STATUS", nullable = false)
    // Stato ordine ad esempio in_lavorazione
    private String status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_UTENTE", nullable = false)
    // Utente che ha creato l'ordine
    private Utente utente;

    // Lista dei prodotti ordinati con quantita e prezzo storico
    @OneToMany(mappedBy = "ordine", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrdineProdotto> items = new ArrayList<>();
}
