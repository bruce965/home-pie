import { FC, PropsWithChildren } from 'react';
import * as classNames from './style.module.scss';

export const LoginScreen: FC<PropsWithChildren> = ({
    children,
}) => {

    return <div className={classNames['login-screen']}>
        <form
            className={classNames['login-dialog']}
            onSubmit={e => {
                e.preventDefault();
                console.log(e);
            }}
        >
            <img className={classNames['profile-picture']} />
            <div className={classNames['title']}>Login</div>
            <label aria-label="Username">
                <input name='username' className={classNames['input']} />
            </label>
            <label aria-label="Password">
                <input type='password' name='password' className={classNames['input']} />
            </label>
            <button type='submit'>Login</button>
        </form>
    </div>;
};
