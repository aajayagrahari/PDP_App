import { Component, OnInit, Input } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';
import { LightingLoad, LightingLoadPickList } from '../_models/lightingLoad.model';
import { BasePickList, HarmonicDeviceTypePickList, StartingMethodEnum } from '../_models/load.model';
import { LoadCharacteristics } from '../_models/loadCharacteristics.model';
import { LoadModel } from '../_models/load.model';
import { VoltageDipList, FrequencyDipList, VoltageNominalList, VoltageSpecificList } from '../_models/solutionSetup.model';
import { ProjectDetails } from '../_models/project.model';
import { solutionService } from '../Services/solution.services';
import { CommonService } from '../Services/common.service';
import { Router, ActivatedRoute, NavigationCancel } from '@angular/router';


@Component({
    selector: 'lighting-load',
    templateUrl: './lightingLoad.component.html',
    styleUrls: ['./lightingLoad.component.css'],
    providers: [CommonService]
})

export class LightingLoadComponent implements OnInit {
    public loading: boolean = false;
    @Input() selectedLoad: LoadModel;
    @Input() readOnlyAccess: boolean;
    public LightingLoadDto = new LightingLoad();
    public DefaultLightingLoadDto = new LightingLoad();
    private solutionId: number;
    private loadId: number;

    public loadCharacteristicsValues = new LoadCharacteristics();

    //Variables to calculate Load Characteristics
    private PFStarting: number = 0;
    private PFRunning: number = 0;
    private SizeStartingUnits: string;
    private SizeRunningUnits: string;
    private VoltagePhase: number = 0;
    private VoltageSpecific: number = 0;
    private LoadSequenceType: string;
    private StartingMethod: string;
    private HarmonicContent: number;
    private _THID: number;
    private currentRunningUnits: string;
    private currentStartingUnits: string;

