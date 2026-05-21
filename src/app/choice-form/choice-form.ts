import { Component, OnInit, output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Choice, ChoiceControls, ChoiceFormModel } from '../model/choice';
import { ChoiceRow } from "../choice-row/choice-row";

@Component({
  selector: 'app-choice-form',
  imports: [ReactiveFormsModule, ChoiceRow],
  templateUrl: './choice-form.html',
  styleUrl: './choice-form.css',
})
export class ChoiceForm implements OnInit {
  update = output<Choice[]>();
  choices: Choice[] = [];

  private defaultColor = 'red';

  fb = new FormBuilder();
  form = this.fb.group<ChoiceFormModel>({
    newChoice: this.fb.control<string>("", { nonNullable: true }),
    choiceControls: this.fb.array<ChoiceControls>([]),
  });

  get choiceControls() {
    return this.form.controls.choiceControls;
  }

  removeChoice(choiceIndex: number) {
    this.choiceControls.removeAt(choiceIndex);
  }

  submitForm() {
    let newChoiceLabel: string = this.form.controls.newChoice.value;

    if (!newChoiceLabel || newChoiceLabel === "") return;

    this.choiceControls.push(
      this.fb.group<{ label: FormControl<string>, weight: FormControl<number>, color: FormControl<string> }>({
        label: this.fb.control<string>(newChoiceLabel, { nonNullable: true }),
        weight: this.fb.control<number>(1, { nonNullable: true }),
        color: this.fb.control<string>(this.defaultColor, { nonNullable: true })
      })
    );

    this.form.controls.newChoice.patchValue("", { emitEvent: false });
  }

  ngOnInit() {
    this.form.valueChanges.subscribe((values) => {
      let updatedChoices: Choice[] = values.choiceControls!.map((choice) => {
        if (!choice.label || !choice.weight) return { label: "", weight: 1, color: this.defaultColor };

        return { label: choice.label, weight: choice.weight, color: choice.color ?? this.defaultColor };
      });
      this.update.emit(updatedChoices);
    });

  }
}
