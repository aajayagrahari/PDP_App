import { BaseSolutionLoad, SequencePickList, BasePickList, SizeUnitsPickList, HarmonicDeviceTypePickList } from './load.model';

export interface ACLoadPickList {
    SequenceList: SequencePickList[];
    CompressorsList: BasePickList[];
    CoolingLoadList: BasePickList[];
    ReheatLoadList: BasePickList[];
    CoolingUnitsList: SizeUnitsPickList[];
    VoltageDipList: BasePickList[];
    FrequencyDipList: BasePickList[];
    VoltageDipUnitsList: BasePickList[];
    FrequencyDipUnitsList: BasePickList[];
}

export class ACLoad extends BaseSolutionLoad {
    Cooling: number;
    CoolingUnitsID: number;
    CompressorsID: number;
    CoolingLoadID: number;
    ReheatLoadID: number;
    VoltageSpecific: number;
    Frequency: number;
    ACLoadPickListDto: ACLoadPickList;
    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }
}