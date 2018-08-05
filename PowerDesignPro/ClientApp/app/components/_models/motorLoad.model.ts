import { VoltageNominalList, VoltageSpecificList } from './solutionSetup.model';
import { BaseSolutionLoad, SequencePickList, BasePickList, SizeUnitsPickList, HarmonicDeviceTypePickList } from './load.model';

export interface ConfigurationInputPickList {
    ID: number;
    Description: string;
    Value: string;
    StartingMethodID: number;
    sKVAMultiplierOverride: number;
    sKWMultiplierOverride: number;
    rKWMultiplierOverride: number;
    IsDefaultSelection: boolean;
}

export interface StartingCodePickList {
    ID: number;
    Description: string;
    Value: string;
    KVAHPStarting: number;
    AmpsDescription: string;
    KWMDescription: string;
    LanguageKey: string;
    LanguageKeyKWM: string;
    LanguageKeyHP: string;
}

export interface HarmonicContentPickList {
    ID: number;
    Description: string;
    Value: string;
    StartingMethodID: number;
}

export interface BasicLoadTypeList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
}

export interface MotorTypeList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
    StartingCodeID: number;
}

export interface StartingMethodList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
    DefaultHarmonicTypeID: number;
    VoltageDipID: number;
    FrequencyDipID: number;
    MotorLoadTypeID: number;
}

export interface MotorCalculation {
    HP: number;
    kWm: number;
    KVARunning: number;
    PFRunning: number;
    PFStarting: number;
    kVAHPStartingNema: number;
    KVAHPStartingIEC: number;
    StartingCodeIDNema: number;
    StartingCodeIDIEC: number;
    CalcReferenceIEC: number;
}

export interface MotorLoadPickList {
    SequenceList: SequencePickList[];
    VoltageNominalList: VoltageNominalList[];
    VoltageSpecificList: VoltageSpecificList[];
    VoltagePhaseList: BasePickList[];
    MotorLoadLevelList: BasePickList[];
    MotorLoadTypeList: BasicLoadTypeList[];
    MotorTypeList: MotorTypeList[];
    StartingCodeList: StartingCodePickList[];
    SizeUnitsList: SizeUnitsPickList[];
    VoltageDipList: BasePickList[];
    FrequencyDipList: BasePickList[];
    VoltageDipUnitsList: BasePickList[];
    FrequencyDipUnitsList: BasePickList[];
    HarmonicDeviceTypeList: HarmonicDeviceTypePickList[];
    ConfigurationInputList: ConfigurationInputPickList[];
    HarmonicContentList: HarmonicContentPickList[];
    MotorCalculationList: MotorCalculation[];
    StartingMethodList: StartingMethodList[];
}

export class MotorLoad extends BaseSolutionLoad {
    SizeRunning: number;
    SizeRunningUnitsID: number;
    HarmonicDeviceTypeID: number;
    HarmonicContentID: number;
    VoltageNominalID: number;
    VoltageSpecificID: number;
    VoltagePhaseID: number;
    MotorLoadLevelID: number;
    MotorLoadTypeID: number;
    MotorTypeID: number;
    StartingCodeID: number;
    StartingMethodID: number;
    ConfigurationInputID: number;
    VoltageSpecific: number;
    FrequencyID: number;
    Frequency: number;
    StartingMethodEditable: boolean;
    ConfigurationInputEditable: boolean;
    MotorLoadLevelEditable: boolean;
    MotorLoadTypeEditable: boolean;
    MotorTypeEditable: boolean;
    StartingCodeEditable: boolean;
    SizeRunningEditable: boolean;
    HarmonicTypeEditable: boolean;
    MotorLoadPickListDto: MotorLoadPickList;
    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }
}