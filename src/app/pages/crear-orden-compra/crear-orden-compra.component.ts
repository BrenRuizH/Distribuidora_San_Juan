import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { HormasService } from 'src/app/services/hormas.service';
import { OrdenesCompraService } from 'src/app/services/ordenesCompra.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-orden-compra',
  templateUrl: './crear-orden-compra.component.html',
  styleUrls: ['./crear-orden-compra.component.css']
})
export class CrearOrdenCompraComponent implements OnInit{
  
  ordenesCompra: any = [];
  ordenesForm: FormGroup;

  clientes: any[] = [];
  cliente: any = {};
  hormas: any[] = [];
  horma: any = {};

  fecha: string = '';
  fechaOrden: string = '';
  folioMax: string = '';
  countMax: string = '';
  total: string = '';

  cliente_id: number | null = null;

  noHormas: boolean = false;

  puntosYcantidades = [
    [
      { vista:'15', punto: 15, cantidad: 0},
      { vista:'1/2', punto: 15.5, cantidad: 0},
      { vista:'16', punto: 16, cantidad: 0},
      { vista:'1/2', punto: 16.5, cantidad: 0},
      { vista:'17', punto: 17, cantidad: 0},
      { vista:'1/2', punto: 17.5, cantidad: 0},
    ],
    [
      { vista:'18',  punto: 18, cantidad: 0},
      { vista:'1/2', punto: 18.5, cantidad: 0},
      { vista:'19', punto: 19, cantidad: 0},
      { vista:'1/2', punto: 19.5, cantidad: 0},
      { vista:'20', punto: 20, cantidad: 0},
      { vista:'1/2',  punto: 20.5, cantidad: 0},
    ],
    [
      { vista:'21', punto: 21, cantidad: 0},
      { vista:'1/2', punto: 21.5, cantidad: 0},
      { vista:'22', punto: 22, cantidad: 0},
      { vista:'1/2', punto: 22.5, cantidad: 0},
      { vista:'23', punto: 23, cantidad: 0},
      { vista:'1/2', punto: 23.5, cantidad: 0},
    ],
    [
      { vista:'24', punto: 24, cantidad: 0},
      { vista:'1/2', punto: 24.5, cantidad: 0},
      { vista:'25', punto: 25, cantidad: 0},
      { vista:'1/2', punto: 25.5, cantidad: 0},
      { vista:'26', punto: 26, cantidad: 0},
      { vista:'1/2', punto: 26.5, cantidad: 0},
    ],
    [
      { vista:'27',  punto: 27, cantidad: 0},
      { vista:'1/2', punto: 27.5, cantidad: 0},
      { vista:'28', punto: 28, cantidad: 0},
      { vista:'1/2', punto: 28.5, cantidad: 0},
      { vista:'29', punto: 29, cantidad: 0},
      { vista:'1/2', punto: 29.5, cantidad: 0},
    ],
    [
      { vista:'30', punto: 30, cantidad: 0},
      { vista:'1/2', punto: 30.5, cantidad: 0},
      { vista:'31', punto: 31, cantidad: 0},
      { vista:'1/2', punto: 31.5, cantidad: 0},
      { vista:'32', punto: 32, cantidad: 0},
      { vista:'1/2', punto: 32.5, cantidad: 0},
    ]
  ];

  puntosYcantidadesCondorin =
  [
    [
      { vista:'25', punto: 25, cantidad: 0},
      { vista:'26', punto: 26, cantidad: 0},
      { vista:'27', punto: 27, cantidad: 0},
      { vista:'28', punto: 28, cantidad: 0},
      { vista:'29', punto: 29, cantidad: 0},
      { vista:'30', punto: 30, cantidad: 0},
      { vista:'31', punto: 31, cantidad: 0},

      { vista:'32', punto: 32, cantidad: 0},
      { vista:'33', punto: 33, cantidad: 0},
      { vista:'34', punto: 34, cantidad: 0},
      { vista:'35', punto: 35, cantidad: 0},
      { vista:'36', punto: 36, cantidad: 0},
      { vista:'37', punto: 37, cantidad: 0},
      { vista:'38', punto: 38, cantidad: 0},
    ],
  ];
  
