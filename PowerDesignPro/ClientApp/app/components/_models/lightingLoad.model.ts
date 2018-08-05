﻿import { VoltageNominalList, VoltageSpecificList } from './solutionSetup.model';
import { BaseSolutionLoad, SequencePickList, BasePickList, SizeUnitsPickList, HarmonicDeviceTypePickList } from './load.model';

export interface LightingTypePickList {
    ID: number;
    Description: string;
    Value: string;
    HarmonicDeviceTypeID: number;
    RunningPFID: number;
    HarmonicContentID: number;
}

export interface LightingLoadPickList {
    SequenceList: SequencePickList[];
    VoltageNominalList: VoltageNominalList[];
    VoltageSpecificList: VoltageSpecificList[];
    VoltagePhaseList: BasePickList[];
    PFList: BasePickList[];
    SizeUnitsList: SizeUnitsPickList[];
    LightingTypeList: LightingTypePickList[];
    HarmonicDeviceTypeList: HarmonicDeviceTypePickList[];
    HarmonicContentList: BasePickList[];
    VoltageDipList: BasePickList[];
    FrequencyDipList: BasePickList[];
    VoltageDipUnitsList: BasePickList[];
    FrequencyDipUnitsList: BasePickList[];
}

export class LightingLoad extends BaseSolutionLoad {
    SizeRunning: number;
    SizeRunningUnitsID: number;
    SizeStarting: number;
    SizeStartingUnitsID: number;
    LightingTypeID: number;
    VoltageNominalID: number;
    VoltageSpecificID: number;
    VoltagePhaseID: number;
    FrequencyID: number;
    Frequency: number;
    HarmonicDeviceTypeID: number;
    HarmonicContentID: number;
    RunningPFID: number;
    StartingPFID: number;
    SizeRunningEditable: boolean;
    RunningPFEditable: boolean;
    HarmonicTypeEditable: boolean;
    LightingLoadPickListDto: LightingLoadPickList;
    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }
}