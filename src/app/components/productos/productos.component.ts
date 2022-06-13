import { KeycloakService } from './../../services/keycloak.service';
import { Component, Input, OnInit } from '@angular/core';
import { ProductosService } from './../../services/productos.service';
import { Producto } from 'src/app/model/Producto';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
})
export class ProductosComponent implements OnInit {
  modalReference!: NgbModalRef;
  public productos!: Producto[];

  @Input() isAdmin!: boolean;

  @Input() username!: string;

  @Input() isLogged!: boolean;

  // Objeto de un producto a guardar o actualizar.

  public producto: Producto = new Producto();
  // Página actual.
  page = 1;
  // Tamaño de la página.
  pageSize = 4;
  // Cantidad total de registros.
  collectionSize = 0;

  constructor(
    private productosService: ProductosService,
    private modalService: NgbModal,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.consultarProductos();

    setTimeout(() => {
      this.isAdmin = this.keycloakService.getIsAdmin();

      this.username = this.keycloakService.getUsername();

      this.isLogged = this.keycloakService.getIsLogged();
    }, 500);
  }

  public getIsAdmin(): boolean {
    return this.keycloakService.getIsAdmin();
  }

  public getIsLogged(): boolean {
    return this.keycloakService.getIsLogged();
  }

  consultarProductos() {
    this.productosService.consultarProductos().subscribe((response) => {
      this.productos = response;
      this.collectionSize = this.productos.length;
      this.productos = this.productos
        .map((producto, i) => ({ counter: i + 1, ...producto }))
        .slice(
          (this.page - 1) * this.pageSize,
          (this.page - 1) * this.pageSize + this.pageSize
        );
    });
  }

  open(content: any) {
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    });
    this.modalReference.result.then(
      (result) => {
        // this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  // Método que permite precargar el objeto de producto seleccionado por el usuario en la ventana modal para actualizarse.

  cargarProducto(productoSeleccionado: Producto, content: any) {
    this.producto = new Producto();
    this.producto.idProducto = productoSeleccionado.idProducto;
    this.producto.nombre = productoSeleccionado.nombre;
    this.producto.precio = productoSeleccionado.precio;
    this.producto.idPedido = productoSeleccionado.idPedido;
    this.producto.idProveedor = productoSeleccionado.idProveedor;
    this.open(content);
  }

  guardarProducto(data: any) {
    if (!this.producto.idProducto) {
      this.producto = new Producto();
      this.producto.nombre = data.nombre;
      this.producto.precio = data.precio;
      this.producto.idPedido = data.idPedido;
      this.producto.idProveedor = data.idProveedor;
      this.productosService
        .guardarProducto(this.producto)
        .subscribe((response) => {
          this.modalReference.close();
          this.consultarProductos();
          this.producto = new Producto();
        });
    } else {
      this.productosService
        .actualizarProducto(this.producto)
        .subscribe((response) => {
          this.modalReference.close();
          this.consultarProductos();
          this.producto = new Producto();
        });
    }
  }

  // Método que permite mostrar la confirmación para elimintar el objeto de producto seleccionado por el usuario.

  mostrarVentanaEliminar(producto: Producto) {
    Swal.fire({
      title:
        '¿Estás seguro que quieres eliminar al producto ' +
        producto.nombre +
        '?',
      text: '¡No podras revertirlo!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, estoy seguro',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productosService
          .eliminarProducto(producto.idProducto)
          .subscribe((response) => {
            this.consultarProductos();
            Swal.fire(
              'Borrado!',
              'El producto ' + producto.nombre + ' ha sido eliminado.',
              'success'
            );
          });
      }
    });
  }

  name = 'ExcelSheet.xlsx';
  exportToExcel(): void {
    let element = document.getElementById('table');
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const book: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');

    XLSX.writeFile(book, this.name);
  }
  public exportToPdf(): void {
    let DATA: any = document.getElementById('table');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('productos.pdf');
    });
  }
}
