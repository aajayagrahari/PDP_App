import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { userService } from '../Services/user.service';
import { projectService } from '../Services/project.services';
import { solutionService } from '../Services/solution.services';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmComponent } from '../confirm/confirm.component';
import { Router, ActivatedRoute, NavigationCancel } from '@angular/router';
import { SolutionDetail } from '../_models/solutionSummary.model';
import { TranslateService } from '@ngx-translate/core';
import { ReportModel } from '../_models/report.model'
import { HarmonicAnalysisInputs, HarmonicAnalysis } from '../_models/analysisReport.model';
import { HarmonicAnalysisComponent } from '../harmonicAnalysis/harmonicAnalysis.component';
import { UtilityService } from '../Services/utility.service';
import * as Chart from 'chart.js';
import { saveAs } from 'file-saver';

@Component({
    selector: 'pdpsolutionheader',
    providers: [userService],
    templateUrl: './solutionheader.component.html',
    styleUrls: ['./solutionheader.component.css']
})
export class SolutionHeaderComponent implements OnInit {
    @Input() solutionDetail: SolutionDetail;
    public loading: boolean = false;
    public chart: any = [];
    public HarmonicAnalysisInputs: HarmonicAnalysisInputs;
    public HarmonicAnalysis = new HarmonicAnalysis();
    @Output() updatedSolution = new EventEmitter<any>();
    @Output() pdfDownloadError = new EventEmitter<any>();
    public showNotesRequiredError: boolean = false;
    public showadderror: boolean = false;
    @ViewChild('closemodal') closemodal: ElementRef;
    public harmonicAnalysis: HarmonicAnalysisComponent;
    protected reportModel = new ReportModel();
    constructor(private _route: Router, private _project: projectService,
        private _activatedRoute: ActivatedRoute, private dialogService: DialogService, private translate: TranslateService, private _solutionService: solutionService, public utility: UtilityService){
         
    }
    isSolutionAvailable(): boolean { 
        return this.solutionDetail.IsSolutionAvailable;
    }
    ngOnInit() {
    }
    getChartData() {
        if (this.harmonicAnalysis.noSolution || this.harmonicAnalysis.noLoads)
            return;      
        this.harmonicAnalysis.calculateCharData();
        var yMax = (Math.ceil(this.harmonicAnalysis.findMax(this.harmonicAnalysis.chartData) / 100) * 100) + 100;

        const xTickOptions: Chart.LinearTickOptions = {
            min: 0,
            max: 720,
            stepSize: 90,
            beginAtZero: true
        }

        const yTickOptions: Chart.LinearTickOptions = {
            stepSize: 100,
            max: yMax,
            min: -yMax
        }

        this.chart = new Chart('canvas', {
            type: 'line',
            data: {
                datasets: [
                    {
                        backgroundColor: '#008000',
                        borderColor: '#008000',
                        data: this.harmonicAnalysis.chartData,
                        fill: false
                    }
                ]
            },
            options: {
                elements: { point: { radius: 0 } },
                responsive: true,
                legend: {
                    display: false
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    xAxes: [{
                        type: 'linear',
                        display: true,
                        ticks: xTickOptions
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Volts',
                            fontStyle: 'bold',
                            fontSize: 14
                        },
                        ticks: yTickOptions
                    }],
                }
            }
        });
    }
    EditSolution(): void {
        this._route.navigate(["/project", this.solutionDetail.ProjectID, "solutionsetup", this.solutionDetail.SolutionID]);
    } 
 
 CreateImage(): string {
     let canvas = document.getElementById('canvas') as HTMLCanvasElement; 
     var imageData = canvas.toDataURL();
     return imageData;
 }
    DownloadReport(event: any): void { 
        event.stopPropagation();
        this.loading = true;
         this.harmonicAnalysis = new HarmonicAnalysisComponent(this._project, this._solutionService, this._activatedRoute);
         this.harmonicAnalysis.solutionDetail = this.solutionDetail;
         this.reportModel.ProjectId = this.solutionDetail.ProjectID;
         this.reportModel.SolutionId = this.solutionDetail.SolutionID;  
         this.harmonicAnalysis.loadHarmonicAnalysis();
         var reportDownLoadTime = 4000;
         setTimeout(() => {            
             this.reportModel.LanguageCode = this.utility.userBrowserLocale;
             if (this.harmonicAnalysis.HarmonicAnalysisInputs == null || this.harmonicAnalysis.HarmonicAnalysisInputs == undefined)
             { 
                 setTimeout(() =>
                 {
                     this.reportModel.HarmonicAnalysis = this.harmonicAnalysis.HarmonicAnalysis;
                     reportDownLoadTime = 6000;
                     this.getChartData()
                     setTimeout(() => this.reportModel.HarmicAnalysisImageUrl = this.CreateImage(), 3000)
                 }, 2000);
             } else
             {
                 this.reportModel.HarmonicAnalysis = this.harmonicAnalysis.HarmonicAnalysis;
                 this.getChartData();
                 setTimeout(() => this.reportModel.HarmicAnalysisImageUrl = this.CreateImage(), 3000);
             }
             
             setTimeout(() => {
                 this._solutionService.DownloadReportInPDF(this.reportModel).subscribe(res => {
                     this.loading = false;
                     if (res.ErrorCode != undefined && res.ErrorCode == -1)
                     {
                         this.pdfDownloadError.emit(false);
                         return;
                     }
                     var responseContent = res;
                     var blob = new Blob([responseContent], { type: "application/pdf" });
                     var url = window.URL.createObjectURL(blob);
                     var linkElement = document.createElement('a');
                     linkElement.setAttribute('href', url);
                     linkElement.setAttribute("download", this.solutionDetail.SolutionName + "_SolutionSummary.PDF");
                     var clickEvent = new MouseEvent("click", {
                         "view": window,
                         "bubbles": true,
                         "cancelable": false
                     });
                     linkElement.dispatchEvent(clickEvent);
                 }, (err) => console.log(err),
                     () => console.log("Done")
                 )
             }, reportDownLoadTime);
         }, 4000);
    }
    CopySolution(): void {
        var solutionRequestDto = { "ProjectID": this.solutionDetail.ProjectID, "SolutionID": this.solutionDetail.SolutionID };
        this._project.copySolution(solutionRequestDto).subscribe((result) => {
            this._route.navigate(['/project', result.ProjectId, 'solution', result.SolutionId]);
        });
    }

    GrantEditAccess(): void {
        if (!this.solutionDetail.Notes) {
            this.showadderror = true;
            this.showNotesRequiredError = true;
            return;
        }
        var solutionRequestDto = { "ProjectID": this.solutionDetail.ProjectID, "SolutionID": this.solutionDetail.SolutionID, "Notes": this.solutionDetail.Notes };
        this._project.grantEditAccess(solutionRequestDto).subscribe((result) => {
            this.closemodal.nativeElement.click();
            this.solutionDetail.ShowGrantAccess = false;
            this.solutionDetail.IsReadOnlyAccess = true;
            this.updatedSolution.emit(this.solutionDetail);
        });
    }

    public HideAlert(): void {
        this.showadderror = false;
        this.showNotesRequiredError = true;
    }

    DeleteSolution(event: any, solutionId: number): void {
        event.stopPropagation();
        var alertMessage = "";
        var confirmTitle = "";
        this.translate.get('warning.SolutionDeleteAlert').subscribe(x => alertMessage = x);
        this.translate.get('Confirm').subscribe(x => confirmTitle = x);
        let disposable = this.dialogService.addDialog(ConfirmComponent, {
            title: confirmTitle,
            message: alertMessage
        }, { closeByClickingOutside: true, backdropColor: 'rgba(0, 0, 0, 0.5)' })
            .subscribe((isConfirmed) => {
                //We get dialog result
                if (isConfirmed) {
                    this._project.deleteSolution(this.solutionDetail.ProjectID, this.solutionDetail.SolutionID).subscribe((result) => {
                        this._route.navigate(['/project', this.solutionDetail.ProjectID]);
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
