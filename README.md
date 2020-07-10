# react-use-side-effect-reducer

A `useReducer`-like hook for React that can handle separate side effects. A simple alternative to Redux and its thunks and sagas and god knows what. Based on the reducer seen in [Reason React's now deprecated Record API](https://reasonml.github.io/reason-react/docs/en/state-actions-reducer#state-update-through-reducer).


## Realistic example usage
<details>
<summary>Expand</summary>

```typescript
import React from 'react'
import {
    useSideEffectReducer,
    update,
    sideEffect,
    updateWithSideEffect,
    noUpdate,
    Update,
} from 'react-use-side-effect-reducer'

import api from './api'


type RequestState<TOk, TError> =
    | { tag: 'Waiting' }
    | { tag: 'InProgress' }
    | { tag: 'Done', data: TOk }
    | { tag: 'Error', error: TError }


type State = {
    searchQuery: string
    searchRequest: RequestState<string[], unknown>
}


type Action =
    | { tag: 'UpdateSearchQuery', query: string }
    | { tag: 'SendSearchRequest' }
    | { tag: 'SearchRequestDone', results: string[] }
    | { tag: 'SearchRequestError', error: unknown }
    | { tag: 'LogMessage', message: string }
    | { tag: 'NotYetImplemented' }


function createInitialState(): State {
    return {
        searchQuery: '',
        searchRequest: { tag: 'Waiting' }
    }
}


function reducer(state: State, action: Action): Update<State, Action> {
    switch (action.tag) {
        case 'UpdateSearchQuery':
            return update({
                ...state,
                searchQuery: action.query
            })
        case 'SendSearchRequest':
            // side effects are always executed after the update
            return updateWithSideEffect(
                {
                    ...state,
                    searchRequest: { tag: 'InProgress' }
                },
                // they can be async or sync, doesn't matter
                async (dispatch, state) => {
                    const response = await api.search(state.searchQuery)
                    if (response.ok) {
                        dispatch({
                            tag: 'SearchRequestDone',
                            results: response.results
                        })
                    }
                    else {
                        dispatch({
                            tag: 'SearchRequestError',
                            error: response.error
                        })
                    }
                }
            )
        case 'SearchRequestDone':
            return update({
                ...state,
                searchRequest: {
                    tag: 'Done',
                    data: action.results
                }
            })
        case 'SearchRequestError':
            return update([
                ...state,
                searchRequest: {
                    tag: 'Error',
                    error: action.error
                }
            ])
        case 'LogMessage':
            return sideEffect(() => console.log(action.message))
        case 'NotYetImplemented':
            return noUpdate()
    }
}


function App() {
    const [ state, dispatch ] = useSideEffectReducer(
        createInitialState,
        reducer
    )

    // pass relevant state and the dispatch function to children
    ...
}
```
</details>

## Installation
There's no NPM package for now, so you have to install directly from this repository:

```
yarn add https://github.com/gregor-smith/react-use-side-effect-reducer.git
```

Two versions are included in `/dist`: ES5 using `tslib` and CommonJS modules (the default), and ES2015 using ES2015 modules.
