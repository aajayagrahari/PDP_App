import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { solutionService } from '../Services/solution.services';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';
import { GasPiping, GasPipingInput, GasPipingSolution, GasPipingPipeSize, SolutionDetail } from '../_models/solutionSummary.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'gasPiping',
    templateUrl: './gasPiping.component.html'
})

export class GasPipingComponent implements OnInit {

    public GasPiping: GasPiping;
    public GasPipingInput: GasPipingInput;
    public GasPipingSolution: GasPipingSolution;
    public AllowablePercentage: number;
    public error: string = "";
    public isGaseousProduct: boolean = true;
    @Input() solutionDetail: SolutionDetail;
    @Input() readOnlyAccess: boolean;
    //@Output() getGasPipingReport: EventEmitter<boolean> = new EventEmitter();
    constructor(
        protected _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _solutionService: solutionService, private translate: TranslateService) {
    }

    ngOnInit(): void { 
        //throw new Error("Method not implemented.");
    }

    loadGasPiping() {
        this._solutionService.GetGasPipingDetails(this.solutionDetail.ProjectID, this.solutionDetail.SolutionID).subscribe((gasPipingDetails) => {
            if (gasPipingDetails == null)
                return;            
            if (!gasPipingDetails.IsGasesousSolution) {
                this.isGaseousProduct = false;
                return;
            }
            this.isGaseousProduct = true;
            this.GasPiping = gasPipingDetails as GasPiping;
            this.AllowablePercentage = +(this.GasPiping.GasPipingSolution.AllowablePercentage * 100).toFixed(2);
            this.GasPipingInput = this.GasPiping.GasPipingInput;
            this.GasPipingSolution = this.GasPiping.GasPipingSolution;
            this.displayError();
            this.subscribeToLangChanged();
            //this.validateGasPiping();
        });
    }
    subscribeToLangChanged() {
        // refresh text
        // please unsubribe during destroy
        return this.translate.onLangChange.subscribe(() => this.displayError());
    }

    displayError(): void {
        this.error = "";
        if (!this.GasPiping.GasPipingSolution.SolutionFound) {
            this.translate.get("warning.NoSolutionFound").subscribe(x => this.error = x);
        } else {
            var generatorMinPressureEnglish = +this.GeneratorMinPressureEnglish();
            var availablePressureEnglish = +this.AvailablePressureEnglish();
            if (availablePressureEnglish < generatorMinPressureEnglish && this.GasPiping.SizingMethodID == 4) {
                this.translate.get("warning.WarningIncreasePipeSize").subscribe(x => this.error = x + this.GasPipingInput.GeneratorMinPressure);
            } else if (availablePressureEnglish < generatorMinPressureEnglish) {
                this.translate.get("warning.WarningSupplyGasPressure").subscribe(x => this.error = x);
            } else if (this.overServicePressure()) {
                this.translate.get("warning.RecommendIncreasingPipeSize").subscribe(x => this.error = x);
            }
        }
    }

    updateGasPiping() {
        this.updateGasPipingSolution();        
    }

    updateGasPipingSolution() {
        var gasPipingRequest = {
            "GasPiping": this.GasPiping,
            "SolutionID": this.solutionDetail.SolutionID
        };

        this._solutionService.PostGasPipingSolutionDetail(gasPipingRequest).subscribe((result) => {
            if (result.ErrorCode != null || result.ErrorCode != undefined) {
                //this.GasPiping.ID = 0;
            }
            else {
                this.GasPiping = result;
                this.AllowablePercentage = +(this.GasPiping.GasPipingSolution.AllowablePercentage * 100).toFixed(2);
                this.GasPipingInput = this.GasPiping.GasPipingInput;
                this.GasPipingSolution = this.GasPiping.GasPipingSolution;
            }
            this.displayError();
        });
    }

    private overServicePressure(): boolean {
        return this.GasPipingSolution.PressureDrop > ((this.ServicePressureEnglish() - this.GeneratorMinPressureEnglish()) / 2)
    }

    private GeneratorMinPressureEnglish(): number {
        if (this.GasPiping.UnitSelected == 2) {
            return this.GasPipingInput.GeneratorMinPressure / 0.2491;
        } else {
            return this.GasPipingInput.GeneratorMinPressure
        }
    }

    private ServicePressureEnglish(): number {
        if (this.GasPiping.UnitSelected == 2) {
            return this.GasPipingInput.SupplyGasPressure / 0.2491;
        } else {
            return this.GasPipingInput.SupplyGasPressure
        }
    }

    private AvailablePressureEnglish(): number {
        if (this.GasPiping.UnitSelected == 2) {
            return this.GasPipingSolution.AvailablePressure / 0.2491;
        } else {
            return this.GasPipingSolution.AvailablePressure
        }
    }

    //calculateTolerences() {
    //    var lengthFeet = this.GasPiping.GasPipingInput.LengthOfRun;
    //    switch (this.GasPiping.UnitSelected) {
    //        case 2:
    //            lengthFeet = lengthFeet * 3.2808;
    //            break;
    //        default:
    //            break;
    //    }

    //    var pressureDrop = this.CalculateFuelPipePressureDrop(lengthFeet);
    //    var percentAllowable = +this.CalculatePercentAllowable(pressureDrop).toFixed(2);
    //    var availablePressure = this.ServicePressureEnglish() - pressureDrop;

    //    //this.GasPipingSolution.PressureDrop = +pressureDrop.toFixed(2);
    //    //this.GasPipingSolution.AllowablePercantage = +percentAllowable.toFixed(2);
    //    //this.GasPipingSolution.AvailablePressure = +availablePressure.toFixed(2);
    //}

