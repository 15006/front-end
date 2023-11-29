import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-invoice',
  templateUrl: './nav-invoice.component.html',
  styleUrls: ['./nav-invoice.component.scss']
})
export class NavInvoiceComponent implements OnInit {

  constructor(
    private router:Router) { 
  }

  ngOnInit(): void {
  }
  openInvoiceWithOrder(){
    let orderId = Number(102093);
    //this.router.navigate([`/invoices/edit/${null}/${orderId}`]);
    this.router.navigate([`/invoices/edit/${null}?${orderId}`]);
  }
  openInvoiceWithOutOrder(){
    
    let orderId = Number(102093);
    this.router.navigate([`/invoices/edit`]);
  }
  openInvoiceForUpdate(){
    
    let invoiceId = Number(401007);
    this.router.navigate([`/invoices/edit/${invoiceId}`]);
  }

  openInvoiceNewAction(){
    let invoiceId = Number(401007);
    let orderId = Number(102093);
    this.router.navigate([`/invoices/edit/${invoiceId}/${orderId}`]);
    //this.router.navigate([`/invoices/edit/${invoiceId}?orderId=${orderId}`]);
  }

}
