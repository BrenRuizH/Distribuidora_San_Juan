import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { apiServer } from "../apiServer";

@Injectable({
    providedIn: 'root'
})
export class ClientesService {
    url = apiServer.url+"clientes/";

   

    constructor(private http: HttpClient) {}

    agregarCliente(url: any, body: any): Observable<any> {
        return this.http.post(`${this.url}${url}`, body);
    }
    
    getClientes(url: any): Observable<any> {
        return this.http.get(`${this.url}${url}`);
    }
    
    seleccionarCliente(id: number) {
        return this.http.get(`${this.url}seleccion.php?id=${id}`);
    }
    
    eliminarCliente(id: number) {
        return this.http.get(`${this.url}eliminar.php?id=${id}`);
    }
}