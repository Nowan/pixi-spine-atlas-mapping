import { Application, Loader, LoaderResource } from 'pixi.js';
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
    const spritesheetsPaths = ["assets/spritesheets/portal.atlas.json", "assets/spritesheets/spineboy.atlas.json"];
    const spinesPaths = ["assets/spines/spineboy.spine.json"];

    return new Promise((resolve, reject) => {
      this._loadSpritesheets(...spritesheetsPaths).then(spritesheets => {
        this._loadSpines(spritesheets, ...spinesPaths).then(spines => {
          resolve(Object.assign({}, spritesheets, spines));
        })
      })
    });
  }

  _loadSpritesheets(...spritesheetsPaths) {
    return new Promise((resolve, reject) => {
      const loader = new Loader();

      for (let spritesheetPath of spritesheetsPaths) {
        loader.add(spritesheetPath, spritesheetPath);
      }

      loader.load((loader, resources) => {
        Promise.all(Object.entries(resources).map(([resourceKey, resource]) => new Promise((resolve, reject) => {
          if (resource.data && resource.type === LoaderResource.TYPE.JSON && resource.data.meta && resource.data.meta.related_multi_packs) {
            this._loadSpritesheets(...resource.data.meta.related_multi_packs).then(multiPackResources => {
              resolve(multiPackResources);
            });
          }
          else {
            resolve({ [resourceKey]: resource });
          }
        }))).then((resourceEntries) => {
          const resources = resourceEntries.reduce((resources, resourceEntry) => Object.assign(resources, resourceEntry), {});

          resolve(resources);
        })
      });
    });
  }

  _loadSpines(spritesheets, ...spinesPaths) {
    return Promise.all(spinesPaths.map(spinePath => this._loadSpine(spritesheets, spinePath))).then(resourceEntries => {
      const resources = resourceEntries.reduce((resources, resourceEntry) => Object.assign(resources, resourceEntry), {});

      return resources;
    });
  }

  _loadSpine(spritesheets, spinePath) {
    return new Promise((resolve, reject) => {
      const spineMapPath = spinePath.replace(".json", ".map.json");
      const loader = new Loader();

      loader.add(spineMapPath, spineMapPath);
      loader.load((_, resources) => {
        const spineMap = resources[spineMapPath].data;
        const atlas = new TextureAtlas();
        for (let [attachmentName, mapEntry] of Object.entries(spineMap)) {
          const spritesheet = spritesheets[mapEntry.atlas].spritesheet;

          atlas.addTexture(attachmentName, spritesheet.textures[mapEntry.frame])
        }
          
        // Load json skeleton
        const loader = new Loader();
        loader.add(spinePath, spinePath, {metadata: {spineAtlas: atlas}});
        loader.load((_, resources) => resolve({
          [spinePath]: resources[spinePath]
        }));
      });
    });
  }
}