    //updateSingleUnit() {
    //    if (!this.GasPiping.SingleUnit) {
    //        this.GasPiping.GeneratorSummary.FuelConsumption = +this.GasPiping.GeneratorSummary.FuelConsumption * 2;
    //    }
    //    this.displayError();
    //}

    //private validateGasPiping() {

    //    var solutionFound = false;
    //    switch (+this.GasPiping.SizingMethodID) {
    //        case 1:
    //            solutionFound = this.findPipeSizePressureDrop();
    //            break;
    //        case 2:
    //            solutionFound = this.findPipeSizePercent(0.33);
    //            break;
    //        case 3:
    //            solutionFound = this.findPipeSizePercent(0.5);
    //            break;
    //        case 4:
    //            solutionFound = (this.GasPipingSolution.AvailablePressure > 0);
    //            break;
    //        default:
    //            break;
    //    }

    //    if (!solutionFound) {
    //        this.translate.get("warning.NoSolutionFound").subscribe(x => this.error = x);
    //    } else {
    //        var generatorMinPressureEnglish = this.GeneratorMinPressureEnglish();
    //        if (this.GasPipingSolution.AvailablePressure < generatorMinPressureEnglish && this.GasPiping.SizingMethodID == 4) {
    //            this.translate.get("warning.WarningIncreasePipeSize").subscribe(x => this.error = x + this.GeneratorMinPressureEnglish());
    //        } else if (this.GasPipingSolution.AvailablePressure < generatorMinPressureEnglish) {
    //            this.translate.get("warning.WarningSupplyGasPressure").subscribe(x => this.error = x);
    //        } else if (this.overServicePressure()) {
    //            this.translate.get("warning.RecommendIncreasingPipeSize").subscribe(x => this.error = x);
    //        }
    //    }

    //    this.GasPipingSolution.PressureDrop = +this.GasPipingSolution.PressureDrop.toFixed(2);
    //    this.GasPipingSolution.AllowablePercentage = +(this.GasPipingSolution.AllowablePercentage).toFixed(2);
    //    this.GasPipingSolution.AvailablePressure = +this.GasPipingSolution.AvailablePressure.toFixed(2);
    //}



    //private findPipeSizePressureDrop(): boolean {
    //    this.GasPiping.PipeSizeID = this.GasPiping.PipeSizeList[0].ID;
    //    this.calculateTolerences();
    //    var outOfSize = false;
    //    while (this.GasPipingSolution.PressureDrop >= 0.5 && outOfSize == false) {
    //        outOfSize = !this.increasePipeSize();
    //        this.calculateTolerences();
    //    }

    //    return (this.GasPipingSolution.PressureDrop < 0.5);
    //}

    //private findPipeSizePercent(minAllowable: number): boolean {
    //    this.GasPiping.PipeSizeID = this.GasPiping.PipeSizeList[0].ID;
    //    this.calculateTolerences();
    //    var outOfSize = false;
    //    while (this.GasPipingSolution.AllowablePercentage >= minAllowable && outOfSize == false) {
    //        outOfSize = !this.increasePipeSize();
    //        this.calculateTolerences();
    //    }

    //    return (this.GasPipingSolution.AllowablePercentage < minAllowable);
    //}

    //private increasePipeSize(): boolean {
    //    var pipeSizeList = this.GasPiping.PipeSizeList as GasPipingPipeSize[]
    //    var selectedPipe = pipeSizeList.find(x => x.ID == this.GasPiping.PipeSizeID);
    //    if (selectedPipe != undefined) {
    //        var currentIndex = this.GasPiping.PipeSizeList.indexOf(selectedPipe);
    //        if (currentIndex == -1 || currentIndex == this.GasPiping.PipeSizeList.length - 1) {
    //            return false;
    //        }
    //        this.GasPiping.PipeSizeID = this.GasPiping.PipeSizeList[currentIndex + 1].ID;
    //    }

    //    return true;
    //}

    //private CalculateFuelPipePressureDrop(lengthFeet: number): number {
    //    var pipeSizeList = this.GasPiping.PipeSizeList as GasPipingPipeSize[]
    //    var pipe = pipeSizeList.find(x => x.ID == this.GasPiping.PipeSizeID);

    //    if (pipe != undefined) {
    //        var corrFactor = 0.00354 * +this.GasPiping.FuelConfig.SP_GR * +this.GasPiping.TempRank
    //            * (Math.pow((+this.GasPiping.FuelConfig.Viscosity / +this.GasPiping.FuelConfig.SP_GR), 0.152));

    //        var pipeEqLen = +lengthFeet + (+this.GasPipingInput.NumberOf90Elbows * +pipe.Factor90)
    //            + (+this.GasPipingInput.NumberOf45Elbows * pipe.Factor45)
    //            + ((+this.GasPipingInput.NumberOfTees * pipe.Tee));

    //        var gasFlow = this.GasPiping.GeneratorSummary.GasFuelFlow;
    //        var pressureDrop = corrFactor * pipeEqLen * Math.pow((gasFlow / (2313 * Math.pow(pipe.Diameter, 2.623))), 1 / 0.541);

    //        return pressureDrop;
    //    }

    //    return 0;
    //}

    //private CalculatePercentAllowable(pressureDrop: number): number {
    //    var baseSupply = this.ServicePressureEnglish() - this.GeneratorMinPressureEnglish();
    //    if (baseSupply == 0) {
    //        return 0;
    //    } else {
    //        return pressureDrop / baseSupply;
    //    }
    //}
}