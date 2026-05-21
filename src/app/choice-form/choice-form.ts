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
  private defaultColor = '#af91ed';
  private localStorageKey = 'choices';

  fb = new FormBuilder();
  form = this.fb.group<ChoiceFormModel>({
    newChoice: this.fb.control<string>("", { nonNullable: true }),
    choiceControls: this.initChoiceControls(),
  });


  get choiceControls() {
    return this.form.controls.choiceControls;
  }

  initChoiceControls() {
    const savedChoices = localStorage.getItem(this.localStorageKey);
    let controls = this.fb.array<ChoiceControls>([]);

    if (savedChoices) {
      try {
        const choicesToLoad = JSON.parse(savedChoices) as Choice[];
        choicesToLoad.map((choice) => {
          controls.push(
            this.fb.group<{ label: FormControl<string>, weight: FormControl<number>, color: FormControl<string> }>({
              label: this.fb.control<string>(choice.label ?? "Choice", { nonNullable: true }),
              weight: this.fb.control<number>(choice.weight ?? 1, { nonNullable: true }),
              color: this.fb.control<string>(choice.color ?? this.defaultColor, { nonNullable: true })
            })
          );
          this.update.emit(choicesToLoad);
        })
        return controls;
      } catch (e) {
        console.log(e);
      }
    }

    return controls;
  }

  saveToLocalStorage(choices: Choice[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(choices));
  }

  removeChoice(choiceIndex: number) {
    this.choiceControls.removeAt(choiceIndex);
  }

  addChoice() {
    let newChoiceLabel: string = this.form.controls.newChoice.value;

    if (!newChoiceLabel || newChoiceLabel === "") return;

    this.addChoiceFormControlGroup(newChoiceLabel);

    this.form.controls.newChoice.patchValue("", { emitEvent: false });
  }

  addChoiceFormControlGroup(label?: string, weight?: number, color?: string) {
    this.choiceControls.push(
      this.fb.group<{ label: FormControl<string>, weight: FormControl<number>, color: FormControl<string> }>({
        label: this.fb.control<string>(label ?? "Choice", { nonNullable: true }),
        weight: this.fb.control<number>(weight ?? 1, { nonNullable: true }),
        color: this.fb.control<string>(color ?? this.defaultColor, { nonNullable: true })
      })
    );

  }

  ngOnInit() {
    this.form.valueChanges.subscribe((values) => {
      let updatedChoices: Choice[] = values.choiceControls!.map((choice) => {
        if (choice.label === undefined || choice.weight === undefined) return { label: "", weight: 1, color: this.defaultColor };

        return { label: choice.label, weight: choice.weight, color: choice.color ?? this.defaultColor };
      });
      this.update.emit(updatedChoices);
      this.saveToLocalStorage(updatedChoices);
    });
  }
}
