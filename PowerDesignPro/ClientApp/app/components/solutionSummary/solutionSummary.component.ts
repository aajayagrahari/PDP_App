import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SolutionSummary, SolutionLimits, LoadSummaryLoads, SolutionSummaryLoadSummary, SolutionSummaryRecommendedProduct, RecommendedProductRequestDto, SolutionDetail, RequestForQuote, VDipFDip, IProductRecommendation } from '../_models/solutionSummary.model';
import { ProjectDetails } from '../_models/project.model';
import { projectService } from '../Services/project.services';
import { solutionService } from '../Services/solution.services';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';
import { GasPipingComponent } from '../gasPiping/gasPiping.component'
import { ExhaustPipingComponent } from '../exhaustPiping/exhaustPiping.component'
import { TransientAnalysisComponent } from '../transientAnalysis/transientAnalysis.component';
import { HarmonicAnalysisComponent } from '../harmonicAnalysis/harmonicAnalysis.component';
import { ModalComponent } from '../modal/modal.component';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from '../Services/utility.service';

@Component({
    selector: 'solutionSummary',
    templateUrl: './solutionSummary.component.html',
    styleUrls: ['./solutionSummary.component.css']
})

export class SolutionSummaryComponent implements OnInit {
    public solutionSummary = new SolutionSummary();
    public solutionDetail = new SolutionDetail();
    public loadSummaryLoads = new LoadSummaryLoads();
    public vDipFDipRecommendedProduct = new VDipFDip();
    public solutionID: number;
    public projectID: number;
    public projectDetails = new ProjectDetails();
    public solutionLimits = new SolutionLimits();
    private recommendedProductRequestDto = new RecommendedProductRequestDto();
    public solutionSummaryLoadSummary = new SolutionSummaryLoadSummary();
    public solutionSummaryRecommendedProductDetails = new SolutionSummaryRecommendedProduct();
    public loading: boolean = false;
    public revertToDiesel = false;

    //Color variables
    public runningKWError: boolean = false;
    public peakKWError: boolean = false;
    public fDipError: boolean = false;
    public vDipError: boolean = false;
    public thvdContError: boolean = false;
    public thvdPeakError: boolean = false;
    public selectedTab = 1;
    public isReadOnlyAccess = false;
    public requestForQuote = new RequestForQuote();
    public showCommentsRequiredError: boolean = false;
    public requestForQuoteSuccess: boolean = false;
    public showRequestQuoteError: boolean = false;
    public isPDFDownloaded: boolean = true;

    @ViewChild('loads') loads: ElementRef;
    @ViewChild('gasPiping') gasPiping: GasPipingComponent;
    @ViewChild('exhaustPiping') exhaustPiping: ExhaustPipingComponent;
    @ViewChild('transientAnalysis') transientAnalysis: TransientAnalysisComponent;
    @ViewChild('harmonicAnalysis') harmonicAnalysis: HarmonicAnalysisComponent;
    @ViewChild('requestForQuoteModal') requestForQuoteModal: ModalComponent;

    constructor(
        protected _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _projectService: projectService,
        private _solutionService: solutionService,
        private translate: TranslateService,
        private utilityService: UtilityService) {
    }

    ngOnInit(): void {
        this._activatedRoute.params.subscribe((params: Params) => {
            this.loading = true;
            this.projectID = params['projectId'];
            this.solutionID = params['solutionId'];

            this._projectService.getprojectByID(this.projectID).subscribe((projectDetails) => {
                this.projectDetails = projectDetails as ProjectDetails;
                this._solutionService.GetSolutionHeaderDetails(this.projectID, this.solutionID).subscribe((solutionHeaderDetails) => {
                    //this.solutionDetail = {};                    
                    this.solutionDetail.SolutionID = solutionHeaderDetails.SolutionID;
                    this.solutionDetail.SolutionName = solutionHeaderDetails.SolutionName;
                    this.solutionDetail.ProjectID = this.projectID;
                    this.solutionDetail.IsReadOnlyAccess = solutionHeaderDetails.IsReadOnlyAccess;
                    this.solutionDetail.ShowGrantAccess = solutionHeaderDetails.ShowGrantAccess;
                    this.isReadOnlyAccess = this.solutionDetail.IsReadOnlyAccess;
                    
                })
            });

            this.getSolutionSummary();
        });
    }

