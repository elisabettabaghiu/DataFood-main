package it.unife.sample.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class OrderDTO {

    private Integer id;
    private LocalDateTime data;
    private String status;
    private double totale;
    private List<OrderItemDTO> items = new ArrayList<>();
}
