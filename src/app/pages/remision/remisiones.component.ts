import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NumerosALetras } from 'numero-a-letras';
import * as printJS from 'print-js';
import { catchError, of } from 'rxjs';
import { ClientesService } from 'src/app/services/clientes.service';
import { RemisionesService } from 'src/app/services/remisiones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-remisiones',
  templateUrl: './remisiones.component.html',
  styleUrls: ['./remisiones.component.css']
})
export class RemisionesComponent implements OnInit {
  remisionesReporte: any = [];

  remisiones: any = [];
  remision: any = {cliente_id: ''};

  remisionEditada: any = {};
  remisionEditada2: any = {};
  clientes: any[] = [];

  folios: any[] = [];
  cliente_id: number | null = null;
  remision_id: number | null = null;
  selectedFolios: string[] = [];
  noFolios: boolean = false;
  totalParesSum: any;
  formattedPrecioSum: any;
  
  p: number = 1;

  clienteInfo: any = {};
  remisionInfo: any = {};
  ordenCompraInfo: any = {};
  subtotal: number = 0;
  total: number = 0;
  totalEnLetras: string = '';
  fechaImpresion: string = this.convertirFechaTexto(new Date());
  fechaHoy: string = new Date().toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'});


  constructor(private clientesService: ClientesService, private remisionesService: RemisionesService, private changeDetector: ChangeDetectorRef) {
    this.obtenerRemisiones();
  }

