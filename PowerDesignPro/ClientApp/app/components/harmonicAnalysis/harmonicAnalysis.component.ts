import { Component, OnInit, ViewChild, ElementRef, Input } from "@angular/core";
import { HarmonicAnalysisInputs, HarmonicAnalysis, eHarmonicProfile, HarmonicAnalysisSequence, EnumItem, CurrentHarmonicDistortion, VoltageHarmonicDistortion, HarmonicData } from '../_models/analysisReport.model';
import { solutionService } from "../Services/solution.services";
import { ActivatedRoute, Params } from "@angular/router";
import { projectService } from "../Services/project.services";
import { ProjectDetails } from "../_models/project.model";
import * as Chart from "chart.js";
import { SolutionDetail } from "../_models/solutionSummary.model"; 
@Component({
    selector: 'harmonicAnalysis',
    templateUrl: './harmonicAnalysis.component.html',
    styleUrls: ['./harmonicAnalysis.component.css']
})

export class HarmonicAnalysisComponent implements OnInit {
    @Input() solutionDetail: SolutionDetail;
    public HarmonicAnalysisInputs: HarmonicAnalysisInputs;
    public HarmonicAnalysis = new HarmonicAnalysis();
    public loading: boolean = true;
    public selectedHarmonicProfile: number = 1;
    public selectedSequenceID: number | undefined;
    public harmonicProfileList: any;
    public showSequenceList: boolean = false;
    public chart: any = [];
    public chartData: HarmonicData[] = [];
    private kvaBase: number;
    private kvaNonLinearLoad: number;
    public noSolution: boolean = false;
    public noLoads: boolean = false;

    constructor(private _projectService: projectService, private _solutionService: solutionService,
        private _activatedRoute: ActivatedRoute, ) {
    }

    ngOnInit(): void {
        this.HarmonicAnalysisInputs = new HarmonicAnalysisInputs();
    }
    loadHarmonicAnaysisForReport() {
        return this.loadHarmonicAnalysis();

    }

    loadHarmonicAnalysis(): any {
        this.loading = true;
       return this._solutionService.GetHarmonicAnalysisInputs(this.solutionDetail.ProjectID, this.solutionDetail.SolutionID).subscribe((harmonicAnalysisInputs) => {
            if (harmonicAnalysisInputs == null || harmonicAnalysisInputs.ErrorCode != undefined) {
                this.loading = false;
                this.noSolution = true;
                this.noLoads = true;
                return false;
            }
            if (harmonicAnalysisInputs.HarmonicAnalysisSequenceList.length < 0) {
                this.loading = false;
                this.noSolution = false;
                this.noLoads = true;
                return false;
            }
            this.HarmonicAnalysisInputs = harmonicAnalysisInputs as HarmonicAnalysisInputs;
            if (this.HarmonicAnalysisInputs != null) {
                this.kvaBase = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.KVABase;
                this.getHarmonicAnalysis();
                this.noSolution = false;
                this.noLoads = false;
            }
            this.loading = false;
            return true;
        });
        
    }

    enumToArray(Enum: any): EnumItem[] {
        const keys = Object.keys(Enum).filter(k => typeof Enum[k as any] === "number");
        return keys.map(key => ({ Description: key, ID: Enum[key] } as EnumItem));
    }

    public mapHarmonicProfileChange(harmonicProfileID: number) {
        this.loading = true;
        this.selectedHarmonicProfile = +harmonicProfileID;
        if (this.selectedHarmonicProfile == eHarmonicProfile.ApplicationTotalPeak || this.selectedHarmonicProfile == eHarmonicProfile.ApplicationTotalRunning) {
            this.showSequenceList = false;
            this.selectedSequenceID = undefined;
        }
        else {
            this.showSequenceList = true;
            this.selectedSequenceID = this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList[0].SequenceID;
        }
        this.getHarmonicAnalysis();
        this.getChartData();
        this.loading = false;
    }

    public mapSequenceChange(selectedSequenceID: number) {
        this.loading = true;
        this.selectedSequenceID = selectedSequenceID;
        this.getHarmonicAnalysis();
        this.getChartData();
        this.loading = false;
    }

