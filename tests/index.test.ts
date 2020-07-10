import { renderHook, act } from '@testing-library/react-hooks'

import {
    useSideEffectReducer,
    noUpdate,
    update,
    sideEffect,
    updateWithSideEffect,
} from '../src/index'


jest.useFakeTimers()
beforeEach(jest.clearAllMocks)

const printMock = jest.fn<void, string[]>()


type State = { counter: number }

type Action =
    | { tag: 'Ignore' }
    | { tag: 'Increment' }
    | { tag: 'Print', message: string }
    | { tag: 'DecrementAndPrintCount' }
    | { tag: 'AsyncInit' }
    | { tag: 'AsyncDone' }


function renderReducer() {
    const { result } = renderHook(() =>
        useSideEffectReducer<State, Action>(
            () => ({ counter: 0 }),
            (state, action) => {
                switch (action.tag) {
                    case 'Ignore':
                        return noUpdate()
                    case 'Increment':
                        return update({ counter: state.counter + 1 })
                    case 'Print':
                        return sideEffect(() => printMock(action.message))
                    case 'DecrementAndPrintCount':
                        return updateWithSideEffect(
                            { counter: state.counter - 1 },
                            (_dispatch, state) => printMock(String(state.counter))
                        )
                    case 'AsyncInit':
                        return sideEffect(dispatch => {
                            setTimeout(
                                () => dispatch({ tag: 'AsyncDone' }),
                                60 * 60 * 1000
                            )
                        })
                    case 'AsyncDone':
                        return update({ counter: state.counter + 10 })
                }
            }
        )
    )
    return result
}


test('no update', () => {
    const result = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'Ignore' })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(0)
    expect(printMock).toHaveBeenCalledTimes(0)
})


test('update', () => {
    const result = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'Increment' })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(1)
    expect(printMock).toHaveBeenCalledTimes(0)
})


test('side effect', () => {
    const result = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'Print', message: 'hello' })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(0)
    expect(printMock).toHaveBeenCalledTimes(1)
    expect(printMock).toHaveBeenCalledWith('hello')
})


test('update with side effect', () => {
    const result = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'DecrementAndPrintCount' })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(-1)
    expect(printMock).toHaveBeenCalledTimes(1)
    expect(printMock).toHaveBeenCalledWith('-1')
})


test('side effect that dispatches', () => {
    const result = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'AsyncInit' })
    })

    let [ state ] = result.current
    expect(state.counter).toBe(0)
    expect(printMock).toHaveBeenCalledTimes(0)

    act(() => {
        jest.advanceTimersByTime(60 * 60 * 1000)
    });

    [ state ] = result.current
    expect(state.counter).toBe(10)
    expect(printMock).toHaveBeenCalledTimes(0)
})
