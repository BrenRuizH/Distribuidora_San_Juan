import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { HormasService } from 'src/app/services/hormas.service';
import { RemisionesService } from 'src/app/services/remisiones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-remision',
  templateUrl: './crear-remision.component.html',
  styleUrls: ['./crear-remision.component.css']
})
export class CrearRemisionComponent {

  hormas: any[] = [];
  horma: any = {};
  noHormas: boolean = false;
  total: string = '';
  elementosAgregados: any[] = [];
  mostrarInputs: boolean = false;

  fechaRemision: string = '';

  clientes: any[] = [];
  folios: any[] = [];
  cliente_id: number | null = null;
  selectedFolios: { folio: string, oc: string }[] = [];
  noFolios: boolean = false;
  remisionForm:FormGroup;

  totalParesSum: any;
  formattedPrecioSum: any;

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

  constructor(private clientesService: ClientesService, public remisionesService: RemisionesService, 
      private hormasService: HormasService, public router: Router, private fb: FormBuilder) {
    this.remisionForm = this.fb.group({
      fechaRemision:  ['', Validators.required],
      cliente_id: ['', Validators.required],
      horma_id: ['', Validators.required],
      folios: ['', Validators.required],
      cantidad: [''],
      descripcion: [''],
      oc: ['']
    });
  }