    getHarmonicAnalysis(): void {
        var harmonicProfile = this.HarmonicAnalysisInputs.HarmonicProfileList.find(h => +h.Value == +this.selectedHarmonicProfile);

        if (harmonicProfile != undefined) {
            this.HarmonicAnalysis.HarmonicProfile = harmonicProfile.LanguageKey;
        }
        this.HarmonicAnalysis.Sequence = this.getSequenceText();
        this.kvaNonLinearLoad = this.getKVANonLinearLoad();
        this.HarmonicAnalysis.KVANonLinearLoad = +this.kvaNonLinearLoad.toFixed(1);
        this.HarmonicAnalysis.KVABase = this.kvaBase;;

        var alternatorLoading = (+this.getAlternatorLoading().toFixed(1)) * 100;
        this.HarmonicAnalysis.AlternatorLoading = alternatorLoading;

        this.HarmonicAnalysis.CurrentHarmonicDistortion = this.getCurrentHarmonicDistortion();
        this.HarmonicAnalysis.VoltageHarmonicDistortion = this.getVoltageHarmonicDistortion();
        this.HarmonicAnalysis.THID = +this.getTHID().toFixed(1);
        this.HarmonicAnalysis.THVD = +this.getTHVD().toFixed(1);

        var currentHarmonicDistortion = this.HarmonicAnalysis.CurrentHarmonicDistortion;
        var voltageHarmonicDistortion = this.HarmonicAnalysis.VoltageHarmonicDistortion;

       // this.getChartData();

        this.HarmonicAnalysis.CurrentHarmonicDistortion = {
            HarmonicDistortion3: +currentHarmonicDistortion.HarmonicDistortion3.toFixed(1),
            HarmonicDistortion5: +currentHarmonicDistortion.HarmonicDistortion5.toFixed(1),
            HarmonicDistortion7: +currentHarmonicDistortion.HarmonicDistortion7.toFixed(1),
            HarmonicDistortion9: +currentHarmonicDistortion.HarmonicDistortion9.toFixed(1),
            HarmonicDistortion11: +currentHarmonicDistortion.HarmonicDistortion11.toFixed(1),
            HarmonicDistortion13: +currentHarmonicDistortion.HarmonicDistortion13.toFixed(1),
            HarmonicDistortion15: +currentHarmonicDistortion.HarmonicDistortion15.toFixed(1),
            HarmonicDistortion17: +currentHarmonicDistortion.HarmonicDistortion17.toFixed(1),
            HarmonicDistortion19: +currentHarmonicDistortion.HarmonicDistortion19.toFixed(1)
        }

        this.HarmonicAnalysis.VoltageHarmonicDistortion = {
            HarmonicDistortion3: +voltageHarmonicDistortion.HarmonicDistortion3.toFixed(1),
            HarmonicDistortion5: +voltageHarmonicDistortion.HarmonicDistortion5.toFixed(1),
            HarmonicDistortion7: +voltageHarmonicDistortion.HarmonicDistortion7.toFixed(1),
            HarmonicDistortion9: +voltageHarmonicDistortion.HarmonicDistortion9.toFixed(1),
            HarmonicDistortion11: +voltageHarmonicDistortion.HarmonicDistortion11.toFixed(1),
            HarmonicDistortion13: +voltageHarmonicDistortion.HarmonicDistortion13.toFixed(1),
            HarmonicDistortion15: +voltageHarmonicDistortion.HarmonicDistortion15.toFixed(1),
            HarmonicDistortion17: +voltageHarmonicDistortion.HarmonicDistortion17.toFixed(1),
            HarmonicDistortion19: +voltageHarmonicDistortion.HarmonicDistortion19.toFixed(1)
        }
    }

    //getHarmonicProfiles() {
    //    this.harmonicProfileList = this.enumToArray(eHarmonicProfile);
    //}

    getSelectedSequence(): HarmonicAnalysisSequence | undefined {
        return this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList.find(s => s.SequenceID == this.selectedSequenceID);
    }

    getSequenceText(): string {
        var selectedSequence = this.getSelectedSequence() as HarmonicAnalysisSequence;

        if (this.selectedHarmonicProfile == eHarmonicProfile.ApplicationTotalRunning || this.selectedHarmonicProfile == eHarmonicProfile.ApplicationTotalPeak)
            return "(Total)"
        else
            return selectedSequence.SequenceDescription;
    }

