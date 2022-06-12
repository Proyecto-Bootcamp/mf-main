import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proveedor } from '../model/Proveedor';

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  // URL base del microservicio de proveedores de springboot.
  private baseUrl =
    'http://localhost:8900/bootcamp-msproveedores-svc/v1_0/msproveedores';

  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  // Constructor que inicializa el servicio.
  constructor(private httpClient: HttpClient) {}

  // Función que permite consumir el servicio para consultar proveedores.
  consultarProveedores(): Observable<Proveedor[]> {
    return this.httpClient.get<Proveedor[]>(this.baseUrl);
  }

  // Función que permite consumir el servicio para insertar proveedores.
  guardarProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.httpClient.post<Proveedor>(this.baseUrl, proveedor, {
      headers: this.headers,
    });
  }

  // Función que permite consumir el servicio para actualizar proveedores.
  actualizarProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.httpClient.put<Proveedor>(this.baseUrl, proveedor, {
      headers: this.headers,
    });
  }

  // Función que permite consumir el servicio para borrar proveedores.
  eliminarProveedor(idProveedor: number): Observable<void> {
    return this.httpClient.delete<void>(this.baseUrl + '/' + idProveedor);
  }
}
