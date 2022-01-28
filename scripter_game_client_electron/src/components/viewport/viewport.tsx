import React, { useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { PixiComponent, useApp } from "@inlet/react-pixi";
import { Viewport as PixiViewport } from "pixi-viewport";

export interface ViewportProps {
    width: number;
    height: number;
    children?: React.ReactNode;
}

export interface PixiComponentViewportProps extends ViewportProps {
    app: PIXI.Application;
}
let viewport: PixiViewport | undefined = undefined;
let pixiApp: PIXI.Application | undefined = undefined;
let clamp = {
    left: -200,
    bottom: 2200,
    right: 2200,
    top: -200
}
const PixiComponentViewport = PixiComponent("Viewport", {
    create: (props: PixiComponentViewportProps) => {
        viewport = new PixiViewport({
            screenWidth: props.width,
            screenHeight: props.height,
            worldWidth: 2000,
            worldHeight: 2000,
            interaction: props.app.renderer.plugins.interaction,
            passiveWheel: true
        });
        viewport.drag({ mouseButtons: "left" }).clamp(clamp).pinch().wheel().clampZoom({});
        pixiApp = props.app;
        return viewport;
    }
});
export let resizeViewport = (x: number, y: number) => {
    clamp.bottom = 2000 + y;
    viewport?.drag({ mouseButtons: "left" }).clamp(clamp).pinch().wheel().clampZoom({});
}

const Viewport = (props: ViewportProps) => {
    const app = useApp();
    return <PixiComponentViewport app={app} {...props} />;
};
export default Viewport;