  ngOnInit(): void {
    this.getClientes();
    this.obtenerRemisiones();
    
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
    });
  }

  obtenerRemisiones() {
    this.remisionesService.getRemisiones('leer.php').subscribe((data) => {
      this.remisiones = data.items;
    });
  }

  buscarRemisiones() {
    if (!this.remision.cliente_id) {
      this.obtenerRemisiones();
    } else {
      this.remisionesService.getRemisiones('buscar.php?id=' + this.remision.cliente_id).pipe(catchError(error => {
        if(error.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se encontraron remisiones.",
          });
        }
        return of([]);
      })
      ).subscribe((data) => {
        this.remisiones = data.items;
        this.changeDetector.detectChanges();
      });
    }
  }

  seleccionarRemision(id: any) {
    this.remisionesService.seleccionarRemision(id).subscribe((resp: any) => {
      this.remisionEditada = resp.items1[0];
      this.remisionEditada2 = resp.items2;
      this.getFolios(this.remisionEditada.cliente_id, this.remisionEditada.id);

      if (Array.isArray(this.remisionEditada2) && this.remisionEditada2.length > 0) {
        this.folios = this.remisionEditada2.map(folio => ({
          id: folio.id,
          folio: folio.folio
        }));

        this.selectedFolios = this.folios.map(folio => folio.folio);
      }
    });
  }

  getFolios(cliente_id: any, remision_id: any) {
    this.folios = [];
    this.cliente_id = cliente_id;
    this.remision_id = remision_id;
    this.selectedFolios = [];
    this.remisionesService.consultarFolioEditar(cliente_id, remision_id).subscribe((data) => {
      this.folios = data.items.map((folio: any) => ({
        folio: folio.folio,
        total_pares: folio.total_pares,
        precio: folio.precio
      }));
      if (this.folios.length === 0) {
        this.noFolios = true;
      } else {
        this.noFolios = false;
      }
    },
    (error) => {
      this.noFolios = true;
    });
  }

  isSelected(folio: string): boolean {
    
    return this.selectedFolios.includes(folio);
  }

  isClienteSelected(): boolean {
    return !!this.remisionEditada.cliente_id;
  }

  toggleSelection(folio: string): void {
    if (this.isSelected(folio)) {
        this.selectedFolios = this.selectedFolios.filter(f => f !== folio);
    } else {
        this.selectedFolios.push(folio);
    }
    this.calcularSumatoria();
  }

  calcularSumatoria() {
    this.totalParesSum = this.selectedFolios.reduce((sum, folio) => {
      const selectedFolio = this.folios.find(f => f.folio === folio);
      const totalPares = parseInt(selectedFolio?.total_pares || '0', 10);
      return sum + totalPares;
    }, 0);

    const precioSum = this.selectedFolios.reduce((sum, folio) => {
      const selectedFolio = this.folios.find(f => f.folio === folio);
      const precio = parseFloat(selectedFolio?.precio || '0');
      return sum + precio;
    }, 0);

    this.formattedPrecioSum = precioSum.toFixed(2);
  }

  editarRemision() {
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
        formData.append('id', this.remisionEditada.id);
        formData.append('fecha', this.remisionEditada.fecha);
        formData.append('cliente_id', this.remisionEditada.cliente_id.toUpperCase());
        formData.append('total_pares', this.totalParesSum);
        formData.append('precio_final', this.formattedPrecioSum);
        formData.append('folio', this.selectedFolios.join(','));

        this.remisionesService.agregarRemision('editar.php', formData).subscribe((event: any) => {
          swalWithBootstrapButtons.fire({
            title: "¡Editada!",
            text: "La remisión ha sido editada exitosamente.",
            icon: "success"
          });
          if (event.status == 'success') {
            this.obtenerRemisiones();
          }
        });
      }
    });
  }

  eliminarRemision(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary"
      }
    });

    swalWithBootstrapButtons.fire({
      title: "¿Desea eliminar la remisión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "No, cancelar"
    }).then((result) => {
      if (result.isConfirmed) {

        swalWithBootstrapButtons.fire({
          title: "¡Eliminada!",
          text: "La remisión ha sido eliminada exitosamente.",
          icon: "success"
        });

        this.remisionesService.eliminarRemision(id).subscribe((resp: any) => {
          if(resp['status'] == 'success') {
            this.obtenerRemisiones();
          }
        });
      }
    });
  }

  convertirFechaTexto(fecha: Date): string {
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    return `${dia} de ${mes} de ${anio}`;
  }

  remisionar(id: any) {
    this.remisionesService.imprimirRemision(id).subscribe((resp: any) => {
      this.clienteInfo = resp.cliente[0] || {};
      this.remisionInfo = resp.remision[0] || {};
      this.ordenCompraInfo = resp.orden_compra;

      this.subtotal = this.ordenCompraInfo.reduce((acc: number, orden: { horma: { precio: any; }; total_pares: number; }) => acc + (Number(orden.horma.precio) || 0) * orden.total_pares, 0);
      this.total = this.subtotal;

      const totalPares = this.ordenCompraInfo.reduce((acc: any, orden: { total_pares: any; }) => acc + Number(orden.total_pares), 0);

      this.totalEnLetras = NumerosALetras(this.total, {
        plural: 'PESOS',
        singular: 'PESO',
        centPlural: 'CENTAVOS',
        centSingular: 'CENTAVO'
      });

      this.fechaImpresion = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric'});

      const clienteHTML = `
        <div class="cliente-info">
          <p style="text-align: center;">CLIENTE</p>
          <p class="razon-social">${this.clienteInfo.razonSocial}</p>
          <div class="direccion-container">
            <p class="direccion">${this.clienteInfo.direccion}</p>
            <div class="localidad-cp-telefono">
              <p class="localidad">MÉXICO, LEÓN GTO.</p>
              <p class="telefono">Tel.: ${this.clienteInfo.telefono || ''}</p>
            </div>
          </div>
          <div class="cliente-details">
            <p>No. Remisión: ${this.remisionInfo.id}</p>
            <p>Fecha de impresión: ${this.fechaImpresion}</p>
            <p>No. Cliente: ${this.clienteInfo.id}</p>
          </div>
        </div>`;

      const ordenCompraHTML = `
        <table class="orden-compra-table">
          <thead>
            <tr>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            ${this.ordenCompraInfo.map((orden: { total_pares: number; horma: { nombre: any; precio: any; }; detalles: any[]; }) => `
              <tr>
                <td>${Number(orden.total_pares).toLocaleString()}</td>
                <td>PAR</td>
                <td>
                  <p>${orden.horma.nombre}</p>
                  <table class="detalle-puntos-table">
                    <thead>
                      <tr>
                        ${orden.detalles.map(detalle => `<th>${detalle.punto}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        ${orden.detalles.map(detalle => `<td>${Number(detalle.cantidad).toLocaleString()}</td>`).join('')}
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td>$${(Number(orden.horma.precio) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                <td>$${((Number(orden.horma.precio) || 0) * orden.total_pares).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;

      const subtotalTotalHTML = `
        <div class="subtotal-total">
          <p>Total pares: ${totalPares.toLocaleString()}</p>
          <p class="subtotal">Subtotal: $${this.subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
          <p class="total">Total: $${this.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
          <p class="total-letras">Total en letras: (${this.totalEnLetras.toUpperCase()})</p>
        </div>`;

      const footerHTML = `
        <div class="footer">
          <p>Debo(emos) y pagaré(mos) a la orden de Jorge Hernández Hernández, en la ciudad de León, Gto., o en cualquier otra que me sea requerido su pago el día ${this.convertirFechaTexto(new Date())} 
          la cantidad de $${this.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} (${this.totalEnLetras.toUpperCase()}) valor de la mercancía que he recibido a mi entera satisfacción. Este pagaré es mercantil y está regido por la ley 
          general de títulos y operaciones de crédito en su artículo 173 parte final y artículos correlativos por no ser un pagaré domiciliado.</p>
          <p>Número de remisión: ${this.remisionInfo.id}</p>
        </div>`;

      const remisionHTML = `
        <div class="remision-container">
          ${clienteHTML}
          ${ordenCompraHTML}
          ${subtotalTotalHTML}
          ${footerHTML}
        </div>`;

      printJS({
        printable: remisionHTML,
        type: 'raw-html',
        style: '@page { size: portrait; }'
      });
    });
  }

  imprimirReporte() {
    this.remisionesService.getRemisiones('reporte.php?fecha_inicio=' + this.fechaInicio + '&fecha_fin=' + this.fechaFin)
    .subscribe((data) => {
      this.remisionesReporte = data.items;

      const remisionesHTML = this.remisionesReporte.map((remision: { id: any; codigo: any; total_pares: any; precio_final: any; }) => `
      <tr>
        <td>${remision.id || ''}</td>
        <td>${remision.codigo || ''}</td>
        <td>${Number(remision.total_pares).toLocaleString() || ''}</td>
        <td>$${Number(remision.precio_final).toLocaleString() || ''}</td>
    `).join('');

    const tablaHTML = `
        <h1> Reporte de Remisiones </h1>
        <h2> ${this.temp}: ${this.fechaInicio} - ${this.fechaFin} </h2>
        <table>
          <thead>
            <tr>
              <th>No. Remisión</th>
              <th>Cliente</th>
              <th>Pares</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${remisionesHTML}
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
          text: "No hay remisiones para generar un reporte en esa temporalidad."
      });
    }
  });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}