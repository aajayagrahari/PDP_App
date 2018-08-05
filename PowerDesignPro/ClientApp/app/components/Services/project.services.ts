import { Component, Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { httpclient } from '../Services/httpclient.component';
import { ProjectDetails } from '../_models/project.model';
import { userService } from '../Services/user.service';


@Injectable()

export class projectService {

    public projectDetails = new BehaviorSubject<any>(new ProjectDetails());
    token: string;
    constructor(protected _httpclient: httpclient, protected _userservce: userService) {

    }

    getprojectByID(id: number): Observable<any> {
        if (this.projectDetails.observers.length == 0) {
            return this._httpclient.gethttpdatatoken("User/Project/GetProjectDetail?ProjectID=" + id, this._userservce.token).map((recentproject) => {
                this.projectDetails.next(recentproject);
                return recentproject;
            });
        }
        return this.projectDetails;
    }

    updateProject(project: any): Observable<any> {
        return this._httpclient.posthttpdatatoken("User/Dashboard/UpdateProject", project, this._userservce.token).map((projectResponse) => {
            return projectResponse;
        });

    }

    copySolution(solution: any): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/Solution/CopySolution", solution, this._userservce.token).map((projectResponse) => {
            return projectResponse;
        });

    }

    grantEditAccess(solution: any): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/Solution/GrantEditAccess", solution, this._userservce.token).map((projectResponse) => {
            return projectResponse;
        });

    }

    getAllSolutions(projectID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("User/Project/GetSolutionListByProjectID?ProjectID=" + projectID, this._userservce.token).map((solutions) => {
            return solutions;
        });

    }

    //getSolutionProjectDetails(projectId: number): Observable<any> {
    //    if (this.projectDetails.value.length == 0) {
    //        return this._httpclient.gethttpdatatoken("User/Project/GetProjectDetail?ProjectID=" + projectId, this._userservce.token).map((recentproject) => {
    //            this.projectDetails.next(recentproject);
    //            return recentproject;
    //        });
    //    }
    //    return this.projectDetails;
    //}

    deleteSolution(projectId: number, solutionId: number): Observable<any> {
        return this._httpclient.deletehttpdatatoken("User/Project/DeleteSolution?ProjectID=" + projectId + "&SolutionID=" + solutionId, this._userservce.token).map((solutions) => {
            return solutions;
        });
    }
}