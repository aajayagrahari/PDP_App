import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { solutionService } from '../Services/solution.services';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';
import { ExhaustPiping, ExhaustPipingInput, ExhaustPipingSolution, ExhaustPipingRequest, ExhaustPipingGeneratorSummary, SolutionDetail } from '../_models/solutionSummary.model';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { UtilityService } from '../Services/utility.service';
import { TranslateService } from '@ngx-translate/core';
import { BasePickList } from '../_models/load.model';

@Component({
    selector: 'exhaustPiping',
    templateUrl: './exhaustPiping.component.html'
})

export class ExhaustPipingComponent implements OnInit {
    lang$: Observable<string>;
    public ExhaustPiping: ExhaustPiping;
    public ExhaustPipingInput: ExhaustPipingInput;
    public ExhaustPipingSolution: ExhaustPipingSolution;
    public ExhaustPipingGeneratorSummary: ExhaustPipingGeneratorSummary;
    @Input() solutionDetail: SolutionDetail;
    @Input() readOnlyAccess: boolean;
    private exhaustPipingRequest = new ExhaustPipingRequest();
    private pressureDrop: number;
    private pipeDiameter: number;
    private originalTotalExhaustFlow: number;
    private MaximumBackPressure: number;
    public FilteredPipeSizeList: BasePickList[];
    public ShowPressureDropError: boolean = false;
    //@Output() getExhaustPipingReport: EventEmitter<boolean> = new EventEmitter();

    constructor(
        protected _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _solutionService: solutionService, private readonly translate: TranslateService, public utility: UtilityService, private readonly store: Store<string>) {
        this.translate.setDefaultLang(utility.userBrowserLocale);
        this.lang$ = this.store.select(() => utility.userBrowserLocale);
    }

    ngOnInit(): void {
        this.lang$.subscribe(lang => this.translate.use(lang));
    }

    loadExhaustPiping() {
        this._solutionService.GetExhaustPipingDetails(this.solutionDetail.ProjectID, this.solutionDetail.SolutionID).subscribe((exhaustPipingDetails) => {
            this.ExhaustPiping = exhaustPipingDetails;
            if (this.ExhaustPiping != null) {
                this.ExhaustPipingInput = this.ExhaustPiping.ExhaustPipingInput;
                this.ExhaustPipingGeneratorSummary = this.ExhaustPiping.ExhaustPipingGeneratorSummary;
                this.ExhaustPipingSolution = this.ExhaustPiping.ExhaustPipingSolution;
                this.pressureDrop = this.ExhaustPipingSolution.PressureDrop;
                this.originalTotalExhaustFlow = this.ExhaustPiping.ExhaustPipingGeneratorSummary.TotalExhaustFlow;

                var smallestPipeSize = this.getSmallestPipeSize();
                this.FilteredPipeSizeList = this.ExhaustPiping.PipeSizeList.filter(p => +p.Value >= smallestPipeSize);
                this.exhaustSystemConfigurationChanged();
            }
        });
    }

    private getSmallestPipeSize(): number {
        var pipeSize = 0;
        for (var i = 0; i < this.ExhaustPiping.PipeSizeList.length; i++) {
            pipeSize = +this.ExhaustPiping.PipeSizeList[i].Value;
            if (this.ExhaustPiping.UnitSelected == 2) { // metric
                pipeSize = +((pipeSize / 25.4).toFixed(1));
            }
            if (pipeSize >= +this.ExhaustPipingGeneratorSummary.ExhaustFlex)
                return pipeSize;
        }
        return pipeSize;
    }

    public exhaustSystemConfigurationChanged() {
        var exhaustSystemConfiguration = this.ExhaustPiping.ExhaustSystemConfigurationList.find(x => x.ID == this.ExhaustPiping.ExhaustSystemConfigurationID);

        if (exhaustSystemConfiguration != undefined) {
            var exhaustSystemConfigurationValue = exhaustSystemConfiguration.Value.toLowerCase();

            if (exhaustSystemConfigurationValue == "dual")
                this.ExhaustPiping.ExhaustPipingGeneratorSummary.TotalExhaustFlow /= 2;
            else
                this.ExhaustPiping.ExhaustPipingGeneratorSummary.TotalExhaustFlow = +this.originalTotalExhaustFlow;
        }
        this.calculateExhaustPipingSolution();
    }

