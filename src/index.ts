import './global'
import { Boot } from '/states'

if (module.hot)
{
    module.hot.dispose(destroyGame)
    module.hot.accept(() => console.log("[HMR]", "Accept"))
}

!(async () =>
{
    if (!window.GameInstance)
    {
        const game = window.GameInstance = await startGameAsync()
    }
})()

async function startGameAsync()
{
    return new Promise<Phaser.Game>(resolve =>
    {
        Phaser.Device.whenReady((device: Phaser.Device) =>
        {
            console.log("Device Ready")
            const isOffline = location.protocol === "file:"

            const config: Phaser.IGameConfig =
            {
                renderer: device.ie || isOffline && device.chrome ? Phaser.CANVAS : Phaser.AUTO, // IE cannot play videos in WebGL. Chrome will emit CORS errors if using WebGL offline.
                parent: 'content',
                width: window.innerWidth * device.pixelRatio,
                height: window.innerHeight * device.pixelRatio,
                roundPixels: true,
                backgroundColor: '#000000',
                state: Boot
            }

            // Walkaround to prevent canvas from appearing as black from top left corner when starting the game.
            const container = document.querySelector<HTMLDivElement>("#content")
            container.style.setProperty("visibility", "hidden")

            const game = new Phaser.Game(config)

            Boot.onCreate.addOnce(() =>
            {
                container.style.removeProperty("visibility")
            })

            resolve(game)
        })
    })
}

function destroyGame()
{
    console.log("[HMR]", "Destroy Game")
    window.GameInstance.destroy()
    delete window.GameInstance
}