    getSolutionSummary(revertToDiesel?: boolean): void {
        this._solutionService.GetSolutionSummary(this.projectID, this.solutionID).subscribe((solutionSummary) => {
            debugger;
            this.solutionDetail.IsSolutionAvailable = (solutionSummary.SolutionSummaryRecommendedProductDetails.GeneratorID == null || solutionSummary.SolutionSummaryRecommendedProductDetails.AlternatorID == null ? false : true);
            this.UpdateSolutionSummary(solutionSummary);
            this.solutionLimits = this.solutionSummary.SolutionLimits;
            this.getRecommendedProductVDipFDip();
            this.colorSolution();
            this.loading = false;
        });
    }
    

    public processRequestForQuote(): void {
        this.requestForQuote.AlternatorDescription = "";
        this.requestForQuote.GeneratorDescription = "";
        var description1: IProductRecommendation = {};
        var description2: IProductRecommendation = {};
        this.requestForQuoteSuccess = false;
        this.showRequestQuoteError = false;
        if (!this.requestForQuote.Comments) {
            this.showCommentsRequiredError = true;
            return;
        }
        //call the api
        this.loading = true;
        this.requestForQuote.ProjectID = this.projectID;
        this.requestForQuote.SolutionID = this.solutionID;
        this.requestForQuote.Language = this.utilityService.userBrowserLocale;

        var description1List = this.solutionSummaryRecommendedProductDetails.Description.split('|');
        var description2List = this.solutionSummaryRecommendedProductDetails.DescriptionPartwo.split('|');

        this.translate.get(description1List).subscribe(x => description1 = x);
        this.translate.get(description2List).subscribe(x => description2 = x);

        for (let key in description1) {
            if (description1 != undefined && description1.hasOwnProperty(key))
                this.requestForQuote.GeneratorDescription += description1[key];
        }

        for (let key in description2) {
            if (description2 != undefined && description2.hasOwnProperty(key))
                this.requestForQuote.AlternatorDescription += description2[key];
        }

        this._solutionService.RequestForQuote(this.requestForQuote).subscribe((requestForQuoteID) => {
            if (requestForQuoteID.ErrorCode != undefined) {
                this.requestForQuoteSuccess = false;
                this.showRequestQuoteError = true;
            }
            else {
                this.requestForQuoteSuccess = true;
                this.showRequestQuoteError = false;
            }
            this.loading = false;
        });
        this.requestForQuoteModal.hide();
    }

    //callExhaustPiping(): void {
    //    this.exhaustPiping.loadExhaustPiping(true);
    //}

    //getExhaustPipingReport(getReport: boolean) {
    //    this._router.navigate(['/project', this.projectID, 'solution', this.solutionID, 'exhaustPipingReport']);
    //}

    //callGasPiping(): void {
    //    this.gasPiping.loadGasPiping(true);
    //}

    //getGasPipingReport(getReport: boolean) {
    //    this._router.navigate(['/project', this.projectID, 'solution', this.solutionID, 'gasPipingReport']);
    //}

    colorSolution(): void {
        var solSummary = this.solutionSummary;
        if (solSummary.SolutionSummaryRecommendedProductDetails != undefined)
        {
            this.runningKWError = solSummary.SolutionSummaryRecommendedProductDetails.RunningKW > solSummary.SolutionLimits.MaxLoading;
            this.peakKWError = solSummary.SolutionSummaryRecommendedProductDetails.PeakKW > 100;
            this.fDipError = solSummary.SolutionSummaryRecommendedProductDetails.FDip > +solSummary.SolutionLimits.FDip;
            this.thvdContError = +(solSummary.SolutionSummaryRecommendedProductDetails.THVDContinuous.split(' %')[0]) > +(solSummary.SolutionLimits.THVDContinuous.split(' %')[0]);
            this.thvdPeakError = +(solSummary.SolutionSummaryRecommendedProductDetails.THVDPeak.split(' %')[0]) > +(solSummary.SolutionLimits.THVDPeak.split(' %')[0]);

            var minVoltageDip = solSummary.SolutionSummaryRecommendedProductDetails.VDip;
            for (let loadSummaryLoad of solSummary.LoadSummaryLoads.ListOfLoadSummaryLoadList) {
                for (let loadSequence of loadSummaryLoad.LoadSequenceList) {
                    if (+loadSequence.LimitsVdip < minVoltageDip && !loadSummaryLoad.LoadSequenceSummary.Shed)
                        minVoltageDip = + loadSequence.LimitsVdip;
                }
            }

            this.vDipError = solSummary.SolutionSummaryRecommendedProductDetails.VDip > minVoltageDip;
        }
    }

