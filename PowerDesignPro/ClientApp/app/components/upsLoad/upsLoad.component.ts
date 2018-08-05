import { Component, OnInit, Input } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';
import { UPSLoad, UPSLoadPickList } from '../_models/upsLoad.model';
import { BasePickList, HarmonicDeviceTypePickList, StartingMethodEnum } from '../_models/load.model';
import { LoadCharacteristics } from '../_models/loadCharacteristics.model';
import { LoadModel } from '../_models/load.model';
import { VoltageDipList, FrequencyDipList, VoltageNominalList, VoltageSpecificList } from '../_models/solutionSetup.model';
import { ProjectDetails } from '../_models/project.model';
import { solutionService } from '../Services/solution.services';
import { Router, ActivatedRoute, NavigationCancel } from '@angular/router';

@Component({
    selector: 'ups-load',
    templateUrl: './upsLoad.component.html',
    styleUrls: ['./upsLoad.component.css']
})

export class UPSLoadComponent implements OnInit {
    public loading: boolean = false;
    @Input() selectedLoad: LoadModel;
    @Input() readOnlyAccess: boolean;
    public UPSLoadDto = new UPSLoad();
    public DefaultUPSLoadDto = new UPSLoad();
    private solutionId: number;
    private loadId: number;

    public loadCharacteristicsValues = new LoadCharacteristics();

    //Variables to calculate Load Characteristics
    private SizeKVAUnits: string;
    private Phase: string;
    private Efficiency: number;
    private ChargeRate: number;
    private PowerFactor: number;
    private UPSType: string;
    private LoadLevel: number;
    private LoadSequenceType: string;
    private SizeKVA: number;

    private HarmonicContent: number;
    private _THID: number;
    private VoltagePhase: number = 0;
    private VoltageSpecific: number = 0;

    constructor(private _solutionServie: solutionService,
        protected _route: Router,
        private _activatedRoute: ActivatedRoute) {

    }

    ngOnInit(): void {
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
        this.UPSLoadDto = load as UPSLoad;
        if (this.selectedLoad.CopyLoad == true) {
            this.UPSLoadDto.ID = 0;
            this.UPSLoadDto.Description = "";
        }

        this.DefaultUPSLoadDto = JSON.parse(JSON.stringify(this.UPSLoadDto));
        this.FilterHarmomicDeviceTypeList(this.UPSLoadDto.StartingMethodID);
        this.MapUPSTypeChange(this.UPSLoadDto.UPSTypeID);
        this.MapVoltageDipUnitsChange(this.UPSLoadDto.VoltageDipUnitsID);
        this.MapFrequencyDipUnitsChange(this.UPSLoadDto.FrequencyDipUnitsID);
        this.FilterSizeUnits(this.selectedLoad.LoadFamilyID);

        this.CalculateLoadCharacteristicsInputs();
        this.CalculateHarmonicDistortionInputs();

        this.loading = false;
    }

    //Filter Harmonic Device Type List
    FilterHarmomicDeviceTypeList(startingMethodID: any) {
        if (startingMethodID != null && startingMethodID != undefined) {
            var defaultUPSLoadDto = this.DefaultUPSLoadDto;
            this.UPSLoadDto.UPSLoadPickListDto.HarmonicDeviceTypeList = defaultUPSLoadDto.UPSLoadPickListDto.HarmonicDeviceTypeList
                .filter(hd => hd.StartingMethodID == startingMethodID);
        }
    }

    FilterSizeUnits(loadFamilyID: any) {
        if (loadFamilyID != undefined) {
            var defaultUPSLoadPicklist = this.DefaultUPSLoadDto.UPSLoadPickListDto as UPSLoadPickList;
            this.UPSLoadDto.UPSLoadPickListDto.SizeKVAUnitsList = defaultUPSLoadPicklist.SizeKVAUnitsList.filter(s => s.LoadFamilyID == loadFamilyID);
        }
    }
    
    SaveLoadDetails(isValid: boolean): void {
        if (!isValid) {
            return;
        }
        this.UPSLoadDto.SolutionID = this.selectedLoad.SolutionID;
        this.UPSLoadDto.LoadID = this.selectedLoad.ID;
        this.MapLoadCharacteristicsValues();

        this._solutionServie.SaveSolutionUPSLoadDetail(this.UPSLoadDto).subscribe((load) => {
            this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
        });
    }

