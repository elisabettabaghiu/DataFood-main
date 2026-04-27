package it.unife.sample.backend.service;

import it.unife.sample.backend.dto.WishlistDTO;
import it.unife.sample.backend.mapper.WishlistMapper;
import it.unife.sample.backend.model.Prodotto;
import it.unife.sample.backend.model.Utente;
import it.unife.sample.backend.model.Wishlist;
import it.unife.sample.backend.repository.ProdottoRepository;
import it.unife.sample.backend.repository.UtenteRepository;
import it.unife.sample.backend.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UtenteRepository utenteRepository;
    private final ProdottoRepository prodottoRepository;
    private final WishlistMapper wishlistMapper;

    public WishlistService(
            WishlistRepository wishlistRepository,
            UtenteRepository utenteRepository,
            ProdottoRepository prodottoRepository,
            WishlistMapper wishlistMapper) {
        this.wishlistRepository = wishlistRepository;
        this.utenteRepository = utenteRepository;
        this.prodottoRepository = prodottoRepository;
        this.wishlistMapper = wishlistMapper;
    }

    /**
        * Recupera la lista desideri di uno specifico utente.
     */
    public Optional<WishlistDTO> getWishlistByUtenteId(Integer utenteId) {
        return wishlistRepository.findByUtente_IdWithProdotti(utenteId)
                .map(wishlistMapper::toDTO);
    }

    /**
        * Aggiunge un prodotto alla lista desideri dell'utente.
     */
    @Transactional
    public WishlistDTO addProdotto(Integer utenteId, Integer prodottoId) {
        Utente utente = utenteRepository.findById(utenteId)
                .orElseThrow(() -> new IllegalArgumentException("Utente non trovato"));

        Prodotto prodotto = prodottoRepository.findById(prodottoId)
                .orElseThrow(() -> new IllegalArgumentException("Prodotto non trovato"));

        Wishlist wishlist = wishlistRepository.findByUtente_IdWithProdotti(utenteId)
                .orElseGet(() -> {
                    Wishlist newWishlist = new Wishlist();
                    newWishlist.setUtente(utente);
                    return wishlistRepository.save(newWishlist);
                });

        wishlist.getProdotti().add(prodotto);
        Wishlist saved = wishlistRepository.save(wishlist);
        return wishlistMapper.toDTO(saved);
    }

    /**
        * Rimuove un prodotto dalla lista desideri dell'utente.
     */
    @Transactional
    public WishlistDTO removeProdotto(Integer utenteId, Integer prodottoId) {
        Wishlist wishlist = wishlistRepository.findByUtente_IdWithProdotti(utenteId)
                .orElseThrow(() -> new IllegalArgumentException("Wishlist non trovata"));

        wishlist.getProdotti().removeIf(p -> p.getId().equals(prodottoId));
        Wishlist saved = wishlistRepository.save(wishlist);
        return wishlistMapper.toDTO(saved);
    }

    /**
        * Verifica se un prodotto e presente nella lista desideri dell'utente.
     */
    public boolean isProdottoInWishlist(Integer utenteId, Integer prodottoId) {
        return wishlistRepository.isProdottoInWishlist(utenteId, prodottoId);
    }

    /**
        * Esegue il toggle del prodotto (aggiunge se assente, rimuove se presente).
     */
    @Transactional
    public WishlistDTO toggleProdotto(Integer utenteId, Integer prodottoId) {
        if (isProdottoInWishlist(utenteId, prodottoId)) {
            return removeProdotto(utenteId, prodottoId);
        } else {
            return addProdotto(utenteId, prodottoId);
        }
    }

    /**
        * Svuota tutti i prodotti dalla lista desideri dell'utente.
     */
    @Transactional
    public void clearWishlist(Integer utenteId) {
        wishlistRepository.findByUtente_Id(utenteId).ifPresent(wishlist -> {
            wishlist.getProdotti().clear();
            wishlistRepository.save(wishlist);
        });
    }
}