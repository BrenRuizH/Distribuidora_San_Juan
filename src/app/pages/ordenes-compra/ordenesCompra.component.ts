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
  ordenCompra: any = { cliente_id: '' };
  clientes: any[] = [];

  p: number = 1;
  textoBusqueda: string = '';
  temporalidad: number = 0;
  clienteSeleccionado: string = '';
  clienteString: String = '';


  detalle: any = { items1: [{}], items2: [{}] };


  constructor(private clientesService: ClientesService, private ordenCompraService: OrdenesCompraService, private router: Router, private changeDetector: ChangeDetectorRef) {
    this.obtenerOrdenesCompra();
  }

  ngOnInit(): void {
    this.getClientes();
    this.obtenerOrdenesCompra();
  }

  temporalidadSeleccionada: string = '';
  temporalidadPersonalizado: boolean = false;
  fechaInicio: string = '';
  fechaFin: string = '';
  temp: string = '';

  seleccionarTemporalidad(opcion: string) {
    this.temporalidadSeleccionada = opcion;

    switch(opcion) {
      case '1': 
        this.fechaInicio = this.formatDate(new Date());
        this.fechaFin = this.formatDate(new Date());
        this.temp = 'Hoy';
        break;
      case '2':
        const hoy2 = new Date();
        const primerDiaSemana = new Date(hoy2.setDate(hoy2.getDate() - hoy2.getDay()));
        const ultimoDiaSemana = new Date(primerDiaSemana);
        ultimoDiaSemana.setDate(ultimoDiaSemana.getDate() + 6);

        this.fechaInicio = this.formatDate(primerDiaSemana);
        this.fechaFin = this.formatDate(ultimoDiaSemana);
        this.temp = 'Esta semana';
        break;
      case '3':
        const hoy5 = new Date();
        const fechaInicioMes = new Date(hoy5.getFullYear(), hoy5.getMonth(), 1);
        const ultimoDMes = new Date(hoy5.getFullYear(), hoy5.getMonth() + 1, 0);
        const fechaFinMes = new Date(hoy5.getFullYear(), hoy5.getMonth(), ultimoDMes.getDate());

        this.fechaInicio = this.formatDate(fechaInicioMes);
        this.fechaFin = this.formatDate(fechaFinMes);
        this.temp = 'Este mes';
        break;
      case '4':
        this.temporalidadPersonalizado = true;
        this.fechaInicio;
        this.fechaFin;
        this.temp = 'Personalizado';
        break;
      default:
        this.temporalidadPersonalizado = false;
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Selecciona una temporalidad para generar el reporte."
        });
        break;
    }
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
    })
  }

  obtenerOrdenesCompra() {
    this.ordenCompraService.getOrdenesCompra('leer.php').subscribe((data) => {
      this.ordenesCompra = data.items;
    });
  }

  buscarOrdenesCompra() {
    if (!this.textoBusqueda) {
      this.obtenerOrdenesCompra();
    } else {
      this.ordenCompraService.getOrdenesCompra('buscar.php?texto=' + this.textoBusqueda).pipe(catchError(error => {
        if (error.status === 404) {
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
        if (result.isConfirmed) {
          let formData = new FormData();
          formData.append('id', orden.id.toString());
          formData.append('facturaNo', orden.facturaNo.toUpperCase());

          this.ordenCompraService.agregarOrdenCompra('factura.php', formData).subscribe((event: any) => {
            if (event.status == 'success') {
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
      case 'REMISIONADO':
        return 'estado-remisionado';
      default:
        return '';
    }
  }

  editarStatus(ordenId: number, nuevoStatus: string) {
    let formData = new FormData();
    formData.append('id', ordenId.toString());
    formData.append('status', nuevoStatus);

    this.ordenCompraService.agregarOrdenCompra('status.php', formData).subscribe((event: any) => {
      if (event.status == 'success') {
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
      (orden.status === 'FACTURADO'|| orden.status === 'REMISIONADO' && (nuevoEstado === 'EN PRODUCCIÓN' || nuevoEstado === 'EN ENTREGA'))) {
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
        if (result.isConfirmed) {
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

  imprimirReporte() {
    let url = 'reporte.php?fecha_inicio=' + this.fechaInicio + '&fecha_fin=' + this.fechaFin;
    console.log(this.clienteSeleccionado);
    if (this.clienteSeleccionado) {
      url += '&cliente_id=' + this.clienteSeleccionado;
    }

    console.log(url);
    this.ordenCompraService.getOrdenesCompra(url)
      .subscribe((data) => {
        this.ordenesCompraR = data.items;
        console.log(this.ordenesCompraR);

        const ordenesHTML = this.ordenesCompraR.map((orden: { folio: any; codigo: any; orden_compra_c: any; fecha_orden: any; fecha_entrega: any; total_pares: any; facturaNo: any; status: any; }) => `
        <tr>
          <td>${orden.folio || ''}</td>
          <td>${orden.codigo || ''}</td>
          <td>${orden.orden_compra_c || ''}</td>
          <td>${orden.fecha_orden || ''}</td>
          <td>${orden.fecha_entrega || ''}</td>
          <td>${Number(orden.total_pares).toLocaleString() || ''}</td>
          <td>${orden.status || ''}</td>
          <td>${orden.facturaNo || ''}</td>
      `).join('');

        const tablaHTML = `
        <h1> Reporte de Órdenes de Compra </h1>
        <h2> ${this.temp}: ${this.fechaInicio} - ${this.fechaFin} </h2>
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
      },
      (error) => {
        if (error.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No hay órdenes de compra para generar un reporte en esa temporalidad."
        });
      }
    });
  
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
