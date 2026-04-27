package it.unife.sample.backend.service;

import it.unife.sample.backend.dto.OrderDTO;
import it.unife.sample.backend.mapper.OrderMapper;
import it.unife.sample.backend.model.Cart;
import it.unife.sample.backend.model.CartItem;
import it.unife.sample.backend.model.Ordine;
import it.unife.sample.backend.model.OrdineProdotto;
import it.unife.sample.backend.model.Prodotto;
import it.unife.sample.backend.model.Utente;
import it.unife.sample.backend.repository.OrdineRepository;
import it.unife.sample.backend.repository.ProdottoRepository;
import it.unife.sample.backend.repository.UtenteRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    // Chiavi usate per leggere dati dalla sessione HTTP
    private static final String CART_SESSION_KEY = "cart";
    private static final String CURRENT_USER_ID_SESSION_KEY = "currentUserId";

    private final OrdineRepository ordineRepository;
    private final ProdottoRepository prodottoRepository;
    private final UtenteRepository utenteRepository;
    private final OrderMapper orderMapper;

    public OrderService(
            OrdineRepository ordineRepository,
            ProdottoRepository prodottoRepository,
            UtenteRepository utenteRepository,
            OrderMapper orderMapper) {
        this.ordineRepository = ordineRepository;
        this.prodottoRepository = prodottoRepository;
        this.utenteRepository = utenteRepository;
        this.orderMapper = orderMapper;
    }

    @Transactional
    public OrderDTO checkout(HttpSession session) {
        // 1 Recupera il carrello salvato nella sessione
        Cart cart = (Cart) session.getAttribute(CART_SESSION_KEY);

        // Checkout possibile solo con carrello valorizzato
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Carrello vuoto");
        }

        // 2 Recupera l'utente autenticato dalla sessione
        Utente utente = getLoggedUser(session);

        // 3 Crea testata ordine
        Ordine ordine = new Ordine();
        ordine.setData(LocalDateTime.now());
        ordine.setStatus("in_lavorazione");
        ordine.setUtente(utente);

        // 4 Per ogni riga carrello crea una riga ordine_prodotto
        List<OrdineProdotto> ordineItems = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            // Il prezzo viene preso sempre dal database
            Prodotto prodotto = prodottoRepository.findById(toRepositoryId(item.getProductId()))
                    .orElseThrow(() -> new IllegalArgumentException("Prodotto non trovato"));

            OrdineProdotto ordineProdotto = new OrdineProdotto();
            ordineProdotto.setOrdine(ordine);
            ordineProdotto.setProdotto(prodotto);
            ordineProdotto.setQuantita(item.getQuantita());
            ordineProdotto.setPrezzoUnitario(prodotto.getPrezzo());
            ordineItems.add(ordineProdotto);
        }

        ordine.setItems(ordineItems);

        // Salva ordine e righe ordine prodotto tramite cascade
        Ordine savedOrder = ordineRepository.save(ordine);

        // Dopo il checkout il carrello di sessione viene svuotato
        session.removeAttribute(CART_SESSION_KEY);

        return orderMapper.toDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getMyOrders(HttpSession session) {
        // Recupera utente autenticato e carica lo storico ordini
        Utente utente = getLoggedUser(session);

        List<Ordine> ordini = ordineRepository.findByUtenteId(utente.getId().longValue());
        return orderMapper.toDTOList(ordini);
    }

    private Utente getLoggedUser(HttpSession session) {
        // Se non c'e currentUserId in sessione l'utente non e autenticato
        Object userId = session.getAttribute(CURRENT_USER_ID_SESSION_KEY);
        if (!(userId instanceof Integer integerUserId)) {
            throw new SecurityException("Utente non autenticato");
        }

        return utenteRepository.findById(integerUserId)
                .orElseThrow(() -> new SecurityException("Utente non autenticato"));
    }

    private Integer toRepositoryId(Long productId) {
        // Conversione sicura Long -> Integer usata dal repository prodotto
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