  ngOnInit(): void {
    this.getClientes();
    this.fechaRemision = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  seleccionar(event : Event ){
    const check = event.target as HTMLInputElement;
    this.mostrarInputs = check.checked;
  }

  agregarElemento() {
    if (this.remisionForm.get('horma_id')?.value) {
      const puntosYCantidadesFiltrados = this.puntosYcantidades.flatMap(row =>
      row.filter(item => item.cantidad !== 0)
        .map(item => ({ vista: item.vista, punto: item.punto, cantidad: item.cantidad.toLocaleString() }))
    );
      
    const elementos = {
      horma_id: this.horma.id,
      horma: this.horma.nombre,
      oc: this.remisionForm.get('oc')?.value.toUpperCase(),
      puntosYcantidades: puntosYCantidadesFiltrados,
      totalPares: Number(this.total).toLocaleString(),
      precio: (Number(this.total) * this.horma.precio).toLocaleString()
    };
    this.elementosAgregados.push(elementos);
    console.log(this.elementosAgregados)
    this.calcularSumatoria();
  
    this.remisionForm.get('horma_id')?.reset();
    this.resetearPuntosYCantidades();
  }else{
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "El formulario está incompleto. Por favor, completa todos los campos.",
    });
  }
  }

  resetearPuntosYCantidades() {
    this.puntosYcantidades.forEach(row => {
      row.forEach(item => {
        item.cantidad = 0;
      });
    });
    this.calcularTotalPares();
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
    })
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

  getFolios(cliente_id: any) {
    this.cliente_id = cliente_id;
    this.selectedFolios = [];
    this.remisionesService.consultarFolio(cliente_id).subscribe((data) => {
      this.folios = data.items.map((folio: any) => ({
        folio: folio.folio,
        oc: folio.orden_compra_c,
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

  isClienteSelected(): boolean {
    return !!this.remisionForm.get('cliente_id')?.value;
  }

  isSelected(folio: string): boolean {
    return this.selectedFolios.some(f => f.folio === folio);
  }

  toggleSelection(folio: string, oc: string): void {
    const index = this.selectedFolios.findIndex(f => f.folio === folio);
    if (index > -1) {
        this.selectedFolios.splice(index, 1);
    } else {
        this.selectedFolios.push({ folio, oc });
    }
    this.calcularSumatoria();
  }

  calcularTotalPares() {
    let totalPares = 0;
      for (let fila of this.puntosYcantidades) {
        for (let item of fila) {
          totalPares += item.cantidad;
        }
      }
    this.total =  String(totalPares);
  }

  calcularSumatoria() {
    if(this.remisionForm.get('cliente_id')?.value != 36) {
      this.totalParesSum = this.selectedFolios.reduce((sum, folioObj) => {
        const selectedFolio = this.folios.find(f => f.folio === folioObj.folio);
        const totalPares = parseInt(selectedFolio?.total_pares || '0', 10);
        return sum + totalPares;
      }, 0);

      const precioSum = this.selectedFolios.reduce((sum, folioObj) => {
        const selectedFolio = this.folios.find(f => f.folio === folioObj.folio);
        const precio = parseFloat(selectedFolio?.precio || '0');
        return sum + precio;
      }, 0);

      this.formattedPrecioSum = precioSum.toFixed(2);
    } else {
      this.totalParesSum = this.elementosAgregados.reduce((sum, elem) => sum + parseInt(elem.totalPares, 10), 0);
      this.formattedPrecioSum = this.elementosAgregados.reduce((sum, elem) => sum + parseFloat(elem.precio), 0);

    }
  }

    agregarRemision() {
      if (this.fechaRemision && this.remisionForm.get('cliente_id')?.value && this.selectedFolios.join(',') && this.remisionForm.get('cliente_id')?.value != 36) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-secondary"
          },
        });

        swalWithBootstrapButtons.fire({
          title: "¿Desea agregar la remisión?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "¡Sí, agregar!",
          cancelButtonText: "No, cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
          
            let formData = new FormData();
            formData.append('fecha', this.fechaRemision);
            formData.append('cliente_id', this.remisionForm.get('cliente_id')?.value.toUpperCase());
            formData.append('total_pares', this.totalParesSum);
            formData.append('precio_final', this.formattedPrecioSum);
            formData.append('folios', JSON.stringify(this.selectedFolios));

            console.log(JSON.stringify(this.selectedFolios));

            if (this.remisionForm.get('cantidad')?.value) {
              formData.append('extra', this.remisionForm.get('cantidad')?.value);
            }
            if (this.remisionForm.get('descripcion')?.value) {
              formData.append('descripcion', this.remisionForm.get('descripcion')?.value.toUpperCase());
            }
            
            this.remisionesService.agregarRemision('crear.php', formData).subscribe((event: any) =>{
              swalWithBootstrapButtons.fire({
                title: "¡Agregada!",
                text: "La remisión ha sido agregada exitosamente.",
                icon: "success"
              });

              if (event.status == 'success') {
                this.router.navigate(['/home/remisiones']);
              }
            },
            (error) => {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Hubo un error al agregar la remisión. Inténtalo más tarde."
              });
            });
          }
        });
      } else if (this.fechaRemision && this.remisionForm.get('cliente_id')?.value && this.remisionForm.get('cliente_id')?.value == 36) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-secondary"
          },
        });

        swalWithBootstrapButtons.fire({
          title: "¿Desea agregar la remisión?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "¡Sí, agregar!",
          cancelButtonText: "No, cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
          
            let formData = new FormData();
            formData.append('fecha', this.fechaRemision);
            formData.append('cliente_id', this.remisionForm.get('cliente_id')?.value.toUpperCase());
            formData.append('total_pares', this.totalParesSum);
            formData.append('precio_final', this.formattedPrecioSum);
            formData.append('elementosAgregados', JSON.stringify(this.elementosAgregados));

            if (this.remisionForm.get('cantidad')?.value) {
              formData.append('extra', this.remisionForm.get('cantidad')?.value);
            }
            if (this.remisionForm.get('descripcion')?.value) {
              formData.append('descripcion', this.remisionForm.get('descripcion')?.value.toUpperCase());
            }
            
            console.log(this.remisionForm);
            
            this.remisionesService.agregarRemision('crear.php', formData).subscribe((event: any) =>{
              swalWithBootstrapButtons.fire({
                title: "¡Agregada!",
                text: "La remisión ha sido agregada exitosamente.",
                icon: "success"
              });

              if (event.status == 'success') {
                this.router.navigate(['/home/remisiones']);
              }
            },
            (error) => {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Hubo un error al agregar la remisión. Inténtalo más tarde."
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
        console.log(this.remisionForm);
      }
    }
}