import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { apiServer } from "../apiServer";

@Injectable({
    providedIn: 'root'
})
export class CambrillonesService {
    url = apiServer.url+"cambrillones/";

    constructor(private http: HttpClient) {}

    agregarCambrillon(url: any, body: any): Observable<any> {
        return this.http.post(`${this.url}${url}`, body);
    }
    
    getCambrillones(url: any): Observable<any> {
        return this.http.get(`${this.url}${url}`);
    }
    
    seleccionarCambrillon(id: number) {
        return this.http.get(`${this.url}seleccion.php?id=${id}`);
    }

    eliminarCambrillon(id: number) {
        return this.http.get(`${this.url}eliminar.php?id=${id}`);
    }

    consultarCambrillon(horma_id: number): Observable<any> {
        return this.http.get(`${this.url}consulta.php?horma_id=${horma_id}`);
    }
}