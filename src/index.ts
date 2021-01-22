import { useEffect, useReducer, Dispatch } from 'react'

export type { Dispatch } from 'react'


export type SideEffect<TState, TAction> = (
    dispatch: Dispatch<TAction>,
    state: TState
) => void | Promise<void>


export type NoUpdate = { tag: 'NoUpdate' }
export type RegularUpdate<TState> = { tag: 'Update', state: TState }
export type SideEffectUpdate<TState, TAction> = {
    tag: 'SideEffect',
    sideEffect: SideEffect<TState, TAction>
}
export type UpdateWithSideEffect<TState, TAction> = {
    tag: 'UpdateWithSideEffect'
    state: TState
    sideEffect: SideEffect<TState, TAction>
}
export type Update<TState, TAction> =
    | NoUpdate
    | RegularUpdate<TState>
    | SideEffectUpdate<TState, TAction>
    | UpdateWithSideEffect<TState, TAction>


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
            case 'NoUpdate':
                return [ state, sideEffects ]
            case 'Update':
                return [ result.state, sideEffects ]
            case 'SideEffect':
                return [ state, [ ...sideEffects, result.sideEffect ] ]
            case 'UpdateWithSideEffect':
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
            for (let index = 0; index < sideEffects.length; index++) {
                sideEffects[index]!(dispatch, state)
            }
            sideEffects.length = 0
        },
        [ sideEffects ]
    )

    return [ state, dispatch ]
}


export const noUpdate: NoUpdate = { tag: 'NoUpdate' }


export function update<TState>(state: TState): RegularUpdate<TState> {
    return {
        tag: 'Update',
        state
    }
}


export function sideEffect<TState, TAction>(
    sideEffect: SideEffect<TState, TAction>
): SideEffectUpdate<TState, TAction> {
    return {
        tag: 'SideEffect',
        sideEffect
    }
}


export function updateWithSideEffect<TState, TAction>(
    state: TState,
    sideEffect: SideEffect<TState, TAction>
): UpdateWithSideEffect<TState, TAction> {
    return {
        tag: 'UpdateWithSideEffect',
        state,
        sideEffect
    }
}


export function getSideEffect<TState, TAction>(
    update: Update<TState, TAction>
): SideEffect<TState, TAction> | null {
    switch (update.tag) {
        case 'SideEffect':
        case 'UpdateWithSideEffect':
            return update.sideEffect
        default:
            return null
    }
}
