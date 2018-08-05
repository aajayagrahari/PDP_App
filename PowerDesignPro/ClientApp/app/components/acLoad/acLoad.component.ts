import { Component, OnInit, Input } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';
import { ACLoad, ACLoadPickList } from '../_models/acLoad.model';
import { BasePickList } from '../_models/load.model';
import { LoadCharacteristics } from '../_models/loadCharacteristics.model';
import { LoadModel } from '../_models/load.model';
import { VoltageDipList, FrequencyDipList, VoltageNominalList, VoltageSpecificList } from '../_models/solutionSetup.model';
import { ProjectDetails } from '../_models/project.model';
import { solutionService } from '../Services/solution.services';
import { Router, ActivatedRoute, NavigationCancel } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from '../Services/utility.service';


@Component({
    selector: 'ac-load',
    templateUrl: './acLoad.component.html',
    styleUrls: ['./acLoad.component.css']
})

export class ACLoadComponent implements OnInit {

    public loading: boolean = false;
    @Input() selectedLoad: LoadModel;
    @Input() readOnlyAccess: boolean;
    public ACLoadDto = new ACLoad();
    public DefaultACLoadDto = new ACLoad();
    private solutionId: number;
    private loadId: number;
    lang$: Observable<string>;
    public loadCharacteristicsValues = new LoadCharacteristics();

    //Variables to Calculate Load Characteristics
    private LoadSequenceType: string;
    private CoolingUnits: string;
    private CoolingLoad: number;
    private ReheatLoad: number;
    private Compressors: number;

    constructor(
        private _solutionServie: solutionService,
        protected _route: Router,
        private _activatedRoute: ActivatedRoute, private readonly translate: TranslateService, public utility: UtilityService, private readonly store: Store<string>) {

        this.translate.setDefaultLang(utility.userBrowserLocale);
        this.lang$ = this.store.select(() => utility.userBrowserLocale);
    }

    ngOnInit(): void {
        this.lang$.subscribe(lang => this.translate.use(lang));
        this.InitializeLoadDetails(this.selectedLoad);
    }

    InitializeLoadDetails(selectedLoad: LoadModel): void {
        this.loading = true;
        this.selectedLoad = selectedLoad;
        try {
            this._solutionServie.GetSolutionLoadDetails(this.selectedLoad.ID, this.selectedLoad.SolutionID, this.selectedLoad.LoadFamilyID, this.selectedLoad.SolutionLoadID).subscribe((load) => {
                this.MapLoadDetail(load);
            });
        }
        catch (Error) { 
            this.loading = false;
        }
    }

    MapLoadDetail(load: any): void {
        this.ACLoadDto = load as ACLoad;
        if (this.selectedLoad.CopyLoad == true) {
            this.ACLoadDto.ID = 0;
            this.ACLoadDto.Description = "";
        }

        this.DefaultACLoadDto = JSON.parse(JSON.stringify(this.ACLoadDto));

        this.MapVoltageDipUnitsChange(this.ACLoadDto.VoltageDipUnitsID);
        this.MapFrequencyDipUnitsChange(this.ACLoadDto.FrequencyDipUnitsID);
        this.FilterSizeUnits(this.selectedLoad.LoadFamilyID);

        this.CalculateLoadCharacteristicsInputs();

        this.loading = false;
    }

    SaveLoadDetails(isValid: boolean): void {
        if (!isValid) {
            return;
        }
        this.ACLoadDto.SolutionID = this.selectedLoad.SolutionID;
        this.ACLoadDto.LoadID = this.selectedLoad.ID;
        this.MapLoadCharacteristicsValues();

        this._solutionServie.SaveSolutionACLoadDetail(this.ACLoadDto).subscribe((load) => {
            this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
        });
    }

