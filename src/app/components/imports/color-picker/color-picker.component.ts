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

    defaultColors: string[] = ['#ff0000', '#8000ff', '#ff00bf', '#ffff00', '#00ff00', '#0000ff', '#fe9a2e'];

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
