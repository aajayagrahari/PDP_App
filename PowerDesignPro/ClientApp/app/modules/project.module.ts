import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule, Http } from '@angular/http';
import { ProjectComponent } from "../components/project/project.component";
import { ProjectHeaderComponent } from "../components/projectheader/projectheader.component";
import { SolutionSetupComponent } from "../components/solutionsetup/solutionsetup.component";
import { SolutionSummaryComponent } from "../components/solutionSummary/solutionSummary.component";
import { SolutionHeaderComponent } from "../components/solutionheader/solutionheader.component";
import { LoadComponent } from "../components/load/load.component";
import { BasicLoadComponent } from "../components/basicLoad/basicLoad.component";
import { LoadCharacteristicsComponent } from "../components/loadCharacteristics/loadCharacteristics.component";
import { LoadSummaryLoadsComponent } from "../components/loadSummaryLoads/loadSummaryLoads.component";
import { ACLoadComponent } from "../components/acLoad/acLoad.component";
import { LightingLoadComponent } from "../components/lightingLoad/lightingLoad.component";
import { WelderLoadComponent } from "../components/welderLoad/welderLoad.component";
import { UPSLoadComponent } from "../components/upsLoad/upsLoad.component";
import { MotorLoadComponent } from "../components/motorLoad/motorLoad.component";
import { projectRoutes } from "./project.routes";
import { SharedModule } from "../modules/shared.module";
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { TabsModule } from 'ngx-tabs';
import { GasPipingComponent } from "../components/gasPiping/gasPiping.component";
import { ExhaustPipingComponent } from "../components/exhaustPiping/exhaustPiping.component";
import { TransientAnalysisComponent } from '../components/transientAnalysis/transientAnalysis.component';
import { HarmonicAnalysisComponent } from '../components/harmonicAnalysis/harmonicAnalysis.component';
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TooltipModule } from 'ngx-bootstrap';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
export function createTranslateLoader(http: Http) {
   return new TranslateHttpLoader(http, './i18n/', '.json');
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        SharedModule,
        RouterModule.forChild(projectRoutes),
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [Http]
            },
            isolate: true
        }),
        LoadingModule.forRoot({
            animationType: ANIMATION_TYPES.threeBounce,
            backdropBackgroundColour: 'rgba(0,0,0,0.1)',
            backdropBorderRadius: '10px',
            fullScreenBackdrop: true,
            primaryColour: '#f0ad4e',
            secondaryColour: '#f0ad4e',
            tertiaryColour: '#f0ad4e'
        }),
        TabsModule,
        TooltipModule.forRoot()
    ],
    declarations: [
        ProjectComponent,
        ProjectHeaderComponent,
        SolutionSetupComponent,
        SolutionSummaryComponent,
        SolutionHeaderComponent,
        LoadComponent,
        BasicLoadComponent,
        LoadCharacteristicsComponent,
        LoadSummaryLoadsComponent,
        ACLoadComponent,
        LightingLoadComponent,
        WelderLoadComponent,
        UPSLoadComponent,
        GasPipingComponent,
        ExhaustPipingComponent,
        MotorLoadComponent,
        TransientAnalysisComponent,
        HarmonicAnalysisComponent
    ],
    providers: [
    ]
})

export class ProjectModule {

}