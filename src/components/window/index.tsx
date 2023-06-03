import { DOMAttributes, FC, PropsWithChildren, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import * as classNames from './style.module.scss';

export interface WindowProps extends PropsWithChildren {
    focused?: boolean | undefined
    title: string
    x: number
    y: number
    width: number
    height: number
    onChange?(change: { x?: number, y?: number, width?: number, height?: number }): void
    onClose?(): void
}

export const Window: FC<WindowProps> = ({
    focused,
    title,
    x,
    y,
    width,
    height,
    children,
    onChange,
    onClose,
}) => {
    const [selectionProbablyInProgress, setSelectionProbablyInProgress] = useState<boolean>();

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

    const minimize = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onClick'], undefined>>(ev => {
        if (ev.defaultPrevented)
            return;

        ev.preventDefault();

        //onChange?.({
        //    state: MINIMIZED,
        //});
    }, [onChange]);

    const maximize = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onClick'], undefined>>(ev => {
        if (ev.defaultPrevented)
            return;

        ev.preventDefault();

        //onChange?.({
        //    state: MAXIMIZED,
        //});
    }, [onChange]);

    const close = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onClick'], undefined>>(ev => {
        if (ev.defaultPrevented)
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

    return <div
        ref={windowRef}
        className={classNames['window'] + (focused ? (' ' + classNames['window-focused']) : '')}
        style={{
            top: y,
            left: x,
        }}
        onDragOver={windowDragOver}
    >
        <Handle
            moveX={1}
            moveY={1}
            windowRef={windowRef}
            contentRef={contentRef}
            className={classNames['title-bar']}
            onChange={onChange}
        >
            <div className={classNames['title']}>{title}</div>
            <div className={classNames['button-minimize']} onClick={minimize} />
            <div className={classNames['button-maximize']} onClick={maximize}  />
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
                width: Math.max(0, width),
                height: Math.max(0, height),
            }}
            children={children}
            onMouseDown={contentMouseDown}
        />

        {selectionProbablyInProgress && <>
            <div className={classNames['selection-workaround-right']} />
            <div className={classNames['selection-workaround-bottom']} />
        </>}

        {!selectionProbablyInProgress && <>
            <Handle
                moveY={1}
                resizeHeight={-1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-top']}
                onChange={onChange}
            />
            <Handle
                moveX={1}
                resizeWidth={-1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-left']}
                onChange={onChange}
            />
            <Handle
                resizeWidth={1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-right']}
                onChange={onChange}
            />
            <Handle
                resizeHeight={1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-bottom']}
                onChange={onChange}
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
            />
            <Handle
                moveY={1}
                resizeWidth={1}
                resizeHeight={-1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-top-right']}
                onChange={onChange}
            />
            <Handle
                moveX={1}
                resizeWidth={-1}
                resizeHeight={1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-bottom-left']}
                onChange={onChange}
            />
            <Handle
                resizeWidth={1}
                resizeHeight={1}
                windowRef={windowRef}
                contentRef={contentRef}
                className={classNames['handle-bottom-right']}
                onChange={onChange}
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
    onChange?(change: { x?: number, y?: number, width?: number, height?: number }): void
}

const Handle: FC<HandleProps> = ({
    moveX,
    moveY,
    resizeWidth,
    resizeHeight,
    windowRef,
    contentRef,
    className,
    children,
    onChange,
}) => {
    const mouseDown = useCallback<Exclude<DOMAttributes<HTMLDivElement>['onMouseDown'], undefined>>(ev => {
        ev.preventDefault();

        onChange?.({});

        const { top: initialY, left: initialX } = windowRef.current!.getBoundingClientRect() ?? {};
        const { width: initialWidth, height: initialHeight } = contentRef.current!.getBoundingClientRect() ?? {};

        const { clientX: startClientX, clientY: startClientY } = ev;

        const mouseMove = (ev: MouseEvent) => {
            if (ev.defaultPrevented)
                return;

            ev.preventDefault();

            const changeX = ev.clientX - startClientX;
            const changeY = ev.clientY - startClientY;

            if (moveX || moveY || resizeWidth || resizeHeight) {
                onChange?.({
                    ...moveX ? { x: initialX + changeX * moveX } : undefined,
                    ...moveY ? { y: initialY + changeY * moveY } : undefined,
                    ...resizeWidth ? { width: initialWidth + changeX * resizeWidth } : undefined,
                    ...resizeHeight ? { height: initialHeight + changeY * resizeHeight } : undefined,
                });
            }
        };

        const mouseUp = (ev: MouseEvent) => {
            mouseMove(ev);

            window.removeEventListener('mousemove', mouseMove, { capture: false });
            window.removeEventListener('mouseup', mouseUp, { capture: false });
        };

        window.addEventListener('mousemove', mouseMove, { capture: false });
        window.addEventListener('mouseup', mouseUp, { capture: false });
    }, [
        windowRef,
        onChange,
        moveX,
        moveY,
        resizeWidth,
        resizeHeight
    ]);

    return <div
        className={className}
        onMouseDown={mouseDown}
        children={children}
    />;
};
