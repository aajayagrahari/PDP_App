import { Component, Input } from '@angular/core';
import { LoadCharacteristics } from '../_models/loadCharacteristics.model';

@Component({
    selector: 'load-Characteristics',
    templateUrl: './loadCharacteristics.component.html'
})
export class LoadCharacteristicsComponent {
    @Input() LoadCharacteristicsValues: LoadCharacteristics;
}