    MapLoadCharacteristicsValues(): void {
        this.ACLoadDto.StartingLoadKva = this.loadCharacteristicsValues.sKVA;
        this.ACLoadDto.StartingLoadKw = this.loadCharacteristicsValues.sKW;
        this.ACLoadDto.RunningLoadKva = this.loadCharacteristicsValues.rKVA;
        this.ACLoadDto.RunningLoadKw = this.loadCharacteristicsValues.rKW;
        this.ACLoadDto.THIDContinuous = this.loadCharacteristicsValues.continuousHarmonicCurrentDistortion;
        this.ACLoadDto.THIDMomentary = this.loadCharacteristicsValues.momentaryHarmonicCurrentDistortion;
        this.ACLoadDto.THIDKva = 0;
        this.ACLoadDto.HD3 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD3
        this.ACLoadDto.HD5 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD5;
        this.ACLoadDto.HD7 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD7;
        this.ACLoadDto.HD9 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD9;
        this.ACLoadDto.HD11 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD11;
        this.ACLoadDto.HD13 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD13;
        this.ACLoadDto.HD15 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD15;
        this.ACLoadDto.HD17 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD17;
        this.ACLoadDto.HD19 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD19;
        this.ACLoadDto.Shed = false;
    }

    CancelAddEditLoad(): void {
        this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
    }

    FilterSizeUnits(loadFamilyID: any) {
        if (loadFamilyID != undefined) {
            var defaultACLoadPicklist = this.DefaultACLoadDto.ACLoadPickListDto as ACLoadPickList;
            this.ACLoadDto.ACLoadPickListDto.CoolingUnitsList = defaultACLoadPicklist.CoolingUnitsList.filter(c => c.LoadFamilyID == loadFamilyID);
        }
    }

    CalculateLoadCharacteristicsInputs(): void {
        this.CoolingUnits = this.GetValue(this.DefaultACLoadDto.ACLoadPickListDto.CoolingUnitsList,
            this.ACLoadDto.CoolingUnitsID);

        this.CoolingLoad = this.GetValue(this.DefaultACLoadDto.ACLoadPickListDto.CoolingLoadList,
            this.ACLoadDto.CoolingLoadID);

        this.ReheatLoad = this.GetValue(this.DefaultACLoadDto.ACLoadPickListDto.ReheatLoadList,
            this.ACLoadDto.ReheatLoadID);

        this.Compressors = this.GetValue(this.DefaultACLoadDto.ACLoadPickListDto.CompressorsList,
            this.ACLoadDto.CompressorsID);

        var sequence = this.ACLoadDto.ACLoadPickListDto.SequenceList.find(s => s.ID == this.ACLoadDto.SequenceID);
        this.LoadSequenceType = sequence != undefined ? sequence.SequenceType : '';

        this.loadCharacteristicsValues.sKVA = +this.KVAStarting().toFixed(2);
        this.loadCharacteristicsValues.sKW = +this.KWStarting().toFixed(2);
        this.loadCharacteristicsValues.rKVA = +this.KVARunning().toFixed(2);
        this.loadCharacteristicsValues.rKW = +this.KWRunning().toFixed(2);
    }

    //Voltage Dip Units Change event
    MapVoltageDipUnitsChange(voltageDipUnitsID: number): VoltageDipList[] {
        var defaultACLoadDto = this.DefaultACLoadDto;
        var voltageDipUnitsItem = defaultACLoadDto.ACLoadPickListDto.VoltageDipUnitsList.find(vd => vd.ID == voltageDipUnitsID);
        if (voltageDipUnitsItem != undefined && voltageDipUnitsItem.Value.toLowerCase() == "volts") {
            var voltageDipPercentValues = defaultACLoadDto.ACLoadPickListDto.VoltageDipList as VoltageDipList[];
            var vDipList: VoltageDipList[] = [];

            for (let vDipPercentValue of voltageDipPercentValues) {
                var vDipItem = <VoltageDipList>{};

                vDipItem.ID = vDipPercentValue.ID;
                vDipItem.Value = (Math.round(+vDipPercentValue.Value * +defaultACLoadDto.VoltageSpecific)).toString();
                vDipItem.Description = vDipItem.Value + " volts";

                vDipList.push(vDipItem);
            }
            this.ACLoadDto.ACLoadPickListDto.VoltageDipList = vDipList;
        }
        else {
            this.ACLoadDto.ACLoadPickListDto.VoltageDipList = this.DefaultACLoadDto.ACLoadPickListDto.VoltageDipList;
        }
        return this.ACLoadDto.ACLoadPickListDto.VoltageDipList;
    }

