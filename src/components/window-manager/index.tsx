import { FC, PropsWithChildren, memo, useCallback, useMemo, useState } from 'react';
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

    const windowNodes = useMemo(() => {
        const sortedWindows = Object.entries(windows)
            .map(([handle, state], i, arr) => ({ handle, state, focused: i === (arr.length - 1), zIndex: i }))
            .sort((a, b) => a.handle > b.handle ? 1 : -1);

        return sortedWindows.map(({ handle, state, focused, zIndex }) => <ManagedWindow
            key={handle}
            zIndex={zIndex}
            focused={focused}
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
        className={classNames['window-container']}
        style={{
            zIndex,
        }}
    >
        <Window
            focused={focused}
            title={state.title}
            x={state.x}
            y={state.y}
            width={state.width}
            height={state.height}
            children={state.content}
            onChange={update}
            onMovingChange={onMovingChange}
            onClose={close}
        />
    </div>;
});
