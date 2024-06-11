import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import * as printJS from 'print-js';
import { catchError, of } from 'rxjs';
import { ClientesService } from 'src/app/services/clientes.service';
import { OrdenesCompraService } from 'src/app/services/ordenesCompra.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ordenesCompra',
  templateUrl: './ordenesCompra.component.html',
  styleUrls: ['./ordenesCompra.component.css']
})
export class OrdenesCompraComponent {
  ordenesCompraR: any = [];

  ordenesCompra: any = [];
  ordenCompra: any = {cliente_id: ''};
  clientes: any[] = [];

  p: number = 1;
  textoBusqueda: string = '';
  temporalidad: number = 0;


  constructor(private clientesService: ClientesService, private ordenCompraService: OrdenesCompraService, private router: Router, private changeDetector: ChangeDetectorRef) {
    this.obtenerOrdenesCompra();
  }

  ngOnInit(): void {
    this.getClientes();
    this.obtenerOrdenesCompra();
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
    })
  }

  obtenerOrdenesCompra() {
    this.ordenCompraService.getOrdenesCompra('leer.php').subscribe((data) => {
      this.ordenesCompra = data.items;
      console.log(this.ordenesCompra);
    })
  }

  buscarOrdenesCompra() {
    if (!this.textoBusqueda) {
      this.obtenerOrdenesCompra();
    } else {
      this.ordenCompraService.getOrdenesCompra('buscar.php?texto=' + this.textoBusqueda).pipe(catchError(error => {
        if(error.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se encontraron órdenes de compra."
          });
        }
        return of([]);
      })
    ).subscribe((data) => {
        this.ordenesCompra = data.items;
      });
    }
  }
  
  mostrarInput(orden: any) {
    orden.editando = true;
  }

  guardarFacturaNo(orden: any) {
    orden.editando = false;
    if (!orden.facturaNo || orden.facturaNo.trim() === '') {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No has ingresado un número de factura válido.",
      });
      return;
    } else {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-warning",
          cancelButton: "btn btn-secondary"
        }
      });
  
      swalWithBootstrapButtons.fire({
        title: "¿Está seguro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: '¡Sí, cambiar!',
        cancelButtonText: 'No, cancelar',
      }).then((result) => {
        if(result.isConfirmed) {
          let formData = new FormData();
          formData.append('id', orden.id.toString());
          formData.append('facturaNo', orden.facturaNo.toUpperCase());
  
          this.ordenCompraService.agregarOrdenCompra('factura.php', formData).subscribe((event: any) => {
            if(event.status == 'success') {
              swalWithBootstrapButtons.fire({
                title: "¡Actualizado!",
                text: "El número de factura de la orden ha sido cambiado exitosamente.",
                icon: "success"
              });
            } else {
              swalWithBootstrapButtons.fire({
                icon: "error",
                title: "Oops...",
                text: "Hubo un problema al actualizar el número de factura de la orden.",
              });

            }
          });
        }
      });
    }    
  }
  

  getClaseEstado(status: string): string {
    switch (status) {
      case 'EN PRODUCCIÓN':
        return 'estado-produccion';
      case 'EN ENTREGA':
        return 'estado-entrega';
      case 'FACTURADO':
        return 'estado-facturado';
      default:
        return '';
    }
  }

  editarStatus(ordenId: number, nuevoStatus: string) {
    let formData = new FormData();
    formData.append('id', ordenId.toString());
    formData.append('status', nuevoStatus);

    this.ordenCompraService.agregarOrdenCompra('status.php', formData).subscribe((event: any) => {
      if(event.status == 'success') {
        Swal.fire({
          title: "¡Actualizado!",
          text: "El status de la orden ha sido cambiado exitosamente.",
          icon: "success"
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Hubo un problema al actualizar el status de la orden.",
        });
      }
    });
  }

  cambiarEstado(orden: any, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstado = selectElement.value;
    const mensaje = `¿Desea cambiar el status de ${orden.status} a ${nuevoEstado}?`;
        
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-warning",
        cancelButton: "btn btn-secondary"
      }
    });

    if ((orden.status === 'EN ENTREGA' && nuevoEstado === 'EN PRODUCCIÓN') ||
        (orden.status === 'FACTURADO' && (nuevoEstado === 'EN PRODUCCIÓN' || nuevoEstado === 'EN ENTREGA'))) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se puede regresar a un status anterior."
      });
      selectElement.value = orden.status;
      return;
    } else {
        swalWithBootstrapButtons.fire({
          title: "¿Está seguro?",
          icon: "warning",
          text: mensaje,
          showCancelButton: true,
          confirmButtonText: '¡Sí, cambiar!',
          cancelButtonText: 'No, cancelar',
        }).then((result) => {
          if(result.isConfirmed) {
            orden.status = nuevoEstado;
            this.editarStatus(orden.id, nuevoEstado);
          } else {
            selectElement.value = orden.status;
          }
        });
    }
  }
    
  verDetalles(ordenId: any) {
    this.router.navigate(['/home/detalles', ordenId]);
  }

  remisionar(ordenId: any) {
  }

  imprimirReporte() {
    const selectorTemporalidad = document.getElementById('selectorTemporalidad') as HTMLSelectElement;
    this.temporalidad = parseInt(selectorTemporalidad.value);

    let fechaInicio: string = '';
    let fechaFin: string = '';
    let temp: string = '';

    switch(this.temporalidad) {
      case 1:
        fechaInicio = this.formatDate(new Date());
        fechaFin = this.formatDate(new Date());
        temp = 'Hoy';
        break;
      case 2:
        const hoy2 = new Date();
        const primerDiaSemana = new Date(hoy2.setDate(hoy2.getDate() - hoy2.getDay()));
        const ultimoDiaSemana = new Date(primerDiaSemana);
        ultimoDiaSemana.setDate(ultimoDiaSemana.getDate() + 6);

        fechaInicio = this.formatDate(primerDiaSemana);
        fechaFin = this.formatDate(ultimoDiaSemana);
        temp = 'Esta semana';
        break;
      case 3:
        const hoy3 = new Date();
        const primerDiaQuincena1 = new Date(hoy3.getFullYear(), hoy3.getMonth(), 1);
        const ultimoDiaQuincena1 = new Date(hoy3.getFullYear(), hoy3.getMonth(), 15);

        fechaInicio = this.formatDate(primerDiaQuincena1);
        fechaFin = this.formatDate(ultimoDiaQuincena1);
        temp = 'Primer Quincena';
        break;
      case 4:
        const hoy4 = new Date();
        const primerDiaQuincena2 = new Date(hoy4.getFullYear(), hoy4.getMonth(), 16);
        const ultimoDiaMes = new Date(hoy4.getFullYear(), hoy4.getMonth() + 1, 0);
        const ultimoDiaQuincena2 = new Date(hoy4.getFullYear(), hoy4.getMonth(), Math.min(ultimoDiaMes.getDate(), 30));

        fechaInicio = this.formatDate(primerDiaQuincena2);
        fechaFin = this.formatDate(ultimoDiaQuincena2);
        temp = 'Segunda Quincena';
        break;
      case 5: 
        const hoy5 = new Date();
        const fechaInicioMes = new Date(hoy5.getFullYear(), hoy5.getMonth(), 1);
        const ultimoDMes = new Date(hoy5.getFullYear(), hoy5.getMonth() + 1, 0);
        const fechaFinMes = new Date(hoy5.getFullYear(), hoy5.getMonth(), ultimoDMes.getDate());

        fechaInicio = this.formatDate(fechaInicioMes);
        fechaFin = this.formatDate(fechaFinMes);
        temp = 'Este mes';
        break;
      default:
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Selecciona una temporalidad para generar el reporte."
        });
        break;
    }

    this.ordenCompraService.getOrdenesCompra('reporte.php?fecha_inicio=' + fechaInicio + '&fecha_fin=' + fechaFin)
    .subscribe((data) => {
      this.ordenesCompraR = data.items;
      console.log(this.ordenesCompraR);
  

      const ordenesHTML = this.ordenesCompraR.map((orden: {folio: any; codigo: any; orden_compra_c: any; fecha_orden: any; fecha_entrega: any; total_pares: any; facturaNo: any; status: any;}) => `
        <tr>
          <td>${orden.folio || ''}</td>
          <td>${orden.codigo || ''}</td>
          <td>${orden.orden_compra_c || ''}</td>
          <td>${orden.fecha_orden || ''}</td>
          <td>${orden.fecha_entrega || ''}</td>
          <td>${orden.total_pares || ''}</td>
          <td>${orden.status || ''}</td>
          <td>${orden.facturaNo || ''}</td>
      `).join('');

      const tablaHTML = `
        <h1> Reporte de Órdenes de Compra </h1>
        <h2> ${temp}: ${fechaInicio} - ${fechaFin} </h2>
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Orden de Compra</th>
              <th>Fecha de Orden</th>
              <th>Fecha de Entrega</th>
              <th>Total de Pares</th>
              <th>Status</th>
              <th>No. Factura</th>
            </tr>
          </thead>
          <tbody>
            ${ordenesHTML}
          </tbody>
        </table>
      

        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .reporte-ordenes {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 {
            font-size: 24px;
            color: #333;
            text-align: center;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 18px;
            color: #666;
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            table-layout: fixed;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 10px;
            text-align: left;
            font-size: 14px;
            word-wrap: break-word;
          }
          th {
            background-color: #f4f4f4;
            font-weight: bold;
            text-transform: uppercase;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
        </style>
      `;

      printJS({
        printable: tablaHTML,
        type: 'raw-html',
        style: '@page { size: landscape; }'
      });
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