    getKVANonLinearLoad(): number {
        var selectedSequence = this.getSelectedSequence() as HarmonicAnalysisSequence;

        switch (this.selectedHarmonicProfile) {
            case eHarmonicProfile.ApplicationTotalRunning: {
                var kva = 0;
                for (let sequence of this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList) {
                    kva += sequence.AllContinuousKVABase;
                }
                return kva;
            }
            case eHarmonicProfile.ApplicationTotalPeak: {
                var kva = 0;
                for (let sequence of this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList) {
                    kva += sequence.AllContinuousAndMomentaryKVABase;
                }
                return kva;
            }
            case eHarmonicProfile.SequenceRunning: {
                if (selectedSequence != undefined)
                    return selectedSequence.AllContinuousKVABase;
                else
                    return 0;
            }
            case eHarmonicProfile.SequencePeak: {
                if (selectedSequence != undefined)
                    return selectedSequence.AllContinuousAndMomentaryKVABase;
                else
                    return 0;
            }
            case eHarmonicProfile.CumulativeRunning: {
                var kva = 0;
                for (let sequence of this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList) {
                    if (sequence.SequencePriority <= selectedSequence.SequencePriority)
                        kva += sequence.AllContinuousKVABase;
                }
                return kva;
            }
            case eHarmonicProfile.CumulativePeak: {
                var kva = 0;
                for (let sequence of this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList) {
                    if (sequence.SequencePriority <= selectedSequence.SequencePriority)
                        kva += sequence.AllContinuousKVABase;
                }
                kva = kva + (selectedSequence.AllContinuousAndMomentaryKVABase - selectedSequence.AllContinuousKVABase);

                return kva;
            }
            default: {
                var kva = 0;
                for (let seq of this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList) {
                    kva += seq.AllContinuousKVABase;
                }
                return kva;
            }
        }
    }

    getAlternatorLoading(): number {
        var kwDerated = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.AlternatorKWDerated;
        var quantity = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.GeneratorQuantity;

        if (kwDerated > 0)
            return this.kvaNonLinearLoad / (kwDerated * quantity);
        else
            return 0;
    }

