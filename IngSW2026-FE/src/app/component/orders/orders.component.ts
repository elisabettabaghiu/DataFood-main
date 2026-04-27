import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { OrderService } from '../../service/order.service';
import { Order } from '../../dto/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    // Carica subito gli ordini dell'utente corrente
    this.loadOrders();
  }

  onSearchChange(value: string): void {
    // Questa pagina non usa la ricerca testuale
  }

  private loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders ?? [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        if (error?.status === 401) {
          this.errorMessage = 'Effettua il login per vedere i tuoi ordini';
          return;
        }
        this.errorMessage = 'Errore nel caricamento ordini';
      }
    });
  }
}
