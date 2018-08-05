import { Component, OnInit, Input } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';
import { MotorLoad, MotorLoadPickList, MotorCalculation, StartingCodePickList } from '../_models/motorLoad.model';
import { BasePickList, HarmonicDeviceTypePickList, StartingMethodEnum } from '../_models/load.model';
import { LoadCharacteristics } from '../_models/loadCharacteristics.model';
import { LoadModel } from '../_models/load.model';
import { VoltageDipList, FrequencyDipList, VoltageNominalList, VoltageSpecificList } from '../_models/solutionSetup.model';
import { ProjectDetails } from '../_models/project.model';
import { solutionService } from '../Services/solution.services';
import { Router, ActivatedRoute, NavigationCancel } from '@angular/router';

@Component({
    selector: 'motor-load',
    templateUrl: './motorLoad.component.html',
    styleUrls: ['./motorLoad.component.css']
})

export class MotorLoadComponent implements OnInit {
    public loading: boolean = false;
    @Input() selectedLoad: LoadModel;
    @Input() readOnlyAccess: boolean;
    public MotorLoadDto = new MotorLoad();
    public DefaultMotorLoadDto = new MotorLoad();
    private solutionId: number;
    private loadId: number;

    public loadCharacteristicsValues = new LoadCharacteristics();

    //Variables to calculate Load Characteristics
    private SizeRunning: string;
    private StartingMethod: string;
    private MotorType: string;
    private MotorLoadType: string;
    private LoadSequenceType: string;
    private HarmonicDeviceType: string;
    private MotorLoadLevel: number;
    private Voltage: number;

    private HarmonicContent: number;
    private _THID: number;
    private VoltagePhase: number = 0;
    private VoltageSpecific: number = 0;
    private currentRunningUnits: string;
    private sizeRunningUnits: string;

    private KWStartingMultiplier: number = 0;
    private KVAStartingMultiplier: number = 0;
    private HarmonicKVAMultiplier: number = 0;
    private HarmonicLoadLimit: number = 0;
    private SelectedStartingCodeId: number = 0;

    private MotorKVARunning: number = 0;
    private PFRunning: number = 0;
    private PFStarting: number = 0; 

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

        this.MotorLoadDto = load as MotorLoad;
        if (this.selectedLoad.CopyLoad == true) {
            this.MotorLoadDto.ID = 0;
            this.MotorLoadDto.Description = "";
        }

        this.DefaultMotorLoadDto = JSON.parse(JSON.stringify(this.MotorLoadDto));
        this.SizeRunningChanged();
        this.FilterHarmomicDeviceTypeList(this.DefaultMotorLoadDto.StartingMethodID);
        this.currentRunningUnits = this.GetValue(this.MotorLoadDto.MotorLoadPickListDto.SizeUnitsList,
            this.MotorLoadDto.SizeRunningUnitsID);

        this.MapVoltageDipUnitsChange(this.DefaultMotorLoadDto.VoltageDipUnitsID);
        this.MapFrequencyDipUnitsChange(this.DefaultMotorLoadDto.FrequencyDipUnitsID);
        //this.MapHarmonicDeviceType(this.DefaultMotorLoadDto.StartingMethodID);
        this.FilterSizeUnits(this.selectedLoad.LoadFamilyID);
        this.FilterVoltageNominalPickList(this.DefaultMotorLoadDto.VoltagePhaseID, this.DefaultMotorLoadDto.FrequencyID);
        this.FilterVoltageSpecificPickList(this.DefaultMotorLoadDto.VoltageNominalID);
        this.MapStartingCode();

        this.CalculateLoadCharacteristicsInputs();
        this.CalculateHarmonicDistortionInputs();

