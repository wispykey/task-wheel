import { Component, computed, effect, ElementRef, input, viewChild } from '@angular/core';
import { Choice } from '../model/choice';

@Component({
  selector: 'app-wheel',
  imports: [],
  templateUrl: './wheel.html',
  styleUrl: './wheel.css',
})
export class Wheel {
  choices = input.required<Choice[]>();

  totalWeight = computed(() => {
    return this.choices().reduce((acc, choice) => acc += choice.weight, 0);
  })

  wheel = viewChild<ElementRef<HTMLCanvasElement>>("wheel");

  center = {
    x: 250,
    y: 250
  }

  radius = 200;

  colors = ['red', 'orange', 'yellow', 'green', 'lightblue', 'purple'];

  computeArcs(): WheelSlice[] {
    let slices: WheelSlice[] = [];

    let currAngle = 0;

    this.choices().map((choice) => {
      let proportion = choice.weight / this.totalWeight();
      let angleLength = 2 * Math.PI * proportion;

      slices.push({
        startAngle: currAngle,
        endAngle: currAngle + angleLength
      });

      currAngle += angleLength;
    })




    return slices;

  }

  drawWheel() {

    console.log(this.wheel());
    const ctx = this.wheel()!.nativeElement.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, 500, 500);

    let slices: WheelSlice[] = this.computeArcs();

    console.log("slices", slices);

    slices.map((slice, i) => {
      ctx.fillStyle = this.colors[i % this.colors.length];

      ctx.beginPath();
      ctx.moveTo(this.center.x, this.center.y);
      ctx.arc(this.center.x, this.center.y, this.radius, slice.startAngle, slice.endAngle);
      ctx.closePath();

      ctx.fill();
    });



  }

  constructor() {
    effect(() => {
      this.drawWheel();
    });
  }
}

type WheelSlice = {
  startAngle: number,
  endAngle: number
}
