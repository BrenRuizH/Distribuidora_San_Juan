import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ClientesService } from 'src/app/services/clientes.service';
import { OrdenesCompraService } from 'src/app/services/ordenesCompra.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ordenesCompra',
  templateUrl: './ordenesCompra.component.html',
  styleUrls: ['./ordenesCompra.component.css']
})
export class OrdenesCompraComponent {
  ordenesCompra: any = [];
  ordenCompra: any = {cliente_id: ''};
  clientes: any[] = [];

  p: number = 1;

  constructor(private clientesService: ClientesService, private ordenCompraService: OrdenesCompraService, private router: Router, private changeDetector: ChangeDetectorRef) {
    this.obtenerOrdenesCompra();
  }

  ngOnInit(): void {
    this.getClientes();
    this.obtenerOrdenesCompra();
  }

  getClientes() {
    this.clientesService.getClientes('leer.php').subscribe((data) => {
      this.clientes = data.items;
    })
  }

  obtenerOrdenesCompra() {
    this.ordenCompraService.getOrdenesCompra('leer.php').subscribe((data) => {
      this.ordenesCompra = data.items;
    })
  }

  buscarOrdenesCompra() {
    if (!this.ordenCompra.cliente_id) {
      this.obtenerOrdenesCompra();
    } else {
      this.ordenCompraService.getOrdenesCompra('buscar.php?id=' + this.ordenCompra.cliente_id).pipe(catchError(error => {
        if(error.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se encontraron órdenes de compra."
          });
        }
        return of([]);
      })
    ).subscribe((data) => {
        this.ordenesCompra = data.items;
        console.log(this.ordenesCompra);
        this.changeDetector.detectChanges();
      });
    }
  }

  verDetalles(ordenId: any) {
    this.router.navigate(['/home/detalles', ordenId]);
  }
}
