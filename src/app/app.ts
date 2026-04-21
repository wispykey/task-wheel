import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChoiceForm } from "./choice-form/choice-form";
import { Wheel } from "./wheel/wheel";
import { Choice } from './model/choice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChoiceForm, Wheel],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('task-wheel');

  choices: Choice[] = [];


  updateChoices(newChoices: Choice[]) {
    this.choices = newChoices;
  }

  reportPickedChoice(choiceIndex: number) {
    alert(`You picked ${this.choices[choiceIndex].label}!`);
  }

}