        this.loading = false;
    }

    //Filter Harmonic Device Type List
    FilterHarmomicDeviceTypeList(startingMethodID: any) {
        if (startingMethodID != null && startingMethodID != undefined) {

            var defaultMotorLoadPicklist = this.DefaultMotorLoadDto.MotorLoadPickListDto as MotorLoadPickList;
            //this.setMotorLoadType(startingMethodID);

            this.MotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList = defaultMotorLoadPicklist.HarmonicDeviceTypeList
                .filter(hd => hd.StartingMethodID == startingMethodID);

            this.MotorLoadDto.MotorLoadPickListDto.ConfigurationInputList = defaultMotorLoadPicklist.ConfigurationInputList
                .filter(s => s.StartingMethodID == startingMethodID);
        }
    }

    //Filter Voltage Nominal picklist
    FilterVoltageNominalPickList(voltagePhase: any, frequency: any): void {
        if (voltagePhase != undefined && frequency != undefined) {
            var defaultMotorLoadDto = this.DefaultMotorLoadDto;
            this.MotorLoadDto.MotorLoadPickListDto.VoltageNominalList = defaultMotorLoadDto.MotorLoadPickListDto.VoltageNominalList
                .filter(x => x.FrequencyID == frequency && x.VoltagePhaseID == voltagePhase);
        } else {
            this.MotorLoadDto.MotorLoadPickListDto.VoltageNominalList = [];
        }
    }

    //Filter Voltage Specific picklist
    FilterVoltageSpecificPickList(voltageNominal: any): void {
        if (voltageNominal != undefined) {
            var defaultMotorLoadDto = this.DefaultMotorLoadDto;
            this.MotorLoadDto.MotorLoadPickListDto.VoltageSpecificList = defaultMotorLoadDto.MotorLoadPickListDto.VoltageSpecificList
                .filter(x => x.VoltageNominalID == voltageNominal);
        } else {
            this.MotorLoadDto.MotorLoadPickListDto.VoltageSpecificList = [];
        }
    }

    FilterSizeUnits(loadFamilyID: any) {
        if (loadFamilyID != undefined) {
            var defaultMotorLoadPicklist = this.DefaultMotorLoadDto.MotorLoadPickListDto as MotorLoadPickList;
            this.MotorLoadDto.MotorLoadPickListDto.SizeUnitsList = defaultMotorLoadPicklist.SizeUnitsList.filter(s => s.LoadFamilyID == loadFamilyID);
        }
    }

    MapHarmonicDeviceType(startingMethodID: any) {
        if (startingMethodID != undefined) {
            var configurationInput = this.DefaultMotorLoadDto.MotorLoadPickListDto.ConfigurationInputList.find(
                c => c.StartingMethodID == startingMethodID && c.IsDefaultSelection
            );
            if (configurationInput != undefined) {
                this.MotorLoadDto.ConfigurationInputID = configurationInput.ID;
            }
            var defaultMotorLoadPicklist = this.DefaultMotorLoadDto.MotorLoadPickListDto as MotorLoadPickList;
            this.setMotorLoadType(startingMethodID);

            this.MotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList = defaultMotorLoadPicklist.HarmonicDeviceTypeList.
                filter(s => s.StartingMethodID == startingMethodID);
            this.MotorLoadDto.MotorLoadPickListDto.ConfigurationInputList = defaultMotorLoadPicklist.ConfigurationInputList.
                filter(s => s.StartingMethodID == startingMethodID);

            var findHDTID = defaultMotorLoadPicklist.StartingMethodList.find(s => s.ID == this.MotorLoadDto.StartingMethodID);
            this.MotorLoadDto.HarmonicDeviceTypeID = findHDTID != undefined ? findHDTID.DefaultHarmonicTypeID : 0;

            var findHarmonicType = this.MotorLoadDto.HarmonicDeviceTypeID; //this.MotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList[0].ID;
            this.MapHarmonicDeviceTypeChange(this.MotorLoadDto.HarmonicDeviceTypeID);
            if (findHarmonicType != undefined) {
                var findHarmonicDeviceType = this.MotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList.find(s => s.ID == findHarmonicType);
                var defaultContentID = findHarmonicDeviceType != undefined ? findHarmonicDeviceType.HarmonicContentID : 0;
                var HarmonicContent = defaultMotorLoadPicklist.HarmonicContentList.find(s => s.ID == defaultContentID);
                var defaultValue = HarmonicContent != undefined ? HarmonicContent.Value : 0;
                if (defaultValue > 0) {
                    this.MotorLoadDto.MotorLoadPickListDto.HarmonicContentList = defaultMotorLoadPicklist.HarmonicContentList.filter(h => h.StartingMethodID == startingMethodID);
                }
                else {
                    this.MotorLoadDto.MotorLoadPickListDto.HarmonicContentList = defaultMotorLoadPicklist.HarmonicContentList.filter(s => s.ID == defaultContentID);
                    this.MotorLoadDto.HarmonicContentID = defaultContentID;
                }
            }


            //this.MotorLoadDto.MotorLoadPickListDto.HarmonicContentList = defaultMotorLoadPicklist.HarmonicContentList.filter(s => s.StartingMethodID == startingMethodID);
            //this.MotorLoadDto.HarmonicContentID = this.MotorLoadDto.MotorLoadPickListDto.HarmonicContentList[0].ID;
            //this.MotorLoadDto.HarmonicDeviceTypeID = this.MotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList[0].ID;
            //this.MotorLoadDto.ConfigurationInputID = this.MotorLoadDto.MotorLoadPickListDto.ConfigurationInputList[0].ID;
            this.CalculateLoadCharacteristicsInputs();


        }
    }

    SaveLoadDetails(isValid: boolean): void {
        if (!isValid) {
            return;
        }
        this.MotorLoadDto.SolutionID = this.selectedLoad.SolutionID;
        this.MotorLoadDto.LoadID = this.selectedLoad.ID;
        this.MapLoadCharacteristicsValues();

        this._solutionServie.SaveSolutionMotorLoadDetail(this.MotorLoadDto).subscribe((load) => {
            this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
        });
    }

    MapLoadCharacteristicsValues(): void {
        this.MotorLoadDto.StartingLoadKva = this.loadCharacteristicsValues.sKVA;
        this.MotorLoadDto.StartingLoadKw = this.loadCharacteristicsValues.sKW;
        this.MotorLoadDto.RunningLoadKva = this.loadCharacteristicsValues.rKVA;
        this.MotorLoadDto.RunningLoadKw = this.loadCharacteristicsValues.rKW;
        this.MotorLoadDto.THIDContinuous = this.loadCharacteristicsValues.continuousHarmonicCurrentDistortion;
        this.MotorLoadDto.THIDMomentary = this.loadCharacteristicsValues.momentaryHarmonicCurrentDistortion;
        this.MotorLoadDto.THIDKva = this.THIDKva();
        this.MotorLoadDto.HD3 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD3;
        this.MotorLoadDto.HD5 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD5;
        this.MotorLoadDto.HD7 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD7;
        this.MotorLoadDto.HD9 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD9;
        this.MotorLoadDto.HD11 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD11;
        this.MotorLoadDto.HD13 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD13;
        this.MotorLoadDto.HD15 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD15;
        this.MotorLoadDto.HD17 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD17;
        this.MotorLoadDto.HD19 = this.loadCharacteristicsValues.harmonicCurrentDistortion.HD19;
        this.MotorLoadDto.Shed = false;
    }

    CancelAddEditLoad(): void {
        this._route.navigate(['/project', this.selectedLoad.ProjectID, 'solution', this.selectedLoad.SolutionID]);
    }

    //Harmonic device Type Change
    MapHarmonicDeviceTypeChange(harmonicDeviceTypeID: number) {
        var defaultMotorLoadDto = this.DefaultMotorLoadDto;
        var harmonicDeviceType = this.DefaultMotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == harmonicDeviceTypeID);
        if (harmonicDeviceType != undefined) {
            this.MotorLoadDto.HarmonicContentID = harmonicDeviceType.HarmonicContentID;
            this.MotorLoadDto.MotorLoadTypeID = harmonicDeviceType.MotorLoadTypeID;
            this.CalculateLoadCharacteristicsInputs();
            this.CalculateHarmonicDistortionInputs();
        }
    }

    MapMotorType(MotorTypeID: number) {
        var defaultMotorLoadDto = this.DefaultMotorLoadDto;
        var motorType = this.DefaultMotorLoadDto.MotorLoadPickListDto.MotorTypeList.find(hd => hd.ID == MotorTypeID);
        if (motorType != undefined) {
            this.MotorLoadDto.StartingCodeID = motorType.StartingCodeID;
        }
    }

    //Voltage Dip Units Change event
    MapVoltageDipUnitsChange(voltageDipUnitsID: number): VoltageDipList[] {
        var defaultMotorLoadDto = this.DefaultMotorLoadDto;
        var voltageDipUnitsItem = defaultMotorLoadDto.MotorLoadPickListDto.VoltageDipUnitsList.find(vd => vd.ID == voltageDipUnitsID);
        if (voltageDipUnitsItem != undefined && voltageDipUnitsItem.Value.toLowerCase() == "volts") {
            var voltageDipPercentValues = defaultMotorLoadDto.MotorLoadPickListDto.VoltageDipList as VoltageDipList[];

            var voltageSpecificList = this.MotorLoadDto.MotorLoadPickListDto.VoltageSpecificList as VoltageSpecificList[];
            var voltageSpecificItem = voltageSpecificList.find(vs => vs.ID == this.MotorLoadDto.VoltageSpecificID)

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
                this.MotorLoadDto.MotorLoadPickListDto.VoltageDipList = vDipList;
            }
        }
        else {
            this.MotorLoadDto.MotorLoadPickListDto.VoltageDipList = this.DefaultMotorLoadDto.MotorLoadPickListDto.VoltageDipList;
        }
        return this.MotorLoadDto.MotorLoadPickListDto.VoltageDipList;
    }

    //Frequency Dip Units Change event
    MapFrequencyDipUnitsChange(frequencyDipUnitsID: number): FrequencyDipList[] {

        var defaultMotorLoadDto = this.DefaultMotorLoadDto;
        var frequencyDipUnitsItem = defaultMotorLoadDto.MotorLoadPickListDto.FrequencyDipUnitsList.find(fd => fd.ID == frequencyDipUnitsID);
        if (frequencyDipUnitsItem != undefined && frequencyDipUnitsItem.Value.toLowerCase() == "percent") {
            var frequencyDipValues = defaultMotorLoadDto.MotorLoadPickListDto.FrequencyDipList as FrequencyDipList[];

            var frequencyItem = this.MotorLoadDto.Frequency;

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
                this.MotorLoadDto.MotorLoadPickListDto.FrequencyDipList = fDipList;
            }
        }
        else {
            this.MotorLoadDto.MotorLoadPickListDto.FrequencyDipList = this.DefaultMotorLoadDto.MotorLoadPickListDto.FrequencyDipList;
        }
        return this.MotorLoadDto.MotorLoadPickListDto.FrequencyDipList;
    }

    private GetValue(list: BasePickList[], id: number): any {
        var item = list.find(l => l.ID == id);
        return item != undefined ? item.Value : undefined;
    }

    MapSizeUnitChange(size: number, type: string) {
        debugger
        this.sizeRunningUnits = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.SizeUnitsList,
            this.MotorLoadDto.SizeRunningUnitsID);

        var Size = this.ConvertMotorPowerUnits(this.currentRunningUnits, this.sizeRunningUnits, size, this.MotorLoadDto.VoltagePhaseID, this.Voltage);
        this.MotorLoadDto.SizeRunning = Size;
        this.currentRunningUnits = this.GetValue(this.MotorLoadDto.MotorLoadPickListDto.SizeUnitsList,
            this.MotorLoadDto.SizeRunningUnitsID);

        this.MapStartingCode();
    }

    MapVoltageNominal(voltagePhase: any, frequency: any): void {

        this.FilterVoltageNominalPickList(voltagePhase, frequency);

        var voltageNominalList = this.MotorLoadDto.MotorLoadPickListDto.VoltageNominalList as VoltageNominalList[];

        var voltageNominalSelected = this.MotorLoadDto.VoltageNominalID;

        var voltageNominalItem = voltageNominalList.find(v => v.IsDefaultSelection == true);
        if (voltageNominalItem != undefined) {
            voltageNominalSelected = voltageNominalItem.ID;
        }

        this.MotorLoadDto.VoltageNominalID = voltageNominalSelected;
        this.MapVoltageSpecific(voltageNominalSelected);
    }

    MapVoltageSpecific(voltageNominal: any): void {
        this.FilterVoltageSpecificPickList(voltageNominal);
        var voltageSpecificList = this.MotorLoadDto.MotorLoadPickListDto.VoltageSpecificList as VoltageSpecificList[];

        var voltageSpecificItem = voltageSpecificList.find(v => v.IsDefaultSelection);
        if (voltageSpecificItem != undefined) {
            this.MotorLoadDto.VoltageSpecificID = voltageSpecificItem.ID;
        }

        this.MapVoltageSpecificChange(this.MotorLoadDto.VoltageDipUnitsID);
    }

    //Voltage Specific Value Change
    MapVoltageSpecificChange(voltageDipUnitsID: number): void {              
        this.Voltage = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.VoltageSpecificList,
            this.MotorLoadDto.VoltageSpecificID);
        this.MapVoltageDipUnitsChange(this.MotorLoadDto.VoltageDipUnitsID);
        this.MapStartingCode();
        this.CalculateLoadCharacteristicsInputs();
    }

    MapStartingCode(): void {

        this.sizeRunningUnits = this.GetValue(this.MotorLoadDto.MotorLoadPickListDto.SizeUnitsList,
            this.MotorLoadDto.SizeRunningUnitsID);
        var dd = this.MotorLoadDto.MotorLoadPickListDto.StartingCodeList as StartingCodePickList[];
        for (var i = 0; i < dd.length; i++) {
            if (this.sizeRunningUnits.toLowerCase() == 'amps') {
                var val = this.getLRAmpSelections(dd[i].KVAHPStarting);
                dd[i].LanguageKey = val;
            }
            else if (this.sizeRunningUnits.toLowerCase() == 'hp') {
                dd[i].LanguageKey = dd[i].LanguageKeyHP;
            }
            else {
                dd[i].LanguageKey = dd[i].LanguageKeyKWM;
            }
        }

        //this.MotorLoadDto.StartingCodeID = this.SelectedStartingCodeId;
    }

    private getLRAmpSelections(KVAHPStarting: number): string {
        try {
            var phaseMultiplier: number = 1;
            var LRampDescription: string = '';
            if (this.MotorLoadDto.VoltagePhaseID == 2) {
                phaseMultiplier = 1.732;
            }

            var Size: number = this.MotorLoadDto.SizeRunning;
            var motorHP = Math.round(this.ConvertMotorPowerUnits('Amps', 'HP', Size, this.MotorLoadDto.VoltagePhaseID, this.Voltage));
            var top = motorHP * KVAHPStarting * 1000 / (this.Voltage * phaseMultiplier);
            LRampDescription += top.toFixed(0) + ' LRAmps';
            return LRampDescription;
        }
        catch (Error) {
            return "0";
        }
    }

    private SizeRunningChanged(): void {
        var sizeRunningUnits = this.GetValue(this.MotorLoadDto.MotorLoadPickListDto.SizeUnitsList, this.MotorLoadDto.SizeRunningUnitsID);
        this.Voltage = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.VoltageSpecificList,
            this.MotorLoadDto.VoltageSpecificID);
        var hpRating = this.ConvertMotorPowerUnits(sizeRunningUnits, 'hp', this.MotorLoadDto.SizeRunning, this.MotorLoadDto.VoltagePhaseID, this.Voltage);

        this.setLoadPowerFactor(hpRating);

        var motorCalculationRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.HP == hpRating);
        if (motorCalculationRow == undefined)
            motorCalculationRow = this.findClosestRow(hpRating, "hp")[0];

        var motorType: string = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.MotorTypeList, this.MotorLoadDto.MotorTypeID);
        if (motorCalculationRow != undefined) {
            if (motorType.toLowerCase() == "iec")
                this.MotorLoadDto.StartingCodeID = motorCalculationRow.StartingCodeIDIEC;
            else
                this.MotorLoadDto.StartingCodeID = motorCalculationRow.StartingCodeIDNema;
        }
        this.MapStartingCode();
        this.CalculateLoadCharacteristicsInputs();
    }

    private setLoadPowerFactor(hpRating: number) {
        var calcRow: MotorCalculation | undefined;
        var motorCalculationRows = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.length;
        var minRow: MotorCalculation = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList[0];
        var maxRow: MotorCalculation = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList[motorCalculationRows - 1];

        if (hpRating < minRow.HP)
            calcRow = minRow;
        else if (hpRating >= maxRow.HP)
            calcRow = maxRow;
        else if (this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.HP == hpRating) == undefined) {
            calcRow = this.findClosestRow(hpRating, "hp")[0];
            calcRow.KVARunning = (hpRating * calcRow.KVARunning) / calcRow.HP;
        }
        else {
            calcRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.HP == hpRating);
        }

        if (calcRow != undefined) {
            this.MotorKVARunning = calcRow.KVARunning;
            this.PFRunning = calcRow.PFRunning;
            this.PFStarting = calcRow.PFStarting;
        }
    }

    private setMotorLoadType(startingMethod: number) {
        var defaultMotorLoadPicklist = this.DefaultMotorLoadDto.MotorLoadPickListDto as MotorLoadPickList;
        var findStartingMethod = defaultMotorLoadPicklist.StartingMethodList.find(s => s.ID == startingMethod);
        if (findStartingMethod != undefined) {
            //this.MotorLoadDto.VoltageDipID = findStartingMethod.VoltageDipID;
            //this.MotorLoadDto.FrequencyDipID = findStartingMethod.FrequencyDipID;
            this.MotorLoadDto.MotorLoadTypeID = findStartingMethod.MotorLoadTypeID;
        }
    }

    //Load Characteristics Calculations

    CalculateLoadCharacteristicsInputs(): void {
        var calcRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.HP == this.MotorLoadDto.SizeRunning);
        if (calcRow != undefined) {
            this.PFStarting = calcRow != undefined ? calcRow.PFStarting : 0;
            this.PFRunning = calcRow != undefined ? calcRow.PFRunning : 0;
        }
        else {
            var closestRow = this.findClosestRow(this.MotorLoadDto.SizeRunning, "hp")[0];
            if (closestRow != undefined) {
                this.PFStarting = closestRow.PFStarting;
                this.PFRunning = closestRow.PFRunning;
            }
            //else {
            //    var motorCalculationRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.HP == this.MotorLoadDto.StartingCodeID);
            //    if (motorCalculationRow != undefined) {
            //        this.PFStarting = motorCalculationRow.PFStarting;
            //        this.PFRunning = motorCalculationRow.PFRunning;
            //    }
            //}
        }

        this.SizeRunning = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.SizeUnitsList,
            this.MotorLoadDto.SizeRunningUnitsID);

        this.StartingMethod = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.StartingMethodList,
            this.MotorLoadDto.StartingMethodID);

        this.Voltage = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.VoltageSpecificList,
            this.MotorLoadDto.VoltageSpecificID);

        this.MotorLoadType = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.MotorLoadTypeList,
            this.MotorLoadDto.MotorLoadTypeID);

        this.MotorType = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.MotorTypeList,
            this.MotorLoadDto.MotorTypeID);

        this.MotorLoadLevel = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.MotorLoadLevelList,
            this.MotorLoadDto.MotorLoadLevelID);

        this.HarmonicDeviceType = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList,
            this.MotorLoadDto.HarmonicDeviceTypeID);

        var HDTList = this.MotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList.find(s => s.ID == this.MotorLoadDto.HarmonicDeviceTypeID);
        this.HarmonicKVAMultiplier = HDTList != undefined ? HDTList.KVAMultiplier : 0;
        this.HarmonicLoadLimit = HDTList != undefined ? HDTList.LoadLimit : 0;

        var sequence = this.MotorLoadDto.MotorLoadPickListDto.SequenceList.find(s => s.ID == this.MotorLoadDto.SequenceID);
        this.LoadSequenceType = sequence != undefined ? sequence.SequenceType : '';

        //var SelectedStartingCode = this.MotorLoadDto.MotorLoadPickListDto.MotorTypeList.find(s => s.ID == this.MotorLoadDto.MotorTypeID);
        //this.SelectedStartingCodeId = SelectedStartingCode != undefined ? SelectedStartingCode.StartingCodeID : 0;

        this.MapStartingCode();
        this.CalculateHarmonicDistortionInputs();
        this.KWStartingMultiplier = +this.KWSMultiplier();
        this.KVAStartingMultiplier = +this.KVASMultiplier();
        this.loadCharacteristicsValues.sKVA = +this.KVAStarting().toFixed(2);
        this.loadCharacteristicsValues.sKW = +this.KWStarting().toFixed(2);
        this.loadCharacteristicsValues.rKVA = +this.KVARunning().toFixed(2);
        this.loadCharacteristicsValues.rKW = +this.KWRunning().toFixed(2);
    }

    CalculateHarmonicDistortionInputs(): void {

        this.HarmonicContent = this.GetValue(this.DefaultMotorLoadDto.MotorLoadPickListDto.HarmonicContentList, this.MotorLoadDto.HarmonicContentID);
        var harmonicDevice = this.DefaultMotorLoadDto.MotorLoadPickListDto.HarmonicDeviceTypeList.find(hd => hd.ID == this.MotorLoadDto.HarmonicDeviceTypeID);

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

    private KVASMultiplier(): number {
        try {

            var _KVAStartingMultiplier: number = 0
            var ehormonicflag: number = 3
            var LowTorqueAtStart: number = 2
            var StartingConfiguration: string = this.GetValue(this.MotorLoadDto.MotorLoadPickListDto.ConfigurationInputList, this.MotorLoadDto.ConfigurationInputID);
            var ConfigurationList = this.MotorLoadDto.MotorLoadPickListDto.ConfigurationInputList.find(s => s.ID == this.MotorLoadDto.ConfigurationInputID);
            var sKVAMultiplierOverride: number = ConfigurationList != undefined ? ConfigurationList.sKVAMultiplierOverride : 0;

            if (this.StartingMethod.toLowerCase() == 'across the line') {
                _KVAStartingMultiplier = 1
            }
            else if (this.StartingMethod.toLowerCase() == 'reduced voltage') {
                if (this.HarmonicDeviceType.toLowerCase() == 'wye / delta (open)') {
                    ehormonicflag = 1
                }
                else if (this.HarmonicDeviceType.toLowerCase() == 'wye / delta (close)') {
                    ehormonicflag = 2
                }
                else
                    ehormonicflag = 3

                if (ehormonicflag == 1 && this.MotorLoadType.toLowerCase() == 'low torque at start') {
                    _KVAStartingMultiplier = 0.625
                }
                else if (ehormonicflag == 1 && this.MotorLoadType.toLowerCase() == 'unloaded at start') {
                    _KVAStartingMultiplier = this.HarmonicKVAMultiplier
                }
                else if (ehormonicflag == 1 && this.MotorLoadType.toLowerCase() == 'rated torque at start') {
                    _KVAStartingMultiplier = 1
                }
                else if (ehormonicflag == 2 && this.MotorLoadType.toLowerCase() == 'low torque at start') {
                    _KVAStartingMultiplier = 0.5416
                }
                else if (ehormonicflag == 2 && this.MotorLoadType.toLowerCase() == 'unloaded at start') {
                    _KVAStartingMultiplier = this.HarmonicKVAMultiplier
                }
                else if (ehormonicflag == 2 && this.MotorLoadType.toLowerCase() == 'rated torque at start') {
                    _KVAStartingMultiplier = 1
                }
                else
                    if (this.HarmonicLoadLimit >= LowTorqueAtStart) {
                        _KVAStartingMultiplier = this.HarmonicKVAMultiplier
                    }
                    else { _KVAStartingMultiplier = 1 }
            }
            else if (this.StartingMethod.toLowerCase() == 'soft starter') {
                if (StartingConfiguration.toLowerCase() == "voltage stepped") {
                    _KVAStartingMultiplier = this.HarmonicKVAMultiplier
                }
                else {
                    _KVAStartingMultiplier = 0.2
                }

            }
            else if (this.StartingMethod.toLowerCase() == 'vfd') {
                _KVAStartingMultiplier = sKVAMultiplierOverride
            }

            return _KVAStartingMultiplier
        }
        catch (Error) {
            return 0;
        }
    }

    private KWSMultiplier(): number {
        try {

            var _KWStartingMultiplier: number = 0
            if (this.MotorLoadType.toLowerCase() == 'low torque at start') {
                _KWStartingMultiplier = 0.85
            }
            else if (this.MotorLoadType.toLowerCase() == 'unloaded at start') {
                _KWStartingMultiplier = 0.7
            }
            else if (this.MotorLoadType.toLowerCase() == 'rated torque at start') {
                _KWStartingMultiplier = 1
            }

            return _KWStartingMultiplier
        }
        catch (Error) {
            return 0;
        }
    }

    private KVAStarting(): number {
        try {
            var multiplier: number = 1;
            var rKVAInput: number = 0;
            var calcRow = this.MotorLoadDto.MotorLoadPickListDto.StartingCodeList.find(fd => fd.ID == this.MotorLoadDto.StartingCodeID);
            var StartingCode: number = calcRow != undefined ? calcRow.KVAHPStarting : 0;
            var Size: number = this.MotorLoadDto.SizeRunning;
            var UserDefinedInputs: number = 1;      // need to write code for value
            var startingCodeMultiplier: number = 1;
            Size = this.ConvertMotorPowerUnits(this.SizeRunning, 'HP', Size, this.MotorLoadDto.VoltagePhaseID, this.Voltage);

            if (this.LoadSequenceType.toLowerCase() == 'concurrent') {
                multiplier = this.MotorLoadDto.Quantity;
            }

            if (this.StartingMethod.toLowerCase() == 'soft starter' || this.StartingMethod.toLowerCase() == 'vfd') {
                if (UserDefinedInputs > 0) {
                    if (this.StartingMethod.toLocaleLowerCase() == 'vfd') {
                        return rKVAInput = multiplier * (Size * startingCodeMultiplier * this.KVAStartingMultiplier)
                    }
                    else {
                        return rKVAInput = multiplier * (Size * StartingCode * this.KVAStartingMultiplier)
                    }
                }
                else {
                    return rKVAInput = multiplier * (Size * UserDefinedInputs) //UserSKVAMultiplier
                }
            }
            else
                return rKVAInput = multiplier * (Size * StartingCode * this.KVAStartingMultiplier)
        }
        catch (Error) {
            return 0;
        }
    }

    private KWStarting(): number {
        try {
            var sKWInput: number = 0;
            var pf: number = this.PFStarting > 0 ? this.PFStarting : this.PFRunning;
            var size: number = this.MotorLoadDto.SizeRunning;

            var UserDefinedInputs: number = 1;      // need to write code for value
            size = this.ConvertMotorPowerUnits(this.SizeRunning, 'HP', size, this.MotorLoadDto.VoltagePhaseID, this.Voltage)
            if (this.MotorLoadType.toLowerCase() == 'low torque at start') {
                if (pf < 0.35) {
                    pf = 0.35;
                }
            }
            if (this.StartingMethod.toLowerCase() == 'soft starter') {
                if (UserDefinedInputs > 0) {
                    sKWInput = (this.loadCharacteristicsValues.sKVA * pf * this.KVAStartingMultiplier)
                }
                else {
                    sKWInput = (size * UserDefinedInputs) //UserSKWMultiplier
                }
            }
            else if (this.StartingMethod.toLowerCase() == 'vfd') {
                if (UserDefinedInputs > 0) {
                    pf = this.PFRunning;
                    sKWInput = (this.loadCharacteristicsValues.sKVA * pf)
                }
                else {
                    sKWInput = (size * UserDefinedInputs) //UserSKWMultiplier
                }
            }
            else if (this.StartingMethod.toLowerCase() == 'reduced voltage') {
                sKWInput = (this.loadCharacteristicsValues.sKVA * pf)
            }
            else {
                sKWInput = (this.loadCharacteristicsValues.sKVA * pf * this.KWStartingMultiplier)
            }

            return sKWInput
        }
        catch (Error) {
            return 0;
        }
    }

    private KVARunning(): number {
        try {

            var rKW: number = 0;
            var rPF: number = 0;                   
            var UserDefinedInputs: number = 1;      // need to write code for value
            var SizeRunning: number = this.MotorLoadDto.SizeRunning;

            if (this.StartingMethod.toLowerCase() == 'soft starter') {
                var rKW: number = 0;
                if (UserDefinedInputs > 0) {
                    rKW = (this.MotorKVARunning / 0.98) * this.PFRunning
                }
                else {
                    rKW = UserDefinedInputs * SizeRunning   //UserRKWMultiplier
                }

                rKW = rKW * (this.MotorLoadLevel)
                if (this.MotorLoadLevel > 0.99) {
                    rPF = this.PFRunning
                }
                else {
                    rPF = ((this.PFRunning - 0.2) / 1 * (this.MotorLoadLevel) + 0.2)
                }
                return this.MotorLoadDto.Quantity * (rKW / rPF)
            }
            else if (this.StartingMethod.toLowerCase() == 'vfd') {
                if (this.MotorLoadLevel > 0.99) {
                    rPF = this.PFRunning
                } else {
                    rPF = ((this.PFRunning - 0.2) / 1 * (this.MotorLoadLevel) + 0.2)
                }
                if (UserDefinedInputs > 0) {

                    rKW = (this.MotorKVARunning * this.PFRunning) * (this.MotorLoadLevel)
                    if (this.MotorLoadLevel > 0.99) {
                        rPF = this.PFRunning
                    }
                    else {
                        rPF = ((this.PFRunning - 0.2) / 1 * (this.MotorLoadLevel) + 0.2)
                    }
                    return ((this.MotorLoadDto.Quantity * (rKW / rPF)) / 0.95)
                }
                else {
                    return (this.MotorLoadDto.Quantity * (UserDefinedInputs * SizeRunning) / rPF) //UserRKWMultiplier
                }
            }
            else
                rKW = (this.MotorKVARunning * this.PFRunning) * (this.MotorLoadLevel)
            if (this.MotorLoadLevel > 0.99) {
                rPF = this.PFRunning
            }
            else {
                rPF = ((this.PFRunning - 0.2) / 1 * (this.MotorLoadLevel) + 0.2)
            }

            return (this.MotorLoadDto.Quantity * (rKW / rPF))
        }
        catch (Error) {
            return 0;
        }
    }

    private KWRunning(): number {
        try {

            var rKW: number = 0;
            var rPF: number = 0;            
            var UserDefinedInputs: number = 1;      // need to write code for value
            var SizeRunning: number = this.MotorLoadDto.SizeRunning;

            if (this.StartingMethod.toLowerCase() == 'soft starter') {
                if (UserDefinedInputs > 0) {
                    rKW = (this.MotorKVARunning / 0.98) * this.PFRunning
                }
                else {
                    rKW = UserDefinedInputs * SizeRunning  //UserRKWMultiplier
                }

                return this.MotorLoadDto.Quantity * (rKW * (this.MotorLoadLevel))
            }
            else if (this.StartingMethod.toLowerCase() == 'vfd') {
                if (UserDefinedInputs > 0) {
                    rKW = (this.MotorKVARunning * this.PFRunning)
                    return this.MotorLoadDto.Quantity * (rKW * (this.MotorLoadLevel)) / 0.95
                }
                else {
                    return UserDefinedInputs * SizeRunning   //UserRKWMultiplier
                }
            }
            else
                rKW = (this.MotorKVARunning * this.PFRunning)
            return this.MotorLoadDto.Quantity * (rKW * (this.MotorLoadLevel))
        }
        catch (Error) {
            return 0;
        }
    }

    private THIDMomentary(): number {

        try {
            var thid: number = 0;
            if (+this.MotorLoadDto.StartingMethodID !== StartingMethodEnum.AcrossTheLine || +this.MotorLoadDto.StartingMethodID !== StartingMethodEnum.ReducedVoltage) {
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
            if (+this.MotorLoadDto.StartingMethodID !== StartingMethodEnum.SoftStarter) {
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
            if (this.StartingMethod.toLowerCase() == 'soft starter') {
                if (this.MotorLoadDto.Quantity > 0) {
                    multiplier = (1 / this.MotorLoadDto.Quantity);
                }
            }

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

    private ConvertMotorPowerUnits(currUnits: string, targetUnits: string, inSize: number, phase: number, voltage: number): number {
        try {
            if (currUnits.toLowerCase() == targetUnits.toLowerCase()) {
                return inSize;
            }

            var KVARunning: number = 0;

            if (targetUnits.toLowerCase() == 'amps') {
                var roundedAmps: number = 0;
                var tempAmps: number = 0;
                if (currUnits.toLowerCase() == 'hp') {
                    var calcRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.HP == inSize);
                    var closestRow = this.findClosestRow(inSize, "hp");
                    if (calcRow == undefined) {
                        if (closestRow == undefined) {
                            tempAmps = 1;
                        }
                        else {
                            tempAmps = (inSize / closestRow[0].HP) * this.ampsFromKVARunning(voltage, phase, closestRow[0].KVARunning);
                        }

                    }
                    else {
                        KVARunning = calcRow != undefined ? calcRow.KVARunning : 0;
                        tempAmps = this.ampsFromKVARunning(voltage, phase, KVARunning);
                    }
                }
                else if (currUnits.toLowerCase() == 'kwm') {
                    var calcRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.kWm == inSize);
                    var closestRow = this.findClosestRow(inSize, "kwm");
                    if (calcRow == undefined) {
                        if (closestRow == undefined) {
                            tempAmps = 1;
                        }
                        else {
                            tempAmps = (inSize / closestRow[0].kWm) * this.ampsFromKVARunning(voltage, phase, closestRow[0].KVARunning);
                        }
                    }
                    else {
                        KVARunning = calcRow != undefined ? calcRow.KVARunning : 0;
                        tempAmps = this.ampsFromKVARunning(voltage, phase, KVARunning);
                    }
                }

                roundedAmps = Math.round(tempAmps * 10) / 10;
                return +roundedAmps.toFixed(2);

            }
            else if (targetUnits.toLowerCase() == 'hp') {
                var returnHP: number = 0;
                if (currUnits.toLowerCase() == 'amps') {
                    KVARunning = this.kvaRunningFromAmps(voltage, phase, inSize);
                    var kvaRunningRounded = Math.round(KVARunning * 10);
                    KVARunning = kvaRunningRounded / 10;
                    var calcRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.KVARunning == KVARunning);
                    var closestRow = this.findClosestRow(inSize, "kvarunning");
                    if (calcRow == undefined) {
                        if (closestRow == undefined) {
                            returnHP = 1;
                        }
                        else {
                            returnHP = inSize / this.ampsFromKVARunning(voltage, phase, closestRow[0].KVARunning) * closestRow[0].HP;
                        }
                    }
                    else {
                        returnHP = calcRow != undefined ? calcRow.HP : 0;
                    }

                }
                else if (currUnits.toLowerCase() == 'kwm') {
                    var calcRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.kWm == inSize);
                    var closestRow = this.findClosestRow(inSize, "kwm");
                    if (calcRow == undefined) {
                        if (closestRow == undefined) {
                            returnHP = 1;
                        }
                        else {
                            returnHP = inSize / 0.746;
                        }
                    }
                    else {
                        returnHP = calcRow != undefined ? calcRow.HP : 0;
                    }
                }

                var rValue = Math.round(returnHP * 10) / 10;
                return +rValue.toFixed(2);
            }
            else if (targetUnits.toLowerCase() == 'kwm') {
                var returnKWM: number = 0;
                if (currUnits.toLowerCase() == 'amps') {
                    KVARunning = this.kvaRunningFromAmps(voltage, phase, inSize);
                    var kvaRunningRounded = Math.round(KVARunning * 10);
                    KVARunning = kvaRunningRounded / 10;
                    var calcRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.KVARunning == KVARunning);
                    var closestRow = this.findClosestRow(inSize, "kvarunning");
                    if (calcRow == undefined) {
                        if (closestRow == undefined) {
                            returnKWM = 1;
                        }
                        else {
                            returnKWM = closestRow[0].kWm / this.ampsFromKVARunning(voltage, phase, closestRow[0].KVARunning) * inSize;
                        }
                    }
                    else {
                        returnKWM = calcRow != undefined ? calcRow.kWm : 0;
                    }
                }
                else if (currUnits.toLowerCase() == 'hp') {
                    var calcRow = this.MotorLoadDto.MotorLoadPickListDto.MotorCalculationList.find(fd => fd.HP == inSize);
                    if (calcRow == undefined) {
                        returnKWM = inSize * 0.746;
                    }
                    else {
                        returnKWM = calcRow != undefined ? calcRow.kWm : 0;
                    }
                }

                var rValue = Math.round(returnKWM * 10) / 10;
                return +rValue.toFixed(2);

            }
            return 0;
        }
        catch (Error) {
            return 0;
        }
    }

    private findClosestRow(inSize: number, units: string): MotorCalculation[] {
        var defaultMotorLoadDto = this.DefaultMotorLoadDto;
        var newMotorCalculationList: MotorCalculation[] = [];
        var MotorCalculationRow = defaultMotorLoadDto.MotorLoadPickListDto.MotorCalculationList;
        if (MotorCalculationRow != undefined) {
            var motorCalculation = defaultMotorLoadDto.MotorLoadPickListDto.MotorCalculationList.map(x => Object.assign({}, x));
            var fMotorCalculationList: MotorCalculation[] = [];
            for (let mCalValue of motorCalculation) {
                if (units.toLowerCase() == 'kwm') {
                    if (mCalValue.kWm <= inSize) {
                        fMotorCalculationList.push(mCalValue);
                    }
                }
                else if (units.toLowerCase() == 'hp') {
                    if (mCalValue.HP <= inSize) {
                        fMotorCalculationList.push(mCalValue);
                    }
                }
                else if (units.toLowerCase() == 'kvarunning') {
                    if (mCalValue.KVARunning <= inSize) {
                        fMotorCalculationList.push(mCalValue);
                    }
                }
            }
            newMotorCalculationList.push(fMotorCalculationList[fMotorCalculationList.length - 1]);
        }
        return newMotorCalculationList;
    }

    private ampsFromKVARunning(voltage: number, phase: number, KVARunning: number): number {
        try {
            var phaseMultiplier: number = 1;
            if (phase == 2) { // three phase
                phaseMultiplier = 1.732;
            }
            return KVARunning / (voltage * phaseMultiplier) * 1000;
        }
        catch (Error) {
            return 0;
        }
    }

    private kvaRunningFromAmps(voltage: number, phase: number, amps: number): number {
        try {
            var phaseMultiplier: number = 1;
            if (phase == 2) { //three phase
                phaseMultiplier = 1.732;
            }
            return (amps / 1000) * voltage * phaseMultiplier;
        }
        catch (Error) {
            return 0;
        }
    }
}
