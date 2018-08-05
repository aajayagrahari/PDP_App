import { Component, OnInit, Input } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';
import { WelderLoad, WelderLoadPickList } from '../_models/welderLoad.model';
import { BasePickList, HarmonicDeviceTypePickList, StartingMethodEnum } from '../_models/load.model';
import { LoadCharacteristics } from '../_models/loadCharacteristics.model';
import { LoadModel } from '../_models/load.model';
import { VoltageDipList, FrequencyDipList, VoltageNominalList, VoltageSpecificList } from '../_models/solutionSetup.model';
import { ProjectDetails } from '../_models/project.model';
import { solutionService } from '../Services/solution.services';
import { CommonService } from '../Services/common.service';
import { Router, ActivatedRoute, NavigationCancel } from '@angular/router';


@Component({
    selector: 'welder-load',
    templateUrl: './welderLoad.component.html',
    styleUrls: ['./welderLoad.component.css'],
    providers: [CommonService]
})

export class WelderLoadComponent implements OnInit {
    public loading: boolean = false;
    @Input() selectedLoad: LoadModel;
    @Input() readOnlyAccess: boolean;
    public WelderLoadDto = new WelderLoad();
    public DefaultWelderLoadDto = new WelderLoad();
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
        private _commonService: CommonService,
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
        this.WelderLoadDto = load as WelderLoad;
        if (this.selectedLoad.CopyLoad == true) {
            this.WelderLoadDto.ID = 0;
            this.WelderLoadDto.Description = "";
        }

        this.DefaultWelderLoadDto = JSON.parse(JSON.stringify(this.WelderLoadDto));
        this.FilterHarmomicDeviceTypeList(this.WelderLoadDto.StartingMethodID);
        this.MapVoltageDipUnitsChange(this.WelderLoadDto.VoltageDipUnitsID);
        this.MapFrequencyDipUnitsChange(this.WelderLoadDto.FrequencyDipUnitsID);
        this.FilterSizeUnits(this.selectedLoad.LoadFamilyID);

        this.CalculateLoadCharacteristicsInputs();
        this.CalculateHarmonicDistortionInputs();

