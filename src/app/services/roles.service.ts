import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { apiServer } from "../apiServer";

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    url = apiServer.url+"roles/";

    constructor(private http: HttpClient) {}

    getRoles(url: any): Observable<any> {
        return this.http.get(`${this.url}${url}`);
    }
}