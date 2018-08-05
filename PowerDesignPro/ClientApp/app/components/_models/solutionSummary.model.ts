import { BasePickList } from './load.model'

export interface IProductRecommendation {
    [key: string]: string;
}

export class SolutionDetail {
    ProjectID: number;
    SolutionID: number;
    SolutionName: string;
    IsReadOnlyAccess: boolean;
    ShowGrantAccess?: boolean;
    Notes: string;
    IsSolutionAvailable: boolean;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class RequestForQuote {
    ProjectID: number;
    SolutionID: number;
    Comments: string;
    Brand: string;
    GeneratorDescription: string;
    AlternatorDescription: string;
    Language: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class SolutionSummary {
    SolutionID: number;
    ProjectID: number;
    SolutionName: string;
    FuelType: string;
    SolutionLimits: SolutionLimits;
    LoadSummaryLoads: LoadSummaryLoads;
    SolutionSummaryRecommendedProductDetails: SolutionSummaryRecommendedProduct;
}

export class VDipFDip {
    VDip: number;
    FDip: number;
}

export class BaseLoadList {
    StartingKW: number;
    StartingKVA: number;
    RunningKW: number;
    RunningKVA: number;
    THIDContinuous: number;
    THIDMomentary: number;
    THIDKva: number;
}

export class LoadSequenceRequest {
    ProjectID: number;
    SolutionID: number;
    SolutionLoadID: number;
    LoadFamilyID: number;
    LoadSequenceID: number;
}

export class LoadSummaryLoads {
    SolutionID: number;
    ProjectID: number;
    ListOfLoadSummaryLoadList: LoadSummaryLoadList[];
    SequenceList: BasePickList[];
    SolutionSummaryLoadSummary: SolutionSummaryLoadSummary;
}

export class LoadSummaryLoadList {
    SequenceID: number;
    SequenceDescription: string;
    LoadSequenceList: LoadSequence[];
    LoadSequenceSummary: LoadSequenceSummary;
}

export class LoadSequence extends BaseLoadList {
    LoadID: number;
    LoadName: string;
    Description: string;
    KVAPFDescription: string;
    HarmonicsDescription: string;
    LoadFamilyID: number;
    SolutionLoadID: number;
    SequenceID: number;
    LimitsVdip: string;
    LimitsFdip: string;
    LanguageKey: string;
}

export class LoadSequenceSummary extends BaseLoadList {
    LoadFactorDescription: string;
    SequencePeakText: string;
    ApplicationPeakText: string;
    VDipPerc: number;
    VDipVolts: number;
    FDipPerc: number;
    FDipHertz: number;
    Shed: boolean;
    Sequence: string;
}

export class SolutionLimits {
    MaxLoading: number;
    FDip: string;
    VDip: string;
    THVDContinuous: string;
    THVDPeak: string;
}

export class SolutionSummaryLoadSummary {
    RunningKW: number;
    RunningKVA: number;
    RunningPF: number;
    StepKW: number;
    PeakKW: number;
    StepKVA: number;
    HarmonicsKVA: number;
    THIDContinuous: number;
    THIDPeak: number;
}

export interface BasicLoadList {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;

}
export class SolutionSummaryRecommendedProduct {
    Description: string;
    DescriptionPartwo: string;
    RunningKW: number;
    PeakKW: number;
    FDip: number;
    VDip: number;
    THVDContinuous: string;
    THVDPeak: string;
    ProductFamilyList: BasicLoadList[];
    ProductFamilyID: number | null;
    FamilySelectionMethodList: BasePickList[];
    FamilySelectionMethodID: number;
    SizingMethodList: BasicLoadList[];
    SizingMethodID: number;
    GeneratorList: GeneratorPickList[];
    GeneratorID: number | null;
    ParallelQuantityList: BasePickList[];
    ParallelQuantityID: number;
    AlternatorList: AlternatorPickList[];
    AlternatorID: number | null;
    GeneratorDocuments: SolutionSummaryGeneratorDocumentationPickList[];
}

export class RecommendedProductRequestDto {
    FamilySelectionMethodID: number;
    ProductFamilyID: number | null;
    ParallelQuantityID: number;
    SizingMethodID: number;
    GeneratorID: number | null;
    AlternatorID: number | null;
    SolutionID: number;
    ProjectID: number;
    Brand: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export interface GeneratorPickList {
    ID: number;
    Description: string;
    Value: string;
    ProductFamilyID: number;
}

export interface AlternatorPickList {
    ID: number;
    Description: string;
    Value: string;
    GeneratorID: number;
}

export interface SolutionSummaryGeneratorDocumentationPickList {
    ID: number;
    Description: string;
    GeneratorID: number;
    DocumentURL: string;
}

export class GasPiping {
    IsGasesousSolution: boolean;
    GeneratorSummary: GeneratorSummary;
    GasPipingInput: GasPipingInput;
    GasPipingSolution: GasPipingSolution;
    SizingMethodID: number;
    PipeSizeID: number;
    UnitSelected: number;
    ID: number;
    SizingMethodList: BasePickList[]
    PipeSizeList: GasPipingPipeSize[]
    SingleUnit: boolean;
    FuelConfig: FuelConfig;
    TempRank: number;
}

export class FuelConfig {
    Type: string;
    SP_GR: number;
    Viscosity: number;
}

export class GasPipingPipeSize {
    ID: number;
    Description: string;
    PipeSize: number;
    Diameter: number;
    Factor45: number;
    Factor90: number;
    Tee: number;
}

export class GeneratorSummary {
    ProductFamily: string;
    Generator: string;
    FuelType: string;
    FuelConsumption: number;
    GasFuelFlow: number;
}

export class GasPipingInput {
    SupplyGasPressure: number;
    LengthOfRun: number;
    GeneratorMinPressure: number;
    NumberOf90Elbows: number;
    NumberOf45Elbows: number;
    NumberOfTees: number;
}

export class GasPipingSolution {
    PressureDrop: number;
    AvailablePressure: number;
    AllowablePercentage: number;
    SolutionFound: boolean;
}

export class UnitMeasure {
    FeetOrMeters: string;
    InchesOrCentimeters: string;
    WaterOrPascals: string;
    YardOrMeters: string;
}

export class ExhaustPiping {
    ExhaustPipingGeneratorSummary: ExhaustPipingGeneratorSummary
    ExhaustPipingInput: ExhaustPipingInput
    ExhaustPipingSolution: ExhaustPipingSolution
    SizingMethodID: number;
    PipeSizeID: number;
    ID: number;
    UnitSelected: number;
    ExhaustSystemConfigurationID: number;
    SizingMethodList: BasePickList[]
    PipeSizeList: BasePickList[]
    ExhaustSystemConfigurationList: BasePickList[]
    UnitMeasure: UnitMeasure;
}

export class ExhaustPipingGeneratorSummary {
    ProductFamily: string;
    Generator: string;
    TotalExhaustFlow: number;
    MaximumBackPressure: number;
    ExhaustTempF: number;
    ExhaustFlex: number;
}

export class ExhaustPipingInput {
    LengthOfRun: number;
    NumberOfStandardElbows: number;
    NumberOfLongElbows: number;
    NumberOf45Elbows: number;
}

export class ExhaustPipingSolution {
    PressureDrop: number;
}

export class ExhaustPipingRequest {
    ID: number;
    SolutionID: number;
    SizingMethodID: number;
    PipeSizeID: number;
    ExhaustSystemConfigurationID: number;
    UnitID: number;
    ExhaustPipingInput: ExhaustPipingInput;
    ExhaustPipingSolution: ExhaustPipingSolution;
    ExhaustPipingGeneratorSummary: ExhaustPipingGeneratorSummary;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}