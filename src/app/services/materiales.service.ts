import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { apiServer } from "../apiServer";

@Injectable({
    providedIn: 'root'
})
export class MaterialesService {
    url = apiServer.url+"materiales/";

    constructor(private http: HttpClient) {}

    agregarMaterial(url: any, body: any): Observable<any> {
        return this.http.post(`${this.url}${url}`, body);
    }
    
    getMateriales(url: any): Observable<any> {
        return this.http.get(`${this.url}${url}`);
    }
    
    seleccionarMaterial(id: number) {
        return this.http.get(`${this.url}seleccion.php?id=${id}`);
    }
    
    eliminarMaterial(id: number) {
        return this.http.get(`${this.url}eliminar.php?id=${id}`);
    }

    consultarMaterial(horma_id: number): Observable<any> {
        return this.http.get(`${this.url}consulta.php?horma_id=${horma_id}`);
    }
}