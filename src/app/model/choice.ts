import { FormArray, FormControl, FormGroup } from "@angular/forms"

export type Choice = {
    label: string,
    weight: number,
}

export type ChoiceControls = FormGroup<{
    label: FormControl<string>;
    weight: FormControl<number>;
}>

export type ChoiceFormModel = {
    newChoice: FormControl<string>;
    choiceControls: FormArray<ChoiceControls>;
}