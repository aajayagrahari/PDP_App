import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';
import { solutionService } from '../Services/solution.services';
import { projectService } from '../Services/project.services';
import { ProjectDetails } from '../_models/project.model';
import { ProjectHeaderComponent } from '../projectheader/projectheader.component';
import {
    ProjectSolutionPickListDto, BaseSolutionSetupMappingValuesDto, BaseSolutionSetupDto,
    ProjectSolutionResponseDto, ProjectSolutionSetup, VoltageNominalList, VoltageSpecificList, VoltagePhaseList,
    FuelTankList, DesiredRunTimeList, VoltageDipList, FrequencyDipList, FrequencyList, RegulatoryFilterList, SelectedRegulatoryFilterList
} from '../_models/solutionSetup.model';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { UtilityService } from '../Services/utility.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
    selector: 'solutionSetupDetail',
    providers: [solutionService],
    templateUrl: './solutionSetupDetail.component.html'
})
export class SolutionSetupDetailComponent implements OnInit {
    @Input() solutionSetupDto: BaseSolutionSetupDto
    @ViewChild(NgForm) form: NgForm;
    public projectName: string;
    public projectID: number;
    public solutionSetupDtoDefault: BaseSolutionSetupDto;
    public projectDetails = new ProjectDetails();
    private solutionID: number;
    private UserDefaultSoltuionSetupObj: BaseSolutionSetupDto;
    public invalidForm: boolean;
    lang$: Observable<string>;

    ProjectSolutionSetupValues = new ProjectSolutionSetup();
    dropdownSettings = {};

    constructor(private _solutionService: solutionService, private _projectService: projectService, protected _route: Router, private activatedRoute: ActivatedRoute, private readonly translate: TranslateService, public utility: UtilityService, private readonly store: Store<string>) {
        this.invalidForm = false;
        this.translate.setDefaultLang(utility.userBrowserLocale);
        this.lang$ = this.store.select(() => utility.userBrowserLocale);

    }
   
    ngOnInit() { 

        this.lang$.subscribe(lang => this.translate.use(lang));
        this.MapPickListData(this.solutionSetupDto);
        this.LoadMultiSelectData();
     //   this.subscribeToLangChanged();
    }
     
    LoadMultiSelectData():void {
        var defaultText = "";
        var selectAllText = "";
        var unSelectAllText = "";
        var placeHolderText = "";
            this.translate.stream("tregulatoryFilterList.SelectRegulatoryFilters").subscribe(x => defaultText = x);
            this.translate.stream("tregulatoryFilterList.SelectAllText").subscribe(x => selectAllText = x);
            this.translate.stream("tregulatoryFilterList.UnSelectAllText").subscribe(x => unSelectAllText = x);
            this.translate.stream("tregulatoryFilterList.placeHolderText").subscribe(x => placeHolderText = x);
            this.dropdownSettings = {
                singleSelection: false,
                text: defaultText,
                selectAllText: selectAllText,
                unSelectAllText: unSelectAllText,
                searchPlaceholderText: placeHolderText,	
                enableSearchFilter: true,
                classes: "myclass custom-class",
                enableCheckAll: false
            };
        

   }
    onItemSelect(item: any) {
        console.log(item);
    }
    subscribeToLangChanged() {
        // refresh text
        // please unsubribe during destroy
        return this.translate.onLangChange.subscribe(() => this.LoadMultiSelectData());
    }
    
    //Map picklist data with the values from database
    MapPickListData(solutionSetup: BaseSolutionSetupDto): void {

        this.solutionSetupDto = solutionSetup as BaseSolutionSetupDto;
        if (solutionSetup.IsGlobalDefaults) {
            this.MapDropdownDataForGlobalDefaults();
        }

        this.ProcessRegulatoryFilter(this.solutionSetupDto);

        this.solutionSetupDtoDefault = JSON.parse(JSON.stringify(this.solutionSetupDto));

        this.FilterVoltageNominalPickList(this.solutionSetupDtoDefault.SolutionSetupMappingValuesDto.VoltagePhaseID,
                                                this.solutionSetupDtoDefault.SolutionSetupMappingValuesDto.FrequencyID);
        this.FilterVoltageSpecificPickList(this.solutionSetupDtoDefault.SolutionSetupMappingValuesDto.VoltageNominalID);
        this.FilterFuelTank(this.solutionSetupDtoDefault.SolutionSetupMappingValuesDto.FuelTypeID);
        this.FilterRunTimeDesired(this.solutionSetupDtoDefault.SolutionSetupMappingValuesDto.FuelTypeID);

        this.MapVoltageDipUnitsChange(this.solutionSetupDtoDefault.SolutionSetupMappingValuesDto.VoltageDipUnitsID);
        this.MapFrequencyDipUnitsChange(this.solutionSetupDtoDefault.SolutionSetupMappingValuesDto.FrequencyDipUnitsID);
    }

