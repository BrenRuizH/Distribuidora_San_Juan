import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { HormasService } from 'src/app/services/hormas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-horma',
  templateUrl: './crear-horma.component.html',
  styleUrls: ['./crear-horma.component.css']
})
export class CrearHormaComponent implements OnInit{

  hormas: any = [];
  clientes: any[] = [];
  hormaForm:FormGroup;

  constructor(private clientesService: ClientesService, public hormasService: HormasService, public router: Router, private fb: FormBuilder) {
    this.hormaForm = this.fb.group({
      nombre: ['', Validators.required],
      cliente_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
      this.getClientes();
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
    })
  }
  
  agregarHorma() {
    if (this.hormaForm.valid) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-secondary"
        },
      });

      swalWithBootstrapButtons.fire({
        title: "¿Desea agregar la horma?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "¡Sí, agregar!",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
        
          let formData = new FormData();
          formData.append('nombre', this.hormaForm.get('nombre')?.value.toUpperCase());
          formData.append('cliente_id', this.hormaForm.get('cliente_id')?.value.toUpperCase());
          if(this.hormas.matriz !== undefined && this.hormas.matriz !== null) {
            formData.append('matriz', this.hormas.matriz.toUpperCase());
          }
          if(this.hormas.cambrillon !== undefined && this.hormas.cambrillon !== null) {
          formData.append('cambrillon', this.hormas.cambrillon.toUpperCase());
          }
          if(this.hormas.materiales !== undefined && this.hormas.materiales !== null) {
          formData.append('materiales', this.hormas.materiales.toUpperCase());
          }
          if(this.hormas.observaciones !== undefined && this.hormas.observaciones !== null) {
          formData.append('observaciones', this.hormas.observaciones.toUpperCase());
          }          

          this.hormasService.agregarHorma('agregar.php', formData).subscribe((event: any) =>{
            swalWithBootstrapButtons.fire({
              title: "¡Agregada!",
              text: "La horma ha sido agregada exitosamente.",
              icon: "success"
            });

            if (event.status == 'success') {
              this.router.navigate(['/home/hormas']);
            }
          },
          (error) => {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Hubo un error al agregar la horma. Inténtalo más tarde."
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
