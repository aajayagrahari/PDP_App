import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { LoadSummaryLoads, LoadSequenceRequest, LoadSequence, LoadSummaryLoadList, SolutionSummaryLoadSummary, SolutionSummary, SolutionLimits, VDipFDip } from '../_models/solutionSummary.model';
import { solutionService } from '../Services/solution.services';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
    selector: 'loadSummaryLoads',
    templateUrl: './loadSummaryLoads.component.html'
})

export class LoadSummaryLoadsComponent implements OnInit {
    public loading: boolean = false;
    @Input() loadSummaryLoads: LoadSummaryLoads;
    @Input() readOnlyAccess: boolean;
    @Input() vDipFDipRecommendedProduct: VDipFDip;
    @Output() UpdateSolutionSummaryLoadSummary = new EventEmitter<SolutionSummaryLoadSummary>();
    @Output() UpdateSolutionSummary = new EventEmitter<SolutionSummary>();
    public solutionSummary = new SolutionSummary();
    public projectID: number;
    public solutionID: number;

    constructor(private dialogService: DialogService, private _solutionService: solutionService) {
    }

    ngOnInit(): void {        
    }

    public getStyle(error: boolean): object {
        if (error) {
            return { color: 'white', 'background-color': 'red' };
        }
        else {
            return { color: 'black', 'background-color': '' };
        }
    }

    LoadSummaryLoadsDetail(projectID: number, solutionID: number): void {
        this.projectID = this.loadSummaryLoads.ProjectID;
        this.solutionID = this.loadSummaryLoads.SolutionID;
        this._solutionService.GetLoadSummaryLoads(projectID, solutionID).subscribe((loadSummaryLoadDetails) => {
            this.loadSummaryLoads = loadSummaryLoadDetails as LoadSummaryLoads;
            this.loadSummaryLoads.ProjectID = this.projectID;
            this.loadSummaryLoads.SolutionID = this.solutionID;
            this.UpdateSolutionSummaryLoadSummary.emit(this.loadSummaryLoads.SolutionSummaryLoadSummary);
            this.loading = false;
        });
    }

    SolutionSummaryDetails(projectID: number, solutionID: number): void {
        this.projectID = this.loadSummaryLoads.ProjectID;
        this.solutionID = this.loadSummaryLoads.SolutionID;
        this._solutionService.GetSolutionSummary(this.projectID, this.solutionID).subscribe((solutionSummaryDetails) => {
            this.solutionSummary = solutionSummaryDetails as SolutionSummary;

            this.loadSummaryLoads = this.solutionSummary.LoadSummaryLoads as LoadSummaryLoads;
            this.loadSummaryLoads.ProjectID = this.projectID;
            this.loadSummaryLoads.SolutionID = this.solutionID;
            this.UpdateSolutionSummary.emit(this.solutionSummary);
            this.loading = false;
        });
    }

    UpdateLoadSequence(loadSequence: LoadSequence): void {
        this.loading = true;
        var request = new LoadSequenceRequest();
        request.ProjectID = this.loadSummaryLoads.ProjectID;
        request.SolutionID = this.loadSummaryLoads.SolutionID;
        request.LoadFamilyID = loadSequence.LoadFamilyID;
        request.SolutionLoadID = loadSequence.SolutionLoadID;
        request.LoadSequenceID = loadSequence.SequenceID;

        this._solutionService.UpdateLoadSequence(request).subscribe((result) => {
            if (result == true) {
                this.LoadSummaryLoadsDetail(this.loadSummaryLoads.ProjectID, this.loadSummaryLoads.SolutionID);
            }
            this.loading = false;
        })

    }

    UpdateLoadSequenceShedDetail(load: LoadSummaryLoadList): void {
        this.loading = true;
        var loadSequenceShed = { SequenceID: load.SequenceID, SolutionID: this.loadSummaryLoads.SolutionID, Shed: load.LoadSequenceSummary.Shed };
        this._solutionService.UpdateLoadSequenceShedDetail(loadSequenceShed).subscribe((result) => {
            if (result == true) {
                this.SolutionSummaryDetails(this.loadSummaryLoads.ProjectID, this.loadSummaryLoads.SolutionID);
            }
        })
    }

    DeleteSolutionLoad(event: any, solutionID: number, solutionLoadID: number, loadFamilyID: number): void {
        event.stopPropagation();

        let disposable = this.dialogService.addDialog(ConfirmComponent, {
            title: 'Confirm',
            message: 'Are you sure, you want to delete this Load?'
        }, { closeByClickingOutside: true, backdropColor: 'rgba(0, 0, 0, 0.5)' })
            .subscribe((isConfirmed) => {
                //We get dialog result
                if (isConfirmed) {
                    this._solutionService.DeleteSolutionLoad(solutionID, solutionLoadID, loadFamilyID).subscribe((result) => {
                        this.LoadSummaryLoadsDetail(this.loadSummaryLoads.ProjectID, this.loadSummaryLoads.SolutionID);
                    });
                }
            });
        //We can close dialog calling disposable.unsubscribe();
        //If dialog was not closed manually close it by timeout
        setTimeout(() => {
            disposable.unsubscribe();
        }, 10000);
    }
}
