module.exports = {
    spritesheets: [
        {
            target: "src/assets/spritesheets/portal",
            source: "src/assets/images/portal"
        },
        {
            target: "src/assets/spritesheets/spineboy",
            source: "src/assets/images/spineboy"
        },
        {
            target: "src/assets/spritesheets/spineboy_full",
            source: ["src/assets/images/portal", "src/assets/images/spineboy"],
            options: {
                prependFolderName: false
            }
        }
    ],
    spineMappings: [
        {
            target: "src/assets/spines/spineboy.spine.json",
            source: ["src/assets/spritesheets/spineboy", "src/assets/spritesheets/portal"]
        }
    ]
}