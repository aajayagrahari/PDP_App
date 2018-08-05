import { Component, Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { httpclient } from '../Services/httpclient.component';
import { RecentProject } from '../_models/dashboard.model';
import { userService } from '../Services/user.service';


@Injectable()

export class dashboardService {
    token: string;
    constructor(protected _httpclient: httpclient, protected _userservce: userService) {

    }

    getsearchfilter(): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Dashboard/GetSearchFilter", this._userservce.token).map((searchfilter) => {
            return searchfilter;
        });

    }

    getrecentprojects(): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Dashboard/RecentProjects?daysOld=90", this._userservce.token).map((recentproject) => {
            return recentproject;
        });

    }

    getprojectbyname(name: string): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Dashboard/GetProjectsByName?projectName=" + name, this._userservce.token).map((recentproject) => {
            return recentproject;
        });
    }

    getprojectbysolution(solutionname: string): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Dashboard/GetProjectsBySolutionName?solutionName=" + solutionname, this._userservce.token).map((recentproject) => {
            return recentproject;
        });
    }

    getprojectbycreatedate(createdate: string): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Dashboard/GetProjectsByCreateDate?createDate=" + createdate, this._userservce.token).map((recentproject) => {
            return recentproject;
        });
    }

    getprojectbymodifydate(modifydate: string): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Dashboard/GetProjectsByModifyDate?modifyDate=" + modifydate, this._userservce.token).map((recentproject) => {
            return recentproject;
        });
    }

    Addproject<T>(project: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("User/Dashboard/AddProject", project, this._userservce.token).map((recentproject) => {
            return recentproject;
        });
    }

    ShareProject<T>(project: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("User/Dashboard/SaveSharedProject", project, this._userservce.token).map((recentproject) => {
            return recentproject;
        });
    }

    getshareprojects(): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Dashboard/GetSharedProjects", this._userservce.token).map((recentproject) => {
            return recentproject;
        });

    }

    deleteProject(projectId: number): Observable<any> {
        return this._httpclient.deletehttpdatatoken("User/Dashboard/DeleteProject?projectID=" + projectId, this._userservce.token).map((result) => {
            return result;
        });
    }

    deleteSharedProject(projectId: number): Observable<any> {
        return this._httpclient.deletehttpdatatoken("User/Dashboard/DeleteSharedProject?projectID=" + projectId, this._userservce.token).map((result) => {
            return result;
        });
    }

    getSolutionListForSharedProject(projectId: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Dashboard/GetSolutionListForSharedProject?projectID=" + projectId, this._userservce.token).map((recentproject) => {
            return recentproject;
        });
    };

}