    getCurrentHarmonicDistortion(): CurrentHarmonicDistortion {
        var selectedSequence = this.getSelectedSequence() as HarmonicAnalysisSequence;
        var currentHarmonicDistortion = new CurrentHarmonicDistortion();

        switch (this.selectedHarmonicProfile) {
            case eHarmonicProfile.ApplicationTotalRunning: {
                var index = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor.length - 1;
                currentHarmonicDistortion.HarmonicDistortion3 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][0];
                currentHarmonicDistortion.HarmonicDistortion5 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][1];
                currentHarmonicDistortion.HarmonicDistortion7 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][2];
                currentHarmonicDistortion.HarmonicDistortion9 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][3];
                currentHarmonicDistortion.HarmonicDistortion11 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][4];
                currentHarmonicDistortion.HarmonicDistortion13 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][5];
                currentHarmonicDistortion.HarmonicDistortion15 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][6];
                currentHarmonicDistortion.HarmonicDistortion17 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][7];
                currentHarmonicDistortion.HarmonicDistortion19 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][8];

                return currentHarmonicDistortion;
            }
            case eHarmonicProfile.ApplicationTotalPeak: {
                var index = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor.length - 1;
                currentHarmonicDistortion.HarmonicDistortion3 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][0];
                currentHarmonicDistortion.HarmonicDistortion5 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][1];
                currentHarmonicDistortion.HarmonicDistortion7 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][2];
                currentHarmonicDistortion.HarmonicDistortion9 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][3];
                currentHarmonicDistortion.HarmonicDistortion11 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][4];
                currentHarmonicDistortion.HarmonicDistortion13 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][5];
                currentHarmonicDistortion.HarmonicDistortion15 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][6];
                currentHarmonicDistortion.HarmonicDistortion17 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][7];
                currentHarmonicDistortion.HarmonicDistortion19 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][8];

                return currentHarmonicDistortion;
            }
            case eHarmonicProfile.SequenceRunning: {
                if (selectedSequence != undefined) {
                    if (this.kvaBase > 0) {
                        currentHarmonicDistortion.HarmonicDistortion3 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion3, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion5 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion5, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion7 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion7, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion9 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion9, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion11 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion11, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion13 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion13, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion15 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion15, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion17 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion17, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion19 = this.calculateCurrentHarmonicDistortion(selectedSequence.LargestContinuousWithLoadFactor.HarmonicDistortion19, selectedSequence.KVABaseErrorChecked);
                    }
                }

                return currentHarmonicDistortion;
            }
            case eHarmonicProfile.SequencePeak: {
                if (selectedSequence != undefined) {
                    if (this.kvaBase > 0) {
                        currentHarmonicDistortion.HarmonicDistortion3 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion3, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion5 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion5, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion7 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion7, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion9 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion9, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion11 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion11, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion13 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion13, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion15 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion15, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion17 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion17, selectedSequence.KVABaseErrorChecked);
                        currentHarmonicDistortion.HarmonicDistortion19 = this.calculateCurrentHarmonicDistortion(selectedSequence.PeakHarmonicWithLoadFactor.HarmonicDistortion19, selectedSequence.KVABaseErrorChecked);
                    }
                }

                return currentHarmonicDistortion;
            }
            case eHarmonicProfile.CumulativeRunning: {
                var index = this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList.indexOf(selectedSequence);

                if (index != undefined) {
                    currentHarmonicDistortion.HarmonicDistortion3 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][0];
                    currentHarmonicDistortion.HarmonicDistortion5 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][1];
                    currentHarmonicDistortion.HarmonicDistortion7 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][2];
                    currentHarmonicDistortion.HarmonicDistortion9 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][3];
                    currentHarmonicDistortion.HarmonicDistortion11 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][4];
                    currentHarmonicDistortion.HarmonicDistortion13 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][5];
                    currentHarmonicDistortion.HarmonicDistortion15 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][6];
                    currentHarmonicDistortion.HarmonicDistortion17 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][7];
                    currentHarmonicDistortion.HarmonicDistortion19 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.LargestContinuousHarmonicsWithLoadFactor[index][8];

                    return currentHarmonicDistortion;
                }
            }
            case eHarmonicProfile.CumulativePeak: {
                var index = this.HarmonicAnalysisInputs.HarmonicAnalysisSequenceList.indexOf(selectedSequence);

                if (index != undefined) {
                    currentHarmonicDistortion.HarmonicDistortion3 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][0];
                    currentHarmonicDistortion.HarmonicDistortion5 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][1];
                    currentHarmonicDistortion.HarmonicDistortion7 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][2];
                    currentHarmonicDistortion.HarmonicDistortion9 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][3];
                    currentHarmonicDistortion.HarmonicDistortion11 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][4];
                    currentHarmonicDistortion.HarmonicDistortion13 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][5];
                    currentHarmonicDistortion.HarmonicDistortion15 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][6];
                    currentHarmonicDistortion.HarmonicDistortion17 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][7];
                    currentHarmonicDistortion.HarmonicDistortion19 = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.PeakHarmonicsWithLoadFactor[index][8];
                }

                return currentHarmonicDistortion;
            }
            default: {
                return currentHarmonicDistortion;
            }
        }
    }

    calculateCurrentHarmonicDistortion(harmonicDistortion: number, kvaBaseErrorChecked: number): number {
        return kvaBaseErrorChecked / this.kvaBase * harmonicDistortion;
    }

    getVoltageHarmonicDistortion(): VoltageHarmonicDistortion {
        var voltageHarmonicDistortion = new VoltageHarmonicDistortion();

        if (this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.KVABase > 0) {
            voltageHarmonicDistortion.HarmonicDistortion3 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion3, 3);
            voltageHarmonicDistortion.HarmonicDistortion5 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion5, 5);
            voltageHarmonicDistortion.HarmonicDistortion7 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion7, 7);
            voltageHarmonicDistortion.HarmonicDistortion9 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion9, 9);
            voltageHarmonicDistortion.HarmonicDistortion11 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion11, 11);
            voltageHarmonicDistortion.HarmonicDistortion13 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion13, 13);
            voltageHarmonicDistortion.HarmonicDistortion15 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion15, (15 / 2));
            voltageHarmonicDistortion.HarmonicDistortion17 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion17, (17 / 2));
            voltageHarmonicDistortion.HarmonicDistortion19 = this.calculateVoltageHarmonicDistortion(this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion19, (19 / 2));
        }
        return voltageHarmonicDistortion;
    }

    calculateVoltageHarmonicDistortion(currentHarmonicDistortion: number, distortionIndex: number): number {
        return ((this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.AlternatorSubtransientReactanceCorrected * this.kvaBase / this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.AlternatorKVABase)
            * currentHarmonicDistortion * distortionIndex) / this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.GeneratorQuantity;
    }

    getTHID(): number {
        return Math.sqrt((this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion3 ** 2) +
            (this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion5 ** 2) +
            (this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion7 ** 2) +
            (this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion9 ** 2) +
            (this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion11 ** 2) +
            (this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion13 ** 2) +
            (this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion15 ** 2) +
            (this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion17 ** 2) +
            (this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion19 ** 2));
    }

    getTHVD(): number {
        return Math.sqrt((this.HarmonicAnalysis.CurrentHarmonicDistortion.HarmonicDistortion3 ** 2) +
            (this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion5 ** 2) +
            (this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion7 ** 2) +
            (this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion9 ** 2) +
            (this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion11 ** 2) +
            (this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion13 ** 2) +
            (this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion15 ** 2) +
            (this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion17 ** 2) +
            (this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion19 ** 2));
    }

    getChartData() {
        if (this.noSolution || this.noLoads)
            return;
        this.calculateCharData();
        var yMax = (Math.ceil(this.findMax(this.chartData) / 100) * 100) + 100;

        const xTickOptions: Chart.LinearTickOptions = {
            min: 0,
            max: 720,
            stepSize: 90,
            beginAtZero: true
        }

        const yTickOptions: Chart.LinearTickOptions = {
            stepSize: 100,
            max: yMax,
            min: -yMax
        }

        this.chart = new Chart('canvas', {
            type: 'line',
            data: {
                datasets: [
                    {
                        backgroundColor: '#008000',
                        borderColor: '#008000',
                        data: this.chartData,
                        fill: false
                    }
                ]
            },
            options: {
                elements: { point: { radius: 0 } },
                responsive: true,
                legend: {
                    display: false
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    xAxes: [{
                        type: 'linear',
                        display: true,
                        ticks: xTickOptions
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Volts',
                            fontStyle: 'bold',
                            fontSize: 14
                        },
                        ticks: yTickOptions
                    }],
                }
            }
        });
    }

    calculateCharData() {
        this.chartData = [];
        var voltageSpecific = this.HarmonicAnalysisInputs.HarmonicAnalysisSizingSolution.SolutionVoltageSpecific;

        var v3 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion3 / 100;
        var v5 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion5 / 100;
        var v7 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion7 / 100;
        var v9 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion9 / 100;
        var v11 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion11 / 100;
        var v13 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion13 / 100;
        var v15 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion15 / 100;
        var v17 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion17 / 100;
        var v19 = this.HarmonicAnalysis.VoltageHarmonicDistortion.HarmonicDistortion19 / 100;

        this.chartData.push({ x: 0, y: 0 });

        for (var i = 1; i <= 720; i++) {
            var rad = Math.PI * i / 180;

            var y = Math.round(voltageSpecific * 1.414 *
                (Math.sin(rad) +
                    v3 * Math.sin(rad * 3) +
                    v5 * Math.sin(rad * 5) +
                    v7 * Math.sin(rad * 7) +
                    v9 * Math.sin(rad * 9) +
                    v11 * Math.sin(rad * 11) +
                    v13 * Math.sin(rad * 13) +
                    v15 * Math.sin(rad * 15) +
                    v17 * Math.sin(rad * 17) +
                    v19 * Math.sin(rad * 19))
            );

            this.chartData.push(new HarmonicData(i, y));
        }
    }

    findMax(array: Array<HarmonicData>): number {
        let max = array[0].y;

        for (let i = 1, len = array.length; i < len; i++) {
            let v = array[i].y;
            max = (v > max) ? v : max;
        }
        return max;
    }
}