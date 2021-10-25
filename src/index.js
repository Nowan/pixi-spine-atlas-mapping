import Application from './js/Application';
import * as PIXI from 'pixi.js';

if (process.env.NODE_ENV === 'development') {
  // Register PIXI namespace for pixi-devtools
  window.__PIXI_INSPECTOR_GLOBAL_HOOK__ && window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}

document.addEventListener('DOMContentLoaded', new Application({
  view: document.getElementById("gameCanvas")
}));
