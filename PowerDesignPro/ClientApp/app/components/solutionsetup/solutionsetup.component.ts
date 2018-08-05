import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { solutionService } from '../Services/solution.services';
import { projectService } from '../Services/project.services';
import { CommonService } from '../Services/common.service';
import { ProjectDetails } from '../_models/project.model';
import { SolutionSetupDetailComponent } from '../solutionSetupDetail/solutioSetupDetail.component';

import {
    ProjectSolutionPickListDto, BaseSolutionSetupMappingValuesDto, BaseSolutionSetupDto,
    ProjectSolutionResponseDto, ProjectSolutionSetup, VoltageNominalList, VoltageSpecificList,
    FuelTankList, DesiredRunTimeList, VoltageDipList, FrequencyDipList, FrequencyList
} from '../_models/solutionSetup.model';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';

@Component({
    selector: 'solutionsetup',
    providers: [solutionService, CommonService],
    templateUrl: './solutionsetup.component.html',
    styleUrls: ['./solutionsetup.component.css']
})
export class SolutionSetupComponent implements OnInit {
    public loading: boolean = false;
    //public projectName: string;
    public projectID: number;
    public ProjectSolutionSetup: ProjectSolutionSetup;
    public solutionSetupDto: BaseSolutionSetupDto;
    public projectDetails = new ProjectDetails();
    public showUniqueSolutionNameError: boolean = false;
    public maxLength: number = 50;

    private solutionID: number;
    private UserDefaultSoltuionSetupObj: BaseSolutionSetupDto;

    @ViewChild('solutionSetupDetail') solutionSetupDetail: SolutionSetupDetailComponent;

    ProjectSolutionSetupValues = new ProjectSolutionSetup();

    constructor(private _solutionService: solutionService, private _projectService: projectService, protected _route: Router, private activatedRoute: ActivatedRoute,
        private _commonService: CommonService) {
    }

    ngOnInit() {
        this.showUniqueSolutionNameError = false;
        this.activatedRoute.params.subscribe((params: Params) => {
            this.projectID = params['projectId'];
            this.solutionID = params['solutionId'];
        });

        this._projectService.getprojectByID(this.projectID).subscribe((projectDetails) => {
            this.projectDetails = projectDetails as ProjectDetails;
        })

        //this.projectName = this.projectDetails.ProjectName;
        this.GetSolutionSetupInit();
    }

    updatedProjectDetails(projectDetail: ProjectDetails): void {
        this.projectDetails = projectDetail
    }

    //Get Soltuion Setup values
    GetSolutionSetupInit(): void {
        this.loading = true;
        //Solution Setup for new solution
        if (this.solutionID == undefined) {
            this._solutionService.LoadNewSolutionSetup(this.projectID).subscribe((SolutionSetup) => {
                this.loading = false;
                this.ProjectSolutionSetup = new ProjectSolutionSetup();
                this.ProjectSolutionSetup.BaseSolutionSetupDto = SolutionSetup;
            });
        }
        //Solution Setup for existing solution
        else {
            this._solutionService.LoadExistingSolutionSetup(this.projectID, this.solutionID).subscribe((SolutionSetup) => {
                this.loading = false;
                this.ProjectSolutionSetup = SolutionSetup as ProjectSolutionSetup;
            });
        }
        //this.loading = false;
    }

    //Save Solution Setup Values
    SaveSolutionSetup(isValid: boolean): void {
        
        if (!this.solutionSetupDetail.form.valid || this.ProjectSolutionSetup.SolutionName == undefined || this.ProjectSolutionSetup.SolutionName == '') {
            this.showUniqueSolutionNameError = false;
            this.solutionSetupDetail.invalidForm = true;
            return;
        }
        this.loading = true;
        this.ProjectSolutionSetup.SolutionID = this.solutionID == undefined ? 0 : this.solutionID;
        this.ProjectSolutionSetup.ProjectID = this.projectID;
        this._solutionService.SaveSolutionSetup(this.ProjectSolutionSetup).subscribe((addedSolution) => {
            this.loading = false;
            if (addedSolution.ErrorCode != undefined) {
                this.showUniqueSolutionNameError = true;
            }
            else {
                if (this.ProjectSolutionSetup.SolutionID > 0) {
                    this._solutionService.CheckLoadExistForSolution(this.ProjectSolutionSetup.SolutionID).subscribe((load) => {
                        if (load) {
                            this._route.navigate(['/project', this.projectID, 'solution', this.ProjectSolutionSetup.SolutionID]);
                        } else {
                            this._route.navigate(['/project', this.projectID, 'solution', this.ProjectSolutionSetup.SolutionID, 'addLoad']);
                        }
                    })
                } else {
                    this.solutionID = addedSolution.SolutionID;
                    this._route.navigate(['/project', this.projectID, "solution", addedSolution.SolutionID, "addLoad"]);
                }
            }
        });
    }

    //Restore default solution setup for user
    RestoreUserDefaults(): void {
        this.showUniqueSolutionNameError = false;
        this.loading = true;
        this._solutionService.RestoreUserDefaults().subscribe((UserDefaultSolutionSetup) => {
            this.loading = false;
            this.ProjectSolutionSetup.BaseSolutionSetupDto = UserDefaultSolutionSetup;
            this.solutionSetupDetail.MapPickListData(this.ProjectSolutionSetup.BaseSolutionSetupDto);

            this.ProjectSolutionSetup.BaseSolutionSetupDto.ProjectSolutionPickListDto.VoltageDipList =
                this.solutionSetupDetail.MapVoltageDipUnitsChange(this.ProjectSolutionSetup.BaseSolutionSetupDto.SolutionSetupMappingValuesDto.VoltageDipUnitsID);

            this.ProjectSolutionSetup.BaseSolutionSetupDto.ProjectSolutionPickListDto.FrequencyDipList =
                this.solutionSetupDetail.MapFrequencyDipUnitsChange(this.ProjectSolutionSetup.BaseSolutionSetupDto.SolutionSetupMappingValuesDto.FrequencyDipUnitsID);
        })
    }

    CancelSolutionSetup(): void {
        this._route.navigate(['/project', this.projectID]);
    }

}
