//import { Component, OnInit, ViewChild } from "@angular/core";
//import { ExhaustPipingReport } from '../_models/analysisReport.model';
//import { solutionService } from "../Services/solution.services";
//import { ActivatedRoute, Params } from "@angular/router";
//import { projectService } from "../Services/project.services";
//import { ProjectDetails } from "../_models/project.model";

//@Component({
//    selector: 'exhaustPipingReport',
//    templateUrl: './exhaustPipingReport.component.html',
//    styleUrls: ['./exhaustPipingReport.component.css']
//})

//export class ExhaustPipingReportComponent implements OnInit {

//    public ExhaustPipingReport = new ExhaustPipingReport();
//    public solutionID: number;
//    public projectID: number;
//    public projectDetails = new ProjectDetails();
//    public solutionDetail: any;
//    public isReadOnlyAccess = false;
//    public loading: boolean = false;

//    constructor(private _projectService: projectService, private _solutionService: solutionService,
//        private _activatedRoute: ActivatedRoute,) {
//    }

//    ngOnInit(): void {
//        this._activatedRoute.params.subscribe((params: Params) => {
//            this.loading = true;
//            this.projectID = params['projectId'];
//            this.solutionID = params['solutionId'];

//            this._projectService.getprojectByID(this.projectID).subscribe((projectDetails) => {
//                this.projectDetails = projectDetails as ProjectDetails;
//                this._solutionService.GetSolutionHeaderDetails(this.projectID, this.solutionID).subscribe((solutionHeaderDetails) => {
//                    this.solutionDetail = {};
//                    this.solutionDetail.SolutionId = solutionHeaderDetails.SolutionID;
//                    this.solutionDetail.SolutionName = solutionHeaderDetails.SolutionName;
//                    this.solutionDetail.ProjectId = this.projectID;
//                    this.solutionDetail.IsReadOnlyAccess = solutionHeaderDetails.IsReadOnlyAccess;
//                    this.solutionDetail.ShowGrantAccess = solutionHeaderDetails.ShowGrantAccess;
//                    this.isReadOnlyAccess = this.solutionDetail.IsReadOnlyAccess;

//                    this._solutionService.GetExhaustPipingReport(this.projectID, this.solutionID).subscribe((exhaustPipingReport) => {
//                        this.ExhaustPipingReport = exhaustPipingReport as ExhaustPipingReport;

//                        this.loading = false;
//                    });
//                });
//            });
//        });
//    }

//    updatedProjectDetails(projectDetail: ProjectDetails): void {
//        this.projectDetails = projectDetail
//    }
//}