    //Frequency Dip Units Change event
    MapFrequencyDipUnitsChange(frequencyDipUnitsID: number): FrequencyDipList[] {
        var defaultACLoadDto = this.DefaultACLoadDto;
        var frequencyDipUnitsItem = defaultACLoadDto.ACLoadPickListDto.FrequencyDipUnitsList.find(fd => fd.ID == frequencyDipUnitsID);
        if (frequencyDipUnitsItem != undefined && frequencyDipUnitsItem.Value.toLowerCase() == "percent") {
            var frequencyDipValues = defaultACLoadDto.ACLoadPickListDto.FrequencyDipList as FrequencyDipList[];
            var fDipList: FrequencyDipList[] = [];

            for (let fDipValue of frequencyDipValues) {

                var fDipItem = <FrequencyDipList>{};

                fDipItem.ID = fDipValue.ID;
                fDipItem.Value = (((+fDipValue.Value * 100) / +defaultACLoadDto.Frequency).toFixed(2)).toString();//(Math.round(+vDipPercentValue.Value * voltageSpecific)).toString();
                fDipItem.Description = fDipItem.Value + " %";

                fDipList.push(fDipItem);
            }
            this.ACLoadDto.ACLoadPickListDto.FrequencyDipList = fDipList;

        }
        else {
            this.ACLoadDto.ACLoadPickListDto.FrequencyDipList = this.DefaultACLoadDto.ACLoadPickListDto.FrequencyDipList;
        }
        return this.ACLoadDto.ACLoadPickListDto.FrequencyDipList;
    }

    private GetValue(list: BasePickList[], id: number): any {
        var item = list.find(l => l.ID == id);
        return item != undefined ? item.Value : undefined;
    }

    private KVAStarting(): number {
        debugger
        try {
            var multiplier: number = 1;

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.ACLoadDto.Quantity;
            }

            var estCompressorTotal = this.CoolingUnits.toLowerCase() == 'tons' ? this.ACLoadDto.Cooling : this.ACLoadDto.Cooling / 12000;
            var estLargestMotorStart = estCompressorTotal * this.CoolingLoad / 0.85;
            var sKVA = (estLargestMotorStart / this.Compressors) * 6;

            return multiplier * sKVA;
        }
        catch (Error) {
            return 0;
        }
    }

    private KVARunning(): number {
        try {
            var estCompressorTotal = this.CoolingUnits.toLowerCase() == 'tons' ? this.ACLoadDto.Cooling : this.ACLoadDto.Cooling / 12000;
            var reheatKW = estCompressorTotal * this.ReheatLoad;
            var rKVA = (estCompressorTotal * this.CoolingLoad) / 0.85;

            rKVA = (rKVA + reheatKW) * this.ACLoadDto.Quantity;

            return rKVA;
        }
        catch (Error) {
            return 0;
        }
    }

    private KWStarting(): number {
        try {
            var multiplier: number = 1;

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.ACLoadDto.Quantity;
            }

            var estCompressorTotal = this.CoolingUnits.toLowerCase() == 'tons' ? this.ACLoadDto.Cooling : this.ACLoadDto.Cooling / 12000;
            var estLargestMotorStart = estCompressorTotal * this.CoolingLoad / 0.85;
            var sKW = (estLargestMotorStart / this.Compressors) * 6;
            var reheatKW = estCompressorTotal * this.ReheatLoad;

            return multiplier * Math.max(sKW * 0.3, reheatKW);
        }
        catch (Error) {
            return 0;
        }
    }

    private KWRunning(): number {
        try {
            var estCompressorTotal = this.CoolingUnits.toLowerCase() == 'tons' ? this.ACLoadDto.Cooling : this.ACLoadDto.Cooling / 12000;
            var reheatKW = estCompressorTotal * this.ReheatLoad;
            var rKW = (estCompressorTotal * this.CoolingLoad / 0.85) * 0.85;

            rKW = (rKW + reheatKW) * this.ACLoadDto.Quantity;

            return rKW;
        }
        catch (Error) {
            return 0;
        }
    }

}