    MapLoadCharacteristicsValues(): void {
        this.UPSLoadDto.StartingLoadKva = this.loadCharacteristicsValues.sKVA;
        this.UPSLoadDto.StartingLoadKw = this.loadCharacteristicsValues.sKW;
        this.UPSLoadDto.RunningLoadKva = this.loadCharacteristicsValues.rKVA;
        this.UPSLoadDto.RunningLoadKw = this.loadCharacteristicsValues.rKW;
        this.UPSLoadDto.THIDContinuous = this.loadCharacteristicsValues.continuousHarmonicCurrentDistortion;
        this.UPSLoadDto.THIDMomentary = this.loadCharacteristicsValues.momentaryHarmonicCurrentDistortion;
        this.UPSLoadDto.THIDKva = this.THIDKva();
        this.UPSLoadDto.HD3 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD3
        this.UPSLoadDto.HD5 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD5;
        this.UPSLoadDto.HD7 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD7;
        this.UPSLoadDto.HD9 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD9;
        this.UPSLoadDto.HD11 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD11;
        this.UPSLoadDto.HD13 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD13;
        this.UPSLoadDto.HD15 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD15;
        this.UPSLoadDto.HD17 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD17;
        this.UPSLoadDto.HD19 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD19;
        this.UPSLoadDto.Shed = false;
    }

    CancelAddEditLoad(): void {
        this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
    }

