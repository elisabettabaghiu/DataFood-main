package it.unife.sample.backend.controller;

import it.unife.sample.backend.dto.OrderDTO;
import it.unife.sample.backend.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/orders", "/orders"})
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderDTO> checkout(HttpSession session) {
        try {
            // Endpoint checkout carrello -> ordine salvato su DB
            return ResponseEntity.ok(orderService.checkout(session));
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderDTO>> getMyOrders(HttpSession session) {
        try {
            // Endpoint storico ordini dell'utente loggato
            return ResponseEntity.ok(orderService.getMyOrders(session));
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
