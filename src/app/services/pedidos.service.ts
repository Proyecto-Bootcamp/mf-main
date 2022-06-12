import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../model/Pedido';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  // URL base del microservicio de pedidos de springboot.
  private baseUrl =
    'http://localhost:8900/bootcamp-mspedidos-svc/v1_0/mspedidos';

  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  // Constructor que inicializa el servicio.
  constructor(private httpClient: HttpClient) {}

  // Función que permite consumir el servicio para consultar pedidos.
  consultarPedidos(): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(this.baseUrl);
  }

  // Función que permite consumir el servicio para insertar pedidos.
  guardarPedido(pedido: Pedido): Observable<Pedido> {
    return this.httpClient.post<Pedido>(this.baseUrl, pedido, {
      headers: this.headers,
    });
  }

  // Función que permite consumir el servicio para actualizar pedidos.
  actualizarPedido(pedido: Pedido): Observable<Pedido> {
    return this.httpClient.put<Pedido>(this.baseUrl, pedido, {
      headers: this.headers,
    });
  }

  // Función que permite consumir el servicio para borrar pedidos.
  eliminarPedido(idPedido: number): Observable<void> {
    return this.httpClient.delete<void>(this.baseUrl + '/' + idPedido);
  }
}
