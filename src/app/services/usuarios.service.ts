import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { apiServer } from "../apiServer";

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    url = apiServer.url+"usuarios/";

    public menu: any = [
        {
            title: 'Usuarios',
            icon: 'mdi mdi-account',
            submenu: [
                { title: 'Crear Usuario', url: 'crear-usuario' },
                { title: 'Datos Usuarios', url: 'usuarios' }
            ]
        },
        {
            title: 'Clientes',
            icon: 'mdi mdi-account-multiple',
            submenu: [
                { title: 'Crear Cliente', url: 'crear-cliente' },
                { title: 'Datos Clientes', url: 'clientes' }
            ]
        },
        {
            title: 'Hormas',
            icon: 'mdi mdi-gnome',
            submenu: [
                { title: 'Crear Horma', url: 'crear-horma' },
                { title: 'Datos Hormas', url: 'hormas' }
            ]
        },
        {
            title: 'Órdenes de Compra',
            icon: 'mdi mdi-clipboard-outline',
            submenu: [
                { title: 'Crear Orden Compra', url: 'crear-orden-compra' },
                { title: 'Datos Órdenes de Compra', url: 'ordenes-compra' }
            ]
        },
        {
            title: 'Remisiones',
            icon: 'mdi mdi-receipt',
            submenu: [
                { title: 'Crear Remisión', url: 'crear-remision' },
                { title: 'Datos Remsiones', url: 'remisiones' }
            ]
        }
    ]

    constructor(private http: HttpClient) {}

    agregarUsuario(url: any, body: any): Observable<any> {
        return this.http.post(`${this.url}${url}`, body);
    }
    
    getUsuarios(url: any): Observable<any> {
        return this.http.get(`${this.url}${url}`);
    }
    
    seleccionarUsuario(id: number) {
        return this.http.get(`${this.url}seleccion.php?id=${id}`);
    }
    
    eliminarUsuario(id: number) {
        return this.http.get(`${this.url}eliminar.php?id=${id}`);
    }

    logout(){
     localStorage.removeItem('token');
     localStorage.removeItem('nombre');
    }
}