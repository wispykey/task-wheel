import { AfterViewInit, Component, computed, effect, ElementRef, input, OnInit, output, viewChild } from '@angular/core';
import { Choice } from '../model/choice';

@Component({
  selector: 'app-wheel',
  imports: [],
  templateUrl: './wheel.html',
  styleUrl: './wheel.css',
})
export class Wheel implements OnInit, AfterViewInit {
  size = input.required<number>();
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
  flipper = viewChild<ElementRef<HTMLCanvasElement>>("flipper");
  container = viewChild<ElementRef<HTMLDivElement>>("container");

  radius: number = 0;

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

  drawFlipper() {
    const ctx = this.flipper()!.nativeElement.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, this.size(), this.size());

    const flipperSize = this.size() * 0.01;
    const flipperLength = this.radius * 0.15;

    ctx.fillStyle = 'black';

    let flipperX = this.size() / 2 + this.radius;
    let flipperY = this.size() / 2;

    ctx.beginPath();
    ctx.moveTo(flipperX - flipperLength, flipperY);
    ctx.arc(flipperX, flipperY, flipperSize, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();

    ctx.fill();
  }

  drawWheel() {
    const ctx = this.wheel()!.nativeElement.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, this.size(), this.size());

    let slices: WheelSlice[] = this.slices();

    // Draw shadow first as a single circle underneath
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(this.size() / 2, this.size() / 2, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();


    // Draw a placeholder circle if no choices have been created yet
    if (slices.length === 0) {
      ctx.fillStyle = 'grey';

      ctx.beginPath();
      ctx.moveTo(this.size() / 2, this.size() / 2);
      ctx.arc(this.size() / 2, this.size() / 2, this.radius, 0, 2 * Math.PI);
      ctx.closePath();

      ctx.fill();
    }

    // Draw colored regions
    slices.map((slice, i) => {
      ctx.fillStyle = this.colors[i % this.colors.length];
      ctx.beginPath();
      ctx.moveTo(this.size() / 2, this.size() / 2);
      ctx.arc(this.size() / 2, this.size() / 2, this.radius, slice.startAngle, slice.endAngle);
      ctx.closePath();
      ctx.fill();
    });

    // Draw text labels
    slices.map((slice) => {
      let sliceMidAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;

      let xDir = Math.cos(sliceMidAngle);
      let yDir = Math.sin(sliceMidAngle);

      let x = this.size() / 2 + (xDir * this.radius * 0.9);
      let y = this.size() / 2 + (yDir * this.radius * 0.9);

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


    // then draw slices normally (no shadow)


    this.drawFlipper();
  }

  constructor() {
    effect(() => {
      this.drawWheel();
    });
  }

  ngOnInit() {
    // this.radius = this.size() / 2 * 0.8;
    // this.container()!.nativeElement.style.width = `${this.size()}`;
    // this.container()!.nativeElement.style.height = `${this.size()}`;
  }

  ngAfterViewInit() {
    this.radius = this.size() / 2 * 0.8;
    this.container()!.nativeElement.style.width = `${this.size()}`;
    this.container()!.nativeElement.style.height = `${this.size()}`;
    this.drawWheel();
  }
}

type WheelSlice = {
  label: string,
  startAngle: number,
  endAngle: number
}
