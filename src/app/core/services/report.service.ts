import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UrlService } from './url.service';
import { BudgetControlReport, Balance, Branch } from '../entities/report/budget-control-report';
import { Order, OrderSearchForm, OrderToPrint, OrderVm } from '../entities/order';
import { Observable, of } from 'rxjs';
import { UserService } from './user.service';
import { MetadataService } from './metadata.service';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { User } from '../entities/user';
import { Cooperative } from '../entities/cooperative';
import { SchoolYear } from '../entities/school-year';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  
  private user$: Observable<User>;
  private userId$: Observable<number>;
  private cooperativeId$: Observable<number>;
  private schoolYear$: Observable<SchoolYear>;

  constructor(private http: HttpClient, private url: UrlService,
    private userService:UserService,
    private metaDataService:MetadataService) { 
    }

  public async GetBudgetControlReport(): Promise<Branch[]> {
    let snifId;
    this.user$ =  this.metaDataService.getUser();
    let user = await this.user$.pipe(first()).toPromise();
    if (!user.isAllowAllBranches){
      snifId = user.branchId;
    } else {
      snifId = -1; 
    }
    let quarter = 2;//0,1,2,3
    let flex = 1;
    let fromInvoiceActionStatusId = 10;
    let toInvoiceActionStatusId = 90;
    
    this.schoolYear$ = this.metaDataService.getCurrentSchoolYear();
    let schoolYearId = (await this.schoolYear$.pipe(first()).toPromise()).schoolYearId;

    this.cooperativeId$ = this.metaDataService.getCooperativeId();
    let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
    
    this.userId$ = this.userService.getUserId();

    let baseUrl = this.url.getUrl('reports/getBudgetControlReports');

    try {

     let url$ = this.userId$.pipe(
       map(userId => `${baseUrl}/${snifId}/${quarter}/${flex}/${fromInvoiceActionStatusId}/${toInvoiceActionStatusId}/${schoolYearId}/${userId}/${cooperativeId}`));
   
      let reportData = await url$.pipe(
        switchMap(url => this.http.get<BudgetControlReport[]>(url))
      ).toPromise();

      //let reportData = await this.http.get<BudgetControlReport[]>(`${base}/${snifId}/${quarter}/${flex}/${fromInvoiceActionStatusId}/${toInvoiceActionStatusId}/${schoolYearId}/${userId}/${cooperativeId}`)
      //  .toPromise();
      console.log('reportData');
      console.log(reportData);

      let _branch$ = this.createReportHierarchy(reportData);
        
      return _branch$.toPromise();

    }
    catch (ex) {
      console.log('בעיה בשליחה לאמיתי');
      console.log(ex);
    }


  }

  private createReportHierarchy(data: BudgetControlReport[]): Observable<Branch[]> {
    
    let groupedData: Branch[] = data
    .groupBy(item => item.branchName)
      .map(group => ({
        branchName: group.key, 
        month1: group.items.sum(item => item.month1), 
        month2: group.items.sum(item => item.month2), 
        month3: group.items.sum(item => item.month3), 
        oderBalance: group.items.sum(item => item.oderBalance), 
        //orderBalance: group.items.sum(item => item.orderBalance ), 
        previouslyBalance: group.items.sum(item => item.previouslyBalance), 
        quarterBudget: group.items.sum(item => item.quarterBudget), 
        reportStartDate: group.items[0] ? group.items[0].reportStartDate : null, 
        reportEndDate: group.items[0] ? group.items[0].reportEndDate : null, 
        schoolYearName: group.items[0] ? group.items[0].schoolYearName: null, 
        
        balances: group.items
              .groupBy(item => item.balanceId)
              .map(group2 => ({
                  balanceId: group2.key, 
                  budgetControlReports: group2.items, 
                  balanceName: group2.items[0] ? group2.items[0].balanceName : null, 
                  month1: group2.items.sum(item => item.month1), 
                  month2: group2.items.sum(item => item.month2), 
                  month3: group2.items.sum(item => item.month3), 
                  oderBalance: group2.items.sum(item => item.oderBalance),
                  //orderBalance: group2.items.sum(item => item.orderBalance ),  
                  previouslyBalance: group2.items.sum(item => item.previouslyBalance), 
                  quarterBudget: group2.items.sum(item => item.quarterBudget)
                }))
      }));
      
    return of(groupedData);
  }
}