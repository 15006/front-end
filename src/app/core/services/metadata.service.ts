import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { cache } from 'src/app/shared/tools/rxjs-operators/cache';
import { Branch } from '../entities/branch';
import { Budget } from '../entities/budget';
import { InvoiceActionStatus } from '../entities/invoice';
import { OrderStatus } from '../entities/order-status';
import { Project } from '../entities/project';
import { Quarter } from '../entities/quarter';
import { SchoolYear } from '../entities/school-year';
import { Supplier } from '../entities/supplier';
import { User } from '../entities/user';
import { ZnCtrMetaData } from '../entities/zn-ctr-metadata';
import { UrlService } from './url.service';
import { UserService } from './user.service';
import { Cooperative } from '../entities/Cooperative';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private allMetadatas$: Observable<ZnCtrMetaData[]>;
  private metadataThatContainsCurrentCooperative: Observable<ZnCtrMetaData>;
  private userSelectedCooperativeId$ = new BehaviorSubject<number>(-1);
  isReshetUser: boolean
  addActionFlag: boolean=false;

  constructor(
    private http: HttpClient,
    private urlService: UrlService,
    private userService: UserService,
  ) {
    let baseUrl = this.urlService.getUrl('meta');
    let url$ = this.userService.getUserId().pipe(map(userId => `${baseUrl}/${userId}`));

    this.allMetadatas$ = url$.pipe(
      distinctUntilChanged(),
      switchMap(url => this.http.get<ZnCtrMetaData[]>(url)),
      cache()
    );

    this.metadataThatContainsCurrentCooperative = combineLatest([this.getCooperative(), this.allMetadatas$]).pipe(
      map(([coop, allmeta]) => allmeta.find(meta => meta.dataBaseId === coop.dbKey))
    );
  }


  async setCooperativeId(id: number): Promise<void> {
    this.userSelectedCooperativeId$.next(id);
  }

  getCooperativeId(): Observable<number> {

    return combineLatest([this.allMetadatas$, this.userSelectedCooperativeId$]).pipe(
      map(([allmetas, userCoopId]) => {
        if (userCoopId > -1) return userCoopId;
        if (allmetas) return allmetas[0].cooperatives[0].cooperativeId;
        return -1;
      })
    )
  }

  fixDisplayPhoneNumber(phoneNumber: any) {
    let finalNumbers: any;

    if (phoneNumber === '') {
      finalNumbers = '- - - - - -'
      return finalNumbers;
    }
    else {
      phoneNumber = phoneNumber.split('    ')
      finalNumbers = phoneNumber[0] + '-' + phoneNumber[1]
      return finalNumbers;
    }
  }

  getAllMetadata(): Observable<ZnCtrMetaData[]> {
    return this.allMetadatas$;
  }

  getCooperative(): Observable<Cooperative> {

    return combineLatest([this.getAllCooperatives(), this.getCooperativeId()])
      .pipe(map(([all, id]) => all.find(c => c.cooperativeId === id)));
  }

  getUser(): Observable<User> {
    return this.allMetadatas$.pipe(map(meta => meta[0].user));
  }
  async getUserPromise(): Promise<User> {
    const meta = await this.allMetadatas$.pipe(take(1)).toPromise();
    this.isReshetUser = this.userService.isNetworkAdmin(meta[0].user);

    return meta[0].user;
  }
  getAllCooperatives(): Observable<Cooperative[]> {
    return this.allMetadatas$.pipe(map(meta => meta[0].cooperatives));
  }

  getMaam(): Observable<number> {
    return this.allMetadatas$.pipe(map(meta => meta[0].maam));
  }

  getAllBranches(): Observable<Branch[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      withLatestFrom(this.getCooperative()),
      map(([meta, coop]) => meta.branches.filter(b => b.cooperativeId === coop.cooperativeId)),
      //tap(([meta, coop]) => console.log("meta",meta,"coop",coop))
    );
  }

  getAllBudgets(): Observable<Budget[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(meta => meta.budgets)
    );
  }


  getAllProjects(): Observable<Project[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(meta => meta.projects)
    );
  }

  getAllBudgetsForBranch(branchId: number): Observable<Budget[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(meta => meta.budgets.filter(b => b.branchId === branchId))
    );
  }

  getAllProjectsForBudgetAndSchoolYear(budgetId: number, schoolYearId: number): Observable<Project[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(meta => meta.projects.filter(p => (p.budgetId === budgetId) && (p.schoolYearId === schoolYearId)))
    );
  }

  getAllSuppliers(): Observable<Supplier[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      withLatestFrom(this.getCooperative()),
      map(([meta, coop]) => meta.suppliers.filter(s => s.cooperativeId === coop.cooperativeId)),
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(meta => meta.employees)
    );
  }

  getAllQuarters(): Observable<Quarter[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(meta => meta.quarters)
    );
  }

  getAllSchoolYears(): Observable<SchoolYear[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(meta => meta.schoolYear)
    );
  }

  getSchoolYearOfDate(theDate: string): Observable<SchoolYear> {
    return this.getAllSchoolYears().pipe(
      map(years => years.find(year => ((theDate >= year.startYear.toString()) && (theDate <= year.endYear.toString()))))
    )
  }

  getThreeLastQuarters(): Observable<Quarter[]> {
    return this.getAllQuarters().pipe(
      map(quarters => quarters.slice(1, quarters.length))
    );
  }

  private getPreviousQuarterByQuarters(quarterId: string, quarters: Quarter[]) {
    let quarter = quarters.find(q => q.quarterId === quarterId);
    let index = quarters.indexOf(quarter);
    return quarters[index - 1];
  }

  getPreviousQuarter(quarterId: string): Observable<Quarter> {
    return this.getAllQuarters().pipe(
      map(quarters => this.getPreviousQuarterByQuarters(quarterId, quarters))
    );
  }

  getBudgetPrecedeCommission(): Observable<number> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(md => md.budgetPrecedeCommission)
    );
  }

  getCurrentSchoolYear(): Observable<SchoolYear> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(md => md.currentSchoolYear)
    );
  }

  getAllOrderStatuses(): Observable<OrderStatus[]> {
    return this.metadataThatContainsCurrentCooperative.pipe(
      map(md => md.allOrderStatuses)
    );
  }

  getActionStatuses(): Observable<InvoiceActionStatus[]> {
    return this.allMetadatas$.pipe(map(meta => meta[0].actionStatuses));
  }

  valid_numbers(e: any) {
   //// alert(this.userService.isReshetUser)
    if(this.userService.isReshetUser){
      return true;
    }
    var key = e.which || e.KeyCode;
    if (key >= 48 && key <= 57)
      // to check whether pressed key is number or not 
      return true;
    else return false;
  }
}


