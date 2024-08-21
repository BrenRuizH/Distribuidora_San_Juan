import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import * as printJS from 'print-js';
import { catchError, of } from 'rxjs';
import { ClientesService } from 'src/app/services/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent {
  clientes: any = [];
  cliente: any = {};


  clientesI: any = [];

  textoBusqueda: string = '';

  p: number = 1;

  constructor(private clienteService: ClientesService, private router: Router) {
    this.obtenerClientes();
  }

  ngOnInit(): void {
      this.obtenerClientes();
  }

  obtenerClientes() {
    this.clienteService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
      this.clientesI = data.items;
    })
  }

  buscarClientes() {
    if(this.textoBusqueda) {
      this.clienteService.getClientes('buscar.php?texto=' + this.textoBusqueda).pipe(catchError(error => {
        if(error.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se encontraron clientes.",
          });
        }
        return of([]);
      })
      ).subscribe((data) => {
        this.clientes = data.items;
      });
    } else {
      this.obtenerClientes();
    }
  }

  seleccionarCliente(id:any) {
    this.clienteService.seleccionarCliente(id).subscribe((resp: any) => {
      this.cliente = resp.items[0];
    })
  }

  editarCliente() {
    if (this.cliente.codigo && this.cliente.razonSocial) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-warning",
          cancelButton: "btn btn-secondary"
        },
      });

      swalWithBootstrapButtons.fire({
        title: "¿Desea editar el cliente?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "¡Sí, editar!",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {

          let formData = new FormData();
          formData.append('id', this.cliente.id);
          formData.append('codigo', this.cliente.codigo.toUpperCase());
          formData.append('razonSocial', this.cliente.razonSocial.toUpperCase());
          if (this.cliente.rfc) {
            formData.append('rfc', this.cliente.rfc.toUpperCase());
          }
          if (this.cliente.telefono) {
            formData.append('telefono', this.cliente.telefono);
          }
          if (this.cliente.pagosCon) {
            formData.append('pagosCon', this.cliente.pagosCon.toUpperCase());
          }
          if (this.cliente.pedidosA) {
            formData.append('pedidosA', this.cliente.pedidosA.toUpperCase());
          }
          if (this.cliente.direccion) {
            formData.append('direccion', this.cliente.direccion.toUpperCase());
          }

          this.clienteService.agregarCliente('editar.php', formData).subscribe((event: any) =>{
            swalWithBootstrapButtons.fire({
              title: "¡Editado!",
              text: "El cliente ha sido editado exitosamente.",
              icon: "success"
            });
            if (event.status == 'success') {
              this.obtenerClientes();
            }
          });
        }
      });
    }else{
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El formulario está incompleto. Por favor, completa todos los campos.",
      });
    }
  }

  eliminarCliente(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary"
      },
    });

    swalWithBootstrapButtons.fire({
      title: "¿Desea eliminar el cliente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {

        swalWithBootstrapButtons.fire({
          title: "¡Eliminado!",
          text: "El cliente ha sido eliminado exitosamente.",
          icon: "success"
        });

        this.clienteService.eliminarCliente(id).subscribe((resp: any) => {
          if(resp['status'] == 'success') {
            this.obtenerClientes();
          }
        });
      }
    });
  }

  imprimirCatalogoClientes() {
    const clientesHTML = this.clientesI.map((cliente: { codigo: any; razonSocial: any; rfc: any; telefono: any; pagosCon: any; pedidosA: any; direccion: any; }) => `
      <tr>
        <td>${cliente.codigo || ''}</td>
        <td>${cliente.razonSocial || ''}</td>
        <td>${cliente.rfc || ''}</td>
        <td>${cliente.telefono || ''}</td>
        <td>${cliente.pagosCon || ''}</td>
        <td>${cliente.pedidosA || ''}</td>
        <td>${cliente.direccion || ''}</td>
      </tr>
    `).join('');
  
    const tablaHTML = `
    <style>
      .table-container {
        width: 100%;
        max-width: 11in; /* Ancho máximo ajustado al tamaño de la página tabloid horizontalmente */
        margin: 0 auto;
        overflow-x: hidden; /* Evitar desplazamiento horizontal */
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 16px; /* Tamaño de la fuente ajustado */
        text-align: left;
      }
      th, td {
        padding: 6px 8px; /* Padding ajustado */
        border: 1px solid #ddd;
        white-space: normal; /* Permitir el ajuste de línea dentro de las celdas */
        word-wrap: break-word; /* Permitir el ajuste de palabras largas */
      }
      th {
        background-color: #f2f2f2;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      tr:hover {
        background-color: #f1f1f1;
      }
      @media (max-width: 600px) {
        table {
          font-size: 10px;
        }
        th, td {
          padding: 4px 6px;
        }
      }
    </style>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Razón Social</th>
            <th>RFC</th>
            <th>Teléfono</th>
            <th>Pagos Con</th>
            <th>Pedidos A</th>
            <th>Dirección</th>
          </tr>
        </thead>
        <tbody>
          ${clientesHTML}
        </tbody>
      </table>
    </div>
  `;
  
    printJS({
      printable: tablaHTML,
      type: 'raw-html',
      style: '@page { size: landscape; }'
    });
  }
  
}
