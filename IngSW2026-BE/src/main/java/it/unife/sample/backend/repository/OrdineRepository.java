package it.unife.sample.backend.repository;

import it.unife.sample.backend.model.Ordine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdineRepository extends JpaRepository<Ordine, Integer> {

    // Restituisce lo storico ordini di uno specifico utente in ordine decrescente di data
    @Query("SELECT o FROM Ordine o WHERE o.utente.id = :userId ORDER BY o.data DESC")
    List<Ordine> findByUtenteId(@Param("userId") Long userId);
}
