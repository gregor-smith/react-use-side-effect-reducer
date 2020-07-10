import { useEffect, useReducer } from 'react';
export function useSideEffectReducer(createInitialState, reducer) {
    function innerReducer([state, sideEffects], action) {
        const result = reducer(state, action);
        switch (result.tag) {
            case 0 /* NoUpdate */:
                return [state, sideEffects];
            case 1 /* Update */:
                return [result.state, sideEffects];
            case 2 /* SideEffect */:
                return [state, [...sideEffects, result.sideEffect]];
            case 3 /* UpdateWithSideEffect */:
                return [result.state, [...sideEffects, result.sideEffect]];
        }
    }
    const [[state, sideEffects], dispatch] = useReducer(innerReducer, undefined, () => [createInitialState(), []]);
    useEffect(() => {
        for (const sideEffect of sideEffects) {
            sideEffect(dispatch, state);
        }
        sideEffects.length = 0;
    }, [sideEffects]);
    return [state, dispatch];
}
export function noUpdate() {
    return { tag: 0 /* NoUpdate */ };
}
export function update(state) {
    return {
        tag: 1 /* Update */,
        state
    };
}
export function sideEffect(sideEffect) {
    return {
        tag: 2 /* SideEffect */,
        sideEffect
    };
}
export function updateWithSideEffect(state, sideEffect) {
    return {
        tag: 3 /* UpdateWithSideEffect */,
        state,
        sideEffect
    };
}
//# sourceMappingURL=index.js.map