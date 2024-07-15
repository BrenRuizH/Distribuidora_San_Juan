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

  puntosYcantidades: any[][] = []; // Matriz de puntos y cantidades

  hormas: any[] = [];
  horma: any = {};
  noHormas: boolean = false;
  total: string = '';

  elementosAgregados: any[] = [];
  editIndex: number | null = null;

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
    this.inicializarPuntosYCantidades();
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
  
      // Verificar si hay al menos un punto con cantidad diferente de 0
      const tieneCantidadValida = puntosYCantidadesFiltrados.length > 0;
  
      if (tieneCantidadValida) {
        const elementos = {
          horma_id: this.horma.id,
          horma: this.horma.nombre,
          oc: this.remisionForm.get('oc')?.value.toUpperCase(),
          puntosYcantidades: puntosYCantidadesFiltrados,
          totalPares: Number(this.total).toLocaleString(),
          precio: (Number(this.total) * this.horma.precio).toLocaleString()
        };
        this.elementosAgregados.push(elementos);
        console.log(this.elementosAgregados);
        this.calcularSumatoria();
  
        this.remisionForm.get('horma_id')?.reset();
        this.resetearPuntosYCantidades();
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Debe haber al menos un punto con cantidad diferente de 0.",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El formulario está incompleto. Por favor, completa todos los campos.",
      });
    }
  }
  

  eliminarElemento(index: number): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary"
      }
    });

    swalWithBootstrapButtons.fire({
      title: "¿Desea eliminar la orden de la remisión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "No, cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire({
          title: "¡Eliminada!",
          text: "La orden ha sido eliminada de la remisión exitosamente.",
          icon: "success"
        });

      this.elementosAgregados.splice(index, 1);
      this.calcularSumatoria();
      }
    });
  }

  inicializarPuntosYCantidades(): void {
    this.puntosYcantidades = [
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
  }

  cargarElementoParaEditar(index: number): void {
    const elemento = this.elementosAgregados[index];
    this.remisionForm.patchValue({
        horma_id: elemento.horma_id,
        oc: elemento.oc,
    });

    // Generar opciones para el select de hormas
    let opcionesHormas = '';
    this.hormas.forEach(horma => {
        opcionesHormas += `<option value="${horma.id}" ${horma.id === elemento.horma_id ? 'selected' : ''}>${horma.nombre}</option>`;
    });

    // Generar HTML para la tabla de puntos
    let puntosTableHtml = '';
    let puntoInicio = 15;
    while (puntoInicio <= 32.5) {
        puntosTableHtml += `
            <tr>
                <td>${puntoInicio}</td>
                  <td><input type="number" value="${this.getPuntoCantidad(elemento.puntosYcantidades, puntoInicio)}" /></td>
            </tr>
        `;
        puntoInicio += 0.5;
        // Agregar línea adicional para punto 1/2
        if (puntoInicio <= 32.5) {
            puntosTableHtml += `
                <tr>
                    <td>1/2</td>
                  <td><input type="number" value="${this.getPuntoCantidad(elemento.puntosYcantidades, puntoInicio)}" /></td>
                </tr>
            `;
            puntoInicio += 0.5;
        }

        // Agregar fila de separación cada 6 puntos
        if ((puntoInicio - 15) % 3 === 0 && puntoInicio <= 32.5) {
          puntosTableHtml += `<tr><td colspan="2"><hr></td></tr>`;
      }
    }

    // Abrir SweetAlert con el formulario y la tabla de puntos
    Swal.fire({
        title: 'Editar Elemento',
        html: `
            <form>
                <div class="form-group">
                    <label for="horma_id">Horma</label>
                    <select class="form-control" id="horma_id" formControlName="horma_id">
                        ${opcionesHormas}
                    </select>
                </div>
                <div class="form-group">
                    <label for="oc">Orden de Compra</label>
                    <input type="text" class="form-control" id="oc" formControlName="oc" value="${elemento.oc}">
                </div>
            </form>
            <hr>
            <h5>Tabla de Puntos</h5>
            <table class="table">
                <thead>
                    <tr>
                        <th>Punto</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    ${puntosTableHtml}
                </tbody>
            </table>
        `,
        showCancelButton: true,
        confirmButtonColor: '#FFA500',
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          return this.obtenerPuntosYCantidadesActualizados();
        }
    }).then((result) => {
        if (result.isConfirmed) {
          const hormaId = this.remisionForm.get('horma_id')?.value;
          const oc = this.remisionForm.get('oc')?.value.toUpperCase();
          const puntosYcantidadesActualizados = this.obtenerPuntosYCantidadesActualizados();

          this.elementosAgregados[index] = {
              horma_id: hormaId,
              horma: this.hormas.find(horma => horma.id === hormaId)?.nombre || '',
              oc: oc,
              puntosYcantidades: puntosYcantidadesActualizados,
              totalPares: this.calcularTotalParesA(puntosYcantidadesActualizados),
              precio: this.calcularPrecioTotal(puntosYcantidadesActualizados)
          };

          // Mostrar mensaje de éxito
            Swal.fire('Actualizado', 'El elemento ha sido actualizado correctamente.', 'success');
        }
    });
}

