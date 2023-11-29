import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { UrlService } from './url.service';
import { cache } from 'src/app/shared/tools/rxjs-operators/cache';
import { User } from '../entities/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userId$: Observable<number>;
  myUser: User;
  isReshetUser: boolean = false;
  res: any;
  sumOf79Invoices: number = 0;
  cooperativeId: number;
  constructor(private http: HttpClient, private urlService: UrlService) {
    let url = this.urlService.getUrl('user/getUser');

    this.userId$ = this.http.get<number>(url).pipe(cache());
  }

  public getUserId(): Observable<number> {
    return this.userId$;
  }

  public isNetworkAdmin(usr: User): boolean {
    return usr?.userId.toString().substring(1, 3) === '50';
  }

  public isNetworkAdminById(usr: number): boolean {
    return usr.toString().substring(1, 3) === '50';
  }

  public async isBlockedBecauseStatus79(
    snifId: number,
    userId: number,
    cooperative: number
  ): Promise<any> {
    this.cooperativeId=cooperative
    let baseUrl = this.urlService.getUrl('invoices/isBlockedBecauseStatus79');
    this.res = await this.http
      .get<any>(`${baseUrl}/${userId}/${cooperative}/${snifId}`)
      .toPromise();
    if (this.res.length !== 0) {
      for (let i = 0; i < this.res.length; i++) {
        this.sumOf79Invoices += this.res[i].numOf79Invoices;
      }
    }
    //  alert(JSON.stringify(this.res)+"     this.res" +  this.sumOf79Invoices)
    return this.res;
  }
}
