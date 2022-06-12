import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../model/Producto';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  // URL base del microservicio de productos de springboot.
  private baseUrl =
    'http://localhost:8900/bootcamp-msproductos-svc/v1_0/msproductos';

  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  // Constructor que inicializa el servicio.
  constructor(private httpClient: HttpClient) {}

  // Función que permite consumir el servicio para consultar productos.
  consultarProductos(): Observable<Producto[]> {
    return this.httpClient.get<Producto[]>(this.baseUrl);
  }

  // Función que permite consumir el servicio para insertar productos.
  guardarProducto(producto: Producto): Observable<Producto> {
    return this.httpClient.post<Producto>(this.baseUrl, producto, {
      headers: this.headers,
    });
  }

  // Función que permite consumir el servicio para actualizar productos.
  actualizarProducto(producto: Producto): Observable<Producto> {
    return this.httpClient.put<Producto>(this.baseUrl, producto, {
      headers: this.headers,
    });
  }

  // Función que permite consumir el servicio para borrar productos.
  eliminarProducto(idProducto: number): Observable<void> {
    return this.httpClient.delete<void>(this.baseUrl + '/' + idProducto);
  }
}
