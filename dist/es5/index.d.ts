import { Dispatch } from 'react';
export { Dispatch } from 'react';
export declare type SideEffect<TState, TAction> = (dispatch: Dispatch<TAction>, state: TState) => void | Promise<void>;
export declare type NoUpdate = {
    tag: 'NoUpdate';
};
export declare type RegularUpdate<TState> = {
    tag: 'Update';
    state: TState;
};
export declare type SideEffectUpdate<TState, TAction> = {
    tag: 'SideEffect';
    sideEffect: SideEffect<TState, TAction>;
};
export declare type UpdateWithSideEffect<TState, TAction> = {
    tag: 'UpdateWithSideEffect';
    state: TState;
    sideEffect: SideEffect<TState, TAction>;
};
export declare type Update<TState, TAction> = NoUpdate | RegularUpdate<TState> | SideEffectUpdate<TState, TAction> | UpdateWithSideEffect<TState, TAction>;
export declare type SideEffectReducer<TState, TAction> = (state: TState, action: TAction) => Update<TState, TAction>;
export declare function useSideEffectReducer<TState, TAction>(createInitialState: () => TState, reducer: SideEffectReducer<TState, TAction>): [TState, Dispatch<TAction>];
export declare const noUpdate: NoUpdate;
export declare function update<TState>(state: TState): RegularUpdate<TState>;
export declare function sideEffect<TState, TAction>(sideEffect: SideEffect<TState, TAction>): SideEffectUpdate<TState, TAction>;
export declare function updateWithSideEffect<TState, TAction>(state: TState, sideEffect: SideEffect<TState, TAction>): UpdateWithSideEffect<TState, TAction>;
