import { Component, OnInit , ViewChild} from '@angular/core';
import { solutionService } from '../Services/solution.services';
import { CommonService } from '../Services/common.service';
import {
    ProjectSolutionPickListDto, BaseSolutionSetupDto, ProjectSolutionSetup,
    VoltageNominalList, VoltageSpecificList, FuelTankList, DesiredRunTimeList,
    VoltageDipList, FrequencyDipList, FrequencyList, RegulatoryFilterList, SelectedRegulatoryFilterList
} from '../_models/solutionSetup.model';
import { Router, ActivatedRoute, NavigationCancel, Params } from '@angular/router';
import { SolutionSetupDetailComponent } from '../solutionSetupDetail/solutioSetupDetail.component';
import { storeagesevice } from '../Services/storeage.service';


@Component({
    selector: 'userdefaultsolutionsetup',
    providers: [solutionService, CommonService],
    templateUrl: './userDefaultSolutionSetup.component.html',
    styleUrls: ['./userDefaultSolutionSetup.component.css']
})
export class UserDefaultSolutionSetupComponent implements OnInit {
    @ViewChild('solutionSetupDetailComponent') solutionSetupDetailComponent: SolutionSetupDetailComponent;
    public solutionSetupDto: BaseSolutionSetupDto;
    public solutionSetupDtoDefault: any;
    private GlobalDefaultSoltuionSetupObj: any;
    public loading: boolean = false;
    public showWelcomeMessage: boolean = false;

    ProjectSolutionSetupValues = new ProjectSolutionSetup();

    constructor(private _solutionService: solutionService, protected _route: Router, private activatedRoute: ActivatedRoute,
        private _commonService: CommonService, private _storageService: storeagesevice) {
    }

    ngOnInit() {
        this.GetUserDefaultSolutionSetup();
    }

    private GetUserDefaultSolutionSetup(): void {
        this.loading = true;
        var userDefaultSetup = this._solutionService.userDefaultExist;
        if (userDefaultSetup == 0) {
            this.showWelcomeMessage = true;
            this._solutionService.GetUserDefaultsForNewUser().subscribe((GlobalSolutionSetupDto) => {
                this.solutionSetupDto = GlobalSolutionSetupDto as BaseSolutionSetupDto;
                this.solutionSetupDto.IsGlobalDefaults = true;
                this.solutionSetupDto.IsUserDefaults = true;
            });

            this.loading = false;
        }
        else {
            this.showWelcomeMessage = false;
            this._solutionService.RestoreUserDefaults().subscribe((UserDefaultSolutionSetup) => {
                this.solutionSetupDto = UserDefaultSolutionSetup as BaseSolutionSetupDto;
                this.solutionSetupDto.IsUserDefaults = true;
            });

            this.loading = false;
        }
    }

    CancelUserDefaultSolutionSetup(): void {
        this._route.navigate(['/home']);
    }

    RestoreGlobalDefaults(): void {
        this.loading = true;
        this._solutionService.GetGlobalDefaults().subscribe((GlobalSolutionSetupDto) => {
            this.solutionSetupDto = GlobalSolutionSetupDto as BaseSolutionSetupDto;
            this.solutionSetupDto.IsGlobalDefaults = true;
            this.solutionSetupDetailComponent.invalidForm = false;
            this.solutionSetupDetailComponent.MapPickListData(this.solutionSetupDto);
            this.loading = false;
        });
    }

    //Save Solution Setup Values
    SaveUserDefaultSolutionSetup(isValid: boolean): void {
        if (!this.solutionSetupDetailComponent.form.valid) {
            this.solutionSetupDetailComponent.invalidForm = true;
            return;
        }
        this.loading = true;
        this._solutionService.SaveUserDefaultSolutionSetup(this.solutionSetupDto.SolutionSetupMappingValuesDto).subscribe((addedSolution) => {
            if (addedSolution.ErrorCode != undefined) {
                //this.showadderror = true;
            }
            else {
                this._storageService.save(this._solutionService.userDefaultSetup, "1");
                this._solutionService.userDefaultExist = this._storageService.get(this._solutionService.userDefaultSetup);
                this._route.navigate(['/home']);
            }

            this.loading = false;
        });
    }
}