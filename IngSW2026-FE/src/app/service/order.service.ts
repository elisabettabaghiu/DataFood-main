import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../dto/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // Endpoint ordini passando dal proxy Angular su /api
  private readonly ordersUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  checkout(): Observable<Order> {
    // Crea un ordine leggendo il carrello dalla sessione server
    return this.http.post<Order>(`${this.ordersUrl}/checkout`, {});
  }

  getMyOrders(): Observable<Order[]> {
    // Restituisce gli ordini dell'utente loggato
    return this.http.get<Order[]>(`${this.ordersUrl}/my`);
  }
}
