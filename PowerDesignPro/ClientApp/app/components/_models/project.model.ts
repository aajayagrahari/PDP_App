
export class ProjectDetails {
    ProjectName: string;
    ContactName: string;
    ContactEmail: string;
    CreatedBy: string;
    Company: string;
    Phone: string;
    UserName: string;
    CreatedDateTime: string;
    ModifiedDateTime: string;
    ID: number;
    ProjectID: number;
    IsReadOnlyAccess: boolean;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}


export class Solutionlist {
    ProjectID: number;
    SolutionID: number;
    SolutionName: string;
    Description: string;
    SpecRefNumber: string;
    ModifiedDateTime: string;
    CreatedDateTime: string;
    
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
 

