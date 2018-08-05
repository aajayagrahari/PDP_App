import { BaseSolutionLoad, SequencePickList, BasePickList, SizeUnitsPickList, HarmonicDeviceTypePickList } from './load.model';

export interface UPSTypePickList {
    ID: number;
    Description: string;
    Value: string;
    HarmonicDeviceTypeID: number;
    PhaseID: number;
    EfficiencyID: number;
    HarmonicContentID: number;
}

export interface UPSLoadPickList {
    SequenceList: SequencePickList[];
    PhaseList: BasePickList[];
    EfficiencyList: BasePickList[];
    ChargeRateList: BasePickList[];
    PowerFactorList: BasePickList[];
    UPSTypeList: UPSTypePickList[];
    SizeKVAUnitsList: SizeUnitsPickList[];
    VoltageDipList: BasePickList[];
    FrequencyDipList: BasePickList[];
    VoltageDipUnitsList: BasePickList[];
    FrequencyDipUnitsList: BasePickList[];
    HarmonicDeviceTypeList: HarmonicDeviceTypePickList[];
    HarmonicContentList: BasePickList[];
    LoadLevelList: BasePickList[];
}

export class UPSLoad extends BaseSolutionLoad {
    SizeKVA: number;
    SizeKVAUnitsID: number;
    UPSTypeID: number;
    HarmonicDeviceTypeID: number;
    HarmonicContentID: number;
    PhaseID: number;
    EfficiencyID: number;
    ChargeRateID: number;
    PowerFactorID: number;
    UPSRevertToBattery: boolean;
    LoadLevelID: number;
    VoltageSpecific: number;
    Frequency: number;
    UPSLoadPickListDto: UPSLoadPickList;
    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }
}