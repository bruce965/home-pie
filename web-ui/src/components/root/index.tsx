import { FC } from 'react';
import { TaskBar } from '../task-bar';
import { Wallpaper } from '../wallpaper';
import { WindowManager, WindowManagerContext } from '../window-manager';
import * as classNames from './style.module.scss';
import { LoginScreen } from '../login-screen';

export const Root: FC = () => {
    return <div className={classNames['root']}>
        <WindowManagerContext>
            <WindowManager>
                <Wallpaper />
                <LoginScreen />
            </WindowManager>
            <TaskBar />
        </WindowManagerContext>
    </div>;
};
