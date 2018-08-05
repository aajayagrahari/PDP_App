import { Component, OnInit, ElementRef, Renderer, ViewChild, AfterViewInit } from '@angular/core';
import { dashboardService } from '../Services/dashboard.services';
import { solutionService } from '../Services/solution.services';
import { RecentProject, SearchProject, AddedProject, ShareProject, ShowShareProject, ProjectSolution, SearchFilter } from '../_models/dashboard.model';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmComponent } from '../confirm/confirm.component';
import { headerComponent } from '../header/header.component';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { MyDatePickerModule } from 'mydatepicker';
import { IMyDpOptions } from 'mydatepicker';
import { IMyDateModel } from 'mydatepicker';
import { UtilityService } from '../Services/utility.service';


@Component({
    selector: 'home',
    providers: [dashboardService, solutionService],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
    public loading: boolean = false;
    public visible = false;
    public visibleAnimate = false;
    public listofProjects: RecentProject[] = [];
    public listofShareProjects: ShowShareProject[] = [];
    //public shownodata: boolean = false;
    public showShareProjectdata: boolean = false;
    public addedProject = new AddedProject();
    public shareProject = new ShareProject();
    public showMessagebar: boolean = false;
    public SearchbyProject: boolean = true;
    public SearchbyDate: boolean = false;
    public showShareProject: boolean = false;
    public showadderror: boolean = false;
    public showemailerror: boolean = false;
    public showReceiptEmailError: boolean = false;
    public showProjectNameRequiredError: boolean = false;
    public showUniqueProjectNameError: boolean = false;
    public shownodataSearch: boolean = false;
    public searchProject = new SearchProject();
    public ProjectSolutionList: ProjectSolution[];
    public showSolutionError = false;
    public showError: boolean = false;
    public showGrid: boolean = false;
    public _satellite: any;
    public showWelcomeMessage: boolean = false;
    @ViewChild('closemodal') closemodal: ElementRef;
    public currentFilter: number = 1;
    public maxLength: number = 50;
    public searchFilters: SearchFilter[] = [];
    private filterValue: string;
    public myDatePickerOptions: IMyDpOptions = {
        // other options...
        dateFormat: <string> 'mm/dd/yyyy',
        inline: <boolean> false,
        editableDateField: <boolean> false,
        openSelectorOnInputClick: <boolean> true,
    };

    // Initialized to specific date (09.10.2018).
    public model: any = { date: { year: 2018, month: 10, day: 9 } };
    

    constructor(private _dashboard: dashboardService, protected _route: Router, private route: ActivatedRoute,
        private dialogService: DialogService, protected _solutionService: solutionService,
        private translate: TranslateService, private _utilityService: UtilityService) {

    }

    ngOnInit() {        
        var userDefaultSetup = this._solutionService.userDefaultExist;
        if (userDefaultSetup > 0) {
            this.listAllproject();
            this.listShareAllproject();
            this.searchFilter();
            //this.searchFilters.ID = 1;
        } else {
            this._route.navigate(['/userdefaults']);
        }
        if (typeof window != undefined) {
            const _satellite = (window as any)._satellite;
            if (_satellite) {
                _satellite.track("DCHomePage");
            }
        }
    }

    ngAfterViewInit() {
        //var event = document.createEvent('CustomEvent');
        //event.initCustomEvent('Home_Page_View', true, true, { pageName: 'User Dashboard' });
        //var element = document.getElementById('homeContent');
        //if (!!element) {
        //    element.dispatchEvent(event);
        //}
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

    getprojectbyname(filter: number): void {
        this.filterValue = this.GetValue(this.searchFilters, filter);
        if (this.searchProject.ProjectName != undefined || (this.searchProject.ProjectName != undefined && this.searchProject.ProjectName == "")) {

            if (this.filterValue == "Project") {
                this._dashboard.getprojectbyname(this.searchProject.ProjectName).subscribe((lst) => {
                    if (lst.ErrorCode != undefined) {
                        this.shownodataSearch = true;
                    }
                    else {
                        this.listofProjects = lst as RecentProject[];
                        if (this.listofProjects.length) {
                            this.shownodataSearch = false;
                        } else {
                            this.shownodataSearch = true;
                        }
                    }
                });
            }

            if (this.filterValue == "Solution") {
                this._dashboard.getprojectbysolution(this.searchProject.ProjectName).subscribe((lst) => {
                    if (lst.ErrorCode != undefined) {
                        this.shownodataSearch = true;
                    }
                    else {
                        this.listofProjects = lst as RecentProject[];
                        if (this.listofProjects.length) {
                            this.shownodataSearch = false;
                        } else {
                            this.shownodataSearch = true;
                        }
                    }
                });
            }

            if (this.filterValue == "Created Date") {
                this._dashboard.getprojectbycreatedate(this.searchProject.ProjectName).subscribe((lst) => {
                    if (lst.ErrorCode != undefined) {
                        this.shownodataSearch = true;
                    }
                    else {
                        this.listofProjects = lst as RecentProject[];
                        if (this.listofProjects.length) {
                            this.shownodataSearch = false;
                        } else {
                            this.shownodataSearch = true;
                        }
                    }
                });
            }

            if (this.filterValue == "Modified Date") {
                this._dashboard.getprojectbymodifydate(this.searchProject.ProjectName).subscribe((lst) => {
                    if (lst.ErrorCode != undefined) {
                        this.shownodataSearch = true;
                    }
                    else {
                        this.listofProjects = lst as RecentProject[];
                        if (this.listofProjects.length) {
                            this.shownodataSearch = false;
                        } else {
                            this.shownodataSearch = true;
                        }
                    }
                });
            }
        }
    }

    AddProject(): void {
        debugger
        if (!this.addedProject.projectName) {
            this.showadderror = true;
            this.showProjectNameRequiredError = true;
            return;
        }
        this._dashboard.Addproject(this.addedProject).subscribe((addproj) => {
            if (addproj.ErrorCode != undefined) {
                if (addproj.ErrorDescription == "Project Name was used already.") {
                    this.showadderror = true;
                    this.showUniqueProjectNameError = true;
                }
            }
            else {
                this.showMessagebar = true;
                this.addedProject = new AddedProject();
                this.closemodal.nativeElement.click();
                this.listAllproject();
            }
        });
    }

    ShareProject(): void {
        this.shareProject.Language = this._utilityService.userBrowserLocale
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

    listAllproject(): void {
        this.loading = true;
        this._dashboard.getrecentprojects().subscribe((lst) => {
            if (lst.ErrorCode != undefined) {
                this.showError = true;
            }
            else {
                this.listofProjects = lst as RecentProject[];
                this.showError = false;
                if (this.listofProjects.length) {
                    this.showWelcomeMessage = false;
                } else {
                    this.showWelcomeMessage = true;
                }
            }

            this.showGrid = !this.showError && !this.showWelcomeMessage;
            this.loading = false;
        });
    }

    listShareAllproject(): void {
        this.loading = true;
        this._dashboard.getshareprojects().subscribe((lst) => {
            if (lst.ErrorCode != undefined) {
                this.showShareProjectdata = false;
            }
            else {
                this.listofShareProjects = lst as ShowShareProject[];
                this.showShareProjectdata = true;
            }
            this.loading = false;
        });
    }

    searchFilter(): void {
        this.loading = true;
        this._dashboard.getsearchfilter().subscribe((lst) => {
            if (lst.ErrorCode != undefined) {
            }
            else {
                this.searchFilters = lst as SearchFilter[];
            }
            this.loading = false;
        });
    }

    Displayproject(projectid: number): void {
        this._route.navigate(['/project', projectid]);
    }

    deleteProject(event: any, projectId: number): void {
        event.stopPropagation();
        var alertMessage = "";
        var confirmTitle = "";
        this.translate.get('warning.ProjectDeleteAlert').subscribe(x => alertMessage = x);
        this.translate.get('Confirm').subscribe(x => confirmTitle = x);
        let disposable = this.dialogService.addDialog(ConfirmComponent, {
            title: confirmTitle,
            message: alertMessage
        }, { closeByClickingOutside: true, backdropColor: 'rgba(0, 0, 0, 0.5)' })
            .subscribe((isConfirmed) => {
                //We get dialog result
                if (isConfirmed) {
                    this._dashboard.deleteProject(projectId).subscribe((result) => {
                        this.listAllproject();
                    });
                }
            });
        //We can close dialog calling disposable.unsubscribe();
        //If dialog was not closed manually close it by timeout
        setTimeout(() => {
            disposable.unsubscribe();
        }, 10000);
    }

    deleteShareProject(event: any, projectId: number): void {
        event.stopPropagation();
        var alertMessage = "";
        var confirmTitle = "";
        this.translate.get('warning.SharedProjectDeleteAlert').subscribe(x => alertMessage = x);
        this.translate.get('Confirm').subscribe(x => confirmTitle = x);
        let disposable = this.dialogService.addDialog(ConfirmComponent, {
            title: confirmTitle,
            message: alertMessage
        }, { closeByClickingOutside: true, backdropColor: 'rgba(0, 0, 0, 0.5)' })
            .subscribe((isConfirmed) => {
                //We get dialog result
                if (isConfirmed) {
                    this._dashboard.deleteSharedProject(projectId).subscribe((result) => {
                        this.listShareAllproject();
                    });
                }
            });
        //We can close dialog calling disposable.unsubscribe();
        //If dialog was not closed manually close it by timeout
        setTimeout(() => {
            disposable.unsubscribe();
        }, 10000);
    }

    public HideAlert(): void {
        this.showadderror = false;
        this.showUniqueProjectNameError = false;
        this.showProjectNameRequiredError = false;
        this.showSolutionError = false;
    }

    public HideError(): void {
        this.showemailerror = false;
        this.showReceiptEmailError = false;
    }

    public onSelectFilter(selectedFilter: number): void {
        this.searchProject.ProjectName = '';
        this.getprojectbyname(selectedFilter);
        this.filterValue = this.GetValue(this.searchFilters, selectedFilter);

        if (this.filterValue == "Created Date" || this.filterValue == "Modified Date") {
            this.SearchbyProject = false;
            this.SearchbyDate = true;
        }
        else {
            this.SearchbyProject = true;
            this.SearchbyDate = false;
        }
        this.currentFilter = selectedFilter;
    }

    onDateChanged(event: IMyDateModel) {
        this.searchProject.ProjectName = event.formatted;
        this.getprojectbyname(this.currentFilter);
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
    }

    private GetValue(list: SearchFilter[], id: number): any {
        var item = list.find(l => l.ID == id);
        return item != undefined ? item.Value : undefined;
    }
}
