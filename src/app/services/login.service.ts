import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable, Output } from "@angular/core";
import { apiServer } from "../apiServer";
import { map, catchError } from "rxjs/operators"; // Importa catchError
import { throwError } from 'rxjs'; // Importa throwError

@Injectable({
    providedIn:"root"
})
export class LoginService{
    url = apiServer.url+"login/";
    @Output() id:EventEmitter<any> = new EventEmitter();
    constructor(private http:HttpClient){}

    userLogin( data: any){
        return this.http.post(`${this.url}login.php`,data)
        .pipe(
            map((Users:any)=>{
                console.log(Users);
                console.log(Users.id);
                    this.setToken(Users.id);
                    this.id.emit(true);
                
                return Users;
            }),
            catchError(error => {
                console.error('Hubo un error durante la petición:', error);
                return throwError(error); // Lanza el error para que pueda ser manejado por el suscriptor
            }));
    }

    setToken(token:string){
        localStorage.setItem('token',token);
        console.log(token);
    }
    
    getToken(){
        return localStorage.getItem('token');
    }

    isLoggenIn(){
        const userToken = this.getToken();
        if(userToken != null ){
            return true;
        }
        return false;
    }
}
