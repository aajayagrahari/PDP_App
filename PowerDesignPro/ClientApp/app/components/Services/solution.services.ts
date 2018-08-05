import { Component, Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { httpclient } from '../Services/httpclient.component';
import { storeagesevice } from '../Services/storeage.service';
import { userService } from '../Services/user.service';
import { DOCUMENT } from '@angular/platform-browser';
import { RecommendedProductRequestDto, RequestForQuote } from '../_models/solutionSummary.model';
import { HarmonicAnalysis } from '../_models/analysisReport.model';
import { ReportModel } from '../_models/report.model';

@Injectable()

export class solutionService {
    public userDefaultExist: number;
    public userDefaultSetup = this._httpclient.userDefaultSetup;
    private brand: string;
    constructor(protected _httpclient: httpclient, protected _userservce: userService, protected _storeagesevice: storeagesevice
        , @Inject(DOCUMENT) public document: any
    ) {
        try {
            this.userDefaultExist = _storeagesevice.get(this.userDefaultSetup)
            //var x = this.window.location.hostname;
            //console.log(this.document.location.hostname)
            if (this.document != null && this.document.location.hostname.toLowerCase().indexOf("pramac") >= 0 ) {
                this.brand = "pramac";
            }
            else {
                this.brand = "generac";
            }
        } catch (e) {
            this.userDefaultExist = 0;
        }
    }


    GetSolutionHeaderDetails(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/Solution/GetSolutionHeaderDetails?projectID=" + projectID + "&solutionID=" + solutionID, this._userservce.token).map((solutionHeaderDetail) => {
            return solutionHeaderDetail;
        });
    }

    //Region - Solution Setup API calls
    LoadNewSolutionSetup(projectID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/Solution/GetDefaultSolutionSetupForNewSolution?projectID=" + projectID, this._userservce.token).map((solutionSetup) => {
            return solutionSetup;
        });
    }

    LoadExistingSolutionSetup(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/Solution/GetSolutionSetupForExistingSolution?projectID=" + projectID + "&solutionID=" + solutionID, this._userservce.token).map((solutionSetup) => {
            return solutionSetup;
        });
    }

    SaveSolutionSetup<T>(solution: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/Solution/SaveSolutionDetail", solution, this._userservce.token).map((recentSolution) => {
            return recentSolution;
        });
    }

    RestoreUserDefaults(): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/Solution/GetUserDefaultSolutionSetup", this._userservce.token).map((userDefaultSolutionSetup) => {
            return userDefaultSolutionSetup;
        });
    }

    GetUserDefaultsForNewUser(): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/Solution/GetGlobalDefaultSolutionSetup", this._userservce.token).map((defaultSolutionSetupForNewUser) => {
            return defaultSolutionSetupForNewUser;
        });
    }

    GetGlobalDefaults(): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/Solution/GetGlobalDefaultSolutionSetup", this._userservce.token).map((globaldefaultSolutionSetup) => {
            return globaldefaultSolutionSetup;
        });
    }

    SaveUserDefaultSolutionSetup<T>(userDefaultSolution: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/Solution/SaveUserDefaultSolutionDetail", userDefaultSolution, this._userservce.token).map((isUserDefaultSetupSaved) => {
            return isUserDefaultSetupSaved;
        });
    }

    CheckUserDefaultSetup(): Observable<any> {        
        return this._httpclient.gethttpdatatoken("Project/Solution/CheckUserDefaultSetup", this._userservce.token).map((isUserDefaultExist) => {
            return isUserDefaultExist;
        });
    }

    //End

    //Region - Loads API calls

    GetSolutionDetails(solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Solution/Load/GetLoadDetails?solutionId=" + solutionID, this._userservce.token).map((load) => {
            return load;
        });
    }

    GetLoadDetails(solutionId: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Solution/Load/GetLoadDetails?solutionId=" + solutionId, this._userservce.token).map((load) => {
            return load;
        });
    }

    GetSolutionLoadDetails(loadId: number, solutionId: number, loadFamilyId: number, solutionLoadId: number = 0): Observable<any> {
        return this._httpclient.gethttpdatatoken("Solution/Load/GetSolutionLoadDetails?loadId=" + loadId + "&solutionId=" + solutionId +"&loadFamilyId=" + loadFamilyId + "&solutionLoadId=" + solutionLoadId, this._userservce.token).map((defaultLoadDetail) => {
            return defaultLoadDetail;
        });
    }

    GetDefaultsLoadDetailsForBasicLoad(loadId: number, solutionId: number, basicLoadId: number = 0): Observable<any> {
        return this._httpclient.gethttpdatatoken("Solution/Load/GetLoadDetailsForBasicLoad?loadId=" + loadId + "&solutionId=" + solutionId + "&basicLoadId=" + basicLoadId, this._userservce.token).map((defaultLoadDetail) => {
            return defaultLoadDetail;
        });
    }

    GetDefaultsLoadDetailsForACLoad(loadId: number, solutionId: number, basicLoadId: number = 0): Observable<any> {
        return this._httpclient.gethttpdatatoken("Solution/Load/GetLoadDetailsForACLoad?loadId=" + loadId + "&solutionId=" + solutionId + "&basicLoadId=" + basicLoadId, this._userservce.token).map((defaultLoadDetail) => {
            return defaultLoadDetail;
        });
    }

    SaveSolutionBasicLoadDetail<T>(basicLoadDto: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Solution/Load/SaveSolutionLoadDetail", basicLoadDto, this._userservce.token).map((result) => {
            return result;
        });
    }

    SaveSolutionACLoadDetail<T>(acLoadDto: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Solution/Load/SaveSolutionAcLoadDetail", acLoadDto, this._userservce.token).map((result) => {
            return result;
        });
    }

    SaveSolutionLightingLoadDetail<T>(lightingLoadDto: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Solution/Load/SaveSolutionLightingLoadDetail", lightingLoadDto, this._userservce.token).map((result) => {
            return result;
        });
    }

    SaveSolutionWelderLoadDetail<T>(welderLoadDto: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Solution/Load/SaveSolutionWelderLoadDetail", welderLoadDto, this._userservce.token).map((result) => {
            return result;
        });
    }

    SaveSolutionUPSLoadDetail<T>(upsLoadDto: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Solution/Load/SaveSolutionUPSLoadDetail", upsLoadDto, this._userservce.token).map((result) => {
            return result;
        });
    }

    SaveSolutionMotorLoadDetail<T>(motorLoadDto: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Solution/Load/SaveSolutionMotorLoadDetail", motorLoadDto, this._userservce.token).map((result) => {
            return result;
        });
    }

    CheckLoadExistForSolution(solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Solution/Load/CheckLoadExistForSolution?solutionId=" + solutionID, this._userservce.token).map((load) => {
            return load;
        });
    }


    GetLoadSummaryLoads(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/SolutionSummary/GetLoadSummaryLoads?projectID=" + projectID + "&solutionID=" + solutionID, this._userservce.token).map((load) => {
            return load;
        });
    }

    GetSolutionSummary(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/SolutionSummary/GetSolutionSummary?projectID=" + projectID + "&solutionID=" + solutionID + "&brand=" + this.brand, this._userservce.token).map((solutionSummary) => {
            return solutionSummary;
        });
    }
    
    GetTransientAnalysis(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/SolutionSummary/GetTransientAnalysis?projectID=" + projectID + "&solutionID=" + solutionID + "&brand=" + this.brand, this._userservce.token).map((transientAnalysis) => {
            return transientAnalysis;
        });
    }

    GetGasPipingReport(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/SolutionSummary/GetGasPipeReport?projectID=" + projectID + "&solutionID=" + solutionID + "&brand=" + this.brand, this._userservce.token).map((gasPipeReport) => {
            return gasPipeReport;
        });
    }


    GetExhaustPipingReport(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/SolutionSummary/GetExhaustPipingReport?projectID=" + projectID + "&solutionID=" + solutionID + "&brand=" + this.brand, this._userservce.token).map((exhaustPipeReport) => {
            return exhaustPipeReport;
        });
    }

    GetHarmonicAnalysisInputs(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/SolutionSummary/GetHarmonicAnalysisInputs?projectID=" + projectID + "&solutionID=" + solutionID + "&brand=" + this.brand, this._userservce.token).map((harmonicAnalysisInputs) => {
            return harmonicAnalysisInputs;
        });
    }
    DownloadReportInPDF(reportModel: ReportModel): Observable<any> {
        return this._httpclient.posthttpdatatokenforreport("PDF/GetPDF", reportModel, this._userservce.token).map((pdfContent) => {
            return pdfContent;
        });
    }
    DownloadHarmonicAnalysisPDF(harmonicAnalysis: HarmonicAnalysis): Observable<any> {
        return this._httpclient.posthttpdatatoken("PDF/GetHarmonicAnalysisPDF", harmonicAnalysis, this._userservce.token).map((isDownloaded) => {
            return isDownloaded;
        });
    }

    updateFuelTypeForSolution<T>(request: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/SolutionSummary/UpdateFuelTypeForSolution", request, this._userservce.token).map((isUpdated) => {
            return isUpdated;
        });
    }

    UpdateLoadSequence<T>(loadSequence: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/SolutionSummary/UpdateLoadSequence", loadSequence, this._userservce.token).map((isUpdated) => {
            return isUpdated;
        });
    }

    UpdateLoadSequenceShedDetail<T>(loadSequence: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/SolutionSummary/UpdateLoadSequenceShedDetail", loadSequence, this._userservce.token).map((isUpdated) => {
            return isUpdated;
        });
    }

    updateRecommendedProductDetails(request: RecommendedProductRequestDto): Observable<any> {
        request.Brand = this.brand;
        return this._httpclient.posthttpdatatoken("Project/SolutionSummary/UpdateRecommendedProductDetails", request, this._userservce.token).map((solutionSummary) => {
            return solutionSummary;
        });
    }

    DeleteSolutionLoad(solutionID: number, solutionLoadID: number, loadFamilyID: number): Observable<any> {
        return this._httpclient.deletehttpdatatoken("Solution/Load/DeleteSolutionLoad?solutionID=" + solutionID +  "&solutionLoadID=" + solutionLoadID + " &loadFamilyID=" + loadFamilyID, this._userservce.token).map((isLoadRemoved) => {
            return isLoadRemoved;
        });
    }

    GetGasPipingDetails(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/SolutionSummary/GetGasPipingDetails?projectID=" + projectID + "&solutionID=" + solutionID, this._userservce.token).map((gasPipingDetails) => {
            return gasPipingDetails;
        });
    }

    GetExhaustPipingDetails(projectID: number, solutionID: number): Observable<any> {
        return this._httpclient.gethttpdatatoken("Project/SolutionSummary/GetExhaustPipingDetails?projectID=" + projectID + "&solutionID=" + solutionID, this._userservce.token).map((exhaustPipingDetails) => {
            return exhaustPipingDetails;
        });
    }

    PostGasPipingSolutionDetail<T>(request: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/SolutionSummary/PostGasPipingSolutionDetail", request, this._userservce.token).map((gasPiping) => {
            return gasPiping;
        });
    }

    PostExhaustPipingSolutionDetail<T>(request: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Project/SolutionSummary/PostExhaustPipingSolutionDetail", request, this._userservce.token).map((exhaustPiping) => {
            return exhaustPiping;
        });
    }

    RequestForQuote<T>(request: RequestForQuote): Observable<any> {
        request.Brand = this.brand;
        return this._httpclient.posthttpdatatoken("Project/SolutionSummary/RequestForQuote", request, this._userservce.token).map((requestForQuoteID) => {
            return requestForQuoteID;
        });
    }
}