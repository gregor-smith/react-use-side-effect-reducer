"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWithSideEffect = exports.sideEffect = exports.update = exports.noUpdate = exports.useSideEffectReducer = void 0;
var tslib_1 = require("tslib");
var react_1 = require("react");
function useSideEffectReducer(createInitialState, reducer) {
    function innerReducer(_a, action) {
        var _b = tslib_1.__read(_a, 2), state = _b[0], sideEffects = _b[1];
        var result = reducer(state, action);
        switch (result.tag) {
            case 'NoUpdate':
                return [state, sideEffects];
            case 'Update':
                return [result.state, sideEffects];
            case 'SideEffect':
                return [state, tslib_1.__spread(sideEffects, [result.sideEffect])];
            case 'UpdateWithSideEffect':
                return [result.state, tslib_1.__spread(sideEffects, [result.sideEffect])];
        }
    }
    var _a = tslib_1.__read(react_1.useReducer(innerReducer, undefined, function () { return [createInitialState(), []]; }), 2), _b = tslib_1.__read(_a[0], 2), state = _b[0], sideEffects = _b[1], dispatch = _a[1];
    react_1.useEffect(function () {
        var e_1, _a;
        try {
            for (var sideEffects_1 = tslib_1.__values(sideEffects), sideEffects_1_1 = sideEffects_1.next(); !sideEffects_1_1.done; sideEffects_1_1 = sideEffects_1.next()) {
                var sideEffect_1 = sideEffects_1_1.value;
                sideEffect_1(dispatch, state);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (sideEffects_1_1 && !sideEffects_1_1.done && (_a = sideEffects_1.return)) _a.call(sideEffects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        sideEffects.length = 0;
    }, [sideEffects]);
    return [state, dispatch];
}
exports.useSideEffectReducer = useSideEffectReducer;
exports.noUpdate = { tag: 'NoUpdate' };
function update(state) {
    return {
        tag: 'Update',
        state: state
    };
}
exports.update = update;
function sideEffect(sideEffect) {
    return {
        tag: 'SideEffect',
        sideEffect: sideEffect
    };
}
exports.sideEffect = sideEffect;
function updateWithSideEffect(state, sideEffect) {
    return {
        tag: 'UpdateWithSideEffect',
        state: state,
        sideEffect: sideEffect
    };
}
exports.updateWithSideEffect = updateWithSideEffect;
//# sourceMappingURL=index.js.map