  constructor(private clientesService: ClientesService,
              private hormasService: HormasService,
              public ordenesCompraService: OrdenesCompraService, 
              public router: Router, private fb: FormBuilder,
              private cdr: ChangeDetectorRef,
              private ngZone: NgZone) {
    this.ordenesForm = this.fb.group({
      fecha_entrega: ['', Validators.required],
      cliente_id: ['', Validators.required],
      horma_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fecha = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.fechaOrden = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    this.getClientes();
    this.obtenerOrdenesCompra();
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
    })
  }

  generarNuevoNumeroOrden(cliente_id:any) {
    this.clientesService.seleccionarCliente(cliente_id).subscribe((resp: any) => {
      this.cliente = resp.items[0];
      this.ordenesCompraService.consultarOrden(cliente_id).subscribe((data) => {
        this.countMax = data.new_orden_compra_c;
      });
    });
  }

  actualizarOrden(nuevoValor: string) {
    this.countMax = nuevoValor;
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

  obtenerOrdenesCompra() {
    this.ordenesCompraService.getOrdenesCompra('leer.php').subscribe((data) => {
      this.ordenesCompra = data.items;
      this.folioMax = String(Number(data.maxFolio) + 1);
    });
  }

  calcularTotalPares() {
    let totalPares = 0;
    if(this.cliente_id != 37) {
      for (let fila of this.puntosYcantidades) {
        for (let item of fila) {
          totalPares += item.cantidad;
        }
      }
    } else {
      for (let fila of this.puntosYcantidadesCondorin) {
        for (let item of fila) {
          totalPares += item.cantidad;
        }
      }
    }
    this.total =  String(totalPares);
  }

  agregarOrdenCompra() {
    if (this.ordenesForm.valid) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-secondary"
        },
      });

      swalWithBootstrapButtons.fire({
        title: "¿Desea crear la orden de compra?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "¡Sí, crear!",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
        
          let formData = new FormData();
          formData.append('fecha_orden', this.fecha);
          formData.append('fecha_entrega', this.ordenesForm.get('fecha_entrega')?.value);
          formData.append('cliente_id', this.ordenesForm.get('cliente_id')?.value);
          formData.append('folio', this.folioMax);
          formData.append('orden_compra_c', this.countMax.toUpperCase());
          formData.append('horma_id', this.ordenesForm.get('horma_id')?.value);
          formData.append('total_pares', this.total);
        
          let puntos = [];
          let cantidades = [];

          if(this.cliente_id != 37) {
            for (let fila of this.puntosYcantidades) {
              for (let dato of fila) {
                if (dato.cantidad !== 0) {
                  puntos.push(dato.punto);
                  cantidades.push(dato.cantidad);
                }
              }
            }
          } else {
            for (let fila of this.puntosYcantidadesCondorin) {
              for (let dato of fila) {
                if (dato.cantidad !== 0) {
                  puntos.push(dato.punto);
                  cantidades.push(dato.cantidad);
                }
              }
            }
          }

          puntos = [...new Set(puntos)];

          formData.append('punto', puntos.join(','));
          formData.append('cantidad', cantidades.join(','));

          this.ordenesCompraService.agregarOrdenCompra('crear.php', formData).subscribe((event: any) =>{
            swalWithBootstrapButtons.fire({
              title: "¡Creada!",
              text: "La orden de compra ha sido creada exitosamente.",
              icon: "success"
            });
            if (event.status == 'success') {
              this.router.navigate(['/home/ordenes-compra']);
            }
          },
          (error) => {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Hubo un error al crear la orden de compra. Inténtalo más tarde."
            });
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
}
