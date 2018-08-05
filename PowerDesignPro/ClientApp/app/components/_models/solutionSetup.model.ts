export interface AmbientTemperatureList {
    ID: number;
    Description: string;
    Value: string;
}

export interface ContinuousAllowableVoltageDistortionList {
    ID: number;
    Description: string;
    Value: string;
}

export interface DesiredRunTimeList {
    ID: number;
    FuelTypeID: number;
    Description: string;
    Value: string;
    IsDefaultSelection: boolean;
    LanguageKey: string;
}

export interface DesiredSoundList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface ElevationList {
    ID: number;
    Description: string;
    Value: string;
}

export interface EnclosureTypeList {
    ID: number;
    Description: string;
    Value: string;
}

export interface EngineDutyList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface FrequencyList {
    ID: number;
    Description: string;
    Value: string;
}

export interface FrequencyDipList {
    ID: number;
    Description: string;
    Value: string;
}

export interface FrequencyDipUnitList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface FuelTankList {
    ID: number;
    FuelTypeID: number;
    Description: string;
    Value: string;
    IsDefaultSelection: boolean;
    LanguageKey: string;
}

export interface FuelTypeList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface LoadSequenceCyclic {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface MaxRunningLoadList {
    ID: number;
    Description: string;
    Value: string;
}

export interface MomentaryAllowableVoltageDistortionList {
    ID: number;
    Description: string;
    Value: string;
}

export interface SolutionApplicationList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface RegulatoryFilterList {
    id: number;
    itemName: string;
    LanguageKey: string;
}

export interface SelectedRegulatoryFilterList {
    id: number;
    itemName: string;
    LanguageKey: string;
}

export interface UnitsList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface VoltageDipList {
    ID: number;
    Description: string;
    Value: string; 
}

export interface VoltageDipUnitList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface VoltageNominalList {
    VoltagePhaseID: number;
    FrequencyID: number;
    ID: number;
    Description: string;
    Value: string;
    IsDefaultSelection: boolean;
}

export interface VoltagePhaseList {
    ID?: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface VoltageSpecificList {
    VoltageNominalID: number;
    ID: number;
    Description: string;
    Value: string;
    IsDefaultSelection: boolean;
}

//Interface DTOS
export interface ProjectSolutionPickListDto {
    AmbientTemperatureList: AmbientTemperatureList[];
    ContinuousAllowableVoltageDistortionList: ContinuousAllowableVoltageDistortionList[];
    DesiredRunTimeList: DesiredRunTimeList[];
    DesiredSoundList: DesiredSoundList[];
    ElevationList: ElevationList[];
    EnclosureTypeList: EnclosureTypeList[];
    EngineDutyList: EngineDutyList[];
    FrequencyList: FrequencyList[];
    FrequencyDipList: FrequencyDipList[];
    FrequencyDipUnitList: FrequencyDipUnitList[];
    FuelTankList: FuelTankList[];
    FuelTypeList: FuelTypeList[];
    LoadSequenceCyclic: LoadSequenceCyclic[];
    MaxRunningLoadList: MaxRunningLoadList[];
    MomentaryAllowableVoltageDistortionList: MomentaryAllowableVoltageDistortionList[];
    SolutionApplicationList: SolutionApplicationList[];
    RegulatoryFilterList: RegulatoryFilterList[];
    SelectedRegulatoryFilterList: SelectedRegulatoryFilterList[];
    UnitsList: UnitsList[];
    VoltageDipList: VoltageDipList[];
    VoltageDipUnitList: VoltageDipUnitList[];
    VoltageNominalList: VoltageNominalList[];
    VoltagePhaseList: VoltagePhaseList[];
    VoltageSpecificList: VoltageSpecificList[];
}

//Mapping values for solution setup
export interface BaseSolutionSetupMappingValuesDto {
    AmbientTemperatureID: number;
    ElevationID: number;
    VoltagePhaseID?: number;
    FrequencyID?: number;
    VoltageNominalID?: number;
    VoltageSpecificID?: number;
    UnitsID?: number;
    MaxRunningLoadID: number;
    VoltageDipID: number;
    VoltageDipUnitsID: number;
    FrequencyDipID: number;
    FrequencyDipUnitsID: number;
    ContinuousAllowableVoltageDistortionID: number;
    MomentaryAllowableVoltageDistortionID: number;
    EngineDutyID: number;
    FuelTypeID?: number;
    SelectedRegulatoryFilterList: SelectedRegulatoryFilterList[];
    SolutionApplicationID: number;
    EnclosureTypeID: number;
    DesiredSoundID: number;
    FuelTankID?: number;
    DesiredRunTimeID?: number;
    LoadSequenceCyclic1ID: number;
    LoadSequenceCyclic2ID: number;
}

//Interface for existing solution setup
export interface ProjectSolutionResponseDto {
    ProjectID: number;
    SolutionID: number;
    SolutionName: string;
    Description: string;
    SpecRefNumber: string;
    CreatedDateTime?: any;
    ModifiedDateTime?: any;
    SolutionSetupMappingValuesDto: BaseSolutionSetupMappingValuesDto;
    ProjectSolutionPickListDto: ProjectSolutionPickListDto;
}

//Mapping values and drop dwon data for new solution/user defaults/ global defaults
export interface BaseSolutionSetupDto {
    SolutionSetupMappingValuesDto: BaseSolutionSetupMappingValuesDto;
    ProjectSolutionPickListDto: ProjectSolutionPickListDto;
    IsGlobalDefaults: boolean;
    IsUserDefaults: boolean
}

//Object to save data to database
export class ProjectSolutionSetup {
    ProjectID: number;
    SolutionID: number;
    SolutionName: string;
    Description: string;
    SpecRefNumber: string;
    BaseSolutionSetupDto: BaseSolutionSetupDto
    //AmbientTemperatureID: number;
    //ElevationID: number;
    //VoltagePhaseID: number;
    //FrequencyID: number;
    //VoltageNominalID: number;
    //VoltageSpecificID: number;
    //UnitsID: number;
    //MaxRunningLoadID: number;
    //VoltageDipID: number;
    //VoltageDipUnitsID: number;
    //FrequencyDipID: number;
    //FrequencyDipUnitsID: number;
    //ContinuousAllowableVoltageDistortionID: number;
    //MomentaryAllowableVoltageDistortionID: number;
    //EngineDutyID: number;
    //FuelTypeID: number;
    //SolutionApplicationID: number;
    //EnclosureTypeID: number;
    //DesiredSoundID: number;
    //FuelTankID: number;
    //DesiredRunTimeID: number;
    //LoadSequenceCyclic1ID: number;
    //LoadSequenceCyclic2ID: number;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}