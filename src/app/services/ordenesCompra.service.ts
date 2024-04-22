import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { apiServer } from "../apiServer";

@Injectable({
    providedIn: 'root'
})
export class OrdenesCompraService {
    url = apiServer.url+"ordenes_compra/";
    constructor(private http: HttpClient) {}

    agregarOrdenCompra(url: any, body: any): Observable<any> {
        return this.http.post(`${this.url}${url}`, body);
    }
    
    getOrdenesCompra(url: any): Observable<any> {
        return this.http.get(`${this.url}${url}`);
    }
    
    seleccionarOrdenCompra(id: number) {
        return this.http.get(`${this.url}seleccion.php?id=${id}`);
    }

    detallesOrdenCompra(orden_id: any) {
        return this.http.get(`${this.url}leer_detalles.php?orden_id=${orden_id}`);
    }

    consultarOrden(cliente_id: number): Observable<any> {
        return this.http.get(`${this.url}consulta.php?cliente_id=${cliente_id}`);
    }
    
    eliminarOrdenCompra(id: number) {
        return this.http.get(`${this.url}cancelar.php?id=${id}`);
    }
}