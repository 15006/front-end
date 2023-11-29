import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor() { }

  getUrl(target: string) {
    return `${environment.baseUrl}/${target}`;
  }

}
