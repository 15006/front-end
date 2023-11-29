// import { Injectable } from '@angular/core';
// import { MetaDataService } from './meta-data.service';
// import { UserService } from './user.service';
// import { User } from '../model/User';
// import { HttpClient } from '@angular/common/http';
// import { promise } from 'protractor';
// import { UrlService } from './url.service';
// import { Supplier } from '../model/supplier';
// import { Cooperative } from '../model/cooperative';
// import { map, switchMap, distinctUntilChanged, withLatestFrom } from 'rxjs/operators';
// import { Observable, BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class SupplierService {

//   constructor(private http:HttpClient, private url: UrlService, private metaDataService: MetaDataService, private userService: UserService) { }

//   private _suppliers: Promise<Supplier[]> = null;

//   private async suppliers(cooperativeId: number): Promise<Supplier[]>{
//     //debugger;
//     // console.log("user service");
//     let userId = 15006;//await this.userService.getUserId();//await this.metaDataService.getUserId();  
    
//    // if (this._suppliers == null)
//    //  {
//        let url = this.url.getUrl('supplier/getSuppliers');
//       // console.log('accessing: ' + url);
//        this._suppliers = this.http
//          .get<Supplier[]>(`${url}/${userId}/${cooperativeId}`)
//          .toPromise();
//     // }
    
//      return await this._suppliers;
//    }
 
//    private async _getSuppliers(cooperativeId: number): Promise<Supplier[]> {
//     //debugger;
//      if (this._suppliers == null)
//      {
//          let sList = await this.suppliers(cooperativeId);
//          this._suppliers =  Promise.resolve (sList);
//      }
       
//      return this._suppliers;
//    }
 
//    public async getSuppliers(cooperativeId: number): Promise<Supplier[]> {
//      console.log('getSuppliers - begin ()');
//      //debugger;
//      return await this._getSuppliers(cooperativeId);
//    }

//    public getAllSuppliers(cooperative: Cooperative): Promise<Supplier[]> {
//     //debugger;

//     if(this._suppliers == null)
//     {
//       this.getSuppliers(cooperative.cooperativeId); 
//     }
   
//     return this._suppliers;
//    }


// }
