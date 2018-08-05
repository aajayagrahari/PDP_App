import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { projectService } from '../Services/project.services';
import { solutionService } from '../Services/solution.services';
import { ProjectDetails, Solutionlist } from '../_models/project.model';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmComponent } from '../confirm/confirm.component';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from '../Services/utility.service';
import { Observable } from 'rxjs/Observable'; 
import { Store } from '@ngrx/store';

@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    //providers: [projectService],
    styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

    public loading: boolean = false;
    public projectID: number;
    public newSolutionID: number = 0;
    public projectDetails: ProjectDetails;
    public showNosolutionSection: boolean = false;
    public solutionlist: Solutionlist[] = []; 
    public showError: boolean = false;
    lang$: Observable<string>;
   
    constructor(
        private _project: projectService,
        private _solution: solutionService,
        protected _route: Router,
        private activatedRoute: ActivatedRoute,
        private dialogService: DialogService, private readonly translate: TranslateService, public utility: UtilityService, private readonly store: Store<string>)
    {
        this.translate.setDefaultLang(utility.userBrowserLocale);  
        this.lang$ = this.store.select(()=>utility.userBrowserLocale);


    }

    ngOnInit() { 
        this.lang$.subscribe(lang => this.translate.use(lang));
        this.activatedRoute.params.subscribe((params: Params) => {
            this.projectID = params['id'];
            this.GetprojectbyID();
            this.listAllSolutions();
          

        });

        if (typeof window != undefined) {
            const _satellite = (window as any)._satellite;
            if (_satellite) {
                _satellite.myParams = { 'pageName': 'Project', 'pageURL': location.host + '/project' };
                _satellite.track("DCProject");
            }
        }
    }

    GetprojectbyID(): void {
        this._project.getprojectByID(this.projectID).subscribe((projdetails) => {
            if (projdetails != undefined) {
                this.projectDetails = projdetails as ProjectDetails;
            }
        });
    }

    listAllSolutions(): void {
        this.loading = true;
        try {
            this._project.getAllSolutions(this.projectID).subscribe((lstSolutions) => {
                if (lstSolutions.ErrorCode != undefined) {
                    this.showError = true;
                }
                else {
                    this.solutionlist = lstSolutions as Solutionlist[];
                    this.showError = false;
                    if (this.solutionlist.length) {
                        this.showNosolutionSection = false;
                    } else {
                        this.showNosolutionSection = true;
                    }
                }
                this.loading = false;
            });
        }
        catch (Error) {
            this.loading = false;
        }        
    }

    DisplaySolution(solutionID: number): void {
        this._solution.CheckLoadExistForSolution(solutionID).subscribe((load) => {
            if (load) {
                this._route.navigate(['/project', this.projectID, 'solution', solutionID]);
            } else {
                this._route.navigate(['/project', this.projectID, 'solution', solutionID, 'addLoad']);
            }
        })
    }

    deleteSolution(event: any, solutionId: number): void {
        event.stopPropagation();

        let disposable = this.dialogService.addDialog(ConfirmComponent, {
            title: 'Confirm',
            message: 'Are you sure, you want to delete this Solution?'
        }, { closeByClickingOutside: true, backdropColor: 'rgba(0, 0, 0, 0.5)' })
            .subscribe((isConfirmed) => {
                //We get dialog result
                if (isConfirmed) {
                    this._project.deleteSolution(this.projectID, solutionId).subscribe((result) => {
                        this.listAllSolutions();
                    });
                }
            });
        //We can close dialog calling disposable.unsubscribe();
        //If dialog was not closed manually close it by timeout
        setTimeout(() => {
            disposable.unsubscribe();
        }, 10000);
    }

    updatedProjectDetails(projectDetail: ProjectDetails): void {
        this.projectDetails = projectDetail
    }

}
