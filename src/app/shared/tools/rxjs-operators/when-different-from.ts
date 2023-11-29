import { Observable } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";

export function whenDifferentFrom<T>(other$: Observable<T>): (source: Observable<T>) => Observable<T> {
    return source$ => source$.pipe(
        withLatestFrom(other$), 
        filter(([source, other]) => source !== other), 
        map(([source, _]) => source)
    );
}