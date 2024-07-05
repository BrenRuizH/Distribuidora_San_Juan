import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { RemisionesService } from 'src/app/services/remisiones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-remision',
  templateUrl: './crear-remision.component.html',
  styleUrls: ['./crear-remision.component.css']
})
export class CrearRemisionComponent {

  fechaRemision: string = '';

  clientes: any[] = [];
  folios: any[] = [];
  cliente_id: number | null = null;
  selectedFolios: string[] = [];
  noFolios: boolean = false;
  remisionForm:FormGroup;

  totalParesSum: any;
  formattedPrecioSum: any;

  selectedFoliosByCliente: Record<number, string[]> = {};

  constructor(private clientesService: ClientesService, public remisionesService: RemisionesService, public router: Router, private fb: FormBuilder) {
    this.remisionForm = this.fb.group({
      fechaRemision:  ['', Validators.required],
      cliente_id: ['', Validators.required],
      folios: ['', Validators.required],
    });
  }

  ngOnInit(): void {
      this.getClientes();
      this.fechaRemision = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
    })
  }

  getFolios(cliente_id: any) {
    this.cliente_id = cliente_id;
    this.selectedFolios = [];
    this.remisionesService.consultarFolio(cliente_id).subscribe((data) => {
      this.folios = data.items.map((folio: any) => ({
        folio: folio.folio,
        total_pares: folio.total_pares,
        precio: folio.precio
      }));
      console.log(this.folios);
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
    return !!this.remisionForm.get('cliente_id')?.value;
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

    agregarRemision() {
      if (this.fechaRemision && this.remisionForm.get('cliente_id')?.value && this.selectedFolios.join(',')) {
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
            formData.append('folio', this.selectedFolios.join(','));
            

            console.log(formData);

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