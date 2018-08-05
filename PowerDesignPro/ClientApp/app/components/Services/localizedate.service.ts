import {Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';  
import { UtilityService } from '../Services/utility.service'; 

@Pipe({
    name: 'localizedDate',
    pure: true
}) 

export class LocalizedDatePipe implements PipeTransform {

    constructor(private utilityService: UtilityService) {
    }

    transform(value: any, pattern: string = 'short'): any {
        const datePipe: DatePipe = new DatePipe(this.utilityService.userBrowserLocale + this.utilityService.userBrowserLocaleRegion); 
        return datePipe.transform(value+" Z", pattern);
    }

}