    public getStyle(error: boolean): object {
        if (error) {
            return { color: 'white', 'background-color': 'red' };
        }
        else {
            return { color: 'black', 'background-color': 'white' };
        }
    }

    updatedProjectDetails(projectDetail: ProjectDetails): void {
        this.projectDetails = projectDetail
    }

    updatedSolution(solutionDetail: SolutionDetail): void {
        this.solutionDetail = solutionDetail;
        this.isReadOnlyAccess = solutionDetail.IsReadOnlyAccess;
    }

    pdfDownloadError(isPDFDownloaded: boolean): void {
        this.isPDFDownloaded = false;
    }

    /**
     * Emitted Event when LoadSequence got updated 
     * @param solutionLoadSummary
     */
    UpdateSolutionSummaryLoadSummary(solutionLoadSummary: SolutionSummaryLoadSummary): void {
        this.solutionSummaryLoadSummary = solutionLoadSummary;
        this.colorSolution();
    }

    /**
     * Emitted event when the Load Shed got updated
     * @param solutionSummary
     */
    UpdateSolutionSummary(solutionSummary: SolutionSummary): void {
        this.solutionSummary = solutionSummary as SolutionSummary;
        this.loadSummaryLoads = this.solutionSummary.LoadSummaryLoads as LoadSummaryLoads;
        if (this.loadSummaryLoads != undefined) {
            this.loadSummaryLoads.SolutionID = this.solutionID;
            this.loadSummaryLoads.ProjectID = this.projectID;
            this.solutionSummaryRecommendedProductDetails = this.solutionSummary.SolutionSummaryRecommendedProductDetails;

            this.UpdateSolutionSummaryLoadSummary(this.solutionSummary.LoadSummaryLoads.SolutionSummaryLoadSummary);
        }
    }

    updateRecommendedProductDetails(generatorID: number | null, alternatorID: number | null): void {
        this.recommendedProductRequestDto = {
            FamilySelectionMethodID: this.solutionSummaryRecommendedProductDetails.FamilySelectionMethodID,
            ProductFamilyID: this.solutionSummaryRecommendedProductDetails.ProductFamilyID,
            ParallelQuantityID: this.solutionSummaryRecommendedProductDetails.ParallelQuantityID,
            SizingMethodID: this.solutionSummaryRecommendedProductDetails.SizingMethodID,
            GeneratorID: generatorID,
            AlternatorID: alternatorID,
            SolutionID: this.solutionID,
            ProjectID: this.projectID,
            Brand: ""
        };

        this.loading = true;
        this._solutionService.updateRecommendedProductDetails(this.recommendedProductRequestDto).subscribe((recommendedProduct) => {
            this.solutionSummary.SolutionSummaryRecommendedProductDetails = recommendedProduct;
            this.solutionSummaryRecommendedProductDetails = recommendedProduct;
            this.getRecommendedProductVDipFDip();
            this.colorSolution();
            this.loading = false;
            if (this.selectedTab != 0) {
                this.loadSelectedTab(this.selectedTab);
            }
        });

    }

    updateFuelTypeForSolution(dieselProduct: number): void {
        var updateFuelTypeForSolutionRequestDto = { ProjectID: this.projectID, SolutionID: this.solutionID, DieselProduct: dieselProduct == 0 ? false : true };
        this.loading = true;
        this._solutionService.updateFuelTypeForSolution(updateFuelTypeForSolutionRequestDto).subscribe((isUpdated) => {
            if (isUpdated) {
                this.revertToDiesel = dieselProduct == 0 ? true : false;
                this.getSolutionSummary();
            }
        });
    }

    getRecommendedProductVDipFDip(): void {
        this.vDipFDipRecommendedProduct = {
            VDip: this.solutionSummaryRecommendedProductDetails.VDip,
            FDip: this.solutionSummaryRecommendedProductDetails.FDip
        }
    }

    loadSelectedTab(event: any) {
        this.selectedTab = event;
        switch (event) {
            case 2:
                this.gasPiping.loadGasPiping();
                break;
            case 3:
                this.exhaustPiping.loadExhaustPiping();
                break;
            case 4:
                this.transientAnalysis.loadTransientAnalysis();
                break;
            case 5:
                var solutionAvailable: boolean = this.harmonicAnalysis.loadHarmonicAnalysis();
                    setTimeout(() => {
                        this.harmonicAnalysis.getChartData();
                    }, 2000)
                break;
            default:
                break;
        }
    }

    public HideError(): void {
        this.showCommentsRequiredError = false;
    }
}
