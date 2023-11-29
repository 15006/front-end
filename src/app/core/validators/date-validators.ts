import { ValidatorFn } from "@angular/forms";

export class DateValidators {
    static minimumDate(minDateCallback:() => string): ValidatorFn {
        return (control) => {

            let val = String(control?.value);
            let minDateString = minDateCallback();
            if (typeof (minDateString) !== 'string') return null;

            let date = Date.parse(val);
            let min = Date.parse(minDateString);

            // console.group('date validation');
            // console.log('val = ', val);
            // console.log('date = ', date);
            // console.log('min date = ', minDateString);
            // console.log('min = ', min);
            // console.groupEnd();

            if (date >= min) return null;
            //if (date >= min) return null;
            return {
                'minimumDate': {
                    minimum: minDateString,
                    actual: control.value
                }
            }
        }
    }
}

