package it.unife.sample.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "WISHLIST")
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_UTENTE", nullable = false)
    private Utente utente;

    @ManyToMany
    @JoinTable(
        name = "WISHLIST_PRODOTTO",
        joinColumns = @JoinColumn(name = "ID_WISHLIST"),
        inverseJoinColumns = @JoinColumn(name = "ID_PRODOTTO")
    )
    private Set<Prodotto> prodotti = new HashSet<>();
}