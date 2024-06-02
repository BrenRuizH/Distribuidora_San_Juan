import { ChangeDetectorRef, Component } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';
import { catchError, of } from 'rxjs';
import { HormasService } from 'src/app/services/hormas.service';
import Swal from 'sweetalert2';
import * as printJS from 'print-js';

@Component({
  selector: 'app-hormas',
  templateUrl: './hormas.component.html',
  styleUrls: ['./hormas.component.css']
})
export class HormasComponent {
  hormas: any = [];
  horma: any = {cliente_id: ''};
  hormaEditada: any = {};
  clientes: any[] = [];

  clientesI: any[] = [];
  hormasI: any = [];

  p: number = 1;

  constructor(private clientesService: ClientesService, private hormasService: HormasService, private changeDetector: ChangeDetectorRef) {
    this.obtenerHormas();
  }

  ngOnInit(): void {
    this.getClientes();
    this.obtenerHormas();
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
      this.clientesI = data.items;
    })
  }

  obtenerHormas() {
    this.hormasService.getHormas('leer.php').subscribe((data) => {
      this.hormas = data.items;
      this.hormasI = data.items;
    })
  }

  buscarHormas() {
    if (!this.horma.cliente_id) {
      this.obtenerHormas();
    } else {
      this.hormasService.getHormas('buscar.php?id=' + this.horma.cliente_id).pipe(catchError(error => {
        if(error.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se encontraron hormas.",
          });
        }
        return of([]);
      })
      ).subscribe((data) => {
        this.hormas = data.items;
        this.changeDetector.detectChanges();
      });
    }
  }
  
  seleccionarHorma(id:any) {
    this.hormasService.seleccionarHorma(id).subscribe((resp: any) => {
      this.hormaEditada = resp.items[0];
    })
  }
  
  editarHorma() {
    if (this.hormaEditada.nombre && this.hormaEditada.cliente_id) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-warning",
          cancelButton: "btn btn-secondary"
        }
      });

      swalWithBootstrapButtons.fire({
        title: "¿Desea editar la horma?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "¡Sí, editar!",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
        
          let formData = new FormData();
          formData.append('id', this.hormaEditada.id);
          formData.append('nombre', this.hormaEditada.nombre.toUpperCase());
          formData.append('cliente_id', this.hormaEditada.cliente_id.toUpperCase());
          if(this.hormaEditada.matriz || this.hormaEditada.matriz === '') {
            formData.append('matriz', this.hormaEditada.matriz.toUpperCase());
          }
          if(this.hormaEditada.cambrillon || this.hormaEditada.cambrillon === '') {
            formData.append('cambrillon', this.hormaEditada.cambrillon.toUpperCase());
          }          
          if(this.hormaEditada.materiales) {
            formData.append('materiales', this.hormaEditada.materiales.toUpperCase());
          }
          if(this.hormaEditada.observaciones) {
            formData.append('observaciones', this.hormaEditada.observaciones.toUpperCase());
          }
          formData.append('precio', this.hormaEditada.precio);

          this.hormasService.agregarHorma('editar.php', formData).subscribe((event: any) =>{
            swalWithBootstrapButtons.fire({
              title: "¡Editada!",
              text: "La horma ha sido editada exitosamente.",
              icon: "success"
            });
            if (event.status == 'success') {
              this.obtenerHormas();
            }
          });
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El formulario está incompleto. Por favor, completa todos los campos.",
      });
    }
  }

  eliminarHorma(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary"
      }
    });

    swalWithBootstrapButtons.fire({
      title: "¿Desea eliminar el usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {

        swalWithBootstrapButtons.fire({
          title: "¡Eliminada!",
          text: "La horma ha sido eliminada exitosamente.",
          icon: "success"
        });

        this.hormasService.eliminarHorma(id).subscribe((resp: any) => {
          if(resp['status'] == 'success') {
            this.obtenerHormas();
          }
        });
      }
    });
  }

  imprimirCatalogoHormas() {
    let pdfContent = '';
    this.clientesI.forEach((cliente: { id: any; codigo: any; razonSocial: any; rfc: any; telefono: any; pagosCon: any; pedidosA: any; direccion: any; }) => {
      const hormasCliente = this.hormasI.filter((h: { horma: any; cliente: any; precio: any;}) => h.cliente === cliente.codigo);
      pdfContent += `
      <div class="cliente-page">
      <h1>Cliente: ${cliente.codigo  || ''}</h1>
      <p>Dirección: ${cliente.direccion || ''}</p>
      <table>
        <thead>
          <tr>
            <th>Horma</th>
            <th>Matriz</th>
            <th>Cambrillón</th>
            <th>Materiales</th>
            <th>Observaciones</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          ${hormasCliente.map((hormaa: { nombre: any; matriz: any; cambrillon: any; materiales: any; observaciones: any; cliente: any; precio: any;}) => `
          <tr>
            <td>${hormaa.nombre || ''}</td>
            <td>${hormaa.matriz || ''}</td>
            <td>${hormaa.cambrillon || ''}</td>
            <td>${hormaa.materiales || ''}</td>
            <td>${hormaa.observaciones || ''}</td>
            <td>S${hormaa.precio || ''}</td>
          </tr>
          `
        ).join('')}
        </tbody>
      </table>
      </div>
      `;
    });

    pdfContent += `
    <style>
      .cliente-page {
        page-break-before: always;
      }
    </style>
    `;
  
    printJS({
      printable: pdfContent,
      type: 'raw-html', 
      documentTitle: `Catálogo de Hormas`,
    });
  }
}
