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

  private localStorageKey = 'choices';

  choices: Choice[] = this.initChoiceControls()

  initChoiceControls() {

    const savedChoices = localStorage.getItem(this.localStorageKey);

    if (savedChoices) {
      try {
        const choicesToLoad = JSON.parse(savedChoices) as Choice[];
        return choicesToLoad.map((choice) => {
          return { label: choice.label, weight: choice.weight, color: choice.color }
        })

      } catch (e) {
        console.log(e);
      }
    }
    return [];
  }


  updateChoices(newChoices: Choice[]) {
    this.choices = newChoices;
  }

  reportPickedChoice(choiceIndex: number) {
    alert(`You picked ${this.choices[choiceIndex].label}!`);
  }

}
