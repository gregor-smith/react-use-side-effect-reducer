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

const enum Tag {
    Ignore,
    Increment,
    Print,
    DecrementAndPrintCount,
    AsyncInit,
    AsyncDone
}

type Action =
    | { tag: Tag.Ignore }
    | { tag: Tag.Increment }
    | { tag: Tag.Print, message: string }
    | { tag: Tag.DecrementAndPrintCount }
    | { tag: Tag.AsyncInit }
    | { tag: Tag.AsyncDone }


function renderReducer() {
    const { result } = renderHook(() =>
        useSideEffectReducer<State, Action>(
            () => ({ counter: 0 }),
            (state, action) => {
                switch (action.tag) {
                    case Tag.Ignore:
                        return noUpdate()
                    case Tag.Increment:
                        return update({ counter: state.counter + 1 })
                    case Tag.Print:
                        return sideEffect(() => printMock(action.message))
                    case Tag.DecrementAndPrintCount:
                        return updateWithSideEffect(
                            { counter: state.counter - 1 },
                            (_dispatch, state) => printMock(String(state.counter))
                        )
                    case Tag.AsyncInit:
                        return sideEffect(dispatch => {
                            setTimeout(
                                () => dispatch({ tag: Tag.AsyncDone }),
                                60 * 60 * 1000
                            )
                        })
                    case Tag.AsyncDone:
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
        dispatch({ tag: Tag.Ignore })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(0)
    expect(printMock).toHaveBeenCalledTimes(0)
})


test('update', () => {
    const result = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: Tag.Increment })
    })

    const [ state ] = result.current
    expect(state.counter).toBe(1)
    expect(printMock).toHaveBeenCalledTimes(0)
})


test('side effect', () => {
    const result = renderReducer()

    act(() => {
        const [ , dispatch ] = result.current
        dispatch({ tag: Tag.Print, message: 'hello' })
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
        dispatch({ tag: Tag.DecrementAndPrintCount })
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
        dispatch({ tag: Tag.AsyncInit })
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
