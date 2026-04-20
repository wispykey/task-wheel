import { Component, input } from '@angular/core';
import { Choice } from '../model/choice';

@Component({
  selector: 'app-wheel',
  imports: [],
  templateUrl: './wheel.html',
  styleUrl: './wheel.css',
})
export class Wheel {
  choices = input.required<Choice[]>();
}
