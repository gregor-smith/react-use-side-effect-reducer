import { useEffect, useReducer, Dispatch } from 'react'


export type SideEffect<TState, TAction> = (
    dispatch: Dispatch<TAction>,
    state: TState
) => void


export const enum Tag {
    NoUpdate,
    Update,
    SideEffect,
    UpdateWithSideEffect
}


export type Update<TState, TAction> =
    | { tag: Tag.NoUpdate }
    | { tag: Tag.Update, state: TState }
    | {
        tag: Tag.SideEffect,
        sideEffect: SideEffect<TState, TAction>
    }
    | {
        tag: Tag.UpdateWithSideEffect
        state: TState
        sideEffect: SideEffect<TState, TAction>
    }


export type SideEffectReducer<TState, TAction> = (
    state: TState,
    action: TAction
) => Update<TState, TAction>


type SideEffectArray<TState, TAction> = SideEffect<TState, TAction>[]
type StateTuple<TState, TAction> = [ TState, SideEffectArray<TState, TAction> ]


export function useSideEffectReducer<TState, TAction>(
    createInitialState: () => TState,
    reducer: SideEffectReducer<TState, TAction>
): [ TState, Dispatch<TAction> ] {
    function innerReducer(
        [ state, sideEffects ]: StateTuple<TState, TAction>,
        action: TAction
    ): StateTuple<TState, TAction> {
        const result = reducer(state, action)
        switch (result.tag) {
            case Tag.NoUpdate:
                return [ state, sideEffects ]
            case Tag.Update:
                return [ result.state, sideEffects ]
            case Tag.SideEffect:
                return [ state, [ ...sideEffects, result.sideEffect ] ]
            case Tag.UpdateWithSideEffect:
                return [ result.state, [ ...sideEffects, result.sideEffect ] ]
        }
    }

    const [ [ state, sideEffects ], dispatch ] = useReducer(
        innerReducer,
        undefined,
        (): StateTuple<TState, TAction> => [ createInitialState(), [] ]
    )

    useEffect(
        () => {
            for (const sideEffect of sideEffects) {
                sideEffect(dispatch, state)
            }
            sideEffects.length = 0
        },
        [ sideEffects ]
    )

    return [ state, dispatch ]
}


export function noUpdate<TState, TAction>(): Update<TState, TAction> {
    return { tag: Tag.NoUpdate }
}


export function update<TState, TAction>(state: TState): Update<TState, TAction> {
    return {
        tag: Tag.Update,
        state
    }
}


export function sideEffect<TState, TAction>(
    sideEffect: SideEffect<TState, TAction>
): Update<TState, TAction> {
    return {
        tag: Tag.SideEffect,
        sideEffect
    }
}


export function updateWithSideEffect<TState, TAction>(
    state: TState,
    sideEffect: SideEffect<TState, TAction>
): Update<TState, TAction> {
    return {
        tag: Tag.UpdateWithSideEffect,
        state,
        sideEffect
    }
}
