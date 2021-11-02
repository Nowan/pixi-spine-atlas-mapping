import { Application, Loader } from 'pixi.js';
import { TextureAtlas, Spine } from "pixi-spine";

export default class GameApplication extends Application {
  constructor(options) {
    super(...arguments);

    this.loadAssets().then((assets) => {
      const animation = new Spine(assets["assets/spines/spineboy.spine.json"].spineData);

      animation.scale.set(0.5);
      animation.x = 400;
      animation.y = 600;

      animation.state.setAnimation(0, "portal", true);

      this.stage.addChild(animation);
    })
  }

  loadAssets() {
    return new Promise((resolve, reject) => {
      const loader = new Loader();

      loader.add("assets/spritesheets/portal.atlas.json", "assets/spritesheets/portal.atlas.json");
      loader.add("assets/spritesheets/spineboy.atlas.json", "assets/spritesheets/spineboy.atlas.json");
      loader.add("assets/spines/spineboy.spine.map.json", "assets/spines/spineboy.spine.map.json");
      
      loader.load((_, resources) => {
        const atlas = new TextureAtlas();
        const spineboySpineMap = resources["assets/spines/spineboy.spine.map.json"].data;

        for (let [attachmentName, mapEntry] of Object.entries(spineboySpineMap)) {
          const spritesheet = resources[mapEntry.atlas].spritesheet;

          atlas.addTexture(attachmentName, spritesheet.textures[mapEntry.frame])
        }
        
        // Load json skeleton
        loader.add("assets/spines/spineboy.spine.json", "assets/spines/spineboy.spine.json", {metadata: {spineAtlas: atlas}});
        loader.onComplete.add((_, resources) => resolve(resources));
      });
    });
  }

  
}

