package it.unife.sample.backend.controller;

import it.unife.sample.backend.dto.CartDTO;
import it.unife.sample.backend.dto.CartUpdateRequestDTO;
import it.unife.sample.backend.service.CartService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api", ""})
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/cart")
    public ResponseEntity<CartDTO> getCart(HttpSession session) {
        // Recupera il carrello salvato nella sessione dell'utente.
        return ResponseEntity.ok(cartService.getCart(session));
    }

    @PostMapping("/cart/add/{productId}")
    public ResponseEntity<CartDTO> addToCart(@PathVariable Long productId, HttpSession session) {
        try {
            // Aggiunge un prodotto al carrello usando l'id arrivato dal frontend.
            return ResponseEntity.ok(cartService.addProduct(productId, session));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/cart/remove/{productId}")
    public ResponseEntity<CartDTO> removeFromCart(@PathVariable Long productId, HttpSession session) {
        // Rimuove il prodotto scelto dal carrello corrente.
        return ResponseEntity.ok(cartService.removeProduct(productId, session));
    }

    @PostMapping("/cart/update")
    public ResponseEntity<CartDTO> updateQuantity(
            @RequestBody CartUpdateRequestDTO request,
            HttpSession session) {
        // Controlli minimi per evitare dati null o quantità negative.
        if (request == null || request.getProductId() == null || request.getQuantita() < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            return ResponseEntity.ok(cartService.updateQuantity(request.getProductId(), request.getQuantita(), session));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/cart/clear")
    public ResponseEntity<CartDTO> clearCart(HttpSession session) {
        // Svuota il carrello quando l'utente fa logout.
        return ResponseEntity.ok(cartService.clearCart(session));
    }
}
