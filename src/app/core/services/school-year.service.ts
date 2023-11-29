import { Injectable } from '@angular/core';
import { MetadataService } from './metadata.service';
import { SchoolYear } from '../entities/school-year'
import { combineLatest, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SchoolYearService {

  constructor(private metaDataService: MetadataService) { }

  schoolYears: Observable<SchoolYear[]>;


  public getSchoolYearOfDate(theDate: Date): Observable<SchoolYear> {
    {

      let schoolYears$: Observable<SchoolYear[]>;
      schoolYears$ = this.metaDataService.getAllSchoolYears();
      // console.log("hi, i am in getSchoolYearOfDate - theDate",theDate);
      return schoolYears$.pipe(
        switchMap((sylist) => sylist.filter(sy => ((theDate >= new Date(sy.startYear)) && (theDate <= new Date(sy.endYear)))))//,
      );
    }
  }

  // public getSchoolYearOfDateByString(theDate: string): Observable<SchoolYear> {
  //   {

  //     let schoolYears$: Observable<SchoolYear[]>;
  //     schoolYears$ = this.metaDataService.getAllSchoolYears();
  //     // console.log("hi, i am in getSchoolYearOfDate - theDate",theDate);

  //     return this.metaDataService.getAllSchoolYears().pipe(
  //       switchMap((v) => sylist.filter(sy => ((theDate >= sy.startYear.toString()) && (dt <= sy.endYear.toString()))))//,
  //     );
  //   }
  // }

  public getSchoolYeaars(): Observable<SchoolYear[]> {
    if (this.schoolYears == null) {
      let sList = this.metaDataService.getAllSchoolYears();
      this.schoolYears = sList;
    }

    return this.schoolYears;

    return this.metaDataService.getAllSchoolYears();
  }
}
