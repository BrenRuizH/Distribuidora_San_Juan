import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { apiServer } from "../apiServer";

@Injectable({
    providedIn: 'root'
})
export class HormasService {
    url = apiServer.url+"hormas/";

    constructor(private http: HttpClient) {}

    agregarHorma(url: any, body: any): Observable<any> {
        return this.http.post(`${this.url}${url}`, body);
    }
    
    getHormas(url: any): Observable<any> {
        return this.http.get(`${this.url}${url}`);
    }
    
    seleccionarHorma(id: number) {
        return this.http.get(`${this.url}seleccion.php?id=${id}`);
    }

    consultarHorma(cliente_id: number): Observable<any> {
        return this.http.get(`${this.url}consulta.php?cliente_id=${cliente_id}`);
    }

    eliminarHorma(id: number) {
        return this.http.get(`${this.url}eliminar.php?id=${id}`);
    }
}