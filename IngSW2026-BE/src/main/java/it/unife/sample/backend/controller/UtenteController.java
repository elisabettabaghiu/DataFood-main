package it.unife.sample.backend.controller;

import it.unife.sample.backend.dto.LoginRequestDTO;
import it.unife.sample.backend.dto.RegisterRequestDTO;
import it.unife.sample.backend.dto.UtenteDTO;
import it.unife.sample.backend.service.UtenteService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/auth", "/api/auth"})
public class UtenteController {

	private final UtenteService utenteService;

	public UtenteController(UtenteService utenteService) {
		this.utenteService = utenteService;
	}

	@PostMapping("/login")
	public ResponseEntity<UtenteDTO> login(@RequestBody LoginRequestDTO request, HttpSession session) {
		try {
			// Controller minimale: validazione credenziali delegata al service
			UtenteDTO utente = utenteService.login(request);
			// Salva l'utente loggato in sessione per cart e checkout
			session.setAttribute("currentUserId", utente.getId());
			return ResponseEntity.ok(utente);
		} catch (IllegalArgumentException exception) {
			// Se email/password non tornano rispondiamo 401
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
	}

	@PostMapping("/register")
	public ResponseEntity<UtenteDTO> register(@RequestBody RegisterRequestDTO request, HttpSession session) {
		try {
			UtenteDTO utente = utenteService.register(request);
			// Dopo registrazione consideriamo l'utente gia loggato
			session.setAttribute("currentUserId", utente.getId());
			return ResponseEntity.ok(utente);
		} catch (IllegalArgumentException exception) {
			// Email gia presente: conflitto logico
			return ResponseEntity.status(HttpStatus.CONFLICT).build();
		}
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpSession session) {
		// Invalida la sessione server dell'utente corrente
		session.invalidate();
		return ResponseEntity.noContent().build();
	}
}
