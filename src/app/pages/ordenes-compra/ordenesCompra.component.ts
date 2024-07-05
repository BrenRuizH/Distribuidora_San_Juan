import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import * as printJS from 'print-js';
import { catchError, of } from 'rxjs';
import { ClientesService } from 'src/app/services/clientes.service';
import { OrdenesCompraService } from 'src/app/services/ordenesCompra.service';
import Swal from 'sweetalert2';
import { NumerosALetras } from 'numero-a-letras';


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

  detalle: any = { items1: [{}], items2: [{}] };


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
    });
  }

  obtenerDetalles(ordenId: any) {
    let formData = new FormData();
    formData.append('id', ordenId.toString());
    this.ordenCompraService.agregarOrdenCompra('remision.php', formData).subscribe((res: any) => {
      if (res.status === 'success') {
        this.ordenCompraService.detallesOrdenCompra(ordenId)
      .subscribe((resp: any) => {
        this.detalle = resp;

        let datos = this.detalle.items2;
        console.log(this.detalle)

        let datosObj: { [key: string]: string } = {};
        datos.forEach((dato: { punto: string, cantidad: string }) => {
          datosObj[dato.punto] = dato.cantidad;
        });
        this.remisionar();
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Hubo un error, inténtelo más tarde."
      });
    }
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

  remisionar() {

    const clienteHTML = this.detalle.items1.map((encabezado: { razonSocial: any; direccion: any; telefono: any; }) => `
    <div class="cliente-info">
      <p style="text-align: center;">CLIENTE</p>
      <p class="razon-social">${encabezado.razonSocial || ''}</p>
      <div class="direccion-container">
        <p class="direccion">${encabezado.direccion || ''}</p>
        <div class="localidad-cp-telefono">
          <p class="localidad">MÉXICO, LEÓN GTO.</p>
          <p class="telefono">Tel.: ${encabezado.telefono || ''}</p>
        </div>
      </div>
    </div>
    `).join('');

    let fecha = this.formatoDate(new Date());
    const remisionHTML = this.detalle.items1.map((remision: { remision: any; cliente_id: any; }) => `
    <div class="remision-info">
      <p><strong>REMISIÓN:</strong> ${remision.remision || ''}</p>
      <p> ${fecha}</p>
      <p><strong>CLIENTE NO.:</strong> ${remision.cliente_id || ''}</p>
    </div>
    `).join('');

    const puntosHTML = `
      <tr>
        ${this.detalle.items2.map((punto: { punto: any; }) => `
          <th>${punto.punto || ''}</th>`)
        .join('')}
      </tr>
      <tr>
        ${this.detalle.items2.map((punto: { cantidad: any; }) => `
          <td>${punto.cantidad || ''}</td>`)
        .join('')}
      </tr>
    `;

    let remision = this.detalle.items1[0].remision;
    let total_pares = parseInt(this.detalle.items1.reduce((sum: any, item: { total_pares: any; }) => sum + item.total_pares, 0));
    let subtotal = total_pares * this.detalle.items1[0].precio;
    let total = subtotal;
    let fechaFormatoLeyenda = this.formatoDateLeyenda(new Date());

    let numeroEnLetras = NumerosALetras(total, {
      plural: 'PESOS',
      singular: 'PESO',
      centPlural: 'CENTAVOS',
      centSingular: 'CENTAVO'
    });

    const hormaHTML = this.detalle.items1.map((hormas: { horma: any; precio: any; total_pares: any; }) => `
    <div class="horma-container">
    <table>
        <thead>
          <tr>
            <th class='cantidad'>CANT.</th>
            <th class='unidad'>UNID.</th>
            <th>DESCRIPCIÓN</th>
            <th class='precio'>PRECIO</th>
            <th class='importe'>IMPORTE</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>${hormas.total_pares || ''}</td>
            <td>PAR</td>
            <td>
              ${hormas.horma || ''}
              <table class="puntos-table">
                ${puntosHTML}
              </table>
            </td>
            <td>$${hormas.precio || ''}</td>
            <td>$${total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    `).join('');

    const infoCliente = `
    <div class="info-cliente-container">
      ${clienteHTML}
      ${remisionHTML}
    </div>
    ${hormaHTML}
    <div class="totales">
      <div class="sumatoria-cantidad" style="align-self: flex-start; margin-right: auto;">
      <hr style="width: 100%; border-top: 1px solid #000;">
        <p>${total_pares}</p>
      </div>
      <div class="subtotal-total">
        <div class="line-item">
          <p><strong>Subtotal</strong></p>
          <p><strong>Total</strong></p>
        </div>
        <div class="line-item">
          <p>$${subtotal.toFixed(2)}</p>
          <p>$${total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  </div>

  <style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 20px;
    color: #333;
    background-color: #f8f9fa;
  }

  .info-cliente-container {
    display: flex;
    justify-content: space-between;
    page-break-inside: avoid;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-radius: 8px;
  }
  
  
 .cliente-info {
    border: 1px solid #ddd;
    padding: 20px;
    width: 66.66%;
    background-color: #fdfdfe;
    border-radius: 8px;
    text-align: left;
  }

  .cliente-info p {
    margin: 0 0 10px 0;
    text-align: left;
  }
  
  .razon-social {
    margin-bottom: 10px;
    text-align: left;
  }

  .direccion-container {
    display: flex;
    flex-direction: column; 
    justify-content: flex-start; 
    align-items: flex-start; 
  }

  .direccion, .localidad-cp-telefono {
    width: 100%;
    text-align: left;
  }

  .localidad, .telefono {
    margin-bottom: 5px;
    text-align: left;
  }

  .remision-info {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    text-align: right;
  }

  .remision-info p {
    margin: 0 0 10px 0;
  }

  .horma-container {
    width: 100%;
    margin-bottom: 20px;
  }

  .horma-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    table-layout: fixed;
  }

  .horma-table, .horma-table th, .horma-table td {
    border: 1px solid #ddd;
  }

  .horma-table th, .horma-table td {
    padding: 8px;
    text-align: left;
    word-wrap: break-word;
  }

  .horma-table th {
    background-color: #f4f4f4;
    font-weight: bold;
    text-transform: uppercase;
  }

  .horma-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
    
  .horma-table tr:hover {
    background-color: #f1f1f1;
  }

  .cantidad {
    padding-right: 15px
  }

  .unidad{
   padding-left: 15px; 
   
  }
  
  precio {
    padding-right: 20px; /* Add padding to the right of the price column */
  }

  .importe {
    padding-left: 20px; /* Add padding to the left of the importe column */
  }

  .puntos-table {
    margin-top: 10px;
    width: 100%;
  }

  .puntos-table th, .puntos-table td {
    border: none;
    padding: 5px;
    text-align: center;
  }

  .puntos-table th {
    background-color: #f0f0f0;
  }

  .totales {
    display: flex;
    flex-direction: column
    align-items: flex-end;
    margin-top: 200px;
  }

  .sumatoria-cantidad {
    text-align: flex-start;
    margin-right: 20px;
  }

  .subtotal-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 10px;
}

.line-item {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.line-item p {
  text-align: center;
}



  .footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    border-top: 1px solid #000;
    padding: 10px 0;
    background-color: #fdfdfe;
  }

  .numero-remision {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .cantidad-letra {
    font-size: 1.2em;
    margin-bottom: 5px;
  }

  .leyenda {
    font-size: 0.8em;
  }
</style>

  <div class="footer">
      <p class="cantidad-letra">(${numeroEnLetras.toUpperCase()})</p>
      <p class="leyenda">
        Debo(emos) y pagaré(mos) a la orden de Jorge Hernández Hernández, en la ciudad de León, Gto., 
        o en cualquier otra que me sea requerido su pago el día ${fechaFormatoLeyenda} la cantidad de 
        $${total.toFixed(2)} (${numeroEnLetras.toUpperCase()}) recibido a mi entera satisfacción. 
        Este pagaré es mercantil y está regido por la ley general de títulos y operaciones de crédito 
        en su artículo 173 parte final y artículos correlativos por no ser un pagaré domiciliado.
      </p>
      <p class="numero-remision">${remision || ''}</p>
    </div>

  `;

    printJS({
      printable: infoCliente,
      type: 'raw-html',
      style: '@page { size: portrait; }'
    });
  }

  imprimirReporte() {
    const selectorTemporalidad = document.getElementById('selectorTemporalidad') as HTMLSelectElement;
    this.temporalidad = parseInt(selectorTemporalidad.value);

    let fechaInicio: string = '';
    let fechaFin: string = '';
    let temp: string = '';

    switch (this.temporalidad) {
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

        const ordenesHTML = this.ordenesCompraR.map((orden: { folio: any; codigo: any; orden_compra_c: any; fecha_orden: any; fecha_entrega: any; total_pares: any; facturaNo: any; status: any; }) => `
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

  private formatoDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const month = months[date.getMonth()];

    return `${day}/${month}/${year}`;
  }

  private formatoDateLeyenda(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date).toUpperCase();
  }
}
