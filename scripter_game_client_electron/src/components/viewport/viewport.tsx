import React from "react";
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
const PixiComponentViewport = PixiComponent("Viewport", {
  create: (props: PixiComponentViewportProps) => {
    viewport = new PixiViewport({
      screenWidth: props.width,
      screenHeight: props.height,
      worldWidth: 2000,
      worldHeight: 2000,
      ticker: props.app.ticker,
      interaction: props.app.renderer.plugins.interaction
    });
    viewport.drag({mouseButtons: "left"}).decelerate().clamp({
        left: -200,
        bottom: 2200,
        right: 2200,
        top: -200
    }).pinch().wheel().clampZoom({});
    return viewport;
  }
});
export let resizeViewport = (x: number, y: number) => {
    viewport?.resize(
        x,
        y,
        2000,
        2000,
    );
}
const Viewport = (props: ViewportProps) => {
  const app = useApp();
  return <PixiComponentViewport app={app} {...props} />;
};
export default Viewport;
