import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PagesComponent } from "./pages.component";
import { CrearUsuarioComponent } from "./crear-usuario/crear-usuario.component";
import { UsuariosComponent } from "./usuarios/usuarios.component";
import { CrearClienteComponent } from "./crear-cliente/crear-cliente.component";
import { ClientesComponent } from "./clientes/clientes.component";
import { authGuard } from "../guards/auth.guard";
import { CrearHormaComponent } from "./crear-horma/crear-horma.component";
import { HormasComponent } from "./hormas/hormas.component";
import { CrearOrdenCompraComponent } from "./crear-orden-compra/crear-orden-compra.component";
import { OrdenesCompraComponent } from "./ordenes-compra/ordenesCompra.component";
import { DetallesComponent } from "./detalles/detalles.component";
import { CrearRemisionComponent } from "./crear-remision/crear-remision.component";
import { RemisionesComponent } from "./remision/remisiones.component";

const routes: Routes = [
    {
        path: 'home', component: PagesComponent,canActivate:[authGuard],
        children: [
            { path: 'crear-usuario', component: CrearUsuarioComponent },
            { path: 'usuarios', component: UsuariosComponent },
            { path: 'crear-cliente', component: CrearClienteComponent },
            { path: 'clientes', component: ClientesComponent },
            { path: 'crear-horma', component: CrearHormaComponent },
            { path: 'hormas', component: HormasComponent },
            { path: 'crear-orden-compra', component: CrearOrdenCompraComponent },
            { path: 'ordenes-compra', component: OrdenesCompraComponent },
            { path: 'detalles/:id', component: DetallesComponent },
            { path: 'crear-remision', component: CrearRemisionComponent },
            { path: 'remisiones', component: RemisionesComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}