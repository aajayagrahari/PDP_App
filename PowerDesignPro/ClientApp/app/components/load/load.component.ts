import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';
import { LoadModel } from '../_models/load.model';
import { ProjectDetails } from '../_models/project.model';
import { projectService } from '../Services/project.services';
import { solutionService } from '../Services/solution.services';
import { BasicLoadComponent } from '../basicLoad/basicLoad.component';
import { ACLoadComponent } from '../acLoad/acLoad.component';
import { LightingLoadComponent } from '../lightingLoad/lightingLoad.component';
import { UPSLoadComponent } from '../upsLoad/upsLoad.component';
import { WelderLoadComponent } from '../welderLoad/welderLoad.component';
import { MotorLoadComponent } from '../motorLoad/motorLoad.component';
import { SolutionDetail } from '../_models/solutionSummary.model';


@Component({
    selector: 'load',
    providers: [solutionService],
    templateUrl: './load.component.html',
    styleUrls: ['./load.component.css']
})
export class LoadComponent implements OnInit {
    public solutionDetail = new SolutionDetail();
    public BaseLoad: any;
    public projectID: number;
    public solutionID: number;
    public solutionLoadId: number;
    public copySolutionLoadId: number;
    public loadId: number;
    public SelectedLoad: LoadModel;
    public LoadList: LoadModel[] = [];
    public projectDetails = new ProjectDetails();
    public loadFamily: string;
    public loadFamilyID: number;
    public copyLoad = false;
    public isReadOnlyAccess = false;
    @ViewChild('basicLoad') basicLoad: BasicLoadComponent;
    @ViewChild('acLoad') acLoad: ACLoadComponent;
    @ViewChild('lightingLoad') lightingLoad: LightingLoadComponent;
    @ViewChild('upsLoad') upsLoad: UPSLoadComponent;
    @ViewChild('welderLoad') welderLoad: WelderLoadComponent;
    @ViewChild('motorLoad') motorLoad: MotorLoadComponent;

    constructor(private _projectService: projectService, private _solutionService: solutionService,
        protected _router: Router,
        private _activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this._activatedRoute.params.subscribe((params: Params) => {
            this.projectID = params['projectId'];
            this.solutionID = params['solutionId'];
            this.loadId = params['loadId'];
            this.solutionLoadId = params['solutionLoadId'];
            this.copySolutionLoadId = params['copySolutionLoadId'];
        });

        this._projectService.getprojectByID(this.projectID).subscribe((projectDetails) => {
            this.projectDetails = projectDetails as ProjectDetails;
            this._solutionService.GetSolutionHeaderDetails(this.projectID, this.solutionID).subscribe((solutionHeaderDetails) => {
                //this.solutionDetail = {};
                this.solutionDetail.SolutionID = solutionHeaderDetails.SolutionID;
                this.solutionDetail.SolutionName = solutionHeaderDetails.SolutionName;
                this.solutionDetail.ProjectID = this.projectID;
                this.solutionDetail.IsReadOnlyAccess = solutionHeaderDetails.IsReadOnlyAccess;
                this.isReadOnlyAccess = solutionHeaderDetails.IsReadOnlyAccess;
            })
        });

        this._solutionService.GetLoadDetails(this.solutionID).subscribe((load) => {
            this.BaseLoad = load;
            this.LoadList = load.Loads as LoadModel[];
            var defaultLoad = this.LoadList.find(l => l.IsDefaultSelection) as LoadModel;
            if (this.loadId != undefined) {
                defaultLoad = this.LoadList.find(l => l.ID == this.loadId) as LoadModel;
            }

            if (defaultLoad != undefined) {
                this.SelectedLoad = defaultLoad;
                this.SelectedLoad.SolutionID = this.solutionID;
                this.SelectedLoad.ProjectID = this.projectID;
                this.loadFamily = this.SelectedLoad.LoadFamily;
                if (this.copySolutionLoadId) {
                    this.SelectedLoad.CopyLoad = true;
                    this.solutionLoadId = this.copySolutionLoadId;
                }
                this.SelectedLoad.SolutionLoadID = this.solutionLoadId;
                this.loadFamilyID = this.SelectedLoad.LoadFamilyID;
            }
        });
    }

    updatedProjectDetails(projectDetail: ProjectDetails): void {
        this.projectDetails = projectDetail
    }

    ShowLoadDetaill(load: LoadModel): void {
        if (this.loadFamily == load.LoadFamily) {
            this.loadFamily = load.LoadFamily;
            load.SolutionID = this.solutionID;
            load.ProjectID = this.projectID;
            load.SolutionLoadID = this.solutionLoadId;
            if (load.LoadFamilyID == 1) {
                this.basicLoad.InitializeLoadDetails(load);
            }
            if (load.LoadFamilyID == 2) {
                this.motorLoad.InitializeLoadDetails(load);
            }
            if (load.LoadFamilyID == 3) {
                this.lightingLoad.InitializeLoadDetails(load);
            }
            if (load.LoadFamilyID == 4) {
                this.welderLoad.InitializeLoadDetails(load);
            }
            if (load.LoadFamilyID == 5) {
                this.acLoad.InitializeLoadDetails(load);
            }
            if (load.LoadFamilyID == 6) {
                this.upsLoad.InitializeLoadDetails(load);
            }
        } else {
            this.loadFamily = load.LoadFamily;
            load.SolutionID = this.solutionID;
            load.ProjectID = this.projectID;
        }
    }
}
