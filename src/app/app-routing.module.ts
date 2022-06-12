import { ProductosComponent } from './components/productos/productos.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { RouterModule, Routes } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { EmptyRouteComponent } from './empty-route/empty-route.component';

const routes: Routes = [
  { path: 'proveedores', component: ProveedoresComponent },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'productos', component: ProductosComponent },
  { path: '**', component: EmptyRouteComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
})
export class AppRoutingModule {}
