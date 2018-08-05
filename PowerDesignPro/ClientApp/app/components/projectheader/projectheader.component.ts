import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { projectService } from '../Services/project.services';
import { dashboardService} from '../Services/dashboard.services';
import { ProjectDetails } from '../_models/project.model';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmComponent } from '../confirm/confirm.component';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from '../Services/utility.service';
import { ShareProject, ProjectSolution } from '../_models/dashboard.model';

@Component({
    selector: 'pdpprojectheader',
    providers: [dashboardService],
    templateUrl: './projectheader.component.html',
    styleUrls: ['./projectheader.component.css']
})
export class ProjectHeaderComponent {
    @Input() projectDetails: ProjectDetails;
    @Output() updatedProjectDetails = new EventEmitter<ProjectDetails>();

    public defaultProject: ProjectDetails = new ProjectDetails();
    public isEdit: boolean;
    public showMessagebar: boolean = false;
    public showadderror: boolean = false;
    public projectNamerequired: boolean = false;

    public visible = false;
    public shareProject = new ShareProject();
    public ProjectSolutionList: ProjectSolution[];
    public visibleAnimate = false;
    public showemailerror: boolean = false;
    public showReceiptEmailError: boolean = false;
    public showSolutionError = false;
    public showShareProject: boolean = false;
    @ViewChild('closemodal') closemodal: ElementRef;

    lang$: Observable<string>;
    constructor(private _dashboard: dashboardService, private _project: projectService, protected _route: Router, private activatedRoute: ActivatedRoute
        , private dialogService: DialogService, private readonly translate: TranslateService, public utility: UtilityService, private readonly store: Store<string>) {
        this.projectNamerequired = false;
        this.translate.setDefaultLang(utility.userBrowserLocale);
        this.lang$ = this.store.select(() => utility.userBrowserLocale);
    }

    ngOnInit() {
        this.isEdit = false;
        this.projectNamerequired = false;
        this.showadderror = false;
        this.showMessagebar = false;
        this.lang$.subscribe(lang => this.translate.use(lang));
    }

    EditProject(): void {
        //this.defaultProject = JSON.parse(JSON.stringify(this.projectDetails));
        this.isEdit = true;
        this.projectNamerequired = false;
        this.showadderror = false;
        this.showMessagebar = false;
    }

    UpdateProject(): void {
        if (!this.projectDetails.ProjectName) {
            this.projectNamerequired = true;            
            return;
        }
        this.defaultProject.ProjectID = this.projectDetails.ID;
        this.defaultProject.ProjectName = this.projectDetails.ProjectName;
        this.defaultProject.ContactName = this.projectDetails.ContactName;
        this.defaultProject.ContactEmail = this.projectDetails.ContactEmail;

        this._project.updateProject(this.defaultProject).subscribe((projectResponse) => {
            if (projectResponse.ErrorCode != undefined) {
                this.Cancel();
                this.showadderror = true;                
            }
            else {
                this.showMessagebar = true;
                this.UpdateProjectSharedServiceDetail(projectResponse.ProjectID);
                this.updatedProjectDetails.emit(this.projectDetails);
            }
        });
        this.isEdit = false;
        this.showadderror = false;
    }

    DeleteProject(event: any, projectId: number): void {
        var alertMessage = "";
        var confirmTitle = "";
        this.translate.get('warning.ProjectDeleteAlert').subscribe(x => alertMessage = x);
        this.translate.get('Confirm').subscribe(x => confirmTitle = x);
        event.stopPropagation();
        let disposable = this.dialogService.addDialog(ConfirmComponent, {
            title: confirmTitle,
            message: alertMessage
        }, { closeByClickingOutside: true, backdropColor: 'rgba(0, 0, 0, 0.5)' })
            .subscribe((isConfirmed) => {
                //We get dialog result
                if (isConfirmed) {
                    this._dashboard.deleteProject(projectId).subscribe((result) => {
                        this._route.navigate(['/home']);
                    });
                }
            });
        //We can close dialog calling disposable.unsubscribe();
        //If dialog was not closed manually close it by timeout
        setTimeout(() => {
            disposable.unsubscribe();
        }, 10000);
    }

    Cancel(): void {
        this.showadderror = false;
        this.isEdit = false;
        this.UpdateProjectSharedServiceDetail(this.projectDetails.ID);
    }

    UpdateProjectSharedServiceDetail(projectId: number): void {
        this._project.getprojectByID(projectId).subscribe((projectDetails) => {
            if (projectDetails != undefined) {
                this.projectDetails = projectDetails as ProjectDetails;
                this.updatedProjectDetails.emit(this.projectDetails);
                //this.defaultProject = this.projectDetails;
            }
        });
        //this.isEdit = false;
        //this.showadderror = false;
    }

    HideAlert(): void {
        this.showadderror = false;
        this.showMessagebar = false;
        this.showSolutionError = false;
    }

    openModel(event: any, projectId: number) {
        try {
            var analyticsEvent = document.createEvent('CustomEvent');
            analyticsEvent.initCustomEvent('Share_Project_Click', true, true, {});
            var element = document.getElementById('shareProject');
            if (!!element) {
                element.dispatchEvent(analyticsEvent);
            }
        }
        catch (e) {
        }
        this.visible = true;
        this.shareProject.ProjectID = projectId;
        this.ProjectSolutionList = new Array<ProjectSolution>();
        this._dashboard.getSolutionListForSharedProject(projectId).subscribe((result) => {
            this.ProjectSolutionList = result;
        })
        setTimeout(() => this.visibleAnimate = true, 100);
        event.stopPropagation();
    }

    onCloseHandled() {
        this.visibleAnimate = false;
        setTimeout(() => this.visible = false, 300);
        this.shareProject.RecipientEmail = '';
    }

    public HideError(): void {
        this.showemailerror = false;
        this.showReceiptEmailError = false;
    }

    ShareProject(): void {
        this.shareProject.Language = this.utility.userBrowserLocale;
        if (this.isValidMailFormat(this.shareProject.RecipientEmail)) {
            this.showemailerror = true;
            this.showReceiptEmailError = true;
            return;
        }
        this.ProjectSolutionList.forEach((solution) => {
            if (solution.Selected) {
                this.shareProject.SelectedSolutionList.push(solution.ID);
            }
        });

        this.showSolutionError = !(this.shareProject.SelectedSolutionList.length > 0);

        if (!this.showSolutionError) {
            this._dashboard.ShareProject(this.shareProject).subscribe((shareproj) => {
                if (shareproj.ErrorCode != undefined) {
                    this.showemailerror = true;
                    this.showReceiptEmailError = true;
                }
                else {
                    this.showShareProject = true;
                    this.shareProject = new ShareProject();
                    this.closemodal.nativeElement.click();
                    this.onCloseHandled();
                }
            });
        }
    }

    isValidMailFormat(email: string) {
        let EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (!EMAIL_REGEXP.test(email)) {
            return true;
        }
        return false;
    }

}