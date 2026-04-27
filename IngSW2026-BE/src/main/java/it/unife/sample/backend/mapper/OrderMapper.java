package it.unife.sample.backend.mapper;

import it.unife.sample.backend.dto.OrderDTO;
import it.unife.sample.backend.dto.OrderItemDTO;
import it.unife.sample.backend.model.Ordine;
import it.unife.sample.backend.model.OrdineProdotto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    // Mappa ORDINE in OrderDTO e calcola il totale dalle righe ordine
    @Mapping(target = "totale", expression = "java(calculateTotal(entity))")
    @Mapping(target = "items", source = "items")
    OrderDTO toDTO(Ordine entity);

    // Mappa ogni riga ORDINE_PRODOTTO in OrderItemDTO
    @Mapping(target = "productId", source = "prodotto.id")
    @Mapping(target = "nome", source = "prodotto.nome")
    @Mapping(target = "prezzo", source = "prezzoUnitario")
    @Mapping(target = "quantita", source = "quantita")
    OrderItemDTO toDTO(OrdineProdotto entity);

    // Mapping lista ordini per endpoint GET /orders/my
    List<OrderDTO> toDTOList(List<Ordine> entities);

    default double map(BigDecimal value) {
        if (value == null) {
            return 0;
        }
        return value.doubleValue();
    }

    default double calculateTotal(Ordine ordine) {
        if (ordine == null || ordine.getItems() == null) {
            return 0;
        }

        // Somma prezzoUnitario * quantita per ogni prodotto dell'ordine
        return ordine.getItems().stream()
                .mapToDouble(item -> item.getPrezzoUnitario().doubleValue() * item.getQuantita())
                .sum();
    }
}
