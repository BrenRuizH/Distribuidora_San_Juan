import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { LoginComponent } from './login/login.component';
import { CrearUsuarioComponent } from './crear-usuario/crear-usuario.component';
import { CrearClienteComponent } from './crear-cliente/crear-cliente.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ClientesComponent } from './clientes/clientes.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HormasComponent } from './hormas/hormas.component';
import { CrearHormaComponent } from './crear-horma/crear-horma.component';
import { CrearOrdenCompraComponent } from './crear-orden-compra/crear-orden-compra.component';
import { OrdenesCompraComponent } from './ordenes-compra/ordenesCompra.component';
import { DetallesComponent } from './detalles/detalles.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CrearRemisionComponent } from './crear-remision/crear-remision.component';
import { RemisionesComponent } from './remision/remisiones.component';

@NgModule({
  declarations: [
    PagesComponent,
    LoginComponent,
    CrearUsuarioComponent,
    CrearClienteComponent,
    CrearHormaComponent,
    CrearOrdenCompraComponent,
    CrearRemisionComponent,
    UsuariosComponent,
    ClientesComponent,
    HormasComponent,    
    OrdenesCompraComponent,
    DetallesComponent,
    RemisionesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl:'never'})
  ]
})
export class PagesModule { }
