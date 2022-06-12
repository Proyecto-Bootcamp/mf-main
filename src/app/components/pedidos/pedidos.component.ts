import { KeycloakService } from './../../services/keycloak.service';
import { Component, Input, OnInit } from '@angular/core';
import { PedidosService } from './../../services/pedidos.service';
import { Pedido } from 'src/app/model/Pedido';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
})
export class PedidosComponent implements OnInit {
  modalReference!: NgbModalRef;
  public pedidos!: Pedido[];

  @Input() isAdmin!: boolean;

  @Input() username!: string;

  @Input() isLogged!: boolean;

  // Objeto de un pedido a guardar o actualizar.

  public pedido: Pedido = new Pedido();
  // Página actual.
  page = 1;
  // Tamaño de la página.
  pageSize = 4;
  // Cantidad total de registros.
  collectionSize = 0;

  constructor(
    private pedidosService: PedidosService,
    private modalService: NgbModal,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.consultarPedidos();

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

  consultarPedidos() {
    this.pedidosService.consultarPedidos().subscribe((response) => {
      this.pedidos = response;
      this.collectionSize = this.pedidos.length;
      this.pedidos = this.pedidos
        .map((pedido, i) => ({ counter: i + 1, ...pedido }))
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

  // Método que permite precargar el objeto de pedido seleccionado por el usuario en la ventana modal para actualizarse.

  cargarPedido(pedidoSeleccionado: Pedido, content: any) {
    this.pedido = new Pedido();
    this.pedido.idPedido = pedidoSeleccionado.idPedido;
    this.pedido.fecha = pedidoSeleccionado.fecha;
    this.pedido.precioTotal = pedidoSeleccionado.precioTotal;
    this.pedido.idCliente = pedidoSeleccionado.idCliente;
    this.open(content);
  }

  guardarPedido(data: any) {
    if (!this.pedido.idPedido) {
      this.pedido = new Pedido();
      this.pedido.fecha = data.fecha;
      this.pedido.precioTotal = data.precioTotal;
      this.pedido.idCliente = data.idCliente;
      this.pedidosService.guardarPedido(this.pedido).subscribe((response) => {
        this.modalReference.close();
        this.consultarPedidos();
        this.pedido = new Pedido();
      });
    } else {
      this.pedidosService
        .actualizarPedido(this.pedido)
        .subscribe((response) => {
          this.modalReference.close();
          this.consultarPedidos();
          this.pedido = new Pedido();
        });
    }
  }

  // Método que permite mostrar la confirmación para elimintar el objeto de pedido seleccionado por el usuario.

  mostrarVentanaEliminar(pedido: Pedido) {
    Swal.fire({
      title:
        '¿Estás seguro que quieres eliminar al pedido ' + pedido.idPedido + '?',
      text: '¡No podras revertirlo!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, estoy seguro',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidosService
          .eliminarPedido(pedido.idPedido)
          .subscribe((response) => {
            this.consultarPedidos();
            Swal.fire(
              'Borrado!',
              'El pedido ' + pedido.idPedido + ' ha sido eliminado.',
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
      PDF.save('pedidos.pdf');
    });
  }
}
