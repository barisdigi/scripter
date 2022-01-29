import React, { useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { PixiComponent, useApp } from "@inlet/react-pixi";
import { Viewport as PixiViewport } from "pixi-viewport";

export interface ViewportProps {
    width: number;
    height: number;
    children?: React.ReactNode;
    map: { size: { x: number, y: number } }
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
let map: { size: { x: number, y: number } } | undefined = undefined;
const PixiComponentViewport = PixiComponent("Viewport", {
    create: (props: PixiComponentViewportProps) => {
        viewport = new PixiViewport({
            screenWidth: props.width,
            screenHeight: props.height,
            worldWidth: props.map.size.x * 20,
            worldHeight: props.map.size.y * 20,
            interaction: props.app.renderer.plugins.interaction,
            ticker: props.app.ticker,
            passiveWheel: true
        });
        map = props.map;
        clamp.left = -1 * ((props.map.size.x * 20) / 3)
        clamp.right = (props.map.size.x * 20) + 400
        clamp.bottom = props.map.size.y * 20 + 200;
        viewport.drag({ mouseButtons: "left" }).clamp(clamp).pinch().wheel().clampZoom({});
        pixiApp = props.app;
        
        return viewport;
    }
});
export let resizeViewport = (x: number, y: number) => {
    if (map) {
        clamp.bottom = map.size.y * 20 + y;
        viewport?.drag({ mouseButtons: "left" }).clamp(clamp).pinch().wheel().clampZoom({});
    }
}
export let updateViewport = () => {
    pixiApp?.render()

}

const Viewport = (props: ViewportProps) => {
    const app = useApp();
    return <PixiComponentViewport app={app} {...props} />;
};
export default Viewport;
