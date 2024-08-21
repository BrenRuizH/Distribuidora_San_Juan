import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
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

  puntosYcantidades: any[][] = [];

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
  subTotal : number = 0;
  selectedFolios: any[] = [];
  //selectedFolios: { folio: string, oc: string, precio_actual: string, precio_anterior: string, usarPrecioAnterior: boolean, precio_seleccionado: string }[] = [];
  
  noFolios: boolean = false;
  remisionForm:FormGroup;

  precioUni: number = 0;
  totalParesSum: any;
  formattedPrecioSum: any;
  
  constructor(private clientesService: ClientesService, public remisionesService: RemisionesService, 
      private hormasService: HormasService, public router: Router, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
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
                .map(item => ({ vista: item.vista, punto: item.punto, cantidad: item.cantidad }))
        );

        const tieneCantidadValida = puntosYCantidadesFiltrados.length > 0;

        if (tieneCantidadValida) {
            const hormaId = this.horma.id;
            const hormaNombre = this.horma.nombre;
            const oc = this.remisionForm.get('oc')?.value.toUpperCase();
            const precio_unitario = Number(this.horma.precio.toString().replace(',', '.'));
            const totalPares = Number(this.total);
            const precio = totalPares * precio_unitario;

            console.log("Total pares:", totalPares); // Debería ser 1
            console.log("Precio unitario:", precio_unitario); // Debería ser 5.3
            console.log("Precio calculado:", precio); 


            let hormaExistente = this.elementosAgregados.find((h: { horma_id: any; }) => h.horma_id === hormaId);

            if (hormaExistente) {
                hormaExistente.totalPares += totalPares;
                hormaExistente.precio += Number(precio);
                hormaExistente.oc = oc;
                hormaExistente.precio_unitario = precio_unitario;

                puntosYCantidadesFiltrados.forEach((nuevoPunto: { punto: number; cantidad: number; }) => {
                    let puntoExistente = hormaExistente.puntosYcantidades.find((p: { punto: number; }) => p.punto === nuevoPunto.punto);
                    if (puntoExistente) {
                        puntoExistente.cantidad += nuevoPunto.cantidad;
                    } else {
                        hormaExistente.puntosYcantidades.push(nuevoPunto);
                    }
                });
            } else {
                const elementos = {
                    horma_id: hormaId,
                    horma: hormaNombre,
                    oc: oc,
                    puntosYcantidades: puntosYCantidadesFiltrados,
                    totalPares: totalPares.toLocaleString(),
                    precio: precio.toFixed(2), // Usa toFixed para asegurar que tenga 2 decimales
                    precio_unitario: precio_unitario // Agregando el precio actual
                };
                this.elementosAgregados.push(elementos);
            }

            console.log(this.elementosAgregados);
            this.calcularSumatoria();

            this.remisionForm.get('oc')?.reset();
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

    let opcionesHormas = '';
    this.hormas.forEach(horma => {
        opcionesHormas += `<option value="${horma.id}" ${horma.id === elemento.horma_id ? 'selected' : ''}>${horma.nombre}</option>`;
    });

    let puntosTableHtml = '';
    let puntoInicio = 15;
    while (puntoInicio <= 32.5) {
        puntosTableHtml += `
            <tr>
                <td>${puntoInicio}</td>
                <td><input type="number" class="form-control" id="punto_${puntoInicio}" value="${this.getPuntoCantidad(elemento.puntosYcantidades, puntoInicio)}" /></td>
            </tr>
        `;
        puntoInicio += 0.5;

        if (puntoInicio <= 32.5) {
            puntosTableHtml += `
                <tr>
                    <td>1/2</td>
                    <td><input type="number" class="form-control" id="punto_1/2_${puntoInicio}" value="${this.getPuntoCantidad(elemento.puntosYcantidades, puntoInicio)}" /></td>
                </tr>
            `;
            puntoInicio += 0.5;
        }

        if ((puntoInicio - 15) % 3 === 0 && puntoInicio <= 32.5) {
            puntosTableHtml += `<tr><td colspan="2"><hr></td></tr>`;
        }
    }

    Swal.fire({
        title: 'Editar Elemento',
        html: `
            <form>
                <div class="form-group mb-3">
                    <label for="horma_id" class="form-label">Horma</label>
                    <select class="form-select" id="horma_id" formControlName="horma_id">
                        ${opcionesHormas}
                    </select>
                </div>
                <div class="form-group mb-3">
                    <label for="oc" class="form-label">Orden de Compra</label>
                    <input type="text" class="form-control" id="oc" formControlName="oc" value="${elemento.oc}">
                </div>
            </form>
            <hr>
            <h5 class="mt-4">Tabla de Puntos</h5>
            <div style="overflow-x: auto;">
                <table class="table table-bordered table-striped mt-2">
                    <thead class="table-dark">
                        <tr>
                            <th>Punto</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${puntosTableHtml}
                    </tbody>
                </table>
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#FFA500',
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const hormaId = (document.getElementById('horma_id') as HTMLSelectElement).value;
            const oc = (document.getElementById('oc') as HTMLInputElement).value.toUpperCase();
            const puntosYcantidadesActualizados = this.obtenerPuntosYCantidadesActualizados();

            return { hormaId, oc, puntosYcantidadesActualizados };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { hormaId, oc, puntosYcantidadesActualizados } = result.value;

            this.actualizarElemento(index, hormaId, oc, puntosYcantidadesActualizados);
        }
    });
}

actualizarElemento(index: number, hormaId: string, oc: string, puntosYcantidadesActualizados: any[]): void {
  let totalPares = 0;
  puntosYcantidadesActualizados.forEach(item => {
      totalPares += item.cantidad;
  });

  const precio = (totalPares * this.hormas.find(horma => horma.id === hormaId)?.precio || 0).toLocaleString();

  this.elementosAgregados[index] = {
      horma_id: hormaId,
      horma: this.hormas.find(horma => horma.id === hormaId)?.nombre || '',
      oc: oc,
      puntosYcantidades: puntosYcantidadesActualizados,
      totalPares: totalPares.toLocaleString(),
      precio: precio
  };

  Swal.fire('Actualizado', 'El elemento ha sido actualizado correctamente.', 'success');

  this.calcularSumatoria();

  this.remisionForm.get('horma_id')?.reset();
  this.resetearPuntosYCantidades();
}

obtenerPuntosYCantidadesActualizados(): any[] {
  const puntosYCantidadesActualizados = [];

  let puntoInicio = 15;
  while (puntoInicio <= 32.5) {
      const inputPunto = document.getElementById(`punto_${puntoInicio}`) as HTMLInputElement;
      if (inputPunto) {
          const cantidad = parseFloat(inputPunto.value);
          if (!isNaN(cantidad) && cantidad !== 0) {
              puntosYCantidadesActualizados.push({ vista: '', punto: puntoInicio, cantidad: cantidad });
          }
      }

      puntoInicio += 0.5;

      if (puntoInicio <= 32.5) {
          const inputPuntoMedio = document.getElementById(`punto_1/2_${puntoInicio}`) as HTMLInputElement;
          if (inputPuntoMedio) {
              const cantidadMedio = parseFloat(inputPuntoMedio.value);
              if (!isNaN(cantidadMedio) && cantidadMedio !== 0) {
                  puntosYCantidadesActualizados.push({ vista: '1/2', punto: puntoInicio, cantidad: cantidadMedio });
              }
          }
          puntoInicio += 0.5;
      }
  }
  return puntosYCantidadesActualizados;
}

calcularTotalParesA(puntosYCantidades: any[]): string {
  let totalPares = 0;
  puntosYCantidades.forEach(item => {
    totalPares += item.cantidad;
  });
  return totalPares.toLocaleString();
}

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
            precio: folio.precio,
            precio_actual: folio.precio_actual,
            precio_anterior: folio.precio_anterior,
            usarPrecioAnterior: false, // Predeterminado a false para usar precio_actual
            precio_seleccionado: folio.precio_actual // Inicia con precio_actual
        }));
        
        console.log('Folios: ', this.folios);
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

toggleSelection(datos: any): void {
  const index = this.selectedFolios.findIndex(f => f.folio === datos.folio);
  if (index > -1) {
      // Si el folio ya está en selectedFolios, simplemente lo eliminamos
      this.selectedFolios.splice(index, 1);
  } else {
      // Si no está, lo agregamos con todos los datos necesarios
      this.selectedFolios.push({
          folio: datos.folio,
          oc: datos.oc,
          precio_actual: datos.precio_actual,
          precio_anterior: datos.precio_anterior,
          usarPrecioAnterior: false, // Inicializamos en false para usar el precio actual
          precio_seleccionado: datos.precio_actual // Inicializamos con el precio actual
      });
  }
  console.log('Selected Folios:', this.selectedFolios);
  this.calcularSumatoria();
}

actualizarPrecioSeleccionado(folio: any) {
  folio.precio_seleccionado = folio.usarPrecioAnterior ? folio.precio_anterior : folio.precio_actual;
  this.cdr.detectChanges();  // Forzar la detección de cambios
  console.log('Precio Seleccionado:', folio.precio_seleccionado);
  console.log('Precion anterior: ', folio.usarPrecioAnterior);
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
        const totalPares = parseInt(selectedFolio?.total_pares || '0', 10);
  
        // Multiplicamos el precio por el total de pares
        const precioUnitario = parseFloat(folioObj.usarPrecioAnterior ? selectedFolio?.precio_anterior : selectedFolio?.precio_actual || '0');
        const precioTotalPorFolio = precioUnitario * totalPares;
  
        return sum + precioTotalPorFolio;
      }, 0);
  
      this.formattedPrecioSum = precioSum.toFixed(2);
    } else {
      this.totalParesSum = this.elementosAgregados.reduce((sum, elem) => {
        const totalParesSinComas = elem.totalPares.replace(/,/g, '');
        const totalPares = parseInt(totalParesSinComas, 10);
        return sum + totalPares;
    }, 0);
    this.formattedPrecioSum = this.elementosAgregados.reduce((sum, elem) => {
      const precio = parseFloat(elem.precio.toString().replace(',', '.')); 
      return sum + precio;
  }, 0).toFixed(2);
  
  
    console.log(this.elementosAgregados);

    }
    this.subTotal = this.formattedPrecioSum;
    console.log("Precio final: ", this.formattedPrecioSum);
    console.log("Total pares: ", this.totalParesSum);
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

            this.calcularSumatoria();
          
            let formData = new FormData();
            formData.append('fecha', this.fechaRemision);
            formData.append('cliente_id', this.remisionForm.get('cliente_id')?.value.toUpperCase());
            formData.append('total_pares', this.totalParesSum);
            formData.append('precio_final', this.formattedPrecioSum);
            const foliosWithPrecio = this.selectedFolios.map(folio => ({
              ...folio,
              precio_unitario: folio.precio_seleccionado // Agregando el precio seleccionado
            }));
    
            formData.append('folios', JSON.stringify(foliosWithPrecio));

            if (this.remisionForm.get('cantidad')?.value && this.remisionForm.get('descripcion')?.value) {
              formData.append('extra', this.remisionForm.get('cantidad')?.value);
              formData.append('descripcion', this.remisionForm.get('descripcion')?.value.toUpperCase());
            } else if (this.remisionForm.get('cantidad')?.value || this.remisionForm.get('descripcion')?.value) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Debe completar ambos campos para agregar un extra.",
              });
              return;
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
      } else if (this.fechaRemision && this.remisionForm.get('cliente_id')?.value && this.remisionForm.get('cliente_id')?.value == 36 && this.elementosAgregados && this.elementosAgregados.length > 0) {
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

            if (this.remisionForm.get('cantidad')?.value && this.remisionForm.get('descripcion')?.value) {
              formData.append('extra', this.remisionForm.get('cantidad')?.value);
              formData.append('descripcion', this.remisionForm.get('descripcion')?.value.toUpperCase());
            } else if (this.remisionForm.get('cantidad')?.value || this.remisionForm.get('descripcion')?.value) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Debe completar ambos campos para agregar un extra.",
              });
              return;
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