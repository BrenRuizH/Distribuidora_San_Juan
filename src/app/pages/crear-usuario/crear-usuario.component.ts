import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from 'src/app/services/roles.service';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent implements OnInit{

  usuarios: any = [];
  roles: any[] = [];
  usuarioForm: FormGroup;

  constructor(private rolesService: RolesService, public usuariosService: UsuariosService, public router: Router, private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasenia: ['', Validators.required],
      rol_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
      this.getRoles();
  }

  getRoles() {
    this.rolesService.getRoles('leer.php').subscribe((data) => {
      this.roles = data.items;
    })
  }

  agregarUsuario() {
    if (this.usuarioForm.valid) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-secondary"
        },
      });

      swalWithBootstrapButtons.fire({
        title: "¿Desea agregar el usuario?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "¡Sí, agregar!",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          let formData = new FormData();
          formData.append('nombre', this.usuarioForm.get('usuario')?.value.toUpperCase());
          formData.append('contrasenia', this.usuarioForm.get('contrasenia')?.value);
          formData.append('rol_id', this.usuarioForm.get('rol_id')?.value.toUpperCase());

          this.usuariosService.agregarUsuario('agregar.php', formData).subscribe((event: any) =>{
            swalWithBootstrapButtons.fire({
              title: "¡Agregado!",
              text: "El usuario ha sido agregado exitosamente.",
              icon: "success"
            });
            if (event.status == 'success') {
              this.router.navigate(['/home/usuarios']);
            }
          },
          (error) => {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Hubo un error al agregar el usuario. Inténtalo más tarde."
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