    public calculateExhaustPipingSolution() {
        var sizingMethod = this.ExhaustPiping.SizingMethodList.find(s => s.ID == this.ExhaustPiping.SizingMethodID);

        if (sizingMethod != undefined) {
            var sizingMethodText = sizingMethod.Value.toLowerCase();
            if (sizingMethodText == "auto") {
                this.pipeDiameter = this.getSmallestPipeSize();
                this.findPressureDrop();
                this.findBestDiameter();
            }
            else {
                var pipeSize = this.FilteredPipeSizeList.find(x => x.ID == this.ExhaustPiping.PipeSizeID);
                if (pipeSize != undefined) {
                    var pipeSizeValue = +pipeSize.Value;
                    this.pipeDiameter = pipeSizeValue;
                    this.findPressureDrop();
                }
            }
            this.ExhaustPipingSolution.PressureDrop = +this.pressureDrop.toFixed(2);

            if (+this.ExhaustPipingSolution.PressureDrop > +this.ExhaustPipingGeneratorSummary.MaximumBackPressure) {
                this.ShowPressureDropError = true;
            }
            else {
                this.ShowPressureDropError = false;
            }

            this.updateExhaustPipingSolution();
        }
    }

    private findPressureDrop() {
        var length: number = this.ExhaustPiping.ExhaustPipingInput.LengthOfRun
        switch (this.ExhaustPiping.UnitSelected) {
            case 2:
                length = length / 0.3048;
                this.pipeDiameter /= 25.4;
                break;
            default:
                break;
        }

        this.pressureDrop = this.calculateExhaustPipePressureDrop(length, this.ExhaustPipingInput, this.ExhaustPiping.ExhaustPipingGeneratorSummary);
    }

    private findBestDiameter() {
        var _isMaxPipeSize: boolean = false;
        var index = this.FilteredPipeSizeList.findIndex(x => +x.Value == this.pipeDiameter);

        if (index != -1) {
            this.ExhaustPiping.PipeSizeID = +this.FilteredPipeSizeList[index].ID;
        }

        while (this.pressureDrop > this.ExhaustPiping.ExhaustPipingGeneratorSummary.MaximumBackPressure && !_isMaxPipeSize) {
            _isMaxPipeSize = this.isMaxPipeSize();
            this.findPressureDrop();
        }
    }

    private isMaxPipeSize(): boolean {
        var index = this.FilteredPipeSizeList.findIndex(x => +x.Value == this.pipeDiameter);

        if (index == -1 || index == this.FilteredPipeSizeList.length - 1)
            return true;

        this.pipeDiameter = +this.FilteredPipeSizeList[index + 1].Value;
        this.ExhaustPiping.PipeSizeID = +this.FilteredPipeSizeList[index + 1].ID;
        return false;
    }

    private calculateExhaustPipePressureDrop(length: number, exhaustPipingInput: ExhaustPipingInput, exhaustPipingGeneratorSummary: ExhaustPipingGeneratorSummary): number {
        var stdElbowM: number = 3;
        var longElbowM: number = 2;
        var elbow45M: number = 1;
        var density: number = 39.6 / (exhaustPipingGeneratorSummary.ExhaustTempF + 460);
        var pipeEqLen: number = +length + this.pipeDiameter * ((exhaustPipingInput.NumberOfStandardElbows * stdElbowM)
            + (exhaustPipingInput.NumberOfLongElbows * longElbowM) + (exhaustPipingInput.NumberOf45Elbows * elbow45M));
        var pressureDrop: number = (1.3 * pipeEqLen * density * exhaustPipingGeneratorSummary.TotalExhaustFlow ** 2) / (187.0 * this.pipeDiameter ** 5)

        return pressureDrop;
    }

    updateExhaustPipingSolution() {
        this.exhaustPipingRequest = {
            ID: this.ExhaustPiping.ID,
            SizingMethodID: this.ExhaustPiping.SizingMethodID,
            PipeSizeID: this.ExhaustPiping.PipeSizeID,
            UnitID: this.ExhaustPiping.UnitSelected,
            SolutionID: this.solutionDetail.SolutionID,
            ExhaustSystemConfigurationID: this.ExhaustPiping.ExhaustSystemConfigurationID,
            ExhaustPipingInput: this.ExhaustPipingInput,
            ExhaustPipingSolution: this.ExhaustPipingSolution,
            ExhaustPipingGeneratorSummary: this.ExhaustPipingGeneratorSummary
        };

        this._solutionService.PostExhaustPipingSolutionDetail(this.exhaustPipingRequest).subscribe((result) => {
            if (result.ErrorCode != null || result.ErrorCode != undefined) {
                //this.ExhaustPiping.ID = 0;
            }
            else {
                this.ExhaustPiping.ID = result;
            }
        });
    }
}