import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Choice, ChoiceControls } from '../model/choice';

@Component({
  selector: 'app-choice-row',
  imports: [ReactiveFormsModule],
  templateUrl: './choice-row.html',
  styleUrl: './choice-row.css',
})
export class ChoiceRow {
  choiceControls = input.required<ChoiceControls>();

  remove = output();

  signalForRemoval() {
    this.remove.emit();
  }
}
