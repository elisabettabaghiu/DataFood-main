package it.unife.sample.backend.service;

import it.unife.sample.backend.dto.CartDTO;
import it.unife.sample.backend.dto.CartItemDTO;
import it.unife.sample.backend.model.Cart;
import it.unife.sample.backend.model.CartItem;
import it.unife.sample.backend.model.Prodotto;
import it.unife.sample.backend.repository.ProdottoRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    // Chiave usata per salvare il carrello dentro la sessione HTTP.
    private static final String CART_SESSION_KEY = "cart";

    private final ProdottoRepository prodottoRepository;

    public CartService(ProdottoRepository prodottoRepository) {
        this.prodottoRepository = prodottoRepository;
    }

    public CartDTO getCart(HttpSession session) {
        // Se il carrello non esiste ancora, lo creiamo al volo.
        Cart cart = getOrCreateCart(session);
        // Rileggiamo i prezzi dal database per non fidarci mai dei dati vecchi.
        refreshPricesFromDb(cart);
        return toDTO(cart);
    }

    public CartDTO addProduct(Long productId, HttpSession session) {
        Cart cart = getOrCreateCart(session);

        // Il prodotto va cercato nel DB prima di inserirlo nel carrello.
        Prodotto prodotto = prodottoRepository.findById(toRepositoryId(productId))
                .orElseThrow(() -> new IllegalArgumentException("Prodotto non trovato"));

        CartItem newItem = new CartItem(
                productId,
                prodotto.getNome(),
                prodotto.getPrezzo().doubleValue(),
                1
        );

        cart.addItem(newItem);
        session.setAttribute(CART_SESSION_KEY, cart);
        return toDTO(cart);
    }

    public CartDTO removeProduct(Long productId, HttpSession session) {
        Cart cart = getOrCreateCart(session);
        // Rimuove la riga del prodotto dal carrello.
        cart.removeItem(productId);
        session.setAttribute(CART_SESSION_KEY, cart);
        return toDTO(cart);
    }

    public CartDTO updateQuantity(Long productId, int quantita, HttpSession session) {
        Cart cart = getOrCreateCart(session);

        if (quantita > 0) {
            // Se la quantità è valida, aggiorniamo anche nome e prezzo dal DB.
            Prodotto prodotto = prodottoRepository.findById(toRepositoryId(productId))
                    .orElseThrow(() -> new IllegalArgumentException("Prodotto non trovato"));

            cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(productId))
                    .findFirst()
                    .ifPresent(item -> {
                        item.setNome(prodotto.getNome());
                        item.setPrezzo(prodotto.getPrezzo().doubleValue());
                    });
        }

        cart.updateQuantity(productId, quantita);
        session.setAttribute(CART_SESSION_KEY, cart);
        return toDTO(cart);
    }

    public CartDTO clearCart(HttpSession session) {
        // Alla fine del logout lasciamo una sessione con carrello vuoto.
        Cart cart = new Cart();
        session.setAttribute(CART_SESSION_KEY, cart);
        return toDTO(cart);
    }

    private Cart getOrCreateCart(HttpSession session) {
        Cart cart = (Cart) session.getAttribute(CART_SESSION_KEY);
        if (cart == null) {
            // Primo accesso: inizializziamo il carrello in sessione.
            cart = new Cart();
            session.setAttribute(CART_SESSION_KEY, cart);
        }
        return cart;
    }

    private void refreshPricesFromDb(Cart cart) {
        for (CartItem item : cart.getItems()) {
            // Il prezzo mostrato deve restare allineato al prodotto reale.
            prodottoRepository.findById(toRepositoryId(item.getProductId()))
                    .ifPresent(prodotto -> {
                        item.setNome(prodotto.getNome());
                        item.setPrezzo(prodotto.getPrezzo().doubleValue());
                    });
        }
    }

    private CartDTO toDTO(Cart cart) {
        // Converto il modello interno nel DTO esposto al frontend.
        CartDTO dto = new CartDTO();
        dto.setItems(cart.getItems().stream().map(this::toItemDTO).toList());
        dto.setTotale(cart.getTotal());
        return dto;
    }

    private CartItemDTO toItemDTO(CartItem item) {
        // Mapping semplice da CartItem interno a CartItemDTO.
        CartItemDTO dto = new CartItemDTO();
        dto.setProductId(item.getProductId());
        dto.setNome(item.getNome());
        dto.setPrezzo(item.getPrezzo());
        dto.setQuantita(item.getQuantita());
        return dto;
    }

    private Integer toRepositoryId(Long productId) {
        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException("Id prodotto non valido");
        }

        try {
            return Math.toIntExact(productId);
        } catch (ArithmeticException exception) {
            throw new IllegalArgumentException("Id prodotto non valido");
        }
    }
}
