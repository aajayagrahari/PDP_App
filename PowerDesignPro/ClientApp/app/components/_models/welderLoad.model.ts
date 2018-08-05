import { VoltageNominalList, VoltageSpecificList } from './solutionSetup.model';
import { BaseSolutionLoad, SequencePickList, BasePickList, SizeUnitsPickList, HarmonicDeviceTypePickList } from './load.model';

export interface WelderTypePickList {
    ID: number;
    Description: string;
    Value: string;
    HarmonicDeviceTypeID: number;
}

export interface WelderLoadPickList {
    SequenceList: SequencePickList[];
    VoltageNominalList: VoltageNominalList[];
    VoltageSpecificList: VoltageSpecificList[];
    VoltagePhaseList: BasePickList[];
    PFList: BasePickList[];
    SizeUnitsList: SizeUnitsPickList[];
    WelderTypeList: WelderTypePickList[];
    HarmonicDeviceTypeList: HarmonicDeviceTypePickList[];
    HarmonicContentList: BasePickList[];
    VoltageDipList: BasePickList[];
    FrequencyDipList: BasePickList[];
    VoltageDipUnitsList: BasePickList[];
    FrequencyDipUnitsList: BasePickList[];
}

export class WelderLoad extends BaseSolutionLoad {
    SizeRunning: number;
    SizeRunningUnitsID: number;
    SizeStarting: number;
    SizeStartingUnitsID: number;
    WelderTypeID: number;
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
    WelderLoadPickListDto: WelderLoadPickList;
    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }
}