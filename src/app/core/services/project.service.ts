import { MetadataService } from './metadata.service';
import { UserService } from './user.service';
import { User } from '../entities/user';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { promise } from 'protractor';
import { UrlService } from './url.service';
import { Project } from '../entities/project';
import { map, switchMap, distinctUntilChanged, withLatestFrom } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { combineLatest } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    private _projects: Promise<Project[]> = null;
    private userId$: Observable<number>;

    constructor(private http: HttpClient, private url: UrlService, private metadataService: MetadataService, private userService: UserService) {
        this.userId$ = this.userService.getUserId();
    }


    public async getAll(): Promise<Project[]> {
        //debugger;
        // console.log("user service");
        let cooperativeId$ = this.metadataService.getCooperativeId();

        if (this._projects == null) {
            //let url = this.url.getUrl('invoices/getProjects');
            let url = this.url.getUrl('project/getProjects');
            // console.log('accessing: ' + url);
            this._projects = combineLatest([this.userId$, cooperativeId$]).pipe(
                distinctUntilChanged(),
                map(([userId, cooperativeId]) => `${url}/${userId}/${cooperativeId}`),
                switchMap(url => this.http.get<Project[]>(url))
            ).toPromise();
        }

        return await this._projects;
    }

}



