import { Injectable } from "@angular/core";
import { apiServer } from "../apiServer";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class RemisionesService {
    url = apiServer.url+"remisiones/";

    constructor(private http: HttpClient) {}

    agregarRemision(url: any, body: any): Observable<any> {
        return this.http.post(`${this.url}${url}`, body);
    }

    consultarFolio(cliente_id: number): Observable<any> {
        return this.http.get(`${this.url}consulta.php?cliente_id=${cliente_id}`);
    }
    consultarFolioEditar(cliente_id: number, remision_id: number): Observable<any> {
        return this.http.get(`${this.url}consultaEditar.php?cliente_id=${cliente_id}&remision_id=${remision_id}`);
    }

    getRemisiones(url: any): Observable<any> {
        return this.http.get(`${this.url}${url}`);
    }

    seleccionarRemision(id: number) {
        return this.http.get(`${this.url}seleccion.php?remision_id=${id}`);
    }

    eliminarRemision(id: number) {
        return this.http.get(`${this.url}eliminar.php?id=${id}`);
    }

    imprimirRemision(id: number) {
        return this.http.get(`${this.url}imprimir.php?remision_id=${id}`);
    }
}