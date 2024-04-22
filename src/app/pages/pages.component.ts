import { Component } from '@angular/core';
import { UsuariosService } from '../services/usuarios.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent {
  constructor(public usuariosService: UsuariosService, public router: Router) {}

  logout() {
    this.usuariosService.logout();
    this.router.navigateByUrl('/login');
  }
}
