import { FC } from 'react';
import { TaskBar } from '../task-bar';
import { Wallpaper } from '../wallpaper';
import { WindowManager, WindowManagerContext } from '../window-manager';
import * as classNames from './style.module.scss';

export const Root: FC = () => {
    return <WindowManagerContext>
        <div className={classNames['root']}>
            <WindowManager>
                <Wallpaper />
            </WindowManager>
            <TaskBar />
        </div>
    </WindowManagerContext>;
};
