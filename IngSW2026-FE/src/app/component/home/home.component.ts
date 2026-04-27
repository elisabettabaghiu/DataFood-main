import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../service/product.service';
import { CategoriaService } from '../../service/categoria.service';
import { Prodotto } from '../../dto/prodotto.model';
import { Categoria } from '../../dto/categoria.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  prodotti: Prodotto[] = [];
  categorie: Categoria[] = [];
  categoriaSelezionataId?: number;
  searchTerm = '';

  constructor(
    private productService: ProductService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    // Carico i dati iniziali della homepage del catalogo
    this.loadProdotti();
    this.loadCategorie();
  }

  loadProdotti(): void {
    this.productService.getAll().subscribe((data) => {
      this.prodotti = data;
    });
  }

  loadCategorie(): void {
    this.categoriaService.getAll().subscribe((data) => {
      this.categorie = data;
    });
  }

  filterByCategoria(id: number | undefined): void {
    // Controllo importante per evitare chiamate con id undefined
    if (id === undefined) {
      this.categoriaSelezionataId = undefined;
      this.applyCurrentFilters();
      return;
    }

    this.categoriaSelezionataId = id;
    this.applyCurrentFilters();
  }

  onSearchChange(value: string): void {
    // Aggiorno il testo della ricerca dalla navbar
    this.searchTerm = value;
    this.applyCurrentFilters();
  }

  private applyCurrentFilters(): void {
    // Applico in cascata i filtri correnti categoria più ricerca testuale
    const normalizedSearch = this.searchTerm.trim();

    if (this.categoriaSelezionataId === undefined && normalizedSearch.length === 0) {
      this.loadProdotti();
      return;
    }

    if (this.categoriaSelezionataId !== undefined) {
      // Se è selezionata una categoria, filtro prima lato backend per categoria
      this.productService.getByCategoria(this.categoriaSelezionataId).subscribe((filteredByCategory) => {
        if (normalizedSearch.length === 0) {
          this.prodotti = filteredByCategory;
          return;
        }

        // Poi rifinisco lato frontend per testo senza fare una seconda chiamata HTTP
        const lowerSearch = normalizedSearch.toLowerCase();
        this.prodotti = filteredByCategory.filter((prodotto) =>
          prodotto.nome.toLowerCase().includes(lowerSearch)
        );
      });
      return;
    }

    this.productService.searchByNome(normalizedSearch).subscribe((filteredBySearch) => {
      this.prodotti = filteredBySearch;
    });
  }

  get titoloCatalogo(): string {
    if (this.categoriaSelezionataId === undefined) {
      return 'Tutti i prodotti';
    }

    const categoria = this.categorie.find(
      (item) => (item.id ?? item.ID) === this.categoriaSelezionataId
    );

    return categoria?.nome ?? 'Categoria selezionata';
  }
}
