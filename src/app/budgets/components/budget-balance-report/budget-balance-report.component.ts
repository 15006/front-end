import { Component, OnInit } from '@angular/core';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { ReportService } from 'src/app/core/services/report.service';
import { DatesService } from 'src/app/core/services/dates.service';
import {Branch} from 'src/app/core/entities/report/budget-control-report';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-budget-balance-report',
  templateUrl: './budget-balance-report.component.html',
  styleUrls: ['./budget-balance-report.component.scss']
})
export class BudgetBalanceReportComponent implements OnInit {
  report :Promise<Branch[]>; 
  strCurrentDate :string;

 constructor(private metaDataService: MetadataService,
   private reportService : ReportService,
   private route: ActivatedRoute,
   private router: Router,
   private dateService: DatesService) { }

 ngOnInit() { 
 
   this.initPage();
   
 }

 private async initPage(){
   this.report = this.reportService.GetBudgetControlReport();
   this.strCurrentDate = this.dateService.dateFormatedForPrint(new Date());
   
 }


 public dateFormatedForPrint(myDate : Date): string{
   return  this.dateService.dateFormatedForPrint(myDate);
 }
}