actualizarElemento(index: number): void {
    // Obtener valores actualizados del formulario y la tabla de puntos
    const hormaId = this.remisionForm.get('horma_id')?.value;
    const oc = this.remisionForm.get('oc')?.value.toUpperCase();
    const puntosYcantidadesActualizados = this.obtenerPuntosYCantidadesActualizados();

    // Calcular total de pares
    let totalPares = 0;
    puntosYcantidadesActualizados.forEach(item => {
      totalPares += item.cantidad;
    });

    // Calcular precio total
    const precio = (totalPares * this.horma.precio).toLocaleString();

    // Actualizar el elemento en el array
    this.elementosAgregados[index] = {
      horma_id: hormaId,
      horma: this.horma.nombre, // Ajusta según tu lógica
      oc: oc,
      puntosYcantidades: puntosYcantidadesActualizados,
      totalPares: totalPares.toLocaleString(), // Ajusta el formato si es necesario
      precio: precio
    };

    // Mostrar mensaje de éxito
    Swal.fire('Actualizado', 'El elemento ha sido actualizado correctamente.', 'success');

    // Recalcular sumatoria si es necesario
    this.calcularSumatoria();
}

// Función para obtener los puntos y cantidades actualizados desde la tabla del SweetAlert
obtenerPuntosYCantidadesActualizados(): any[] {
  const puntosYCantidadesActualizados = [];

  let puntoInicio = 15;
  while (puntoInicio <= 32.5) {
    const inputPunto = document.getElementById(`${puntoInicio}`) as HTMLInputElement;
    if (inputPunto) {
      const cantidad = parseFloat(inputPunto.value);
      if (!isNaN(cantidad)) {
        puntosYCantidadesActualizados.push({ punto: puntoInicio, cantidad: cantidad });
      }
    }

    puntoInicio += 0.5;

    // Agregar línea adicional para punto 1/2
    if (puntoInicio <= 32.5) {
      const inputPuntoMedio = document.getElementById(`1/2_${puntoInicio}`) as HTMLInputElement;
      if (inputPuntoMedio) {
        const cantidadMedio = parseFloat(inputPuntoMedio.value);
        if (!isNaN(cantidadMedio)) {
          puntosYCantidadesActualizados.push({ punto: `1/2 ${puntoInicio}`, cantidad: cantidadMedio });
        }
      }
      puntoInicio += 0.5;
    }
  }

  return puntosYCantidadesActualizados;
}

// Función para calcular el total de pares desde los puntos y cantidades actualizados
calcularTotalParesA(puntosYCantidades: any[]): string {
  let totalPares = 0;
  puntosYCantidades.forEach(item => {
    totalPares += item.cantidad;
  });
  return totalPares.toLocaleString();
}

// Función para calcular el precio total desde los puntos y cantidades actualizados
calcularPrecioTotal(puntosYCantidades: any[]): string {
  // Lógica para calcular el precio total basado en los puntos y cantidades actualizados
  return ''; // Implementa la lógica necesaria
}

// Método para obtener la cantidad de un punto específico
getPuntoCantidad(puntosYcantidades: any[], punto: number): number {
  const puntoCantidad = puntosYcantidades.find(pc => pc.punto === punto);
  return puntoCantidad ? puntoCantidad.cantidad : 0;
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