
declare module '*.module.scss' {
    const classNames: Record<string>;
    export = classNames;
}

declare const process: {
    env: {
        NODE_ENV: 'development' | 'production'
    }
};
