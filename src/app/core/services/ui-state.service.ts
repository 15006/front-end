import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private _isSidebarOpen: boolean = false;
  private _isSidebarOpen$ = new BehaviorSubject<boolean>(this._isSidebarOpen);

  get isSidebarOpen() {return this._isSidebarOpen$.asObservable();}


  openSidebar() {
    this._isSidebarOpen = true;
    this._isSidebarOpen$.next(this._isSidebarOpen);
  }

  closeSidebar() {
    this._isSidebarOpen = false;
    this._isSidebarOpen$.next(this._isSidebarOpen);
  }

  toggleSidebar() {
    this._isSidebarOpen = !this._isSidebarOpen;
    this._isSidebarOpen$.next(this._isSidebarOpen);
  }

  constructor() { }
}
