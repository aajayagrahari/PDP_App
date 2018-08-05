import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: 'modal.component.html',
    styleUrls: ['modal.component.css']
})
export class ModalComponent {

    //@Input() title: string;
    public visible = false;
    public visibleAnimate = false;

    constructor() { }

    public show(): void {
        this.visible = true;
        setTimeout(() => this.visibleAnimate = true, 100);
    }

    public hide(): void {
        this.visibleAnimate = false;
        setTimeout(() => this.visible = false, 300);
    }

}