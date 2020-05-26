import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent {
    @Input() heading: string;
    @Input() color: string;
    @Input() players;
    @Output() event: EventEmitter<string> = new EventEmitter<string>();

    modal;

    defaultColors: string[] = ['#68c20e', '#1581da', '#4a0ec2', '#e81010', '#f1ed0d', '#f10d97', '#19d1ce', '#f2840f', '#7b4716', '#1acfa0', '#3e3e3e'];

    constructor(
        private modalService: NgbModal
    ) { }

    showColor(color: string) {
        if (this.players.findIndex(player => player.color == color) != -1) {
            return true;
        }

        return false;
    }

    changeColor(color: string): void {
        this.color = color;

        this.event.emit(this.color);

        this.modal.close();
    }

    openModal(content, size) {
        this.modal = this.modalService.open(content, { size, centered: true });
    }
}
