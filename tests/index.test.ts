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
    const { result, waitForNextUpdate } = renderHook(() =>
        useSideEffectReducer<State, Action>(
            () => ({ counter: 0 }),
            (state, action) => {
                switch (action.tag) {
                    case 'Ignore':
                        return noUpdate
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
                        return sideEffect(async dispatch => {
                            await new Promise(resolve =>
                                setTimeout(resolve, 60 * 60 * 1000)
                            )
                            dispatch({ tag: 'AsyncDone' })
                        })
                    case 'AsyncDone':
                        return update({ counter: state.counter + 10 })
                }
            }
        )
    )
    return { result, waitForNextUpdate }
}


test('no update', () => {
    const { result } = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'Ignore' })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(0)
    expect(printMock).toHaveBeenCalledTimes(0)
})


test('update', () => {
    const { result } = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'Increment' })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(1)
    expect(printMock).toHaveBeenCalledTimes(0)
})


test('side effect', () => {
    const { result } = renderReducer()

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
    const { result } = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'DecrementAndPrintCount' })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(-1)
    expect(printMock).toHaveBeenCalledTimes(1)
    expect(printMock).toHaveBeenCalledWith('-1')
})


test('async side effect that dispatches', async () => {
    const { result, waitForNextUpdate } = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: 'AsyncInit' })
    })

    let [ state ] = result.current
    expect(state.counter).toBe(0)
    expect(printMock).toHaveBeenCalledTimes(0)

    jest.advanceTimersByTime(60 * 60 * 1000)
    await waitForNextUpdate();

    [ state ] = result.current
    expect(state.counter).toBe(10)
    expect(printMock).toHaveBeenCalledTimes(0)
})
