export class LoadModel {
    ID: number;
    Description: string;
    Value: string;
    LoadFamilyID: number;
    IsDefaultSelection: boolean;
    LoadFamily: string;
    SolutionID: number;
    ProjectID: number;
    SolutionLoadID: number;
    CopyLoad: boolean;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export interface BasePickList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey?: string;
}

export interface SizeUnitsPickList {
    ID: number;
    Description: string;
    Value: string;
    LoadFamilyID: number;
}

export interface SequencePickList {
    ID: number;
    Description: string;
    Value: string;
    SequenceType: string;
}

export interface HarmonicDeviceTypePickList {
    ID: number;
    StartingMethodID: number;
    Description: string;
    Value: string;
    HarmonicContentID: number;
    HD3: number;
    HD5: number;
    HD7: number;
    HD9: number;
    HD11: number;
    HD13: number;
    HD15: number;
    HD17: number;
    HD19: number;
    KVAMultiplier: number;
    KWMultiplier: number;
    LoadLimit: number;
    MotorLoadTypeID: number;
}

export enum StartingMethodEnum {
    AcrossTheLine = 1,
    ReducedVoltage = 2,
    SoftStarter = 3,
    VFD = 4
}

export class BaseSolutionLoad {
    ID: number;
    LoadID: number;
    SolutionID: number;
    Description: string;
    SequenceID: number;
    Quantity: number;
    VoltageDipID: number;
    VoltageDipUnitsID: number;
    FrequencyDipID: number;
    FrequencyDipUnitsID: number;
    StartingLoadKva: number;
    StartingLoadKw: number;
    RunningLoadKva: number;
    RunningLoadKw: number;
    THIDMomentary: number;
    THIDContinuous: number;
    THIDKva: number;
    HD3: number;
    HD5: number;
    HD7: number;
    HD9: number;
    HD11: number;
    HD13: number;
    HD15: number;
    HD17: number;
    HD19: number;
    Shed: boolean;
    StartingMethodID?: number;
}