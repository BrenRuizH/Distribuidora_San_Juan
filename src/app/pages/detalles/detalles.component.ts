import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { HormasService } from 'src/app/services/hormas.service';
import { OrdenesCompraService } from 'src/app/services/ordenesCompra.service';
import Swal from 'sweetalert2';
import * as printJS from 'print-js';

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent implements OnInit{
  detalles: any[] = [];
  detalle: any = { items1: [{}], items2: [{}]};
  puntosYcantidades: any[] = [];
  puntosYcantidadesEditar: any[] = [];

  puntosYcantidadesEditarCondorin: any[] = [];

  noHormas: boolean = false;

  clientes: any[] = [];
  cliente: any = {};
  
  hormas: any[] = [];
  horma: any = {};

  countMax: string = '';

  total: string = '';

  cliente_id: number | null = null;


  ordenPersonalizada: boolean = false;
  editarOrden: boolean = false;
  clienteAnterior: any = null;

  constructor(private clientesService: ClientesService,
              private hormasService: HormasService,
              private detallesService: OrdenesCompraService, 
              private activetedRouter: ActivatedRoute, 
              public router: Router) {
    this.activetedRouter.params.subscribe(params => {
      this.detalles = params['id'];
    })
  }

  ngOnInit(): void {
    this.obtenerDetalles();
    this.getClientes();
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
    })
  }

  generarNuevoNumeroOrden(cliente_id: any) {
    this.detallesService.consultarOrden(cliente_id).subscribe((data) => {
      this.detalle.items1[0].orden_compra_c = data.new_orden_compra_c;
    });
  }

  actualizarOrden(nuevoValor: string) {
    this.detalle.items1[0].orden_compra_c = nuevoValor;
  }

  getHormas(cliente_id: any) {
    this.cliente_id = cliente_id;
    this.hormasService.consultarHorma(cliente_id).subscribe((data) => {
      this.hormas = data.items;
      if (this.hormas.length === 0) {
        this.noHormas = true;
      } else {
        this.noHormas = false;
      }
    },
    (error) => {
      this.noHormas = true;
    });
  }

  seleccionarHorma(horma_id: any) {
    this.hormasService.seleccionarHorma(horma_id).subscribe((resp: any) => {
      this.horma = resp.items[0];
    })
  }

  calcularTotalPares() {
    let totalPares = 0;
    for (let fila of this.puntosYcantidadesEditar) {
      for (let item of fila) {
        let cantidad = Number(item.cantidad);
        totalPares += isNaN(cantidad) ? 0 : cantidad;
      }
    }
    this.detalle.items1[0].total_pares = String(totalPares);
  }

  llenarPuntosYcantidadesEditar() {
    let datos = this.detalle.items2;
    let datosObj: { [key: string]: string } = {};
    datos.forEach((dato: { punto: string, cantidad: string }) => {
      datosObj[dato.punto] = dato.cantidad;
    });
  
    let nuevosPuntosYcantidadesEditar = [];
  
    let fila = [];

    if(this.cliente_id == 37) {
      for (let i = 33; i <= 38; i ++) {
        let vista = i;
        let punto = i.toFixed(2);
        let cantidad = datosObj.hasOwnProperty(punto) ? datosObj[punto] : 0;
        fila.push({punto: punto, vista: vista, cantidad: cantidad});
        if (fila.length === 6) {
          nuevosPuntosYcantidadesEditar.push(fila);
          fila = [];
        }
      }
      if (fila.length > 0) {
        nuevosPuntosYcantidadesEditar.push(fila);
      }
    } else {
      for (let i = 15; i <= 32.5; i += 0.5) {
        let vista = i % 1 === 0 ? i.toString() : '1/2';
        let punto = i.toFixed(2);
        let cantidad = datosObj.hasOwnProperty(punto) ? datosObj[punto] : 0;
        fila.push({punto: punto, vista: vista, cantidad: cantidad});
        if (fila.length === 6) {
          nuevosPuntosYcantidadesEditar.push(fila);
          fila = [];
        }
      }
      if (fila.length > 0) {
        nuevosPuntosYcantidadesEditar.push(fila);
      }
    }
    
    this.puntosYcantidadesEditar = nuevosPuntosYcantidadesEditar;
  }

  obtenerDetalles() {
    this.detallesService.detallesOrdenCompra(this.detalles)
    .subscribe((resp: any) => {
      this.detalle = resp;

      let datos = this.detalle.items2;

      let datosObj: { [key: string]: string } = {};
      datos.forEach((dato: { punto: string, cantidad: string }) => {
        datosObj[dato.punto] = dato.cantidad;
      });

      this.puntosYcantidades = [];

      if(this.cliente_id == 37) {
        for (let i = 33; i <= 38; i ++) {
          let vista = i;
          let punto = i.toFixed(2);
          let cantidad = datosObj.hasOwnProperty(punto) ? datosObj[punto] : '-';
          this.puntosYcantidades.push({punto: punto, vista: vista, cantidad: cantidad});
        }
      } else {
        for (let i = 15; i <= 32.5; i += 0.5) {
          let vista = i % 1 === 0 ? i.toString() : '1/2';
          let punto = i.toFixed(2);
          let cantidad = datosObj.hasOwnProperty(punto) ? datosObj[punto] : '-';
          this.puntosYcantidades.push({punto: punto, vista: vista, cantidad: cantidad});
        }
      }
      

      if (this.detalle.items1[0]) {
        this.getHormas(this.detalle.items1[0].cliente_id);
        this.seleccionarHorma(this.detalle.items1[0].horma_id);
      }
    });
  }
  
  editarOrdenYdetalles() {
    if(this.detalle.items1[0].fecha_orden && this.detalle.items1[0].cliente_id && this.detalle.items1[0].horma_id) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-warning",
          cancelButton: "btn btn-secondary"
        },
      });

      swalWithBootstrapButtons.fire({
        title: "¿Desea editar la orden de compra?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "¡Sí, editar!",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {

        let formData = new FormData();
        formData.append('id', this.detalle.items1[0].id);
        formData.append('fecha_orden', this.detalle.items1[0].fecha_orden);
        formData.append('fecha_entrega', this.detalle.items1[0].fecha_entrega);
        formData.append('cliente_id', this.detalle.items1[0].cliente_id);
        formData.append('folio', this.detalle.items1[0].folio);
        formData.append('orden_compra_c', this.detalle.items1[0].orden_compra_c.toUpperCase());
        formData.append('horma_id', this.detalle.items1[0].horma_id);
        formData.append('total_pares', this.detalle.items1[0].total_pares);

        let puntos = [];
        let cantidades = [];

        for (let fila of this.puntosYcantidadesEditar) {
          for (let dato of fila) {
            if (dato.cantidad !== 0) {
              puntos.push(dato.punto);
              cantidades.push(dato.cantidad);
            }
          }
        }
        puntos = [...new Set(puntos)];

        formData.append('punto', puntos.join(','));
        formData.append('cantidad', cantidades.join(','));
        
        for (let pair of (formData as any).entries()) {
        }

        this.detallesService.agregarOrdenCompra('editar.php', formData).subscribe((event: any) =>{
          swalWithBootstrapButtons.fire({
            title: "¡Editado!",
            text: "La orden de compra ha sido editada exitosamente.",
            icon: "success"
          });
          if (event.status == 'success') {
            this.obtenerDetalles();
          }
        });
      }
    });
  } else  {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "El formulario está incompleto. Por favor, completa todos los campos.",
    });
  }
}
  cancelarOrden(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary"
      },
    });

    swalWithBootstrapButtons.fire({
      title: "¿Desea cancelar la orden de compra?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "¡Sí, cancelar!",
      cancelButtonText: "No, espera",
    }).then((result) => {
      if (result.isConfirmed) {

        swalWithBootstrapButtons.fire({
          title: "¡Cancelada!",
          text: "La orden de compra ha sido cancelada exitosamente.",
          icon: "success"
        });

        this.detallesService.eliminarOrdenCompra(id).subscribe((resp: any) => {
          if(resp['status'] == 'success') {
            this.router.navigate(['/home/ordenes-compra']);
          }
        })
      }
    });
  }

  imprimirDetalles() {
    let elemento = document.getElementById('contdiv');

    if (elemento) {
        let myHTML = elemento.innerHTML;

        myHTML += '<div style="width: 100%; display: block;"> <br><br>' + elemento.innerHTML + '</div>';

        myHTML += `
          <style>
            .hover-table, .miTabla {
              font-family: Arial, sans-serif;
              font-size: 22px;
              border-collapse: collapse;
              text-align: center;
              margin-bottom: 0 !important;
            }

            .hover-table {
              width: 100%;
              text-align: left;
            }

            .miTabla {
              margin-top: 0 !important;
              margin-left: 10px;
              width: 100%;
              height: 75%;
            }

            .hover-table th, .hover-table td, .miTabla th, .miTabla td {
              border: solid;
            }

            .hover-table th {
              font-weight: 300;
              padding: 5px;
              font-size: 20px;
            }

            .hover-table td{
              font-weight: bold;
              padding: 5px;
            }

            .no-border {
              border: none !important;
            }

            .total-pares-numero{
              text-align: right;
            }

            .miTabla .punto {
              font-weight: normal;
              font-size: 15px;
              padding: 2px;
            }

            .miTabla .cantidad {
              font-weight: bold;
            }
          </style>`

        printJS({
            printable: myHTML,
            type: 'raw-html'
        });
    } else {
        console.error('No se encontró el elemento con el ID "contdiv".');
    }
  }

}
