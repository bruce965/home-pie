import { DOMAttributes, FC, PropsWithChildren, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import * as classNames from './style.module.scss';

const MIN_WIDTH = 160;
const MIN_HEIGHT = 0;

export interface WindowProps extends PropsWithChildren {
    focused?: boolean | undefined
    maximized?: boolean | undefined
    title: string
    x: number
    y: number
    width: number | string
    height: number | string
    onChange?(change: { x?: number, y?: number, width?: number, height?: number, minimized?: boolean, maximized?: boolean }): void
    onMovingChange?(moving: boolean): void
    onClose?(): void
}

export const Window: FC<WindowProps> = ({
    focused,
    maximized,
    title,
    x,
    y,
    width,
    height,
    children,
    onChange,
    onMovingChange,
    onClose,
}) => {
    const [selectionProbablyInProgress, setSelectionProbablyInProgress] = useState<boolean>();
    const [moving, setMoving] = useState<boolean>();

    const windowRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const contentMouseDown = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onMouseDown'], undefined>>(ev => {
        onChange?.({}); // bring to top

        setSelectionProbablyInProgress(true);

        const mouseUp = (ev: MouseEvent) => {
            setSelectionProbablyInProgress(false);

            window.removeEventListener('mouseup', mouseUp, { capture: false });
        };

        window.addEventListener('mouseup', mouseUp, { capture: false });
    }, [onChange, setSelectionProbablyInProgress]);

    const windowDragOver = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onDragOver'], undefined>>(ev => {
        onChange?.({}); // bring to top

        setSelectionProbablyInProgress(false);
    }, [setSelectionProbablyInProgress]);

    const movingChange = useCallback((moving: boolean) => {
        setMoving(moving);
        onMovingChange?.(moving);
    }, []);

    const minimize = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onClick'], undefined>>(ev => {
        if (ev.defaultPrevented)
            return;

        ev.preventDefault();

        onChange?.({ minimized: true });
    }, [onChange]);

    const maximize = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onClick'], undefined>>(ev => {
        if (ev.defaultPrevented)
            return;

        ev.preventDefault();

        onChange?.({ maximized: !maximized });
    }, [onChange, maximized]);

    const close = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onClick'], undefined>>(ev => {
        if (ev.defaultPrevented)
            return;

        ev.preventDefault();

        onClose?.();
    }, [onClose]);

    const closeMiddleClick = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onMouseUp'], undefined>>(ev => {
        if (ev.defaultPrevented)
            return;

        if (ev.button !== 1)
            return;

        ev.preventDefault();

        onClose?.();
    }, [onClose]);

    // on blur save selection, on focus restore selection
    const selection = useRef<Range[]>();
    useEffect(() => {
        const sel = window.getSelection();
        if (!sel)
            return;

        // TODO: this code is broken, fix it.

        if (focused) {
            sel.removeAllRanges();

            for (const range of selection.current ?? [])
                sel.addRange(range);
        } else {
            selection.current = new Array(sel.rangeCount).fill(0).map((_, i) => sel.getRangeAt(i));
            sel.removeAllRanges();
        }

        if (x == 60)
            console.log(focused ? 'focused' : 'blurred', selection.current?.[0]?.startOffset);
    }, [focused]);

    // HACK: workaround to detect when the user focuses an iframe in the content.
    useEffect(() => {
        const checkNow = () => {
            if (!focused && contentRef.current?.contains(window.document.activeElement))
                onChange?.({}); // bring to top
        };

        const checkAfterTimeout = () => {
            setTimeout(checkNow, 0);
        };

        // HACK: only works if the previously focused element was not another iframe.
        window.addEventListener('blur', checkAfterTimeout);

        // HACK: always works, but it's not immediate, and it relies on polling.
        const intervalId = setInterval(checkNow, 120);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('blur', checkAfterTimeout);
        };
    }, [contentRef, focused, onChange]);

    return <div
        ref={windowRef}
        className={classNames['window'] + (focused ? (' ' + classNames['window-focused']) : '')+ (moving ? (' ' + classNames['window-moving']) : '')}
        tabIndex={-1} // allow focusing the window, but it's not necessary to allow focusing it with tab
        style={{
            top: y,
            left: x,
            width: typeof width === 'number' ? '' : width,
            height: typeof height === 'number' ? '' : height,
        }}
        data-maximized={maximized}
        onDragOver={windowDragOver}
    >
        <Handle
            moveX={1}
            moveY={1}
            windowRef={windowRef}
            contentRef={contentRef}
            className={classNames['title-bar']}
            onChange={onChange}
            onMovingChange={movingChange}
            onMouseUp={closeMiddleClick}
            onDoubleClick={maximize}
        >
            <div className={classNames['title']}>{title}</div>
            <div className={classNames['button-minimize']} onClick={minimize} />
            <div className={classNames['button-maximize']} onClick={maximize} />
            <div className={classNames['button-close']} onClick={close} />
        </Handle>

        {selectionProbablyInProgress && <>
            <div className={classNames['selection-workaround-left']} />
            <div className={classNames['selection-workaround-top']} />
        </>}

        <div
            ref={contentRef}
            className={classNames['content']}
            style={{
                width: typeof width === 'number' ? Math.max(MIN_WIDTH, width) : '100%',
                height: typeof height === 'number' ? Math.max(MIN_HEIGHT, height) : '100%',
            }}
            children={children}
            onMouseDown={contentMouseDown}
        />

        {moving && <>
            <div className={classNames['moving-workaround']} />
        </>}

        {selectionProbablyInProgress && <>
            <div className={classNames['selection-workaround-right']} />
            <div className={classNames['selection-workaround-bottom']} />
        </>}

        {!selectionProbablyInProgress && !maximized && <>
            <Handle
                moveY={1}
                resizeHeight={-1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-top']}
                onChange={onChange}
                onMovingChange={movingChange}
            />
            <Handle
                moveX={1}
                resizeWidth={-1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-left']}
                onChange={onChange}
                onMovingChange={movingChange}
            />
            <Handle
                resizeWidth={1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-right']}
                onChange={onChange}
                onMovingChange={movingChange}
            />
            <Handle
                resizeHeight={1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-bottom']}
                onChange={onChange}
                onMovingChange={movingChange}
            />

            <Handle
                moveX={1}
                moveY={1}
                resizeWidth={-1}
                resizeHeight={-1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-top-left']}
                onChange={onChange}
                onMovingChange={movingChange}
            />
            <Handle
                moveY={1}
                resizeWidth={1}
                resizeHeight={-1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-top-right']}
                onChange={onChange}
                onMovingChange={movingChange}
            />
            <Handle
                moveX={1}
                resizeWidth={-1}
                resizeHeight={1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-bottom-left']}
                onChange={onChange}
                onMovingChange={movingChange}
            />
            <Handle
                resizeWidth={1}
                resizeHeight={1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-bottom-right']}
                onChange={onChange}
                onMovingChange={movingChange}
            />
        </>}
    </div>;
};

interface HandleProps extends PropsWithChildren {
    moveX?: number
    moveY?: number
    resizeWidth?: number
    resizeHeight?: number
    windowRef: RefObject<HTMLDivElement>
    contentRef: RefObject<HTMLDivElement>
    className: string
    onChange?(change: { x?: number, y?: number, width?: number, height?: number, maximized?: boolean }): void
    onMovingChange?(moving: boolean): void
}

const Handle: FC<HandleProps & Exclude<DOMAttributes<HTMLDivElement>, HandleProps>> = ({
    moveX,
    moveY,
    resizeWidth,
    resizeHeight,
    windowRef,
    contentRef,
    className,
    onChange,
    onMovingChange,
    ...others
}) => {
    const mouseDown = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onMouseDown'], undefined>>(ev => {
        if (ev.defaultPrevented)
            return;

        ev.preventDefault();

        onChange?.({});

        // if focus is not on this window, focus it
        if (!windowRef.current?.contains(document.activeElement))
            windowRef.current?.focus();

        const { top: initialY, left: initialX } = windowRef.current!.getBoundingClientRect() ?? {};
        const { width: initialWidth, height: initialHeight } = contentRef.current!.getBoundingClientRect() ?? {};

        const { clientX: startClientX, clientY: startClientY } = ev;

        let movedAtLeastOnce = false;

        const mouseMove = (ev: MouseEvent) => {
            if (ev.defaultPrevented)
                return;

            ev.preventDefault();

            if (!movedAtLeastOnce) {
                movedAtLeastOnce = true;
                onMovingChange?.(true);
            }

            if (moveX || moveY || resizeWidth || resizeHeight) {
                const changeX = ev.clientX - startClientX;
                const changeY = ev.clientY - startClientY;

                let newX = initialX + changeX * (moveX ?? 0);
                let newY = initialY + changeY * (moveY ?? 0);

                let newWidth = initialWidth + changeX * (resizeWidth ?? 0);
                let newHeight = initialHeight + changeY * (resizeHeight ?? 0);

                if (newWidth < MIN_WIDTH) {
                    if (moveX && moveX > 0)
                        newX += (newWidth - MIN_WIDTH);

                    newWidth = MIN_WIDTH;
                }

                if (newHeight < MIN_HEIGHT) {
                    if (moveY && moveY > 0)
                        newY += (newHeight - MIN_HEIGHT);

                    newHeight = MIN_HEIGHT;
                }

                onChange?.({
                    maximized: false,
                    ...moveX ? { x: newX } : undefined,
                    ...moveY ? { y: newY } : undefined,
                    ...resizeWidth ? { width: newWidth } : undefined,
                    ...resizeHeight ? { height: newHeight } : undefined,
                });
            }
        };

        const mouseUp = (ev: MouseEvent) => {
            window.removeEventListener('mousemove', mouseMove, { capture: false });
            window.removeEventListener('mouseup', mouseUp, { capture: false });

            if (movedAtLeastOnce)
                mouseMove(ev);

            onMovingChange?.(false);
        };

        window.addEventListener('mousemove', mouseMove, { capture: false });
        window.addEventListener('mouseup', mouseUp, { capture: false });
    }, [
        windowRef,
        onChange,
        onMovingChange,
        moveX,
        moveY,
        resizeWidth,
        resizeHeight
    ]);

    const othersOnMouseDown = others.onMouseDown;
    const mouseDownHandler = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onMouseDown'], undefined>>(ev => {
        mouseDown(ev);
        othersOnMouseDown?.(ev);
    }, [mouseDown, othersOnMouseDown]);

    return <div
        {...others}
        className={className}
        onMouseDown={mouseDownHandler}
    />;
};
