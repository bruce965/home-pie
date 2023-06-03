import { Dispatch, FC, PropsWithChildren, ReactNode, createContext, useContext, useMemo, useReducer, useRef } from 'react';
import { WindowManagerAction, initialState, reducer } from './reducer';
import { WindowManagerState } from './state';

interface WindowOptions {
    title?: string
    content?: ReactNode
}

interface WindowHandle {
    bringToTop(): void
    close(): void
}

interface WindowManagerContext {
    open(options?: WindowOptions): WindowHandle
}

const stateContext = createContext<WindowManagerState | undefined>(undefined);
const dispatchContext = createContext<Dispatch<WindowManagerAction> | undefined>(undefined);
const wmContext = createContext<WindowManagerContext | undefined>(undefined);

export const WindowManagerContext: FC<PropsWithChildren> = props => {
    const lastHandle = useRef(0);
    const [state, dispatch] = useReducer(reducer, initialState);

    const wm = useMemo<WindowManagerContext>(() => ({
        open(options) {
            const handleNumeric = ++lastHandle.current;
            const handle = `w_${handleNumeric}`;

            dispatch({
                type: 'OPEN',
                handle,
                initialState: {
                    title: options?.title ?? "",
                    x: 30 + handleNumeric % 10 * 30,
                    y: 30 + handleNumeric % 10 * 30,
                    width: 300,
                    height: 200,
                    content: options?.content,
                }
            });

            return {
                bringToTop() {
                    dispatch({ type: 'UPDATE', handle, bringToTop: true });
                },
                close() {
                    dispatch({ type: 'CLOSE', handle });
                },
            };
        },
    }), [dispatch]);

    return <wmContext.Provider value={wm}>
        <stateContext.Provider value={state}>
            <dispatchContext.Provider value={dispatch}>
                {props.children}
            </dispatchContext.Provider>
        </stateContext.Provider>
    </wmContext.Provider>;
};

export const useWindowManager = () => {
    const wm = useContext(wmContext);
    if (!wm)
        throw new Error("Window manager not available.");

    return wm;
};

export const useWindowManagerState = () => {
    const state = useContext(stateContext);
    if (!state)
        throw new Error("Window manager not available.");

    return state;
};

export const useWindowManagerDispatch = () => {
    const dispatch = useContext(dispatchContext);
    if (!dispatch)
        throw new Error("Window manager not available.");

    return dispatch;
};
