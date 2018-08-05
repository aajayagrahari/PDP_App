import { Component, Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ProjectSolutionPickListDto, BaseSolutionSetupMappingValuesDto, BaseSolutionSetupDto, ProjectSolutionResponseDto, ProjectSolutionSetup } from '../_models/solutionSetup.model';
import { BasePickList } from "../_models/load.model";


@Injectable()

export class CommonService {

    constructor() {

    }

    public GetConvertedPowerUnitsValue(
        currentValue: number,
        currentUnits: string,
        targetUnits: string,
        voltage: number,
        powerFactor: number,
        phase: number,
        isMotorLoad: boolean): number {
        if (isMotorLoad) {

        }
        else {
            return this.ConvertPowerUnits(currentValue, currentUnits, targetUnits, voltage, powerFactor, phase);
        }

        return 0;
    }

    private ConvertPowerUnits(
        currentValue: number,
        currentUnits: string,
        targetUnits: string,
        voltage: number,
        powerFactor: number,
        phase: number): number {

        var targetValue = currentValue;
        let phaseMultiplier = 1;

        if (currentUnits.toLowerCase() == targetUnits.toLowerCase()) {
            return currentValue;
        }

        if (phase == 2) {
            phaseMultiplier = 1.732;
        }

        if (targetUnits.toLowerCase() == "kw") {
            if (currentUnits.toLowerCase() == "kva") {
                targetValue = currentValue * powerFactor;
            } else {
                targetValue = (currentValue * voltage * powerFactor / 1000) * phaseMultiplier;
            }
        }

        if (targetUnits.toLowerCase() == "kva") {
            if (currentUnits.toLowerCase() == "kw") {
                targetValue = currentValue / powerFactor;
            } else {
                targetValue = (currentValue * voltage / 1000) * phaseMultiplier;
            }
        }

        if (targetUnits.toLowerCase() == "amps") {
            if (currentUnits.toLowerCase() == "kw") {
                targetValue = currentValue * 1000 / (voltage * phaseMultiplier * powerFactor);
            } else {
                targetValue = currentValue * 1000 / (voltage * phaseMultiplier);
            }
        }

        return +targetValue.toFixed(2);
    }

    //private ConvertPowerUnits(
    //    currentValue: number,
    //    currentUnits: string,
    //    targetUnits: string,
    //    voltage: number,
    //    powerFactor: number,
    //    phase: number): number {

    //    var targetValue = currentValue;
    //    let phaseMultiplier = 1;

    //    if (currentUnits == targetUnits) {
    //        return currentValue;
    //    }

    //    if (phase == 2) {
    //        phaseMultiplier = 1.732;
    //    }

    //    if (targetUnits == 1) {
    //        if (currentUnits == 2) {
    //            targetValue = currentValue * powerFactor;
    //        } else {
    //            targetValue = (currentValue * voltage * powerFactor / 1000) * phaseMultiplier;
    //        }
    //    }

    //    if (targetUnits == 2) {
    //        if (currentUnits == 1) {
    //            targetValue = currentValue / powerFactor;
    //        } else {
    //            targetValue = (currentValue * voltage / 1000) * phaseMultiplier;
    //        }
    //    }

    //    if (targetUnits == 3) {
    //        if (currentUnits == 1) {
    //            targetValue = currentValue * 1000 / (voltage * phaseMultiplier * powerFactor);
    //        } else {
    //            targetValue = currentValue * 1000 / (voltage * phaseMultiplier);
    //        }
    //    }

    //    return +targetValue.toFixed(2);
    //}
}