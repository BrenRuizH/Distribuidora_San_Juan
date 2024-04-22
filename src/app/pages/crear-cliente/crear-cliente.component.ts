import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-cliente',
  templateUrl: './crear-cliente.component.html',
  styleUrls: ['./crear-cliente.component.css']
})
export class CrearClienteComponent {
  
  clientes: any = [];
  clientesForm:FormGroup;

  constructor(public clientesService: ClientesService, public router: Router, private fb: FormBuilder) {
    this.clientesForm= this.fb.group({
      codigo: ['', Validators.required],
      razonSocial: ['', Validators.required]
    })
  }

  agregarCliente() {
    if (this.clientesForm.valid) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-secondary"
        },
      });

      swalWithBootstrapButtons.fire({
        title: "¿Desea agregar el cliente?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "¡Sí, agregar!",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          let formData = new FormData();
          formData.append('codigo', this.clientesForm.get('codigo')?.value.toUpperCase());
          formData.append('razonSocial',this.clientesForm.get('razonSocial')?.value.toUpperCase());
          if(this.clientes.rfc !== undefined && this.clientes.rfc !== null) {
            formData.append('rfc',this.clientes.rfc.toUpperCase());
          }
          if (this.clientes.telefono !== undefined && this.clientes.telefono !== null) {
            formData.append('telefono', this.clientes.telefono);
          }
          if (this.clientes.pagosCon !== undefined && this.clientes.pagosCon !== null) {
            formData.append('pagosCon', this.clientes.pagosCon.toUpperCase());
          }
          if (this.clientes.pedidosA !== undefined && this.clientes.pedidosA !== null) {
            formData.append('pedidosA', this.clientes.pedidosA.toUpperCase());
          }
          if (this.clientes.recepcionDePedidos !== undefined && this.clientes.recepcionDePedidos !== null) {
            formData.append('recepcionDePedidos', this.clientes.recepcionDePedidos.toUpperCase());
          }
        
          this.clientesService.agregarCliente('agregar.php', formData).subscribe((event: any) =>{
            swalWithBootstrapButtons.fire({
              title: "¡Agregado!",
              text: "El cliente ha sido agregado exitosamente.",
              icon: "success"
            });
            if (event.status == 'success') {
              this.router.navigate(['/home/clientes']);
            }
          },
          (error) => {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Hubo un error al agregar el cliente. Inténtalo más tarde."
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