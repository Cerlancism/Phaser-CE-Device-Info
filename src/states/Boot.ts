const FontSize = 12
const scrollSpeed = 10
const wheelSpeed = 5
const scrollBound = 100

function singleLevelReplacer(k: string, v: any)
{
    return k ? "" + v : v;
}

function getPlainObjectKeys(obj: Object)
{
    return Object.keys(obj).filter(x => typeof obj[x] != "object" && typeof obj[x] != "function")
}

function getFilteredObject(target: Object, keys: string[])
{
    return Object.keys(target)
        .filter(key => keys.includes(key))
        .reduce((obj, key) =>
        {
            obj[key] = target[key];
            return obj;
        }, {});
}

function getNavigatorObject()
{
    const keys = Object.keys(Object.getPrototypeOf(navigator))
    return keys.reduce((obj: Object, key) =>
    {
        obj[key] = navigator[key]
        return obj
    }, {})

}

const windowPlainPropertiesKeys = getPlainObjectKeys(window)

export class Boot extends Phaser.State
{
    public static key = "Boot"
    public static onCreate = new Phaser.Signal()

    public readonly key = Boot.key

    private mousePosition: Phaser.Point
    private textDump: Phaser.Text

    private textMessageDevice: string
    private textMessageLocation = JSON.stringify(location, undefined, 2)
    private textMessageNavigator = JSON.stringify(getNavigatorObject(), undefined, 2)

    private inputPlainPropertyKeys: string[]

    init()
    {
        console.log("State", this.key)
        this.inputPlainPropertyKeys = getPlainObjectKeys(this.input.activePointer)

        this.scale.scaleMode = Phaser.ScaleManager.RESIZE
        // Disable generic right click menu.
        this.game.canvas.addEventListener('contextmenu', (event) => event.preventDefault())
        this.game.stage.disableVisibilityChange = true
    }

    create()
    {
        Boot.onCreate.dispatch()

        this.textMessageDevice = JSON.stringify(this.game.device, undefined, 2)

        this.textDump = this.game.add.text(0, 0, "",
            {
                fill: "white",
                fontSize: FontSize,
                font: "courier",
            })
        this.textDump.texture.baseTexture.scaleMode = Phaser.scaleModes.NEAREST
        this.textDump.lineSpacing = -FontSize / 2

        this.input.mouse.mouseWheelCallback = () => this.scrollText(-this.input.mouse.wheelDelta * wheelSpeed)

        this.mousePosition = this.input.position.clone()
    }

    updatePrintText()
    {
        const textMessageWindow = JSON.stringify(getFilteredObject(window, windowPlainPropertiesKeys), singleLevelReplacer, 2)
        const textMessageinput = JSON.stringify(getFilteredObject(this.input.activePointer, this.inputPlainPropertyKeys), singleLevelReplacer, 2)
        this.textDump.text = `device\n${this.textMessageDevice}\n\ninput\n${textMessageinput}\n\nwindow\n${textMessageWindow}\n\nlocation\n${this.textMessageLocation}\n\nnavigator${this.textMessageNavigator}`
    }

    update()
    {
        const currentMousePosition = this.input.activePointer.position.clone()
        const mouseDelta = Phaser.Point.subtract(currentMousePosition, this.mousePosition)
        this.mousePosition = currentMousePosition

        if (this.input.activePointer.isDown)
        {
            if (mouseDelta.y !== 0)
            {
                if (this.input.activePointer.justPressed(1000 / 30))
                {
                    return
                }
                this.scrollText(-mouseDelta.y / scrollSpeed)
            }
            else
            {
                if (this.input.y > this.game.height - scrollBound)
                {
                    this.scrollText(1)
                }
                else if (this.input.y < scrollBound)
                {
                    this.scrollText(-1)
                }
            }
        }

        this.updatePrintText()
    }

    scrollText(direction: number)
    {
        this.textDump.y = Phaser.Math.clamp(this.textDump.y - direction * scrollSpeed, this.game.height - this.textDump.height, 0)
    }
}

