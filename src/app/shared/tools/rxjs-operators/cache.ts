import { BehaviorSubject, ConnectableObservable, Observable } from "rxjs";
import { filter, multicast, publishBehavior, refCount, share, shareReplay } from "rxjs/operators";

export function cache<T>(): (source: Observable<T>) => Observable<T> {
    return source$ => source$.pipe(shareReplay(1));
    
}