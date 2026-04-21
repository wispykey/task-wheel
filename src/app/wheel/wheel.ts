import { Component, computed, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { Choice } from '../model/choice';

@Component({
  selector: 'app-wheel',
  imports: [],
  templateUrl: './wheel.html',
  styleUrl: './wheel.css',
})
export class Wheel {
  choices = input.required<Choice[]>();
  picked = output<number>();

  currentAngle: number = 0;

  totalWeight = computed(() => {
    return this.choices().reduce((acc, choice) => acc += choice.weight, 0);
  })

  slices = computed(() => {
    let slices: WheelSlice[] = [];

    let currAngle = 0;

    this.choices().map((choice) => {
      let proportion = choice.weight / this.totalWeight();
      let angleLength = 2 * Math.PI * proportion;

      slices.push({
        label: choice.label,
        startAngle: currAngle,
        endAngle: currAngle + angleLength
      });

      currAngle += angleLength;
    })

    return slices;
  })

  wheel = viewChild<ElementRef<HTMLCanvasElement>>("wheel");

  center = {
    x: 250,
    y: 250
  }

  radius = 200;

  colors = ['red', 'orange', 'yellow', 'green', 'lightblue', 'purple'];

  get currentChoiceIndex(): number {
    if (this.slices().length === 1) return 0;
    // Assume we pick the choice whose slice covers angle 0

    // Wheel spins clockwise, which means our reference point has rotated counter-clockwise
    const angle = (-this.currentAngle % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

    return this.slices().findIndex((slice) => {
      // There can only ever be one slice that crosses zero; handles wraparound cleanly
      return slice.startAngle >= slice.endAngle || angle >= slice.startAngle && angle <= slice.endAngle;
    });
  }

  resetWheelTransition() {
    const wheel = this.wheel()!.nativeElement;
    wheel.classList.remove('spinning');

    this.picked.emit(this.currentChoiceIndex);
  }

  spinWheel() {
    // Add a few extra rotations randomly for variety
    const numFullRotations = 10 + Math.floor(Math.random() * 3);

    const fullRotationAngle = numFullRotations * (2 * Math.PI);
    const angleToNextChoice = fullRotationAngle + Math.random() * (2 * Math.PI);
    this.currentAngle += angleToNextChoice;

    const currentAngleDegrees = this.currentAngle / (2 * Math.PI) * 360;

    const wheel = this.wheel()!.nativeElement;
    wheel.classList.add('spinning');
    wheel.style.transform = `rotate(${currentAngleDegrees}deg)`;
  }

  drawWheel() {
    const ctx = this.wheel()!.nativeElement.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, 500, 500);

    let slices: WheelSlice[] = this.slices();

    // Draw a placeholder circle if no choices have been created yet
    if (slices.length === 0) {
      ctx.fillStyle = 'grey';

      ctx.beginPath();
      ctx.moveTo(this.center.x, this.center.y);
      ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
      ctx.closePath();

      ctx.fill();
    }

    // Draw colored regions
    slices.map((slice, i) => {
      ctx.fillStyle = this.colors[i % this.colors.length];
      ctx.beginPath();
      ctx.moveTo(this.center.x, this.center.y);
      ctx.arc(this.center.x, this.center.y, this.radius, slice.startAngle, slice.endAngle);
      ctx.closePath();
      ctx.fill();
    });

    // Draw text labels
    slices.map((slice) => {
      let sliceMidAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;

      let xDir = Math.cos(sliceMidAngle);
      let yDir = Math.sin(sliceMidAngle);

      let x = this.center.x + (xDir * this.radius * 0.9);
      let y = this.center.y + (yDir * this.radius * 0.9);

      // Rotate text by rotating canvas, drawing, then restoring
      ctx.save();

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '24px Arial';
      ctx.fillStyle = 'black';

      ctx.translate(x, y);
      ctx.rotate(sliceMidAngle);
      ctx.fillText(slice.label, 0, 0);

      ctx.restore();
    });
  }

  constructor() {
    effect(() => {
      this.drawWheel();
    });
  }
}

type WheelSlice = {
  label: string,
  startAngle: number,
  endAngle: number
}
