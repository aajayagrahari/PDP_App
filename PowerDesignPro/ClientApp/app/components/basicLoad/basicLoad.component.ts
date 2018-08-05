import { Component, OnInit, Input } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';
import { BasicLoad, BasicLoadPickList } from '../_models/basicLoad.model';
import { BasePickList, HarmonicDeviceTypePickList, StartingMethodEnum } from '../_models/load.model';
import { LoadCharacteristics } from '../_models/loadCharacteristics.model';
import { LoadModel } from '../_models/load.model';
import { VoltageDipList, FrequencyDipList, VoltageNominalList, VoltageSpecificList } from '../_models/solutionSetup.model';
import { ProjectDetails } from '../_models/project.model';
import { solutionService } from '../Services/solution.services';
import { CommonService } from '../Services/common.service';
import { Router, ActivatedRoute, NavigationCancel } from '@angular/router';


@Component({
    selector: 'basic-load',
    templateUrl: './basicLoad.component.html',
    styleUrls: ['./basicLoad.component.css'],
    providers: [CommonService]
})

export class BasicLoadComponent implements OnInit {
    public loading: boolean = false;
    @Input() selectedLoad: LoadModel;
    @Input() readOnlyAccess: boolean;
    public BasicLoadDto = new BasicLoad();
    public DefaultBasicLoadDto = new BasicLoad();
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
        this.BasicLoadDto = load as BasicLoad;
        if (this.selectedLoad.CopyLoad == true) {
            this.BasicLoadDto.ID = 0;
            this.BasicLoadDto.Description = "";
        }

        this.DefaultBasicLoadDto = JSON.parse(JSON.stringify(this.BasicLoadDto));

        this.FilterHarmomicDeviceTypeList(this.BasicLoadDto.StartingMethodID);
        this.MapVoltageDipUnitsChange(this.BasicLoadDto.VoltageDipUnitsID);
        this.MapFrequencyDipUnitsChange(this.BasicLoadDto.FrequencyDipUnitsID);
        this.FilterSizeUnits(this.selectedLoad.LoadFamilyID);

        this.CalculateLoadCharacteristicsInputs();
        this.CalculateHarmonicDistortionInputs();

