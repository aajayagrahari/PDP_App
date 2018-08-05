import { Injectable, Output, EventEmitter } from '@angular/core'

@Injectable()

export class storeagesevice{

    @Output() getLoggedIndetail: EventEmitter<any> = new EventEmitter();

    constructor() {
        
    }

    public save(name: string, data: string) {
        localStorage.setItem(name, data);
    }

    public remove(name: string) {
        localStorage.removeItem(name);
    }

    public get(name: string): any {
        var data =  localStorage.getItem(name);
        if (!data) {
            return undefined;
        }
        return data;
    }

    public setUserDetail(name: string, data: string) {
        localStorage.setItem(name, data);
        this.getLoggedIndetail.emit();
    }

    public removeUserDetail(name: string) {
        localStorage.removeItem(name);
        this.getLoggedIndetail.emit();
    }
}