import { FormArray, FormControl, FormGroup } from "@angular/forms"

export type Choice = {
    label: string,
    weight: number,
    color: string
}

export type ChoiceControls = FormGroup<{
    label: FormControl<string>;
    weight: FormControl<number>;
    color: FormControl<string>;
}>

export type ChoiceFormModel = {
    newChoice: FormControl<string>;
    choiceControls: FormArray<ChoiceControls>;
}