        this.FilterVoltageNominalPickList(this.DefaultWelderLoadDto.VoltagePhaseID,
            this.DefaultWelderLoadDto.FrequencyID);
        this.FilterVoltageSpecificPickList(this.DefaultWelderLoadDto.VoltageNominalID);
        this.currentRunningUnits = this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.SizeUnitsList, this.WelderLoadDto.SizeRunningUnitsID);
        this.currentStartingUnits = this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.SizeUnitsList, this.WelderLoadDto.SizeStartingUnitsID);
        this.loading = false;
    }

    //Filter Harmonic Device Type List
    FilterHarmomicDeviceTypeList(startingMethodID: any) {
        if (startingMethodID != null && startingMethodID != undefined) {
            var defaultWelderLoadDto = this.DefaultWelderLoadDto;
            this.WelderLoadDto.WelderLoadPickListDto.HarmonicDeviceTypeList = defaultWelderLoadDto.WelderLoadPickListDto.HarmonicDeviceTypeList
                .filter(hd => hd.StartingMethodID == startingMethodID);
        }
    }

    MapSizeUnitChange(size: number, type: string) {

        let powerFactor = type == "running" ? this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.PFList, this.WelderLoadDto.RunningPFID)
            : this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.PFList, this.WelderLoadDto.StartingPFID);

        let sizeUnits = type == "running" ? this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.SizeUnitsList, this.WelderLoadDto.SizeRunningUnitsID)
            : this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.SizeUnitsList, this.WelderLoadDto.SizeStartingUnitsID);

        var targetSize = this._commonService.GetConvertedPowerUnitsValue(size, this.currentRunningUnits, sizeUnits,
            this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.VoltageSpecificList, this.WelderLoadDto.VoltageSpecificID), powerFactor, this.WelderLoadDto.VoltagePhaseID, false);

        if (type == "running") {
            this.WelderLoadDto.SizeRunning = targetSize;
        } else {
            this.WelderLoadDto.SizeStarting = targetSize;
        }

        this.currentRunningUnits = this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.SizeUnitsList, this.WelderLoadDto.SizeRunningUnitsID);
        this.currentStartingUnits = this.GetValue(this.WelderLoadDto.WelderLoadPickListDto.SizeUnitsList, this.WelderLoadDto.SizeStartingUnitsID);
    }

    //Filter Voltage Nominal picklist
    FilterVoltageNominalPickList(voltagePhase: any, frequency: any): void {
        if (voltagePhase != undefined && frequency != undefined) {
            var defaultLightingLoadDto = this.DefaultWelderLoadDto;
            this.WelderLoadDto.WelderLoadPickListDto.VoltageNominalList = defaultLightingLoadDto.WelderLoadPickListDto.VoltageNominalList
                .filter(x => x.FrequencyID == frequency && x.VoltagePhaseID == voltagePhase);
        } else {
            this.WelderLoadDto.WelderLoadPickListDto.VoltageNominalList = [];
        }
    }

    //Filter Voltage Specific picklist
    FilterVoltageSpecificPickList(voltageNominal: any): void {
        if (voltageNominal != undefined) {
            var defaultWelderLoadDto = this.DefaultWelderLoadDto;
            this.WelderLoadDto.WelderLoadPickListDto.VoltageSpecificList = defaultWelderLoadDto.WelderLoadPickListDto.VoltageSpecificList
                .filter(x => x.VoltageNominalID == voltageNominal);
        } else {
            this.WelderLoadDto.WelderLoadPickListDto.VoltageSpecificList = [];
        }
    }

    FilterSizeUnits(loadFamilyID: any) {
        if (loadFamilyID != undefined) {
            var defaultWelderLoadPicklist = this.DefaultWelderLoadDto.WelderLoadPickListDto as WelderLoadPickList;
            this.WelderLoadDto.WelderLoadPickListDto.SizeUnitsList = defaultWelderLoadPicklist.SizeUnitsList.filter(s => s.LoadFamilyID == loadFamilyID);
        }
    }

    //Voltage Nominal picklist change event
    MapVoltageNominal(voltagePhase: any, frequency: any): void {
        this.FilterVoltageNominalPickList(voltagePhase, frequency);

        var voltageNominalList = this.WelderLoadDto.WelderLoadPickListDto.VoltageNominalList as VoltageNominalList[];

        var voltageNominalSelected = this.WelderLoadDto.VoltageNominalID;

        var voltageNominalItem = voltageNominalList.find(v => v.IsDefaultSelection == true);
        if (voltageNominalItem != undefined) {
            voltageNominalSelected = voltageNominalItem.ID;
        }

        this.WelderLoadDto.VoltageNominalID = voltageNominalSelected;
        this.MapVoltageSpecific(voltageNominalSelected);
    }

    //Voltage specific picklist change event
    MapVoltageSpecific(voltageNominal: any): void {
        this.FilterVoltageSpecificPickList(voltageNominal);
        var voltageSpecificList = this.WelderLoadDto.WelderLoadPickListDto.VoltageSpecificList as VoltageSpecificList[];

        var voltageSpecificItem = voltageSpecificList.find(v => v.IsDefaultSelection);
        if (voltageSpecificItem != undefined) {
            this.WelderLoadDto.VoltageSpecificID = voltageSpecificItem.ID;
        }

        this.MapVoltageSpecificChange(this.WelderLoadDto.VoltageDipUnitsID);
    }

    //Voltage Specific Value Change
    MapVoltageSpecificChange(voltageDipUnitsID: number): void {
        this.MapVoltageDipUnitsChange(this.WelderLoadDto.VoltageDipUnitsID);
        this.CalculateLoadCharacteristicsInputs();
    }

    SaveLoadDetails(isValid: boolean): void {
        if (!isValid) {
            return;
        }
        this.WelderLoadDto.SolutionID = this.selectedLoad.SolutionID;
        this.WelderLoadDto.LoadID = this.selectedLoad.ID;
        this.MapLoadCharacteristicsValues();

        this._solutionServie.SaveSolutionWelderLoadDetail(this.WelderLoadDto).subscribe((load) => {
            this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
        });
    }

    MapLoadCharacteristicsValues(): void {
        this.WelderLoadDto.StartingLoadKva = this.loadCharacteristicsValues.sKVA;
        this.WelderLoadDto.StartingLoadKw = this.loadCharacteristicsValues.sKW;
        this.WelderLoadDto.RunningLoadKva = this.loadCharacteristicsValues.rKVA;
        this.WelderLoadDto.RunningLoadKw = this.loadCharacteristicsValues.rKW;
        this.WelderLoadDto.THIDContinuous = this.loadCharacteristicsValues.continuousHarmonicCurrentDistortion;
        this.WelderLoadDto.THIDMomentary = this.loadCharacteristicsValues.momentaryHarmonicCurrentDistortion;
        this.WelderLoadDto.THIDKva = this.THIDKva();
        this.WelderLoadDto.HD3 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD3
        this.WelderLoadDto.HD5 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD5;
        this.WelderLoadDto.HD7 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD7;
        this.WelderLoadDto.HD9 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD9;
        this.WelderLoadDto.HD11 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD11;
        this.WelderLoadDto.HD13 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD13;
        this.WelderLoadDto.HD15 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD15;
        this.WelderLoadDto.HD17 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD17;
        this.WelderLoadDto.HD19 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD19;
        this.WelderLoadDto.Shed = false;
    }

    CancelAddEditLoad(): void {
        this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
    }

    //Lighting Type Change
    MapWelderTypeChange(welderTypeID: number) {
        var defaultWelderLoadDto = this.DefaultWelderLoadDto;
        var welderType = this.DefaultWelderLoadDto.WelderLoadPickListDto.WelderTypeList.find(lt => lt.ID == welderTypeID);
        if (welderType != undefined) {
            this.WelderLoadDto.HarmonicDeviceTypeID = welderType.HarmonicDeviceTypeID;
        }
        this.CalculateLoadCharacteristicsInputs();
        this.MapHarmonicDeviceTypeChange(this.WelderLoadDto.HarmonicDeviceTypeID);
    }

    //Harmonic device Type Change
    MapHarmonicDeviceTypeChange(harmonicDeviceTypeID: number) {
        var defaultWelderLoadDto = this.DefaultWelderLoadDto;
        var harmonicDeviceType = this.DefaultWelderLoadDto.WelderLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == harmonicDeviceTypeID);
        if (harmonicDeviceType != undefined) {
            this.WelderLoadDto.HarmonicContentID = harmonicDeviceType.HarmonicContentID;
            this.CalculateHarmonicDistortionInputs();
        }
    }

    //Voltage Dip Units Change event
    MapVoltageDipUnitsChange(voltageDipUnitsID: number): VoltageDipList[] {
        var defaultWelderLoadDto = this.DefaultWelderLoadDto;
        var voltageDipUnitsItem = defaultWelderLoadDto.WelderLoadPickListDto.VoltageDipUnitsList.find(vd => vd.ID == voltageDipUnitsID);
        if (voltageDipUnitsItem != undefined && voltageDipUnitsItem.Value.toLowerCase() == "volts") {
            var voltageDipPercentValues = defaultWelderLoadDto.WelderLoadPickListDto.VoltageDipList as VoltageDipList[];

            var voltageSpecificList = this.WelderLoadDto.WelderLoadPickListDto.VoltageSpecificList as VoltageSpecificList[];
            var voltageSpecificItem = voltageSpecificList.find(vs => vs.ID == this.WelderLoadDto.VoltageSpecificID)

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
                this.WelderLoadDto.WelderLoadPickListDto.VoltageDipList = vDipList;
            }
        }
        else {
            this.WelderLoadDto.WelderLoadPickListDto.VoltageDipList = this.DefaultWelderLoadDto.WelderLoadPickListDto.VoltageDipList;
        }
        return this.WelderLoadDto.WelderLoadPickListDto.VoltageDipList;
    }

    //Frequency Dip Units Change event
    MapFrequencyDipUnitsChange(frequencyDipUnitsID: number): FrequencyDipList[] {
        var defaultWelderLoadDto = this.DefaultWelderLoadDto;
        var frequencyDipUnitsItem = defaultWelderLoadDto.WelderLoadPickListDto.FrequencyDipUnitsList.find(fd => fd.ID == frequencyDipUnitsID);
        if (frequencyDipUnitsItem != undefined && frequencyDipUnitsItem.Value.toLowerCase() == "percent") {
            var frequencyDipValues = defaultWelderLoadDto.WelderLoadPickListDto.FrequencyDipList as FrequencyDipList[];

            var frequencyItem = this.WelderLoadDto.Frequency;

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
                this.WelderLoadDto.WelderLoadPickListDto.FrequencyDipList = fDipList;
            }
        }
        else {
            this.WelderLoadDto.WelderLoadPickListDto.FrequencyDipList = this.DefaultWelderLoadDto.WelderLoadPickListDto.FrequencyDipList;
        }
        return this.WelderLoadDto.WelderLoadPickListDto.FrequencyDipList;
    }


    private GetValue(list: BasePickList[], id: number): any {
        var item = list.find(l => l.ID == id);
        return item != undefined ? item.Value : undefined;
    }

    //Load Characteristics Calculations

    CalculateLoadCharacteristicsInputs(): void {
        var pfStarting = this.DefaultWelderLoadDto.WelderLoadPickListDto.PFList.find(pf => pf.ID == this.WelderLoadDto.StartingPFID);
        this.PFStarting = pfStarting != undefined ? +pfStarting.Value : 0.0;

        this.PFRunning = +this.GetValue(this.DefaultWelderLoadDto.WelderLoadPickListDto.PFList,
            this.WelderLoadDto.RunningPFID);

        this.SizeRunningUnits = this.GetValue(this.DefaultWelderLoadDto.WelderLoadPickListDto.SizeUnitsList,
            this.WelderLoadDto.SizeRunningUnitsID);

        this.SizeStartingUnits = this.GetValue(this.DefaultWelderLoadDto.WelderLoadPickListDto.SizeUnitsList,
            this.WelderLoadDto.SizeStartingUnitsID);

        this.VoltagePhase = this.GetValue(this.DefaultWelderLoadDto.WelderLoadPickListDto.VoltagePhaseList,
            this.WelderLoadDto.VoltagePhaseID);

        this.VoltageSpecific = this.GetValue(this.DefaultWelderLoadDto.WelderLoadPickListDto.VoltageSpecificList,
            this.WelderLoadDto.VoltageSpecificID);

        var sequence = this.WelderLoadDto.WelderLoadPickListDto.SequenceList.find(s => s.ID == this.WelderLoadDto.SequenceID);
        this.LoadSequenceType = sequence != undefined ? sequence.SequenceType : '';

        //        this.StartingMethod = this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto)

        this.loadCharacteristicsValues.sKVA = +this.KVAStarting().toFixed(2);
        this.loadCharacteristicsValues.sKW = +this.KWStarting().toFixed(2);
        this.loadCharacteristicsValues.rKVA = +this.KVARunning().toFixed(2);
        this.loadCharacteristicsValues.rKW = +this.KWRunning().toFixed(2);
    }

    CalculateHarmonicDistortionInputs(): void {
        this.HarmonicContent = this.GetValue(this.DefaultWelderLoadDto.WelderLoadPickListDto.HarmonicContentList, this.WelderLoadDto.HarmonicContentID);
        var harmonicDevice = this.DefaultWelderLoadDto.WelderLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == this.WelderLoadDto.HarmonicDeviceTypeID);

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
            var size: number = this.WelderLoadDto.SizeRunning;
            var pf: number = this.PFRunning;

            if (this.WelderLoadDto.SizeStarting == null || this.WelderLoadDto.SizeStarting == 0) {
                this.SizeStartingUnits = this.SizeRunningUnits;
            }

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.WelderLoadDto.Quantity;
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

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.WelderLoadDto.Quantity;
            }

            return multiplier * this.KVAStarting() * 0.4;
        }
        catch (Error) {
            return 0;
        }
    }

    private KVARunning(): number {
        try {
            if (this.SizeStartingUnits.toLowerCase() == 'kw') {
                return this.WelderLoadDto.Quantity * (this.WelderLoadDto.SizeRunning / this.PFRunning);
            }
            else if (this.SizeStartingUnits.toLowerCase() == 'kva') {
                return this.WelderLoadDto.Quantity * this.WelderLoadDto.SizeRunning;
            }
            else {
                if (this.VoltagePhase == 1) {
                    return this.WelderLoadDto.Quantity * ((this.WelderLoadDto.SizeRunning * this.VoltageSpecific / 1000) * 1);
                }
                else {
                    return this.WelderLoadDto.Quantity * ((this.WelderLoadDto.SizeRunning * this.VoltageSpecific / 1000) * 1.732);
                }
            }
        }
        catch (Error) {
            return 0;
        }
    }

    private KWRunning(): number {
        try {
            if (this.SizeStartingUnits.toLowerCase() == 'kw') {
                return this.WelderLoadDto.Quantity * this.WelderLoadDto.SizeRunning;
            }
            else if (this.SizeStartingUnits.toLowerCase() == 'kva') {
                return this.WelderLoadDto.Quantity * (this.WelderLoadDto.SizeRunning * this.PFRunning);
            }
            else {
                if (this.VoltagePhase == 1) {
                    return this.WelderLoadDto.Quantity * ((this.WelderLoadDto.SizeRunning * this.VoltageSpecific * this.PFRunning / 1000) * 1);
                }
                else {
                    return this.WelderLoadDto.Quantity * ((this.WelderLoadDto.SizeRunning * this.VoltageSpecific * this.PFRunning / 1000) * 1.732);
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
            if (this.WelderLoadDto.StartingMethodID !== +StartingMethodEnum.AcrossTheLine || this.WelderLoadDto.StartingMethodID !== +StartingMethodEnum.ReducedVoltage) {
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
            if (this.WelderLoadDto.StartingMethodID !== +StartingMethodEnum.SoftStarter) {
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
