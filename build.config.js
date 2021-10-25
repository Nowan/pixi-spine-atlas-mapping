module.exports = {
    spritesheets: [
        {
            target: "portal",
            source: "src/assets/images/portal"
        },
        {
            target: "spineboy",
            source: "src/assets/images/spineboy"
        },
        {
            target: "spineboy_full",
            source: ["src/assets/images/portal", "src/assets/images/spineboy"],
            options: {
                prependFolderName: false,
                width: 512,
                height: 512
            }
        }
    ]
}