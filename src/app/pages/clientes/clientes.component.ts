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

  imprimirCatalogoClienteee() {
    let elemento = document.getElementById('contdiv');

    if (elemento) {
      let myHTML = elemento.innerHTML;

      printJS({
        printable: myHTML,
        type: 'raw-html'
      });
    }
  }

  imprimirCatalogoCliente(){
    let elemento = `
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
        <tr for="let datos of clientes">
          <td>{{datos.codigo}}</td>
          <td>{{datos.razonSocial}}</td>
          <td>{{datos.rfc}}</td>
          <td>{{datos.telefono}}</td>
          <td>{{datos.pagosCon}}</td>
          <td>{{datos.pedidosA}}</td>
          <td>{{datos.direccion}}</td>
        </tr>
      </tbody>
    </table> `

    printJS({
      printable: elemento,
      type: 'raw-html'
    });
  }

  imprimirCatalogoClientes() {
    const clientesHTML = this.clientes.map((cliente: { codigo: any; razonSocial: any; rfc: any; telefono: any; pagosCon: any; pedidosA: any; direccion: any; }) => `
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
    `;
  
    printJS({
      printable: tablaHTML,
      type: 'raw-html'
    });
  }
  
}
