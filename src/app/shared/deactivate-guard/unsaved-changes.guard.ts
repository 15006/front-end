import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, map } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    // Check if the component has an implementation of the canDeactivate method
    if (component.canDeactivate) {
      // Call the component's canDeactivate method to check if there are any unsaved changes
      const canDeactivateResult = component.canDeactivate();
      if (canDeactivateResult instanceof Observable) {
        return canDeactivateResult.pipe(
          map(result => {
            if (!result) {
              // Display a confirmation dialog to the user
              return window.confirm('יש לך שינויים שלא שמרת , האם אתה בטוח שהינך רוצה לצאת?');
            }
            return true;
          })
        );
      } else if (canDeactivateResult instanceof Promise) {
        return canDeactivateResult.then(result => {
          if (!result) {
            // Display a confirmation dialog to the user
            return window.confirm('יש לך שינויים שלא שמרת , האם אתה בטוח שהינך רוצה לצאת?');
          }
          return true;
        });
      } else {
        if (!canDeactivateResult) {
          // Display a confirmation dialog to the user
          return window.confirm('יש לך שינויים שלא שמרת , האם אתה בטוח שהינך רוצה לצאת?');
        }
        return true;
      }
    } else {
      // If the component does not have an implementation of the canDeactivate method, allow the navigation to proceed
      return true;
    }
  }
}