    constructor(private _solutionServie: solutionService,
        private _commonService:CommonService,
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
        this.LightingLoadDto = load as LightingLoad;
        if (this.selectedLoad.CopyLoad == true) {
            this.LightingLoadDto.ID = 0;
            this.LightingLoadDto.Description = "";
        }

        this.DefaultLightingLoadDto = JSON.parse(JSON.stringify(this.LightingLoadDto));
        this.FilterHarmomicDeviceTypeList(this.LightingLoadDto.StartingMethodID);
        this.MapVoltageDipUnitsChange(this.LightingLoadDto.VoltageDipUnitsID);
        this.MapFrequencyDipUnitsChange(this.LightingLoadDto.FrequencyDipUnitsID);
        this.FilterSizeUnits(this.selectedLoad.LoadFamilyID);

        this.CalculateLoadCharacteristicsInputs();
        this.CalculateHarmonicDistortionInputs();

        this.FilterVoltageNominalPickList(this.DefaultLightingLoadDto.VoltagePhaseID,
            this.DefaultLightingLoadDto.FrequencyID);
        this.FilterVoltageSpecificPickList(this.DefaultLightingLoadDto.VoltageNominalID);        
        this.currentRunningUnits = this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.SizeUnitsList, this.LightingLoadDto.SizeRunningUnitsID);
        this.currentStartingUnits = this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.SizeUnitsList, this.LightingLoadDto.SizeStartingUnitsID);
        this.loading = false;
    }

    //Filter Harmonic Device Type List
    FilterHarmomicDeviceTypeList(startingMethodID: any) {
        if (startingMethodID != null && startingMethodID != undefined) {
            var defaultLightingLoadDto = this.DefaultLightingLoadDto;
            this.LightingLoadDto.LightingLoadPickListDto.HarmonicDeviceTypeList = defaultLightingLoadDto.LightingLoadPickListDto.HarmonicDeviceTypeList
                .filter(hd => hd.StartingMethodID == startingMethodID);
        }
    }

    MapSizeUnitChange(size: number, type: string) {

        let powerFactor = type == "running" ? this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.PFList, this.LightingLoadDto.RunningPFID)
            : this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.PFList, this.LightingLoadDto.StartingPFID);

        let sizeUnits = type == "running" ? this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.SizeUnitsList, this.LightingLoadDto.SizeRunningUnitsID)
            : this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.SizeUnitsList, this.LightingLoadDto.SizeStartingUnitsID);

        var targetSize = this._commonService.GetConvertedPowerUnitsValue(size, this.currentRunningUnits, sizeUnits,
            this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.VoltageSpecificList, this.LightingLoadDto.VoltageSpecificID), powerFactor, this.LightingLoadDto.VoltagePhaseID, false);

        if (type == "running") {
            this.LightingLoadDto.SizeRunning = targetSize;
        } else {
            this.LightingLoadDto.SizeStarting = targetSize;
        }

        this.currentRunningUnits = this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.SizeUnitsList, this.LightingLoadDto.SizeRunningUnitsID);
        this.currentStartingUnits = this.GetValue(this.LightingLoadDto.LightingLoadPickListDto.SizeUnitsList, this.LightingLoadDto.SizeStartingUnitsID);
    }

    //Filter Voltage Nominal picklist
    FilterVoltageNominalPickList(voltagePhase: any, frequency: any): void {
        if (voltagePhase != undefined && frequency != undefined) {
            var defaultLightingLoadDto = this.DefaultLightingLoadDto;
            this.LightingLoadDto.LightingLoadPickListDto.VoltageNominalList = defaultLightingLoadDto.LightingLoadPickListDto.VoltageNominalList
                .filter(x => x.FrequencyID == frequency && x.VoltagePhaseID == voltagePhase);
        } else {
            this.LightingLoadDto.LightingLoadPickListDto.VoltageNominalList = [];
        }
    }

    //Filter Voltage Specific picklist
    FilterVoltageSpecificPickList(voltageNominal: any): void {
        if (voltageNominal != undefined) {
            var defaultLightingLoadDto = this.DefaultLightingLoadDto;
            this.LightingLoadDto.LightingLoadPickListDto.VoltageSpecificList = defaultLightingLoadDto.LightingLoadPickListDto.VoltageSpecificList
                .filter(x => x.VoltageNominalID == voltageNominal);
        } else {
            this.LightingLoadDto.LightingLoadPickListDto.VoltageSpecificList = [];
        }
    }

    FilterSizeUnits(loadFamilyID: any) {
        if (loadFamilyID != undefined) {
            var defaultLightingLoadPicklist = this.DefaultLightingLoadDto.LightingLoadPickListDto as LightingLoadPickList;
            this.LightingLoadDto.LightingLoadPickListDto.SizeUnitsList = defaultLightingLoadPicklist.SizeUnitsList.filter(s => s.LoadFamilyID == loadFamilyID);
        }
    }

    //Voltage Nominal picklist change event
    MapVoltageNominal(voltagePhase: any, frequency: any): void {
        this.FilterVoltageNominalPickList(voltagePhase, frequency);

        var voltageNominalList = this.LightingLoadDto.LightingLoadPickListDto.VoltageNominalList as VoltageNominalList[];

        var voltageNominalSelected = this.LightingLoadDto.VoltageNominalID;

        var voltageNominalItem = voltageNominalList.find(v => v.IsDefaultSelection == true);
        if (voltageNominalItem != undefined) {
            voltageNominalSelected = voltageNominalItem.ID;
        }

        this.LightingLoadDto.VoltageNominalID = voltageNominalSelected;
        this.MapVoltageSpecific(voltageNominalSelected);
    }

    //Voltage specific picklist change event
    MapVoltageSpecific(voltageNominal: any): void {
        this.FilterVoltageSpecificPickList(voltageNominal);
        var voltageSpecificList = this.LightingLoadDto.LightingLoadPickListDto.VoltageSpecificList as VoltageSpecificList[];

        var voltageSpecificItem = voltageSpecificList.find(v => v.IsDefaultSelection);
        if (voltageSpecificItem != undefined) {
            this.LightingLoadDto.VoltageSpecificID = voltageSpecificItem.ID;
        }

        this.MapVoltageSpecificChange(this.LightingLoadDto.VoltageDipUnitsID);
    }

    //Voltage Specific Value Change
    MapVoltageSpecificChange(voltageDipUnitsID: number): void {
        this.MapVoltageDipUnitsChange(this.LightingLoadDto.VoltageDipUnitsID);
        this.CalculateLoadCharacteristicsInputs();
    }

    SaveLoadDetails(isValid: boolean): void {
        if (!isValid) {
            return;
        }
        this.LightingLoadDto.SolutionID = this.selectedLoad.SolutionID;
        this.LightingLoadDto.LoadID = this.selectedLoad.ID;
        this.MapLoadCharacteristicsValues();

        this._solutionServie.SaveSolutionLightingLoadDetail(this.LightingLoadDto).subscribe((load) => {
            this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
        });
    }

    MapLoadCharacteristicsValues(): void {
        this.LightingLoadDto.StartingLoadKva = this.loadCharacteristicsValues.sKVA;
        this.LightingLoadDto.StartingLoadKw = this.loadCharacteristicsValues.sKW;
        this.LightingLoadDto.RunningLoadKva = this.loadCharacteristicsValues.rKVA;
        this.LightingLoadDto.RunningLoadKw = this.loadCharacteristicsValues.rKW;
        this.LightingLoadDto.THIDContinuous = this.loadCharacteristicsValues.continuousHarmonicCurrentDistortion;
        this.LightingLoadDto.THIDMomentary = this.loadCharacteristicsValues.momentaryHarmonicCurrentDistortion;
        this.LightingLoadDto.THIDKva = this.THIDKva();
        this.LightingLoadDto.HD3 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD3
        this.LightingLoadDto.HD5 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD5;
        this.LightingLoadDto.HD7 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD7;
        this.LightingLoadDto.HD9 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD9;
        this.LightingLoadDto.HD11 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD11;
        this.LightingLoadDto.HD13 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD13;
        this.LightingLoadDto.HD15 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD15;
        this.LightingLoadDto.HD17 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD17;
        this.LightingLoadDto.HD19 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD19;
        this.LightingLoadDto.Shed = false;
    }

    CancelAddEditLoad(): void {
        this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
    }

    //Lighting Type Change
    MapLightingTypeChange(lightingTypeID: number) {
        var defaultLightingLoadDto = this.DefaultLightingLoadDto;
        var lightingType = this.DefaultLightingLoadDto.LightingLoadPickListDto.LightingTypeList.find(lt => lt.ID == lightingTypeID);
        if (lightingType != undefined) {
            this.LightingLoadDto.RunningPFID = lightingType.RunningPFID;
            this.LightingLoadDto.HarmonicDeviceTypeID = lightingType.HarmonicDeviceTypeID;
            this.LightingLoadDto.HarmonicContentID = lightingType.HarmonicContentID;
        }
        this.CalculateLoadCharacteristicsInputs();
        this.CalculateHarmonicDistortionInputs();
    }

    //Harmonic device Type Change
    MapHarmonicDeviceTypeChange(harmonicDeviceTypeID: number) {
        var defaultLightingLoadDto = this.DefaultLightingLoadDto;
        var harmonicDeviceType = this.DefaultLightingLoadDto.LightingLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == harmonicDeviceTypeID);
        if (harmonicDeviceType != undefined) {
            this.LightingLoadDto.HarmonicContentID = harmonicDeviceType.HarmonicContentID;
            this.CalculateHarmonicDistortionInputs();
        }
    }

    //Voltage Dip Units Change event
    MapVoltageDipUnitsChange(voltageDipUnitsID: number): VoltageDipList[] {
        var defaultLightingLoadDto = this.DefaultLightingLoadDto;
        var voltageDipUnitsItem = defaultLightingLoadDto.LightingLoadPickListDto.VoltageDipUnitsList.find(vd => vd.ID == voltageDipUnitsID);
        if (voltageDipUnitsItem != undefined && voltageDipUnitsItem.Value.toLowerCase() == "volts") {
            var voltageDipPercentValues = defaultLightingLoadDto.LightingLoadPickListDto.VoltageDipList as VoltageDipList[];

            var voltageSpecificList = this.LightingLoadDto.LightingLoadPickListDto.VoltageSpecificList as VoltageSpecificList[];
            var voltageSpecificItem = voltageSpecificList.find(vs => vs.ID == this.LightingLoadDto.VoltageSpecificID)

            if (voltageSpecificItem != undefined) {
                var voltageSpecific = parseInt(voltageSpecificItem.Value);
                var vDipList: VoltageDipList[] = [];
                for (let vDipPercentValue of voltageDipPercentValues) {
                    var vDipItem = <VoltageDipList>{};

                    vDipItem.ID = vDipPercentValue.ID;
                    vDipItem.Value = (Math.round(+vDipPercentValue.Value * voltageSpecific)).toString();
                    vDipItem.Description = vDipItem.Value + " volts";

                    vDipList.push(vDipItem);
                }
                this.LightingLoadDto.LightingLoadPickListDto.VoltageDipList = vDipList;
            }
        }
        else {
            this.LightingLoadDto.LightingLoadPickListDto.VoltageDipList = this.DefaultLightingLoadDto.LightingLoadPickListDto.VoltageDipList;
        }
        return this.LightingLoadDto.LightingLoadPickListDto.VoltageDipList;
    }

    //Frequency Dip Units Change event
    MapFrequencyDipUnitsChange(frequencyDipUnitsID: number): FrequencyDipList[] {
        var defaultLightingLoadDto = this.DefaultLightingLoadDto;
        var frequencyDipUnitsItem = defaultLightingLoadDto.LightingLoadPickListDto.FrequencyDipUnitsList.find(fd => fd.ID == frequencyDipUnitsID);
        if (frequencyDipUnitsItem != undefined && frequencyDipUnitsItem.Value.toLocaleLowerCase() == "percent") {
            var frequencyDipValues = defaultLightingLoadDto.LightingLoadPickListDto.FrequencyDipList as FrequencyDipList[];

            var frequencyItem = this.LightingLoadDto.Frequency;

            if (frequencyItem != undefined) {
                var selectedFrequency = frequencyItem;
                var fDipList: FrequencyDipList[] = [];
                for (let fDipValue of frequencyDipValues) {

                    var fDipItem = <FrequencyDipList>{};

                    fDipItem.ID = fDipValue.ID;
                    fDipItem.Value = (((+fDipValue.Value * 100) / selectedFrequency).toFixed(2)).toString();//(Math.round(+vDipPercentValue.Value * voltageSpecific)).toString();
                    fDipItem.Description = fDipItem.Value + " %";

                    fDipList.push(fDipItem);
                }
                this.LightingLoadDto.LightingLoadPickListDto.FrequencyDipList = fDipList;
            }
        }
        else {
            this.LightingLoadDto.LightingLoadPickListDto.FrequencyDipList = this.DefaultLightingLoadDto.LightingLoadPickListDto.FrequencyDipList;
        }
        return this.LightingLoadDto.LightingLoadPickListDto.FrequencyDipList;
    }


    private GetValue(list: BasePickList[], id: number): any {
        var item = list.find(l => l.ID == id);
        return item != undefined ? item.Value : undefined;
    }

    //Load Characteristics Calculations

    CalculateLoadCharacteristicsInputs(): void {
        var pfStarting = this.DefaultLightingLoadDto.LightingLoadPickListDto.PFList.find(pf => pf.ID == this.LightingLoadDto.StartingPFID);
        this.PFStarting = pfStarting != undefined ? +pfStarting.Value : 0.0;

        this.PFRunning = +this.GetValue(this.DefaultLightingLoadDto.LightingLoadPickListDto.PFList,
            this.LightingLoadDto.RunningPFID);

        this.SizeRunningUnits = this.GetValue(this.DefaultLightingLoadDto.LightingLoadPickListDto.SizeUnitsList,
            this.LightingLoadDto.SizeRunningUnitsID);

        this.SizeStartingUnits = this.GetValue(this.DefaultLightingLoadDto.LightingLoadPickListDto.SizeUnitsList,
            this.LightingLoadDto.SizeStartingUnitsID);

        this.VoltagePhase = this.GetValue(this.DefaultLightingLoadDto.LightingLoadPickListDto.VoltagePhaseList,
            this.LightingLoadDto.VoltagePhaseID);

        this.VoltageSpecific = this.GetValue(this.DefaultLightingLoadDto.LightingLoadPickListDto.VoltageSpecificList,
            this.LightingLoadDto.VoltageSpecificID);

        var sequence = this.LightingLoadDto.LightingLoadPickListDto.SequenceList.find(s => s.ID == this.LightingLoadDto.SequenceID);
        this.LoadSequenceType = sequence != undefined ? sequence.SequenceType : '';

        //        this.StartingMethod = this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto)

        this.loadCharacteristicsValues.sKVA = +this.KVAStarting().toFixed(2);
        this.loadCharacteristicsValues.sKW = +this.KWStarting().toFixed(2);
        this.loadCharacteristicsValues.rKVA = +this.KVARunning().toFixed(2);
        this.loadCharacteristicsValues.rKW = +this.KWRunning().toFixed(2);
    }

    CalculateHarmonicDistortionInputs(): void {
        this.HarmonicContent = this.GetValue(this.DefaultLightingLoadDto.LightingLoadPickListDto.HarmonicContentList, this.LightingLoadDto.HarmonicContentID);
        var harmonicDevice = this.DefaultLightingLoadDto.LightingLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == this.LightingLoadDto.HarmonicDeviceTypeID);

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
            var size: number = this.LightingLoadDto.SizeStarting > 0 ? this.LightingLoadDto.SizeStarting : this.LightingLoadDto.SizeRunning;
            var pf: number = this.PFStarting > 0 ? this.PFStarting : this.PFRunning;

            if (this.LightingLoadDto.SizeStarting == null || this.LightingLoadDto.SizeStarting == 0) {
                this.SizeStartingUnits = this.SizeRunningUnits;
            }

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.LightingLoadDto.Quantity;
            }

            if (this.SizeStartingUnits.toLowerCase() == 'kw') {
                return multiplier * (size / pf);
            }
            else if (this.SizeStartingUnits.toLowerCase() == 'kva') {
                return multiplier * size;
            }
            else {
                if (this.VoltagePhase == 1) {
                    return multiplier * ((size * this.VoltageSpecific / 1000) * 1);
                }
                else {
                    return multiplier * ((size * this.VoltageSpecific / 1000) * 1.732);
                }
            }
        }
        catch (Error) {
            return 0;
        }
    }

    private KWStarting(): number {
        try {
            var multiplier: number = 1;
            var size: number = this.LightingLoadDto.SizeStarting > 0 ? this.LightingLoadDto.SizeStarting : this.LightingLoadDto.SizeRunning;
            var pf: number = this.PFStarting > 0 ? this.PFStarting : this.PFRunning;

            if (this.LightingLoadDto.SizeStarting == null || this.LightingLoadDto.SizeStarting == 0) {
                this.SizeStartingUnits = this.SizeRunningUnits;
            }

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.LightingLoadDto.Quantity;
            }

            if (this.SizeStartingUnits.toLowerCase() == 'kw') {
                return multiplier * size;
            }
            else if (this.SizeStartingUnits.toLowerCase() == 'kva') {
                return multiplier * (size * pf);
            }
            else {
                if (this.VoltagePhase == 1) {
                    return multiplier * ((size * this.VoltageSpecific * pf / 1000) * 1);
                }
                else {
                    return multiplier * ((size * this.VoltageSpecific * pf / 1000) * 1.732);
                }
            }
        }
        catch (Error) {
            return 0;
        }
    }

    private KVARunning(): number {
        try {
            if (this.SizeRunningUnits.toLowerCase() == 'kw') {
                return this.LightingLoadDto.Quantity * (this.LightingLoadDto.SizeRunning / this.PFRunning);
            }
            else if (this.SizeRunningUnits.toLowerCase() == 'kva') {
                return this.LightingLoadDto.Quantity * this.LightingLoadDto.SizeRunning;
            }
            else {
                if (this.VoltagePhase == 1) {
                    return this.LightingLoadDto.Quantity * ((this.LightingLoadDto.SizeRunning * this.VoltageSpecific / 1000) * 1);
                }
                else {
                    return this.LightingLoadDto.Quantity * ((this.LightingLoadDto.SizeRunning * this.VoltageSpecific / 1000) * 1.732);
                }
            }
        }
        catch (Error) {
            return 0;
        }
    }

    private KWRunning(): number {
        try {
            if (this.SizeRunningUnits.toLowerCase() == 'kw') {
                return this.LightingLoadDto.Quantity * this.LightingLoadDto.SizeRunning;
            }
            else if (this.SizeRunningUnits.toLowerCase() == 'kva') {
                return this.LightingLoadDto.Quantity * (this.LightingLoadDto.SizeRunning * this.PFRunning);
            }
            else {
                if (this.VoltagePhase == 1) {
                    return this.LightingLoadDto.Quantity * ((this.LightingLoadDto.SizeRunning * this.VoltageSpecific * this.PFRunning / 1000) * 1);
                }
                else {
                    return this.LightingLoadDto.Quantity * ((this.LightingLoadDto.SizeRunning * this.VoltageSpecific * this.PFRunning / 1000) * 1.732);
                }
            }
        }
        catch (Error) {
            return 0;
        }
    }

    private THIDMomentary(): number {
        try {
            var thid: number = 0;
            if (this.LightingLoadDto.StartingMethodID !== +StartingMethodEnum.AcrossTheLine || this.LightingLoadDto.StartingMethodID !== +StartingMethodEnum.ReducedVoltage) {
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
            if (this.LightingLoadDto.StartingMethodID !== +StartingMethodEnum.SoftStarter) {
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
