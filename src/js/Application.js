import { Application, Loader } from 'pixi.js';
import { TextureAtlas, Spine } from "pixi-spine";

export default class GameApplication extends Application {
  constructor(options) {
    super(...arguments);

    this.loadAssets().then((assets) => {
      const animation = new Spine(assets["assets/spines/spineboy.spine.json"].spineData);

      animation.x = 400;
      animation.y = 600;

      animation.state.setAnimation(0, "run", true);

      this.stage.addChild(animation);
    })
  }

  loadAssets() {
    return new Promise((resolve, reject) => {
      const loader = new Loader();

      loader.add("assets/spritesheets/portal.atlas.json", "assets/spritesheets/portal.atlas.json");
      loader.add("assets/spritesheets/spineboy.atlas.json", "assets/spritesheets/spineboy.atlas.json");
      loader.add("assets/spritesheets/spineboy_full.atlas.json", "assets/spritesheets/spineboy_full.atlas.json");
      
      loader.load((_, resources) => {
        const portalSpritesheet = resources["assets/spritesheets/portal.atlas.json"].spritesheet;
        const spineboySpritesheet = resources["assets/spritesheets/spineboy.atlas.json"].spritesheet
        const spineboyFullSpritesheet = resources["assets/spritesheets/spineboy_full.atlas.json"].spritesheet
        
        // Create Spine atlas from loaded spritesheets
        const atlas = new TextureAtlas();
        atlas.addTextureHash(spineboyFullSpritesheet.textures, true);

        // Load json skeleton
        loader.add("assets/spines/spineboy.spine.json", "assets/spines/spineboy.spine.json", {metadata: {spineAtlas: atlas}});
        loader.onComplete.add((_, resources) => resolve(resources));
      });
    });
  }
}

