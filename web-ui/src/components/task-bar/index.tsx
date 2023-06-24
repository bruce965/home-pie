import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowManager, useWindowManagerState } from '../window-manager';
import * as classNames from './style.module.scss';
import { WindowManagerState } from '../window-manager/data/state';

let globalCount = 0;

export const TaskBar: FC = () => {
    const wm = useWindowManager();

    const { windows } = useWindowManagerState();
    const { handles, focused } = useTrayBar(windows);

    return <div className={classNames['task-bar']}>
        <button onClick={() => wm.open({
            title: `Hello World ${++globalCount}`,
            content: <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt mollit
                anim id est laborum.
            </>,
        })}>Open window</button>
        <button onClick={() => wm.open({
            title: `Terminal ${++globalCount}`,
            width: 867,
            height: 385,
            content: <iframe
                style={{ display: 'block', border: 0, width: '100%', height: '100%' }}
                src='/terminal'
                onError={e => console.log("error", e)}
            />,
        })}>Open terminal</button>
        {handles.map(handle => <TrayBarItem
            key={handle}
            handle={handle}
            title={windows[handle]?.title ?? ""}
            focused={focused === handle}
        />)}
    </div>;
};

interface TrayBarItemProps {
    handle: string
    title: string
    focused: boolean
}

const TrayBarItem: FC<TrayBarItemProps> = ({
    handle,
    title,
    focused,
}) => {
    const wm = useWindowManager();

    return <button
        disabled={focused}
        onClick={() => wm.bringToTop(handle)}
    >{title}</button>;
};

const useTrayBar = (windows: WindowManagerState['windows']) => {
    const trayBar = useRef<{
        for: typeof windows
        handlesDict: { [handle: string]: 0 }
        handles: string[]
        focused: string | null
    }>();

    if (trayBar.current?.for !== windows) {
        trayBar.current ??= {
            for: windows,
            handlesDict: {},
            handles: [],
            focused: null,
        };

        trayBar.current.for = windows;
        trayBar.current.focused = null;

        let handlesChanged = false;

        // remove closed windows
        for (const handle in trayBar.current.handlesDict) {
            if (!Object.prototype.hasOwnProperty.call(windows, handle)) {
                delete trayBar.current.handlesDict[handle];
                handlesChanged = true;
            }
        }

        // add opened windows
        for (const handle in windows) {
            if (!Object.prototype.hasOwnProperty.call(trayBar.current.handlesDict, handle)) {
                trayBar.current.handlesDict[handle] = 0;
                handlesChanged = true;
            }

            // last non-minimized window is the focused one
            if (!windows[handle]?.minimized)
                trayBar.current.focused = handle;
        }

        if (handlesChanged)
            trayBar.current.handles = Object.keys(trayBar.current.handlesDict);
    }

    return {
        handles: trayBar.current.handles,
        focused: trayBar.current.focused,
    };
};