    //Harmonic device Type Change
    MapHarmonicDeviceTypeChange(harmonicDeviceTypeID: number) {
        var defaultUPSLoadDto = this.DefaultUPSLoadDto;
        var harmonicDeviceType = this.DefaultUPSLoadDto.UPSLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == harmonicDeviceTypeID);
        if (harmonicDeviceType != undefined) {
            this.UPSLoadDto.HarmonicContentID = harmonicDeviceType.HarmonicContentID;
            this.CalculateHarmonicDistortionInputs();
        }
    }

    //Voltage Dip Units Change event
    MapVoltageDipUnitsChange(voltageDipUnitsID: number): VoltageDipList[] {
        var defaultUPSLoadDto = this.DefaultUPSLoadDto;
        var voltageDipUnitsItem = defaultUPSLoadDto.UPSLoadPickListDto.VoltageDipUnitsList.find(vd => vd.ID == voltageDipUnitsID);
        if (voltageDipUnitsItem != undefined && voltageDipUnitsItem.Value.toLowerCase() == "volts") {
            var voltageDipPercentValues = defaultUPSLoadDto.UPSLoadPickListDto.VoltageDipList as VoltageDipList[];
            var vDipList: VoltageDipList[] = [];

            for (let vDipPercentValue of voltageDipPercentValues) {
                var vDipItem = <VoltageDipList>{};

                vDipItem.ID = vDipPercentValue.ID;
                vDipItem.Value = (Math.round(+vDipPercentValue.Value * +defaultUPSLoadDto.VoltageSpecific)).toString();
                vDipItem.Description = vDipItem.Value + " volts";

                vDipList.push(vDipItem);
            }
            this.UPSLoadDto.UPSLoadPickListDto.VoltageDipList = vDipList;
        }
        else {
            this.UPSLoadDto.UPSLoadPickListDto.VoltageDipList = this.DefaultUPSLoadDto.UPSLoadPickListDto.VoltageDipList;
        }
        return this.UPSLoadDto.UPSLoadPickListDto.VoltageDipList;
    }

    //Frequency Dip Units Change event
    MapFrequencyDipUnitsChange(frequencyDipUnitsID: number): FrequencyDipList[] {
        var defaultUPSLoadDto = this.DefaultUPSLoadDto;
        var frequencyDipUnitsItem = defaultUPSLoadDto.UPSLoadPickListDto.FrequencyDipUnitsList.find(fd => fd.ID == frequencyDipUnitsID);
        if (frequencyDipUnitsItem != undefined && frequencyDipUnitsItem.Value.toLowerCase() == "percent") {
            var frequencyDipValues = defaultUPSLoadDto.UPSLoadPickListDto.FrequencyDipList as FrequencyDipList[];
            var fDipList: FrequencyDipList[] = [];

            for (let fDipValue of frequencyDipValues) {

                var fDipItem = <FrequencyDipList>{};

                fDipItem.ID = fDipValue.ID;
                fDipItem.Value = (((+fDipValue.Value * 100) / +defaultUPSLoadDto.Frequency).toFixed(2)).toString();//(Math.round(+vDipPercentValue.Value * voltageSpecific)).toString();
                fDipItem.Description = fDipItem.Value + " %";

                fDipList.push(fDipItem);
            }
            this.UPSLoadDto.UPSLoadPickListDto.FrequencyDipList = fDipList;

        }
        else {
            this.UPSLoadDto.UPSLoadPickListDto.FrequencyDipList = this.DefaultUPSLoadDto.UPSLoadPickListDto.FrequencyDipList;
        }
        return this.UPSLoadDto.UPSLoadPickListDto.FrequencyDipList;
    }

    //UPS Type Change
    MapUPSTypeChange(upsTypeID: number) {
        var defaultUPSLoadDto = this.DefaultUPSLoadDto;
        var upsType = this.DefaultUPSLoadDto.UPSLoadPickListDto.UPSTypeList.find(ups => ups.ID == upsTypeID);
        if (upsType != undefined) {
            this.UPSLoadDto.PhaseID = upsType.PhaseID;
            this.UPSLoadDto.EfficiencyID = upsType.EfficiencyID;
            this.UPSLoadDto.HarmonicDeviceTypeID = upsType.HarmonicDeviceTypeID;
            this.UPSLoadDto.HarmonicContentID = upsType.HarmonicContentID;
        }
        this.CalculateLoadCharacteristicsInputs();
        this.CalculateHarmonicDistortionInputs();
    }

    private GetValue(list: BasePickList[], id: number): any {
        var item = list.find(l => l.ID == id);
        return item != undefined ? item.Value : undefined;
    }

    //Load Characteristics Calculations

    CalculateLoadCharacteristicsInputs(): void {
        this.SizeKVAUnits = this.GetValue(this.DefaultUPSLoadDto.UPSLoadPickListDto.SizeKVAUnitsList,
            this.UPSLoadDto.SizeKVAUnitsID);

        this.Efficiency = this.GetValue(this.DefaultUPSLoadDto.UPSLoadPickListDto.EfficiencyList,
            this.UPSLoadDto.EfficiencyID);

        this.ChargeRate = this.GetValue(this.DefaultUPSLoadDto.UPSLoadPickListDto.ChargeRateList,
            this.UPSLoadDto.ChargeRateID);

        this.PowerFactor = this.GetValue(this.DefaultUPSLoadDto.UPSLoadPickListDto.PowerFactorList,
            this.UPSLoadDto.PowerFactorID);

        this.LoadLevel = this.GetValue(this.DefaultUPSLoadDto.UPSLoadPickListDto.LoadLevelList,
            this.UPSLoadDto.LoadLevelID);

        this.UPSType = this.GetValue(this.DefaultUPSLoadDto.UPSLoadPickListDto.UPSTypeList,
            this.UPSLoadDto.UPSTypeID);

        var sequence = this.UPSLoadDto.UPSLoadPickListDto.SequenceList.find(s => s.ID == this.UPSLoadDto.SequenceID);
        this.LoadSequenceType = sequence != undefined ? sequence.SequenceType : '';

        this.loadCharacteristicsValues.sKVA = +this.KVAStarting().toFixed(2);
        this.loadCharacteristicsValues.sKW = +this.KWStarting().toFixed(2);
        this.loadCharacteristicsValues.rKVA = +this.KVARunning().toFixed(2);
        this.loadCharacteristicsValues.rKW = +this.KWRunning().toFixed(2);
    }

    CalculateHarmonicDistortionInputs(): void {
        this.HarmonicContent = this.GetValue(this.DefaultUPSLoadDto.UPSLoadPickListDto.HarmonicContentList, this.UPSLoadDto.HarmonicContentID);
        var harmonicDevice = this.DefaultUPSLoadDto.UPSLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == this.UPSLoadDto.HarmonicDeviceTypeID);

        if (harmonicDevice != undefined) {
            this._THID = Math.sqrt((harmonicDevice.HD3 ** 2) +
                (harmonicDevice.HD5 ** 2) +
                (harmonicDevice.HD7 ** 2) +
                (harmonicDevice.HD9 ** 2) +
                (harmonicDevice.HD11 ** 2) +
                (harmonicDevice.HD13 ** 2) +
                (harmonicDevice.HD15 ** 2) +
                (harmonicDevice.HD17 ** 2) +
                (harmonicDevice.HD19 ** 2));

            this._THID = Math.max(this._THID, 1);

            this.loadCharacteristicsValues.momentaryHarmonicCurrentDistortion = +this.THIDMomentary();
            this.loadCharacteristicsValues.continuousHarmonicCurrentDistortion = +this.THIDContinuous();
            this.CalculateHarmonicDistortions(harmonicDevice);
        }
    }

    private KVAStarting(): number {
        try {
            var multiplier: number = 1;
            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.UPSLoadDto.Quantity;
            }

            var rKVAInput: number = 0;
            if (this.SizeKVAUnits.toLowerCase() == 'input') {
                rKVAInput = this.UPSLoadDto.SizeKVA;
            }
            else {
                rKVAInput = this.UPSLoadDto.SizeKVA * this.LoadLevel / this.Efficiency + this.UPSLoadDto.SizeKVA * this.ChargeRate
            }                     

            if (this.UPSType.toLowerCase() == 'passiveptandby') {
                return rKVAInput = (rKVAInput * 1);
            }
            else if (this.UPSType.toLowerCase() == 'lineinteractive') {
                return rKVAInput = (rKVAInput * 1);
            }
            else if (this.UPSType.toLowerCase() == 'ferroresonant') {
                return rKVAInput = (rKVAInput * 1);
            }
            else if (this.UPSType.toLowerCase() == 'deltaconversion') {
                return rKVAInput = (rKVAInput * 0.2);
            }
            else if (this.UPSType.toLowerCase() == 'doubleconversion') {
                return rKVAInput = (rKVAInput * 0.2);
            }
            else
                return multiplier * rKVAInput;
        }
        catch (Error) {
            return 0;
        }
    }

    private KWStarting(): number {
        try {
            var multiplier: number = 1;
            var pf: number = this.PowerFactor;
            return multiplier * (this.loadCharacteristicsValues.sKVA * pf);
        }
        catch (Error) {
            return 0;
        }
    }

    private KVARunning(): number {
        try {
            var rKVAInput: number = 0;
            if (this.SizeKVAUnits.toLowerCase() == 'input') {
                rKVAInput = this.UPSLoadDto.SizeKVA;
            }
            else {
                rKVAInput = this.UPSLoadDto.SizeKVA * this.LoadLevel / this.Efficiency + this.UPSLoadDto.SizeKVA * this.ChargeRate
            }

            return this.UPSLoadDto.Quantity * rKVAInput;
        }
        catch (Error) {
            return 0;
        }
    }

    private KWRunning(): number {
        try {
            var pf: number = this.PowerFactor;
            return (this.loadCharacteristicsValues.rKVA * pf);
        }
        catch (Error) {
            return 0;
        }
    }

    private THIDMomentary(): number {
        try {
            var thid: number = 0;
            if (this.UPSLoadDto.StartingMethodID !== +StartingMethodEnum.AcrossTheLine || this.UPSLoadDto.StartingMethodID !== +StartingMethodEnum.ReducedVoltage) {
                thid = this.HarmonicContent;
            }

            return thid;
        }
        catch (Error) {
            return 0;
        }
    }

    private THIDContinuous(): number {
        try {
            var thid: number = 0;
            if (this.UPSLoadDto.StartingMethodID !== +StartingMethodEnum.SoftStarter) {
                thid = this.HarmonicContent;
            }

            return thid;
        }
        catch (Error) {
            return 0;
        }
    }

    private THIDKva(): number {
        try {
            if (this.THIDMomentary() == 0 && this.THIDContinuous() == 0) {
                return 0;
            }

            return this.KVARunning();
        }
        catch (Error) {
            return 0;
        }
    }

    private CalculateHarmonicDistortions(harmonicDevice: HarmonicDeviceTypePickList): void {
        try {
            var multiplier = 1;

            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD3 = +(multiplier * ((harmonicDevice.HD3 * this.HarmonicContent) / this._THID)).toFixed(2);
            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD5 = +(multiplier * ((harmonicDevice.HD5 * this.HarmonicContent) / this._THID)).toFixed(2);
            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD7 = +(multiplier * ((harmonicDevice.HD7 * this.HarmonicContent) / this._THID)).toFixed(2);
            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD9 = +(multiplier * ((harmonicDevice.HD9 * this.HarmonicContent) / this._THID)).toFixed(2);
            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD11 = +(multiplier * ((harmonicDevice.HD11 * this.HarmonicContent) / this._THID)).toFixed(2);
            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD13 = +(multiplier * ((harmonicDevice.HD13 * this.HarmonicContent) / this._THID)).toFixed(2);
            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD15 = +(multiplier * ((harmonicDevice.HD15 * this.HarmonicContent) / this._THID)).toFixed(2);
            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD17 = +(multiplier * ((harmonicDevice.HD17 * this.HarmonicContent) / this._THID)).toFixed(2);
            this.loadCharacteristicsValues.harmonicCurrentDistortion.HD19 = +(multiplier * ((harmonicDevice.HD19 * this.HarmonicContent) / this._THID)).toFixed(2);
        }
        catch (Error) {
        }
    }
}
