package it.unife.sample.backend.repository;

import it.unife.sample.backend.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {

    /**
        * Cerca la lista desideri tramite id utente.
     */
    Optional<Wishlist> findByUtente_Id(Integer utenteId);

    /**
        * Cerca la lista desideri con i prodotti tramite id utente (fetch eager).
     */
    @Query("SELECT w FROM Wishlist w LEFT JOIN FETCH w.prodotti WHERE w.utente.id = :utenteId")
    Optional<Wishlist> findByUtente_IdWithProdotti(@Param("utenteId") Integer utenteId);

    /**
        * Verifica se un prodotto e presente nella lista desideri dell'utente.
     */
    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM Wishlist w " +
           "JOIN w.prodotti p WHERE w.utente.id = :utenteId AND p.id = :prodottoId")
    boolean isProdottoInWishlist(@Param("utenteId") Integer utenteId, @Param("prodottoId") Integer prodottoId);
}