export class HarmonicCurrentDistortion {
    HD3: number = 0;
    HD5: number = 0;
    HD7: number = 0;
    HD9: number = 0;
    HD11: number = 0;
    HD13: number = 0;
    HD15: number = 0;
    HD17: number = 0;
    HD19: number = 0;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class LoadCharacteristics {
    sKVA: number = 0;
    sKW: number = 0;
    rKVA: number = 0;
    rKW: number = 0;
    momentaryHarmonicCurrentDistortion: number = 0;
    continuousHarmonicCurrentDistortion: number = 0;
    harmonicCurrentDistortion = new HarmonicCurrentDistortion();
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}