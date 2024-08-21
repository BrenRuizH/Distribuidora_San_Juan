import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { RolesService } from 'src/app/services/roles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: any = [];
  usuario: any = {};
  roles: any[] = [];

  p: number = 1;

  constructor(private rolesService: RolesService, public router: Router, private usuarioService: UsuariosService) {
    this.obtenerUsuarios();
  }

  ngOnInit(): void {
    this.getRoles();
    this.obtenerUsuarios();
  }

  getRoles() {
    this.rolesService.getRoles('leer.php').subscribe((data) => {
      this.roles = data.items;
    });
  }

  obtenerUsuarios() {
    this.usuarioService.getUsuarios('leer.php').subscribe((data) => {
      this.usuarios = data.items;
    })
  }

  seleccionarUsuario(id:any) {
    this.usuarioService.seleccionarUsuario(id).subscribe((resp: any) => {
      this.usuario = resp.items[0];
    })
  }

  editarUsuario() {
    if (this.usuario.nombre && this.usuario.contrasenia && this.usuario.rol_id) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-warning",
          cancelButton: "btn btn-secondary"
        },
      });

      swalWithBootstrapButtons.fire({
        title: "¿Desea editar el usuario?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "¡Sí, editar!",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          
          let formData = new FormData();
          formData.append('nombre', this.usuario.nombre.toUpperCase());
          formData.append('contrasenia', this.usuario.contrasenia);
          formData.append('rol_id', this.usuario.rol_id.toUpperCase());
          formData.append('id', this.usuario.id);
  
          this.usuarioService.agregarUsuario('editar.php', formData).subscribe((event: any) =>{
            swalWithBootstrapButtons.fire({
              title: "¡Editado!",
              text: "El usuario ha sido editado exitosamente.",
              icon: "success"
            });
            if (event.status == 'success') {
              this.obtenerUsuarios();
            }
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

  eliminarUsuario(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary"
      },
    });

    swalWithBootstrapButtons.fire({
      title: "¿Desea eliminar el usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {

        swalWithBootstrapButtons.fire({
          title: "¡Eliminado!",
          text: "El usuario ha sido eliminado exitosamente.",
          icon: "success"
        });

        this.usuarioService.eliminarUsuario(id).subscribe((resp: any) => {
          if(resp['resultado'] == 'OK') {
            this.obtenerUsuarios();
          }
        });
      }
    });
  }
}
