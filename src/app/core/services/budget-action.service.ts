import { MetadataService} from './metadata.service';
import {BudgetAction} from './../entities/budget-action' 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { promise } from 'protractor';
import { UrlService } from './url.service';
import { UserService } from './user.service';



@Injectable({
  providedIn: 'root'
})
export class BudgetActionService {

  constructor(private http:HttpClient, private url: UrlService,
    private userService:UserService,
    //private metadataService: MetadataService
    ) { }


  public async GetDefaultBudgetAction():Promise<BudgetAction>{
    
    let userId$ =  this.userService.getUserId();

    let url = this.url.getUrl('budgetactions/getDefault');
    console.log('accessing: ' + url);

    return await this.http.get<BudgetAction>(`${url}/${userId$}`)
            .toPromise();
   }
  


   public async SaveBudgetAction(action:BudgetAction):Promise<BudgetAction>{
   
    let url = this.url.getUrl('budgetactions/');
    console.log('accessing: ' + url);

    return await this.http.post<BudgetAction>(url, action)
            .toPromise();
   }
  
 

}
