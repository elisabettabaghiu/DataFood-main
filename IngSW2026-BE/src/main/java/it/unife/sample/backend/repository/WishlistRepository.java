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
     * Find wishlist by user ID.
     */
    Optional<Wishlist> findByUtente_Id(Integer utenteId);

    /**
     * Find wishlist with products by user ID (eager fetch).
     */
    @Query("SELECT w FROM Wishlist w LEFT JOIN FETCH w.prodotti WHERE w.utente.id = :utenteId")
    Optional<Wishlist> findByUtente_IdWithProdotti(@Param("utenteId") Integer utenteId);

    /**
     * Check if a product is in a user's wishlist.
     */
    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM Wishlist w " +
           "JOIN w.prodotti p WHERE w.utente.id = :utenteId AND p.id = :prodottoId")
    boolean isProdottoInWishlist(@Param("utenteId") Integer utenteId, @Param("prodottoId") Integer prodottoId);
}