import { Dispatch } from 'react';
export { Dispatch } from 'react';
export declare type SideEffect<TState, TAction> = (dispatch: Dispatch<TAction>, state: TState) => void;
export declare const enum Tag {
    NoUpdate = 0,
    Update = 1,
    SideEffect = 2,
    UpdateWithSideEffect = 3
}
export declare type Update<TState, TAction> = {
    tag: Tag.NoUpdate;
} | {
    tag: Tag.Update;
    state: TState;
} | {
    tag: Tag.SideEffect;
    sideEffect: SideEffect<TState, TAction>;
} | {
    tag: Tag.UpdateWithSideEffect;
    state: TState;
    sideEffect: SideEffect<TState, TAction>;
};
export declare type SideEffectReducer<TState, TAction> = (state: TState, action: TAction) => Update<TState, TAction>;
export declare function useSideEffectReducer<TState, TAction>(createInitialState: () => TState, reducer: SideEffectReducer<TState, TAction>): [TState, Dispatch<TAction>];
export declare function noUpdate<TState, TAction>(): Update<TState, TAction>;
export declare function update<TState, TAction>(state: TState): Update<TState, TAction>;
export declare function sideEffect<TState, TAction>(sideEffect: SideEffect<TState, TAction>): Update<TState, TAction>;
export declare function updateWithSideEffect<TState, TAction>(state: TState, sideEffect: SideEffect<TState, TAction>): Update<TState, TAction>;
