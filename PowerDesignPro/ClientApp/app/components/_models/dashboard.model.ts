
export class RecentProject {
    ProjectName: string;
    CreatedDateTime: string;
    ModifiedDateTime: boolean;
    ID: number;
    UserID: string

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}


export class SearchProject {
    ProjectName: string;    

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class AddedProject {
    projectName: string;
    contactName: string;
    contactEmail: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class SearchFilter {
    ID: number;
    Description: string;
    Value: string;
    LanguageKey: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class ShareProject {
    RecipientEmail: string;
    Notes: string;
    ProjectID: number;
    SelectedSolutionList = new Array<number>();
    Language: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class ProjectSolution {
    ID: number;
    Name: string;
    Description: string;
    Selected: boolean;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class ShowShareProject {
    ProjectName: string;
    CreatedDateTime: string;
    ModifiedDateTime: boolean;
    ID: number;
    UserID: string;
    SharedUser: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}


