import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formSubmitted : boolean = false;

 public loginForm: any = this.fb.group({
  nombre:['',[Validators.required]],
  contrasenia:['',[Validators.required,Validators.minLength(3)]]
})


constructor(private fb: FormBuilder, private loginService:LoginService, private router:Router){}

iniciar_sesion(){
  this.formSubmitted = true;
  if(this.loginForm.invalid){
    return;
  }

  this.loginService.userLogin(this.loginForm.value)
    .subscribe(data =>{
      if(this.loginForm.value){
      localStorage.setItem('nombre',this.loginForm.get('nombre').value.toUpperCase());
      this.router.navigateByUrl('/home/clientes').then(() => {
        window.location.reload();
      });
      }else{
      localStorage.removeItem('nombre');
      }
   }, err => {
    Swal.fire({
      title:"Error",
      text:"Datos Incorrectos",
      timer: 2000
    })
    localStorage.removeItem('nombre');
   })
  }
  campovalido(campo : any){
    if(this.loginForm.get(campo).invalid && this.formSubmitted){
      return true;
    }else{
      return false;
    }
  }
}
