import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements 
  CanDeactivate<any> {
    canDeactivate(component: any): boolean {
     
      if(!component.canDeactivate()){
          if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
              return true;
          } else {
              return false;
          }
      }
      return true;
    }
  }