    MapDropdownDataForGlobalDefaults(): void {
        this.solutionSetupDto.SolutionSetupMappingValuesDto.VoltagePhaseID = undefined;
        this.solutionSetupDto.SolutionSetupMappingValuesDto.FrequencyID = undefined;
        this.solutionSetupDto.SolutionSetupMappingValuesDto.VoltageNominalID = undefined;
        this.solutionSetupDto.SolutionSetupMappingValuesDto.VoltageSpecificID = undefined;
        this.solutionSetupDto.SolutionSetupMappingValuesDto.UnitsID = undefined;
        this.solutionSetupDto.SolutionSetupMappingValuesDto.FuelTypeID = undefined;
        this.solutionSetupDto.SolutionSetupMappingValuesDto.FuelTankID = undefined;
        this.solutionSetupDto.SolutionSetupMappingValuesDto.DesiredRunTimeID = undefined;
        this.solutionSetupDto.SolutionSetupMappingValuesDto.SelectedRegulatoryFilterList = [];
    }

    ProcessRegulatoryFilter(solutionSetupDto: BaseSolutionSetupDto): void {
        if (solutionSetupDto.SolutionSetupMappingValuesDto.SelectedRegulatoryFilterList == null)
            this.solutionSetupDto.SolutionSetupMappingValuesDto.SelectedRegulatoryFilterList = [];

        this.solutionSetupDto.ProjectSolutionPickListDto.RegulatoryFilterList = this.MapRegulatoryFilter(solutionSetupDto.ProjectSolutionPickListDto.RegulatoryFilterList);
        if (this.solutionSetupDto.SolutionSetupMappingValuesDto.SelectedRegulatoryFilterList.length > 0) {
            this.solutionSetupDto.SolutionSetupMappingValuesDto.SelectedRegulatoryFilterList = this.MapRegulatoryFilter(solutionSetupDto.SolutionSetupMappingValuesDto.SelectedRegulatoryFilterList);
        }
    }

    //Filter Voltage Nominal picklist
    FilterVoltageNominalPickList(voltagePhase: any, frequency: any): void {
        if (voltagePhase != undefined && frequency != undefined) {
            var defaultSolutionSetup = this.solutionSetupDtoDefault as BaseSolutionSetupDto;
            this.solutionSetupDto.ProjectSolutionPickListDto.VoltageNominalList = defaultSolutionSetup.ProjectSolutionPickListDto.VoltageNominalList
                .filter(x => x.FrequencyID == frequency && x.VoltagePhaseID == voltagePhase);
        } else {
            this.solutionSetupDto.ProjectSolutionPickListDto.VoltageNominalList = [];
        }
    }

    //Filter Voltage Specific picklist
    FilterVoltageSpecificPickList(voltageNominal: any): void {
        if (voltageNominal != undefined) {
            var defaultSolutionSetup = this.solutionSetupDtoDefault as BaseSolutionSetupDto;
            this.solutionSetupDto.ProjectSolutionPickListDto.VoltageSpecificList = defaultSolutionSetup.ProjectSolutionPickListDto.VoltageSpecificList
                .filter(x => x.VoltageNominalID == voltageNominal);
        } else {
            this.solutionSetupDto.ProjectSolutionPickListDto.VoltageSpecificList = [];
        }
    }