        this.FilterVoltageNominalPickList(this.DefaultBasicLoadDto.VoltagePhaseID,
            this.DefaultBasicLoadDto.FrequencyID);
        this.FilterVoltageSpecificPickList(this.DefaultBasicLoadDto.VoltageNominalID);
        this.currentRunningUnits = this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.SizeUnitsList, this.BasicLoadDto.SizeRunningUnitsID);
        this.currentStartingUnits = this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.SizeUnitsList, this.BasicLoadDto.SizeStartingUnitsID);
        this.loading = false;
    }

    //Filter Harmonic Device Type List
    FilterHarmomicDeviceTypeList(startingMethodID: any) {
        if (startingMethodID != null && startingMethodID != undefined) {
            var defaultBasicLoadDto = this.DefaultBasicLoadDto;
            this.BasicLoadDto.BasicLoadPickListDto.HarmonicDeviceTypeList = defaultBasicLoadDto.BasicLoadPickListDto.HarmonicDeviceTypeList
                .filter(hd => hd.StartingMethodID == startingMethodID);
        }
    }

    //Filter Voltage Nominal picklist
    FilterVoltageNominalPickList(voltagePhase: any, frequency: any): void {
        if (voltagePhase != undefined && frequency != undefined) {
            var defaultBasicLoadDto = this.DefaultBasicLoadDto;
            this.BasicLoadDto.BasicLoadPickListDto.VoltageNominalList = defaultBasicLoadDto.BasicLoadPickListDto.VoltageNominalList
                .filter(x => x.FrequencyID == frequency && x.VoltagePhaseID == voltagePhase);
        } else {
            this.BasicLoadDto.BasicLoadPickListDto.VoltageNominalList = [];
        }
    }

    //Filter Voltage Specific picklist
    FilterVoltageSpecificPickList(voltageNominal: any): void {
        if (voltageNominal != undefined) {
            var defaultBasicLoadDto = this.DefaultBasicLoadDto;
            this.BasicLoadDto.BasicLoadPickListDto.VoltageSpecificList = defaultBasicLoadDto.BasicLoadPickListDto.VoltageSpecificList
                .filter(x => x.VoltageNominalID == voltageNominal);
        } else {
            this.BasicLoadDto.BasicLoadPickListDto.VoltageSpecificList = [];
        }
    }

    FilterSizeUnits(loadFamilyID: any) {
        if (loadFamilyID != undefined) {
            var defaultBasicLoadPicklist = this.DefaultBasicLoadDto.BasicLoadPickListDto as BasicLoadPickList;
            this.BasicLoadDto.BasicLoadPickListDto.SizeUnitsList = defaultBasicLoadPicklist.SizeUnitsList.filter(s => s.LoadFamilyID == loadFamilyID);
        }
    }

    //Voltage Nominal picklist change event
    MapVoltageNominal(voltagePhase: any, frequency: any): void {
        this.FilterVoltageNominalPickList(voltagePhase, frequency);

        var voltageNominalList = this.BasicLoadDto.BasicLoadPickListDto.VoltageNominalList as VoltageNominalList[];

        var voltageNominalSelected = this.BasicLoadDto.VoltageNominalID;

        var voltageNominalItem = voltageNominalList.find(v => v.IsDefaultSelection == true);
        if (voltageNominalItem != undefined) {
            voltageNominalSelected = voltageNominalItem.ID;
        }

        this.BasicLoadDto.VoltageNominalID = voltageNominalSelected;
        this.MapVoltageSpecific(voltageNominalSelected);
    }

    //Voltage specific picklist change event
    MapVoltageSpecific(voltageNominal: any): void {
        this.FilterVoltageSpecificPickList(voltageNominal);
        var voltageSpecificList = this.BasicLoadDto.BasicLoadPickListDto.VoltageSpecificList as VoltageSpecificList[];

        var voltageSpecificItem = voltageSpecificList.find(v => v.IsDefaultSelection);
        if (voltageSpecificItem != undefined) {
            this.BasicLoadDto.VoltageSpecificID = voltageSpecificItem.ID;
        }

        this.MapVoltageSpecificChange(this.BasicLoadDto.VoltageDipUnitsID);
    }

    SaveLoadDetails(isValid: boolean): void {
        if (!isValid) {
            return;
        }
        this.BasicLoadDto.SolutionID = this.selectedLoad.SolutionID;
        this.BasicLoadDto.LoadID = this.selectedLoad.ID;
        this.MapLoadCharacteristicsValues();

        this._solutionServie.SaveSolutionBasicLoadDetail(this.BasicLoadDto).subscribe((load) => {
            this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
        });
    }

    MapLoadCharacteristicsValues(): void {
        this.BasicLoadDto.StartingLoadKva = this.loadCharacteristicsValues.sKVA;
        this.BasicLoadDto.StartingLoadKw = this.loadCharacteristicsValues.sKW;
        this.BasicLoadDto.RunningLoadKva = this.loadCharacteristicsValues.rKVA;
        this.BasicLoadDto.RunningLoadKw = this.loadCharacteristicsValues.rKW;
        this.BasicLoadDto.THIDContinuous = this.loadCharacteristicsValues.continuousHarmonicCurrentDistortion;
        this.BasicLoadDto.THIDMomentary = this.loadCharacteristicsValues.momentaryHarmonicCurrentDistortion;
        this.BasicLoadDto.THIDKva = this.THIDKva();
        this.BasicLoadDto.HD3 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD3
        this.BasicLoadDto.HD5 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD5;
        this.BasicLoadDto.HD7 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD7;
        this.BasicLoadDto.HD9 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD9;
        this.BasicLoadDto.HD11 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD11;
        this.BasicLoadDto.HD13 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD13;
        this.BasicLoadDto.HD15 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD15;
        this.BasicLoadDto.HD17 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD17;
        this.BasicLoadDto.HD19 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD19;
        this.BasicLoadDto.Shed = false;
    }

    CancelAddEditLoad(): void {
        this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
    }

    //Harmonic device Type Change
    MapHarmonicDeviceTypeChange(harmonicDeviceTypeID: number) {
        var defaultBasicLoadDto = this.DefaultBasicLoadDto;
        var harmonicDeviceType = this.DefaultBasicLoadDto.BasicLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == harmonicDeviceTypeID);
        if (harmonicDeviceType != undefined) {
            this.BasicLoadDto.HarmonicContentID = harmonicDeviceType.HarmonicContentID;
            this.CalculateHarmonicDistortionInputs();
        }
    }

    //Voltage Specific Value Change
    MapVoltageSpecificChange(voltageDipUnitsID: number): void {
        this.MapVoltageDipUnitsChange(this.BasicLoadDto.VoltageDipUnitsID);
        this.CalculateLoadCharacteristicsInputs();
    }

    //Voltage Dip Units Change event
    MapVoltageDipUnitsChange(voltageDipUnitsID: number): VoltageDipList[] {
        var defaultBasicLoadDto = this.DefaultBasicLoadDto;
        var voltageDipUnitsItem = defaultBasicLoadDto.BasicLoadPickListDto.VoltageDipUnitsList.find(vd => vd.ID == voltageDipUnitsID);
        if (voltageDipUnitsItem != undefined && voltageDipUnitsItem.Value.toLowerCase() == "volts") {
            var voltageDipPercentValues = defaultBasicLoadDto.BasicLoadPickListDto.VoltageDipList as VoltageDipList[];

            var voltageSpecificList = this.BasicLoadDto.BasicLoadPickListDto.VoltageSpecificList as VoltageSpecificList[];
            var voltageSpecificItem = voltageSpecificList.find(vs => vs.ID == this.BasicLoadDto.VoltageSpecificID)

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
                this.BasicLoadDto.BasicLoadPickListDto.VoltageDipList = vDipList;
            }
        }
        else {
            this.BasicLoadDto.BasicLoadPickListDto.VoltageDipList = this.DefaultBasicLoadDto.BasicLoadPickListDto.VoltageDipList;
        }
        return this.BasicLoadDto.BasicLoadPickListDto.VoltageDipList;
    }

    //Frequency Dip Units Change event
    MapFrequencyDipUnitsChange(frequencyDipUnitsID: number): FrequencyDipList[] {
        var defaultBasicLoadDto = this.DefaultBasicLoadDto;
        var frequencyDipUnitsItem = defaultBasicLoadDto.BasicLoadPickListDto.FrequencyDipUnitsList.find(fd => fd.ID == frequencyDipUnitsID);
        if (frequencyDipUnitsItem != undefined && frequencyDipUnitsItem.Value.toLowerCase() == "percent") {
            var frequencyDipValues = defaultBasicLoadDto.BasicLoadPickListDto.FrequencyDipList as FrequencyDipList[];

            var frequencyItem = this.BasicLoadDto.Frequency;

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
                this.BasicLoadDto.BasicLoadPickListDto.FrequencyDipList = fDipList;
            }
        }
        else {
            this.BasicLoadDto.BasicLoadPickListDto.FrequencyDipList = this.DefaultBasicLoadDto.BasicLoadPickListDto.FrequencyDipList;
        }
        return this.BasicLoadDto.BasicLoadPickListDto.FrequencyDipList;
    }

    MapSizeUnitChange(size: number, type: string) {
        
        //let powerFactor = type == "running" ? this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.PFList, this.BasicLoadDto.RunningPFID)
        //    : this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.PFList, this.BasicLoadDto.StartingPFID);

        let powerFactor = this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.PFList, this.BasicLoadDto.RunningPFID);

        //let sizeUnits = type == "running" ? this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.SizeUnitsList, this.BasicLoadDto.SizeRunningUnitsID)
        //    : this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.SizeUnitsList, this.BasicLoadDto.SizeStartingUnitsID);

        let sizeUnits = this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.SizeUnitsList, this.BasicLoadDto.SizeRunningUnitsID);

        var targetSize = this._commonService.GetConvertedPowerUnitsValue(size, this.currentRunningUnits, sizeUnits,
            this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.VoltageSpecificList, this.BasicLoadDto.VoltageSpecificID), powerFactor, this.BasicLoadDto.VoltagePhaseID, false);

        if (type == "running") {
            this.BasicLoadDto.SizeRunning = targetSize;
        } else {
            //this.BasicLoadDto.SizeStarting = targetSize;
            this.CalculateLoadCharacteristicsInputs();
        }

        this.currentRunningUnits = this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.SizeUnitsList, this.BasicLoadDto.SizeRunningUnitsID);
        this.currentStartingUnits = this.GetValue(this.BasicLoadDto.BasicLoadPickListDto.SizeUnitsList, this.BasicLoadDto.SizeStartingUnitsID);
    }


    private GetValue(list: BasePickList[], id: number): any {
        var item = list.find(l => l.ID == id);
        return item != undefined ? item.Value : undefined;
    }

    //Load Characteristics Calculations

    CalculateLoadCharacteristicsInputs(): void {
        var pfStarting = this.DefaultBasicLoadDto.BasicLoadPickListDto.PFList.find(pf => pf.ID == this.BasicLoadDto.StartingPFID);
        this.PFStarting = pfStarting != undefined ? +pfStarting.Value : 0.0;

        this.PFRunning = +this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto.PFList,
            this.BasicLoadDto.RunningPFID);

        this.SizeRunningUnits = this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto.SizeUnitsList,
            this.BasicLoadDto.SizeRunningUnitsID);

        this.SizeStartingUnits = this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto.SizeUnitsList,
            this.BasicLoadDto.SizeStartingUnitsID);

        this.VoltagePhase = this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto.VoltagePhaseList,
            this.BasicLoadDto.VoltagePhaseID);

        this.VoltageSpecific = this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto.VoltageSpecificList,
            this.BasicLoadDto.VoltageSpecificID);

        var sequence = this.BasicLoadDto.BasicLoadPickListDto.SequenceList.find(s => s.ID == this.BasicLoadDto.SequenceID);
        this.LoadSequenceType = sequence != undefined ? sequence.SequenceType : '';

        //        this.StartingMethod = this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto)

        this.loadCharacteristicsValues.sKVA = +this.KVAStarting().toFixed(2);
        this.loadCharacteristicsValues.sKW = +this.KWStarting().toFixed(2);
        this.loadCharacteristicsValues.rKVA = +this.KVARunning().toFixed(2);
        this.loadCharacteristicsValues.rKW = +this.KWRunning().toFixed(2);
    }

    CalculateHarmonicDistortionInputs(): void {
        this.HarmonicContent = this.GetValue(this.DefaultBasicLoadDto.BasicLoadPickListDto.HarmonicContentList, this.BasicLoadDto.HarmonicContentID);
        var harmonicDevice = this.DefaultBasicLoadDto.BasicLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == this.BasicLoadDto.HarmonicDeviceTypeID);

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
            var size: number = this.BasicLoadDto.SizeStarting > 0 ? this.BasicLoadDto.SizeStarting : this.BasicLoadDto.SizeRunning;
            var pf: number = this.PFStarting > 0 ? this.PFStarting : this.PFRunning;

            if (this.BasicLoadDto.SizeStarting == null || this.BasicLoadDto.SizeStarting == 0) {
                this.SizeStartingUnits = this.SizeRunningUnits;
            }

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.BasicLoadDto.Quantity;
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
            var size: number = this.BasicLoadDto.SizeStarting > 0 ? this.BasicLoadDto.SizeStarting : this.BasicLoadDto.SizeRunning;
            var pf: number = this.PFStarting > 0 ? this.PFStarting : this.PFRunning;

            if (this.BasicLoadDto.SizeStarting == null || this.BasicLoadDto.SizeStarting == 0) {
                this.SizeStartingUnits = this.SizeRunningUnits;
            }

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.BasicLoadDto.Quantity;
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
                return this.BasicLoadDto.Quantity * (this.BasicLoadDto.SizeRunning / this.PFRunning);
            }
            else if (this.SizeRunningUnits.toLowerCase() == 'kva') {
                return this.BasicLoadDto.Quantity * this.BasicLoadDto.SizeRunning;
            }
            else {
                if (this.VoltagePhase == 1) {
                    return this.BasicLoadDto.Quantity * ((this.BasicLoadDto.SizeRunning * this.VoltageSpecific / 1000) * 1);
                }
                else {
                    return this.BasicLoadDto.Quantity * ((this.BasicLoadDto.SizeRunning * this.VoltageSpecific / 1000) * 1.732);
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
                return this.BasicLoadDto.Quantity * this.BasicLoadDto.SizeRunning;
            }
            else if (this.SizeRunningUnits.toLowerCase() == 'kva') {
                return this.BasicLoadDto.Quantity * (this.BasicLoadDto.SizeRunning * this.PFRunning);
            }
            else {
                if (this.VoltagePhase == 1) {
                    return this.BasicLoadDto.Quantity * ((this.BasicLoadDto.SizeRunning * this.VoltageSpecific * this.PFRunning / 1000) * 1);
                }
                else {
                    return this.BasicLoadDto.Quantity * ((this.BasicLoadDto.SizeRunning * this.VoltageSpecific * this.PFRunning / 1000) * 1.732);
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
            if (this.BasicLoadDto.StartingMethodID !== +StartingMethodEnum.AcrossTheLine || this.BasicLoadDto.StartingMethodID !== +StartingMethodEnum.ReducedVoltage) {
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
            if (this.BasicLoadDto.StartingMethodID !== +StartingMethodEnum.SoftStarter) {
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

            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD3 = +(multiplier * ((harmonicDevice.HD3 * this.HarmonicContent) / this._THID)).toFixed(1);
            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD5 = +(multiplier * ((harmonicDevice.HD5 * this.HarmonicContent) / this._THID)).toFixed(1);
            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD7 = +(multiplier * ((harmonicDevice.HD7 * this.HarmonicContent) / this._THID)).toFixed(1);
            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD9 = +(multiplier * ((harmonicDevice.HD9 * this.HarmonicContent) / this._THID)).toFixed(1);
            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD11 = +(multiplier * ((harmonicDevice.HD11 * this.HarmonicContent) / this._THID)).toFixed(1);
            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD13 = +(multiplier * ((harmonicDevice.HD13 * this.HarmonicContent) / this._THID)).toFixed(1);
            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD15 = +(multiplier * ((harmonicDevice.HD15 * this.HarmonicContent) / this._THID)).toFixed(1);
            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD17 = +(multiplier * ((harmonicDevice.HD17 * this.HarmonicContent) / this._THID)).toFixed(1);
            //this.loadCharacteristicsValues.harmonicCurrentDistortion.HD19 = +(multiplier * ((harmonicDevice.HD19 * this.HarmonicContent) / this._THID)).toFixed(1);

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
