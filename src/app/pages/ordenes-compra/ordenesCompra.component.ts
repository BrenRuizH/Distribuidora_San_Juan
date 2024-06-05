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

  verDetalles(ordenId: any) {
    this.router.navigate(['/home/detalles', ordenId]);
  }

  remisionar(ordenId: any){
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
    <td>${orden.facturaNo || ''}</td>
    <td>${orden.status || ''}</td>
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
            <th>No. Factura</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${ordenesHTML}
        </tbody>
      </table>
    </div>
  `;

  printJS({
    printable: tablaHTML,
    type: 'raw-html'
  });
});
}
  


  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

}