    //Filter Fuel Tank picklist
    FilterFuelTank(fuelType: any): void {
        if (fuelType != undefined) {
            var defaultSolutionSetup = this.solutionSetupDtoDefault as BaseSolutionSetupDto;
            this.solutionSetupDto.ProjectSolutionPickListDto.FuelTankList = defaultSolutionSetup.ProjectSolutionPickListDto.FuelTankList
                .filter(x => x.FuelTypeID == fuelType);
        } else {
            this.solutionSetupDto.ProjectSolutionPickListDto.FuelTankList = [];
        }
    }

    //Filter Run Time picklist
    FilterRunTimeDesired(fuelType: any): void {
        if (fuelType != undefined) {
            var defaultSolutionSetup = this.solutionSetupDtoDefault as BaseSolutionSetupDto;
            this.solutionSetupDto.ProjectSolutionPickListDto.DesiredRunTimeList = defaultSolutionSetup.ProjectSolutionPickListDto.DesiredRunTimeList
                .filter(x => x.FuelTypeID == fuelType);
        } else {
            this.solutionSetupDto.ProjectSolutionPickListDto.DesiredRunTimeList = [];
        }
    }

    //Voltage Nominal picklist change event
    MapVoltageNominal(voltagePhase: any, frequency: any): void {
        this.FilterVoltageNominalPickList(voltagePhase, frequency);

        var voltageNominalList = this.solutionSetupDto.ProjectSolutionPickListDto.VoltageNominalList as VoltageNominalList[];

        var voltageNominalSelected = this.solutionSetupDto.SolutionSetupMappingValuesDto.VoltageNominalID;

        //if (voltagePhase != defaultSolutionSetup.SolutionSetupMappingValuesDto.VoltagePhaseID || frequency != defaultSolutionSetup.SolutionSetupMappingValuesDto.FrequencyID) {
        var voltageNominalItem = voltageNominalList.find(v => v.IsDefaultSelection == true);
        if (voltageNominalItem != undefined) {
            voltageNominalSelected = voltageNominalItem.ID;
        }
        //}

        this.solutionSetupDto.SolutionSetupMappingValuesDto.VoltageNominalID = voltageNominalSelected;
        this.MapVoltageSpecific(voltageNominalSelected);
        this.MapFrequencyDipUnitsChange(this.solutionSetupDto.SolutionSetupMappingValuesDto.FrequencyDipUnitsID);
    }

    //Voltage specific picklist change event
    MapVoltageSpecific(voltageNominal: any): void {
        this.FilterVoltageSpecificPickList(voltageNominal);
        var voltageSpecificList = this.solutionSetupDto.ProjectSolutionPickListDto.VoltageSpecificList as VoltageSpecificList[];

        var voltageSpecificItem = voltageSpecificList.find(v => v.IsDefaultSelection);
        if (voltageSpecificItem != undefined) {
            this.solutionSetupDto.SolutionSetupMappingValuesDto.VoltageSpecificID = voltageSpecificItem.ID;
        }

        this.MapVoltageDipUnitsChange(this.solutionSetupDto.SolutionSetupMappingValuesDto.VoltageDipUnitsID);
    }

    //Fuel Type picklist change event
    MapFuelTypeDependents(fuelType: any): void {
        this.FilterFuelTank(fuelType);
        this.FilterRunTimeDesired(fuelType);

        var fuelTankList = this.solutionSetupDto.ProjectSolutionPickListDto.FuelTankList as FuelTankList[];

        var fuelTankItem = fuelTankList.find(f => f.IsDefaultSelection);
        if (fuelTankItem != undefined) {
            this.solutionSetupDto.SolutionSetupMappingValuesDto.FuelTankID = fuelTankItem.ID;
        }

        var desiredRunTimeList = this.solutionSetupDto.ProjectSolutionPickListDto.DesiredRunTimeList as DesiredRunTimeList[];

        var desiredRunTimeItem = desiredRunTimeList.find(r => r.IsDefaultSelection);
        if (desiredRunTimeItem != undefined) {
            this.solutionSetupDto.SolutionSetupMappingValuesDto.DesiredRunTimeID = desiredRunTimeItem.ID;
        }
    }

