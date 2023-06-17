import { Reducer } from 'react';
import { WindowManagerState, WindowState } from './state';

export type WindowManagerAction =
    | { type: 'OPEN', handle: string | number, initialState: WindowState }
    | { type: 'CLOSE', handle: string | number }
    | { type: 'UPDATE', handle: string | number, update?: Partial<WindowState>, bringToTop?: true };

export const initialState: WindowManagerState = {
    windows: {},
};

export const reducer: Reducer<WindowManagerState, WindowManagerAction> = (state, action) => {
    switch (action.type) {
        case 'OPEN': {
            if (Object.prototype.hasOwnProperty.call(state.windows, action.handle) && process.env.NODE_ENV !== 'production')
                console.warn(`Opening a new window with the same handle, original window will be replaced: ${action}`);

            return {
                ...state,
                windows: {
                    ...state.windows,
                    [action.handle]: action.initialState,
                },
            };
        }

        case 'CLOSE': {
            const { [action.handle]: closed, ...others } = state.windows;

            if (!closed && process.env.NODE_ENV !== 'production')
                console.warn(`Trying to close a nonexistent window: ${action}`);

            return {
                ...state,
                windows: others,
            };
        }

        case 'UPDATE': {
            if (!Object.prototype.hasOwnProperty.call(state.windows, action.handle)) {
                if (process.env.NODE_ENV !== 'production')
                    console.warn(`Trying to update a nonexistent window: ${action}`);

                return state;
            }

            let windows = state.windows;
            if (action.bringToTop) {
                const { [action.handle]: target, ...others } = windows;
                windows = {
                    ...others,
                    [action.handle]: target!,
                };
            }

            return {
                ...state,
                windows: {
                    ...windows,
                    [action.handle]: {
                        ...windows[action.handle],
                        ...action.update,
                    },
                },
            };
        }

        default: {
            if (process.env.NODE_ENV !== 'production')
                console.warn(`Invalid action dispatched to the window manager: ${action}`);

            return state;
        }
    }
};
