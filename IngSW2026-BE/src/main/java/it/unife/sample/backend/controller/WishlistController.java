package it.unife.sample.backend.controller;

import it.unife.sample.backend.dto.WishlistDTO;
import it.unife.sample.backend.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    /**
        * Recupera la lista desideri dell'utente autenticato.
     * GET /api/wishlist?utenteId={id}
     */
    @GetMapping
    public ResponseEntity<WishlistDTO> getWishlist(@RequestParam Integer utenteId) {
        return wishlistService.getWishlistByUtenteId(utenteId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
        * Aggiunge un prodotto alla lista desideri dell'utente.
     * POST /api/wishlist?utenteId={id}&prodottoId={prodottoId}
     */
    @PostMapping
    public ResponseEntity<WishlistDTO> addProdotto(
            @RequestParam Integer utenteId,
            @RequestParam Integer prodottoId) {
        try {
            WishlistDTO wishlist = wishlistService.addProdotto(utenteId, prodottoId);
            return ResponseEntity.ok(wishlist);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
        * Rimuove un prodotto dalla lista desideri dell'utente.
     * DELETE /api/wishlist?utenteId={id}&prodottoId={prodottoId}
     */
    @DeleteMapping
    public ResponseEntity<WishlistDTO> removeProdotto(
            @RequestParam Integer utenteId,
            @RequestParam Integer prodottoId) {
        try {
            WishlistDTO wishlist = wishlistService.removeProdotto(utenteId, prodottoId);
            return ResponseEntity.ok(wishlist);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
        * Esegue il toggle del prodotto nella lista desideri (aggiunge se assente, rimuove se presente).
     * PUT /api/wishlist/toggle?utenteId={id}&prodottoId={prodottoId}
     */
    @PutMapping("/toggle")
    public ResponseEntity<WishlistDTO> toggleProdotto(
            @RequestParam Integer utenteId,
            @RequestParam Integer prodottoId) {
        try {
            WishlistDTO wishlist = wishlistService.toggleProdotto(utenteId, prodottoId);
            return ResponseEntity.ok(wishlist);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
        * Verifica se un prodotto e presente nella lista desideri dell'utente.
     * GET /api/wishlist/check?utenteId={id}&prodottoId={prodottoId}
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> isProdottoInWishlist(
            @RequestParam Integer utenteId,
            @RequestParam Integer prodottoId) {
        boolean inWishlist = wishlistService.isProdottoInWishlist(utenteId, prodottoId);
        return ResponseEntity.ok(inWishlist);
    }

    /**
        * Svuota tutti i prodotti dalla lista desideri dell'utente.
     * DELETE /api/wishlist/clear?utenteId={id}
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearWishlist(@RequestParam Integer utenteId) {
        wishlistService.clearWishlist(utenteId);
        return ResponseEntity.noContent().build();
    }
}