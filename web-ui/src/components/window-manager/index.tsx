import { FC, PropsWithChildren, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Window, WindowProps } from '../window';
import { useWindowManagerDispatch, useWindowManagerState } from './data/hook';
import { WindowState } from './data/state';
import * as classNames from './style.module.scss';

export { WindowManagerContext, useWindowManager, useWindowManagerState } from './data/hook';

export const WindowManager: FC<PropsWithChildren> = ({
    children,
}) => {
    const { windows } = useWindowManagerState();
    const [moving, setMoving] = useState(false);

    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (!Object.prototype.hasOwnProperty.call(e.data, 'type') || e.data.type !== 'HOMEPIE_SDK_MESSAGE')
                return;

            console.log("message received:", e);
        };

        window.addEventListener('message', handler);

        return () => {
            window.removeEventListener('message', handler);
        };
    }, []);

    const windowNodes = useMemo(() => {
        const sortedByHandle = Object.entries(windows)
            .map(([handle, state], i, arr) => ({ handle, state, zIndex: i }))
            .sort((a, b) => a.handle > b.handle ? 1 : -1);

        const focusedHandle = Object.entries(windows)
            .findLast(([handle, state]) => !state.minimized)?.[0];

        return sortedByHandle.map(({ handle, state, zIndex }) => <ManagedWindow
            key={handle}
            zIndex={zIndex}
            focused={handle === focusedHandle}
            handle={handle}
            state={state}
            onMovingChange={setMoving}
        />);
    }, [windows, setMoving]);

    // TODO: show snap handles when `moving`.

    return <div className={classNames['window-manager']}>
        {children}
        {windowNodes}
    </div>;
};

interface ManagedWindowProps {
    zIndex: number
    focused?: boolean
    handle: string
    state: WindowState
    onMovingChange?(moving: boolean): void
}

const ManagedWindow: FC<ManagedWindowProps> = memo(({
    zIndex,
    focused,
    handle,
    state,
    onMovingChange,
}) => {
    const dispatch = useWindowManagerDispatch();

    const update = useCallback<Exclude<WindowProps['onChange'], undefined>>(update => {
        dispatch({
            type: 'UPDATE',
            handle,
            update,
            bringToTop: true,
        });
    }, [handle, dispatch]);

    const close = useCallback<Exclude<WindowProps['onClose'], undefined>>(() => {
        dispatch({
            type: 'CLOSE',
            handle,
        });
    }, [handle, dispatch]);

    return <div
        className={classNames['window-container'] + (state.minimized ? (' ' + classNames['window-container-minimized']) : '')}
        style={{
            zIndex,
        }}
    >
        <Window
            focused={focused}
            maximized={state.maximized}
            title={state.title}
            x={state.maximized ? 0 : state.x}
            y={state.maximized ? 0 : state.y}
            width={state.maximized ? '100%' : state.width}
            height={state.maximized ? '100%' : state.height}
            children={state.content}
            onChange={update}
            onMovingChange={onMovingChange}
            onClose={close}
        />
    </div>;
});
