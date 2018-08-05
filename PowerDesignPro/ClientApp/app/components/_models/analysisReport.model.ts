import { BasePickList } from './load.model'

/* Transient Analysis region START*/
export class TransientAnalysis {
    AlternatorTransientRequirement: AlternatorTransientRequirement;
    EngineTransientRequirement: EngineTransientRequirement;
    AlternatorTransientAnalysisList: AlternatorTransientAnalysis[];
    EngineTransientAnalysisList: EngineTransientAnalysis[];
    IsVdipEngineConfiguration: boolean;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class AlternatorTransientRequirement {
    Sequence: string;
    Load: string;
    StartingkVA: number;
    VdipTolerance: string;
    VdipExpected: number;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class EngineTransientRequirement {
    Sequence: string;
    Load: string;
    StartingkW: number;
    FdipTolerance: number;
    FdipExpected: number;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class AlternatorTransientAnalysis {
    Sequence: string;
    AllowableVdip: string;
    VdipExpected: string;
    SequenceStartingkVA: number;
    LargestTransientLoad: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class EngineTransientAnalysis {
    Sequence: string;
    AllowableFdip: number;
    FdipExpected: number;
    SequenceStartingkW: number;
    LargestTransientLoad: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

/* Transient Analysis region END*/


/* Harmonic Analysis region START*/
export class HarmonicData {
    constructor(public x: number, public y: number) { }
}

export class HarmonicAnalysis {
    HarmonicProfile?: string;
    Sequence: string;    
    KVANonLinearLoad: number;
    THID: number;
    THVD: number;
    KVABase: number;
    AlternatorLoading: number;
    CurrentHarmonicDistortion: CurrentHarmonicDistortion;
    VoltageHarmonicDistortion: VoltageHarmonicDistortion;
}

export class CurrentHarmonicDistortion {
    HarmonicDistortion3: number = 0;
    HarmonicDistortion5: number = 0;
    HarmonicDistortion7: number = 0;
    HarmonicDistortion9: number = 0;
    HarmonicDistortion11: number = 0;
    HarmonicDistortion13: number = 0;
    HarmonicDistortion15: number = 0;
    HarmonicDistortion17: number = 0;
    HarmonicDistortion19: number = 0;
}

export class VoltageHarmonicDistortion {
    HarmonicDistortion3: number = 0;
    HarmonicDistortion5: number = 0;
    HarmonicDistortion7: number = 0;
    HarmonicDistortion9: number = 0;
    HarmonicDistortion11: number = 0;
    HarmonicDistortion13: number = 0;
    HarmonicDistortion15: number = 0;
    HarmonicDistortion17: number = 0;
    HarmonicDistortion19: number = 0;
}

export enum eHarmonicProfile {
    ApplicationTotalRunning = 1,
    ApplicationTotalPeak = 2,
    SequenceRunning = 3,
    SequencePeak = 4,
    CumulativeRunning = 5,
    CumulativePeak = 6
}

export interface EnumItem {
    Description: string;
    ID: number;
}

export class HarmonicAnalysisInputs {
    HarmonicAnalysisSizingSolution: HarmonicAnalysisSizingSolution;
    HarmonicAnalysisSequenceList: HarmonicAnalysisSequence[];
    HarmonicProfileList: BasePickList[];
}

export class HarmonicAnalysisSequence {
    SequenceID: number;
    SequencePriority: number;
    SequenceDescription: string;
    KVABaseErrorChecked: number;
    AllContinuousKVABase: number;
    AllContinuousAndMomentaryKVABase: number;
    LargestContinuousWithLoadFactor: ILargestContinousWithLoadFactor;
    PeakHarmonicWithLoadFactor: IPeakHarmonicWithLoadFactor;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class HarmonicAnalysisSizingSolution {
    SolutionVoltageSpecific: number;
    KVABase: number;
    AlternatorKVABase: number;
    AlternatorSubtransientReactanceCorrected: number;
    AlternatorKWDerated: number;
    GeneratorQuantity: number;
    LargestContinuousHarmonicsWithLoadFactor: number[][];
    PeakHarmonicsWithLoadFactor: number[][];

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export interface ILargestContinousWithLoadFactor {
    HarmonicDistortion3: number;
    HarmonicDistortion5: number;
    HarmonicDistortion7: number;
    HarmonicDistortion9: number;
    HarmonicDistortion11: number;
    HarmonicDistortion13: number;
    HarmonicDistortion15: number;
    HarmonicDistortion17: number;
    HarmonicDistortion19: number;
}

export interface IPeakHarmonicWithLoadFactor {
    HarmonicDistortion3: number;
    HarmonicDistortion5: number;
    HarmonicDistortion7: number;
    HarmonicDistortion9: number;
    HarmonicDistortion11: number;
    HarmonicDistortion13: number;
    HarmonicDistortion15: number;
    HarmonicDistortion17: number;
    HarmonicDistortion19: number;
}

/* Harmonic Analysis region END*/

/* Gas Pipe region START*/
export class GasPipingReport {
    PressureDrop: number;
    SolutionID: number;
    AvailablePressure: number;
    AllowablePercentage: number;
    SupplyGasPressure: number;
    LengthOfRun: number;
    NumberOf90Elbows: number;
    NumberOf45Elbows: number;
    NumberOfTees: number;
    GeneratorMinPressure: number;
    PipeSize: number;
    SizingMethod: string;
    FuelType: string;
    ModelDescription: string;
    ProductFamilyDesc: string;
    FuelConsumption: string;
    PressureUnitText: string;
    LengthOfRunUnitText: string;
    PipeSizeUnitText: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

/* Gas Pipe region END*/

/* Exhaust Pipe region START*/
export class ExhaustPipingReport {
    PressureDrop: number;
    SolutionID: number;
    SizingMethodID: number;
    PipeSizeID: number;
    ExhaustSystemConfigurationID: number;
    LengthOfRun: number;
    NumberOfStandardElbows: number;
    NumberOfLongElbows: number;
    NumberOf45Elbows : number;
    PipeSize: number;
    SizingMethod : string;
    ExhaustEngineConfiguration : string;
    ExhaustSystemConfiguration : string;
    ModelDescription : string;
    ProductFamilyDesc : string;
    TotalExhaustFlow : number;
    MaximumBackPressure: number;
    PressureUnitText: string;
    LengthOfRunUnitText: string;
    PipeSizeUnitText: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

/* Exhaust Pipe region END*/