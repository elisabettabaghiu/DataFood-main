package it.unife.sample.backend.mapper;

import it.unife.sample.backend.dto.WishlistDTO;
import it.unife.sample.backend.model.Wishlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = ProdottoMapper.class)
public interface WishlistMapper {

    @Mapping(target = "utenteId", source = "wishlist.utente.id")
    WishlistDTO toDTO(Wishlist wishlist);

    List<WishlistDTO> toDTOList(List<Wishlist> wishlists);
}