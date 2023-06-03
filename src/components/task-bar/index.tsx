import { FC } from 'react';
import { useWindowManager } from '../window-manager';
import * as classNames from './style.module.scss';

export const TaskBar: FC = () => {
    const wm = useWindowManager();

    return <div className={classNames['task-bar']}>
        <button onClick={() => wm.open({
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
    </div>;
};
