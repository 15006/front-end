import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DatesService {

  constructor(private datepipe: DatePipe) { }

  dateTimeToDate(originalDate: string) {
    //console.group('Fixing Date format');

    //console.log(originalDate);

    //    let date = Date.parse(originalDate);
    let date = new Date(originalDate);

    //console.log(date);

    let res = this.datepipe.transform(originalDate, 'yyyy-MM-dd');

    //console.log(res);
   // console.groupEnd();
    return res;
  }

  dateToFormated(date: Date) {
    return this.datepipe.transform(date, 'yyyy-MM-dd');
    //return this.datepipe.transform(date, 'dd-MM-yyyy');
  }

  dateFormatedForPrint(date:Date){
    return this.datepipe.transform(date,'dd/MM/yyyy');
  }
}
