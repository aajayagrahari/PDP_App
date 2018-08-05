import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { TransientAnalysis } from '../_models/analysisReport.model';
import { solutionService } from "../Services/solution.services";
import { ActivatedRoute, Params } from "@angular/router";
import { projectService } from "../Services/project.services";
import { ProjectDetails } from "../_models/project.model";
import { SolutionDetail } from "../_models/solutionSummary.model";

@Component({
    selector: 'transientAnalysis',
    templateUrl: './transientAnalysis.component.html',
    styleUrls: ['./transientAnalysis.component.css']
})

export class TransientAnalysisComponent implements OnInit {
    @Input() solutionDetail: SolutionDetail;
    public TransientAnalysis: TransientAnalysis | null;
    public loading: boolean = true;

    constructor(private _projectService: projectService, private _solutionService: solutionService,
        private _activatedRoute: ActivatedRoute, ) {
    }

    ngOnInit(): void {
        this.TransientAnalysis = new TransientAnalysis();
    }

    loadTransientAnalysis(): void {
        this.loading = true;
        this._solutionService.GetTransientAnalysis(this.solutionDetail.ProjectID, this.solutionDetail.SolutionID).subscribe((transientAnalysis) => {
            if (transientAnalysis == null || transientAnalysis.ErrorCode != undefined) {
                this.TransientAnalysis = null;
                this.loading = false;
                return;
            }   
            this.TransientAnalysis = transientAnalysis as TransientAnalysis;
            this.loading = false;
        });
    }
}