    //Voltage Dip Units Change event
    MapVoltageDipUnitsChange(voltageDipUnitsID: number): VoltageDipList[] {
        var defaultSolutionSetup = this.solutionSetupDtoDefault as BaseSolutionSetupDto;
        var voltageDipUnitsItem = defaultSolutionSetup.ProjectSolutionPickListDto.VoltageDipUnitList.find(vd => vd.ID == voltageDipUnitsID);
        if (voltageDipUnitsItem != undefined && voltageDipUnitsItem.Value.toLowerCase() == "volts") {
            var voltageDipPercentValues = defaultSolutionSetup.ProjectSolutionPickListDto.VoltageDipList as VoltageDipList[];
            var voltageSpecificList = this.solutionSetupDto.ProjectSolutionPickListDto.VoltageSpecificList as VoltageSpecificList[];

            var voltageSpecificItem = voltageSpecificList.find(vs => vs.ID == this.solutionSetupDto.SolutionSetupMappingValuesDto.VoltageSpecificID)

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
                this.solutionSetupDto.ProjectSolutionPickListDto.VoltageDipList = vDipList;
            }
        }
        else {
            this.solutionSetupDto.ProjectSolutionPickListDto.VoltageDipList = this.solutionSetupDtoDefault.ProjectSolutionPickListDto.VoltageDipList;
        }
        return this.solutionSetupDto.ProjectSolutionPickListDto.VoltageDipList;
    }

    //Frequency Dip Units Change event
    MapFrequencyDipUnitsChange(frequencyDipUnitsID: number): FrequencyDipList[] {
        var defaultSolutionSetup = this.solutionSetupDtoDefault as BaseSolutionSetupDto;
        var frequencyDipUnitsItem = defaultSolutionSetup.ProjectSolutionPickListDto.FrequencyDipUnitList.find(fd => fd.ID == frequencyDipUnitsID);
        if (frequencyDipUnitsItem != undefined && frequencyDipUnitsItem.Value.toLowerCase() == "percent") {
            var frequencyDipValues = defaultSolutionSetup.ProjectSolutionPickListDto.FrequencyDipList as FrequencyDipList[];
            var frequencyList = this.solutionSetupDto.ProjectSolutionPickListDto.FrequencyList as FrequencyList[];

            var frequencyItem = frequencyList.find(fq => fq.ID == this.solutionSetupDto.SolutionSetupMappingValuesDto.FrequencyID)

            if (frequencyItem != undefined) {
                var selectedFrequency = parseInt(frequencyItem.Value);
                var fDipList: FrequencyDipList[] = [];
                for (let fDipValue of frequencyDipValues) {

                    var fDipItem = <FrequencyDipList>{};

                    fDipItem.ID = fDipValue.ID;
                    fDipItem.Value = (((+fDipValue.Value * 100) / selectedFrequency).toFixed(2)).toString();//(Math.round(+vDipPercentValue.Value * voltageSpecific)).toString();
                    fDipItem.Description = fDipItem.Value + " %";

                    fDipList.push(fDipItem);
                }
                this.solutionSetupDto.ProjectSolutionPickListDto.FrequencyDipList = fDipList;
            }
        }
        else {
            this.solutionSetupDto.ProjectSolutionPickListDto.FrequencyDipList = this.solutionSetupDtoDefault.ProjectSolutionPickListDto.FrequencyDipList;
        }
        return this.solutionSetupDto.ProjectSolutionPickListDto.FrequencyDipList;
    }

    MapRegulatoryFilter(regulatoryFilter: any): any {
        var regulatoryFilterList: RegulatoryFilterList[] = [];
        for (let regFilValue of regulatoryFilter) {

            var regulatoryFilterItem = <RegulatoryFilterList>{};
            regulatoryFilterItem.id = regFilValue.Id; 
            regFilValue.LanguageKey != null ? regulatoryFilterItem.LanguageKey = regFilValue.LanguageKey : regulatoryFilterItem.LanguageKey = regFilValue.ItemName;     
            regFilValue.LanguageKey != null ? this.translate.get(regFilValue.LanguageKey).subscribe(x => regulatoryFilterItem.itemName = x) : regulatoryFilterItem.itemName = regFilValue.ItemName;
           // regulatoryFilterItem.itemName = regFilValue.ItemName;
            regulatoryFilterList.push(regulatoryFilterItem);
           
        }

        return regulatoryFilterList;
    }

}
