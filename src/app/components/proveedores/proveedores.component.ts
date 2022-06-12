import { KeycloakService } from './../../services/keycloak.service';
import { Component, Input, OnInit } from '@angular/core';
import { ProveedoresService } from './../../services/proveedores.service';
import { Proveedor } from 'src/app/model/Proveedor';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css'],
})
export class ProveedoresComponent implements OnInit {
  modalReference!: NgbModalRef;
  public proveedores!: Proveedor[];

  @Input() isAdmin!: boolean;

  @Input() username!: string;

  @Input() isLogged!: boolean;

  // Objeto de un proveedor a guardar o actualizar.

  public proveedor: Proveedor = new Proveedor();
  // Página actual.
  page = 1;
  // Tamaño de la página.
  pageSize = 4;
  // Cantidad total de registros.
  collectionSize = 0;

  constructor(
    private proveedoresService: ProveedoresService,
    private modalService: NgbModal,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.consultarProveedores();

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

  consultarProveedores() {
    this.proveedoresService.consultarProveedores().subscribe((response) => {
      this.proveedores = response;
      this.collectionSize = this.proveedores.length;
      this.proveedores = this.proveedores
        .map((proveedor, i) => ({ counter: i + 1, ...proveedor }))
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

  // Método que permite precargar el objeto de proveedor seleccionado por el usuario en la ventana modal para actualizarse.

  cargarProveedor(proveedorSeleccionado: Proveedor, content: any) {
    this.proveedor = new Proveedor();
    this.proveedor.idProveedor = proveedorSeleccionado.idProveedor;
    this.proveedor.nombre = proveedorSeleccionado.nombre;
    this.proveedor.direccion = proveedorSeleccionado.direccion;
    this.open(content);
  }

  guardarProveedor(data: any) {
    if (!this.proveedor.idProveedor) {
      this.proveedor = new Proveedor();
      this.proveedor.nombre = data.nombre;
      this.proveedor.direccion = data.direccion;
      this.proveedoresService
        .guardarProveedor(this.proveedor)
        .subscribe((response) => {
          this.modalReference.close();
          this.consultarProveedores();
          this.proveedor = new Proveedor();
        });
    } else {
      this.proveedoresService
        .actualizarProveedor(this.proveedor)
        .subscribe((response) => {
          this.modalReference.close();
          this.consultarProveedores();
          this.proveedor = new Proveedor();
        });
    }
  }

  // Método que permite mostrar la confirmación para elimintar el objeto de proveedor seleccionado por el usuario.

  mostrarVentanaEliminar(proveedor: Proveedor) {
    Swal.fire({
      title:
        '¿Estás seguro que quieres eliminar al proveedor ' +
        proveedor.nombre +
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
        this.proveedoresService
          .eliminarProveedor(proveedor.idProveedor)
          .subscribe((response) => {
            this.consultarProveedores();
            Swal.fire(
              'Borrado!',
              'El proveedor ' + proveedor.nombre + ' ha sido eliminado.',
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
      PDF.save('proveedores.pdf');
    });
  }
}
