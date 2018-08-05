import { Routes } from '@angular/router';
import { ProjectComponent } from "../components/project/project.component";
import { SolutionSetupComponent } from "../components/solutionsetup/solutionsetup.component";
import { SolutionSummaryComponent } from "../components/solutionSummary/solutionSummary.component";
import { LoadComponent } from "../components/load/load.component";
import { authenticate } from "../components/_authenticate/authenticate";


export const projectRoutes: Routes = [
    { path: ':id', component: ProjectComponent, canActivate: [authenticate], data: { title: 'Project' } },
    { path: ':projectId/solution/:solutionId', component: SolutionSummaryComponent, canActivate: [authenticate], data: { title: 'pageTitle.SolutionSummary' } },
    { path: ':projectId/solutionsetup', component: SolutionSetupComponent, canActivate: [authenticate], data: { title: 'pageTitle.SolutionSetup' } },
    { path: ':projectId/solutionsetup/:solutionId', component: SolutionSetupComponent, canActivate: [authenticate], data: { title: 'pageTitle.SolutionSetup' } },
    { path: ':projectId/solution/:solutionId/addLoad', component: LoadComponent, canActivate: [authenticate], data: { title: 'pageTitle.AddLoad' } },
    { path: ':projectId/solution/:solutionId/load/:loadId/editLoad/:solutionLoadId', component: LoadComponent, canActivate: [authenticate], data: { title: 'pageTitle.EditLoad' } },
    { path: ':projectId/solution/:solutionId/load/:loadId/copyLoad/:copySolutionLoadId', component: LoadComponent, canActivate: [authenticate], data: { title: 'pageTitle.CopyLoad' } },
]