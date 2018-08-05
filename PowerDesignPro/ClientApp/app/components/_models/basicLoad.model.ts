import { VoltageNominalList, VoltageSpecificList } from './solutionSetup.model';
import { BaseSolutionLoad, SequencePickList, BasePickList, SizeUnitsPickList, HarmonicDeviceTypePickList } from './load.model';


export interface BasicLoadPickList {
    SequenceList: SequencePickList[];
    VoltageNominalList: VoltageNominalList[];
    VoltageSpecificList: VoltageSpecificList[];
    VoltagePhaseList: BasePickList[];
    PFList: BasePickList[];
    SizeUnitsList: SizeUnitsPickList[];
    HarmonicDeviceTypeList: HarmonicDeviceTypePickList[];
    HarmonicContentList: BasePickList[];
    VoltageDipList: BasePickList[];
    FrequencyDipList: BasePickList[];
    VoltageDipUnitsList: BasePickList[];
    FrequencyDipUnitsList: BasePickList[];
}

export class BasicLoad extends BaseSolutionLoad {
    SizeRunning: number;
    SizeRunningUnitsID: number;
    SizeStarting: number;
    SizeStartingUnitsID: number;
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
    SizeStartingEditable: boolean;
    StartingPFEditable: boolean;
    RunningPFEditable: boolean;
    HarmonicTypeEditable: boolean;
    BasicLoadPickListDto: BasicLoadPickList;
    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }
}