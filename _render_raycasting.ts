//////////////////////// animation.ts contents of previous version, just for test.ts here for convenience /////////////////////
// file contents:
// directional animations defines for enging_raycasting.ts
// for convenience, constructed animations as below, which images are builtin in Arcade, 
// in order from easy to complex

// each are 2D Image array, Image[][]: 
// 1st dimension is direction: 
//    length=1 to any, e.g. 1,2,3,4,...,8,..., engine can automatically arange them to 0~360° 
//    order: start from left, then folling with others in CW order
//    e.g: 
//         2 directions should be [leftAni,RightAni], 
//         4-direction should be [leftAni, frontAni, rightAni, backAni], 
//         8-direction=[l,lf,f,fr,r,rb,b,lb], ...
//    the reason that directions start from left, is almost all Arcade builtin one side images are facing left, so that would be convient for using.
// 2nd dimension is animation Images
//    length=1 to any, e.g. 1,2,3,4,..., engine will automatically loop them by aniInterval(set when create CompactSprite, or use default)


//simplest, just one static image, looks the same in all angle of view
const texturesDonut = [[sprites.food.smallDonut]]
const texturesBigCake = [[sprites.food.bigCake]]

//1-direction, with ani, looks the same Ani in all angle of view
const texturesCoin = [[sprites.builtin.coin0, sprites.builtin.coin1, sprites.builtin.coin2, sprites.builtin.coin3, sprites.builtin.coin4, sprites.builtin.coin5]]

const texturesDog = [[sprites.builtin.dog0, sprites.builtin.dog1, sprites.builtin.dog2]]
const texturesDuck = [[sprites.duck.duck1, sprites.duck.duck2, sprites.duck.duck3, sprites.duck.duck4, sprites.duck.duck5, sprites.duck.duck6]]

//2-direction, with ani, looks difference from left or right side
const texturesPlane = [[sprites.vehicle.plane0, sprites.vehicle.plane1, sprites.vehicle.plane2, sprites.vehicle.plane3, sprites.vehicle.plane4, sprites.vehicle.plane5],
[sprites.vehicle.plane0, sprites.vehicle.plane1, sprites.vehicle.plane2, sprites.vehicle.plane3, sprites.vehicle.plane4, sprites.vehicle.plane5]]
//no right side ani images builtin, so make them from lefts, and then flipX
imagesFlipX(texturesPlane[1])

const texturesFish = [[sprites.builtin.angelFish0, sprites.builtin.angelFish1, sprites.builtin.angelFish2, sprites.builtin.angelFish3],
[sprites.builtin.angelFish0, sprites.builtin.angelFish1, sprites.builtin.angelFish2, sprites.builtin.angelFish3]]
imagesFlipX(texturesFish[1])

//4-direction
const texturesHero = [
    [sprites.castle.heroWalkSideLeft1, sprites.castle.heroWalkSideLeft2, sprites.castle.heroWalkSideLeft3, sprites.castle.heroWalkSideLeft4],
    [sprites.castle.heroWalkFront1, sprites.castle.heroWalkFront2, sprites.castle.heroWalkFront3, sprites.castle.heroWalkFront4],
    [sprites.castle.heroWalkSideRight1, sprites.castle.heroWalkSideRight2, sprites.castle.heroWalkSideRight3, sprites.castle.heroWalkSideRight4],
    [sprites.castle.heroWalkBack1, sprites.castle.heroWalkBack2, sprites.castle.heroWalkBack3, sprites.castle.heroWalkBack4],
]

const texturesPrincess2 = [
    [sprites.castle.princess2Left1, sprites.castle.princess2Left2],
    [sprites.castle.princess2WalkFront1, sprites.castle.princess2WalkFront2, sprites.castle.princess2WalkFront3, sprites.castle.princess2WalkFront2],
    [sprites.castle.princess2Right1, sprites.castle.princess2Right2],
    [sprites.castle.princess2WalkBack1, sprites.castle.princess2WalkBack2, sprites.castle.princess2WalkBack3, sprites.castle.princess2WalkBack2],
]

//4-direction, but back side has only 1 image, so no ani when looking from back
const texturesSkelly = [
    [sprites.castle.skellyWalkLeft1, sprites.castle.skellyWalkLeft2],
    [sprites.castle.skellyWalkFront1, sprites.castle.skellyWalkFront2, sprites.castle.skellyWalkFront3],
    [sprites.castle.skellyWalkRight1, sprites.castle.skellyWalkRight2],
    [img`
	        ........................
	        ........................
	        ........................
	        ........................
	        ..........ffff..........
	        ........ff1111ff........
	        .......fb111111bf.......
	        .......f11111111f.......
	        ......fd11111111df......
	        ......fd11111111df......
	        ......fd11111111df......
	        ......fb11111111bf......
	        ......fcd111111dcf......
	        .......fb111111bf.......
	        .....ffffdb1bdcfff......
	        ....fc111cfbfbc111cf....
	        ....f11111ffff11111f....
	        ....fbfbfbffffffbfbf....
	        .........ffffff.........
	        ..........fff...........
	        ........................
	        ........................
	        ........................
	        ........................
	    `],
]

const texturesPrincess = [
    [sprites.castle.princessLeft0, sprites.castle.princessLeft1, sprites.castle.princessLeft0, sprites.castle.princessLeft2],
    [sprites.castle.princessFront0, sprites.castle.princessFront1, sprites.castle.princessFront0, sprites.castle.princessFront2],
    [],
    [sprites.castle.princessBack0, sprites.castle.princessBack1, sprites.castle.princessBack0, sprites.castle.princessBack2],
]
texturesPrincess[0].forEach((v, i) => {
    texturesPrincess[2].push(v.clone())
    texturesPrincess[2][i].flipX()
}
)

function imagesFlipX(ani: Image[]) {
    ani.forEach((img, i) => {
        ani[i] = img.clone() //don't worry memery leak or waste, cause old images are still using by left
        ani[i].flipX()
    })
}

//////////////////////// end of animation.ts contents of previous version //////////////
enum RCSpriteAttribute {
    ZOffset,
    ZPosition,
    ZVelocity,
    ZAcceleration
}
/**
 * A 2.5D Screen Render, using Raycasting algorithm
 **/
//% color=#03AA74 weight=1 icon="\uf1b2" //cube f1b2 , fold f279
//% groups='["Instance","Basic", "Dimension Z", "Animate", "Advanced"]'
//% block="3D Render"
namespace Render {
    export enum attribute {
        dirX,
        dirY,
        fov,
        wallZScale,
    }

    export class Animations {
        constructor(public frameInterval: number, public animations: Image[][]) {
        }

        msLast = 0
        index = 0
        iAnimation = 0
        getFrameByDir(dir: number): Image {
            if (control.millis() - this.msLast > this.frameInterval) {
                this.msLast = control.millis()
                this.index++
                this.iAnimation = Math.round((dir * this.animations.length)) % this.animations.length
                if (this.index >= this.animations[this.iAnimation].length)
                    this.index = 0
            }
            return this.animations[this.iAnimation][this.index]
        }
    }

    /**
 * Apply a directional image animations on a sprite
 * @param sprite the sprite to animate on
 * @param animations the directional animates
 */
    //% blockId=set_animation
    //% block="set $sprite=variables_get(mySprite) with animations$animations"
    //% animations.shadow=create_animation
    //% group="Animate"
    //% weight=100
    //% help=github:pxt-raycasting/docs/set-sprite-animations
    export function setSpriteAnimations(sprite: Sprite, animations: Animations) {
        raycastingRender.spriteAnimations[sprite.id] = animations
    }

    /**
 * Create a directional image animations, multi animations will applied to one round dirctions averagely, start from the left. 
 * The reason that directions start from left, is almost all Arcade out-of-box 1 or 2-dirction images are facing left, so that would be convient for using.
 * @param frameInterval the time between changes, eg: 150
 * @param frames1 animation, if this is the first of multi animation it will be used as left, others will 
 * @param frames2 optional, used for 2 or more dirctional
 * @param frames3 optional, used for 3 or more dirctional
 * @param frames4 optional, used for 4 or more dirctional
 */
    //% blockId=create_animation
    //% block="interval$frameInterval=timePicker animates:$frames1=animation_editor|| $frames2=animation_editor $frames3=animation_editor $frames4=animation_editor"
    //% inlineInputMode=inline
    //% group="Animate"
    //% weight=100
    //% help=github:pxt-raycasting/docs/create-animations
    export function createAnimations(frameInterval: number, frames1: Image[], frames2?: Image[], frames3?: Image[], frames4?: Image[]): Animations {
        const animationList = [frames1]
        if (frames2) animationList.push(frames2)
        if (frames3) animationList.push(frames3)
        if (frames4) animationList.push(frames4)
        return new Animations(frameInterval, animationList)
    }

    /**
     * Get the Render
     * @param img the image
     */
    //% group="Instance"
    //% blockId=rcRender_getRCRenderInstance block="raycasting render"
    //% expandableArgumentMode=toggle
    //% weight=100 
    //% blockHidden=true
    //% hidden=1
    export function getRCRenderInstance(): RayCastingRender {
        return raycastingRender
    }

    /**
     * Get the render Sprite, which create automatically, for physical collisions, and holding the view point.
     * You can consider it as "myself", and operate it like a usual sprite, eg.: position, speed, scale, collision, ...
     * But properties relative 3D, eg. ZOffset, ZPosition, viewAngle, and etc. are not in the Sprite class.
     */
    //% group="Instance"
    //% blockId=rcRender_getRenderSpriteVariable block="myself sprite"
    //% expandableArgumentMode=toggle
    //% blockSetVariable=mySprite
    //% weight=99
    //% help=github:pxt-raycasting/get-render-sprite-variable
    export function getRenderSpriteVariable(): Sprite {
        return raycastingRender.sprSelf
    }

    /**
     * Get the render Sprite, which create automatically, for physical collisions, and holding the view point.(but get/set view direction with dirX/dirY, which not in the Sprite class) 
     * You can consider it as "myself", and operate it like a usual sprite.
     * eg: position, speed, scale, collision, ...
     */
    //% group="Instance"
    //% blockId=rcRender_getRenderSpriteInstance block="myself sprite"
    //% expandableArgumentMode=toggle
    //% weight=98
    //% help=github:pxt-raycasting/docs/get-render-sprite-instance
    export function getRenderSpriteInstance(): Sprite {
        return raycastingRender.sprSelf
    }

    /**
     * Toggle current view mode
     */
    //% blockId=rcRender_toggleViewMode block="toggle current view mode"
    //% group="Basic"
    //% weight=89
    //% help=github:pxt-raycasting/docs/toggle-view-mode
    export function toggleViewMode() {
        raycastingRender.viewMode = raycastingRender.viewMode == ViewMode.tilemapView ? ViewMode.raycastingView : ViewMode.tilemapView
    }

    /**
     * Current view mode is the specific one?
     * @param viewMode
     */
    //% blockId=rcRender_isViewMode block="current is $viewMode"
    //% group="Basic"
    //% weight=88
    //% help=github:pxt-raycasting/docs/is-view-mode
    export function isViewMode(viewMode: ViewMode): boolean {
        return viewMode == raycastingRender.viewMode
    }

    /**
     * Set view mode
     * @param viewMode
     */
    //% blockId=rcRender_setViewMode block="set view mode $viewMode"
    //% group="Basic"
    //% weight=87
    //% help=github:pxt-raycasting/docs/set-view-mode
    export function setViewMode(viewMode: ViewMode) {
        raycastingRender.viewMode = viewMode
    }

    /**
     * Get render arribute
     * @param viewMode
     */
    //% group="Basic"
    //% block="get %attribute" 
    //% blockId=rcRender_getAttribute
    //% weight=83
    //% help=github:pxt-raycasting/docs/get-attribute
    export function getAttribute(attr: attribute): number {
        switch (attr) {
            case attribute.dirX:
                return raycastingRender.dirX
            case attribute.dirY:
                return raycastingRender.dirY
            case attribute.fov:
                return raycastingRender.fov
            case attribute.wallZScale:
                return raycastingRender.wallZScale
            default:
                return 0
        }
    }

    /**
     * Set render arribute
     * @param viewMode
     */
    //% group="Basic"
    //% block="set %attribute = %value" 
    //% blockId=rcRender_setAttribute
    //% weight=82
    //% help=github:pxt-raycasting/docs/set-attribute
    export function setAttribute(attr: attribute, value: number) {
        switch (attr) {
            case attribute.dirX:
                raycastingRender.dirX = value
                break
            case attribute.dirY:
                raycastingRender.dirY = value
                break
            case attribute.fov:
                if (value < 0) value = 0
                raycastingRender.fov = value
                break
            case attribute.wallZScale:
                if (value < 0) value = 0
                raycastingRender.wallZScale = value
                break
            default:
        }
    }

    /**
     * Get default FOV (field of view) value
     * @param viewMode
     */
    //% group="Basic"
    //% block="defaultFov"
    //% blockId=rcRender_getDefaultFov
    //% weight=81
    //% help=github:pxt-raycasting/docs/get-default-fov
    export function getDefaultFov(): number {
        return defaultFov
    }

    /**
     * Set view angle
     * @param angle, unit: degree 0~360
     */
    //% blockId=rcRender_setViewAngleInDegree block="set view angle$angle"
    //% angle.min=0 angle.max=360 angle.defl=90
    //% group="Basic"
    //% weight=80
    //% help=github:pxt-raycasting/docs/set-view-angle-in-degree
    export function setViewAngleInDegree(angle: number) {
        raycastingRender.viewAngle = angle * Math.PI / 180
    }

    /**
     * Set view angle by dirX and dirY
     * @param dirX
     * @param dirY
     */
    //% blockId=rcRender_setViewAngle block="set view angle by dirX%dirX and dirY%dirY"
    //% group="Basic"
    //% weight=79
    //% help=github:pxt-raycasting/docs/set-view-angle
    export function setViewAngle(dirX: number, dirY: number) {
        raycastingRender.viewAngle = Math.atan2(dirY, dirX)
    }

    /**
     * Set floating offset height for a sprite at Z direction
     * @param sprite
     * @param Zoffset Negative floats down, affirmative goes up
     * @param duration moving time, 0 for immediately, unit: ms
     */
    //% blockId=rcRender_setZOffset block="set Sprite %spr=variables_get(mySprite) floating %offset pixels|| duration $duration=timePicker|ms "
    //% offset.min=-100 offset.max=100 offset.defl=8
    //% duration.min=0 duration.max=5000 duration.defl=0
    //% group="Dimension Z"
    //% weight=77
    //% blockHidden
    //% help=github:pxt-raycasting/docs/set-z-offset
    export function setZOffset(sprite: Sprite, offset: number, duration?: number) {
        raycastingRender.setZOffset(sprite, offset, duration)
    }

    /**
     * Set arribute of a Sprite
     * @param spr Sprite
     * @param attr RCSpriteAttribute
     */
    //% group="Dimension Z"
    //% block="set Sprite %spr=variables_get(mySprite) %attribute = %value"
    //% blockId=rcRender_setSpriteAttribute
    //% weight=75
    //% help=github:pxt-raycasting/docs/set-sprite-attribute
    export function setSpriteAttribute(spr: Sprite, attr: RCSpriteAttribute, value: number) {
        switch (attr) {
            case RCSpriteAttribute.ZOffset:
                raycastingRender.getMotionZ(spr).offset = value
                break
            case RCSpriteAttribute.ZPosition:
                raycastingRender.getMotionZ(spr).p = value
                break
            case RCSpriteAttribute.ZVelocity:
                raycastingRender.getMotionZ(spr).v = value
                break
            case RCSpriteAttribute.ZAcceleration:
                raycastingRender.getMotionZ(spr).a = value
                break
            default:
        }
    }

    /**
     * Get arribute of a Sprite
     * @param spr Sprite
     * @param attr RCSpriteAttribute
     */
    //% group="Dimension Z"
    //% block="get Sprite %spr=variables_get(mySprite) %attribute"
    //% blockId=rcRender_getSpriteAttribute
    //% weight=74
    //% help=github:pxt-raycasting/docs/get-sprite-attribute
    export function getSpriteAttribute(spr: Sprite, attr: RCSpriteAttribute): number {
        switch (attr) {
            case RCSpriteAttribute.ZOffset:
                return raycastingRender.getMotionZ(spr).offset
            case RCSpriteAttribute.ZPosition:
                return raycastingRender.getMotionZ(spr).p
            case RCSpriteAttribute.ZVelocity:
                return raycastingRender.getMotionZ(spr).v
            case RCSpriteAttribute.ZAcceleration:
                return raycastingRender.getMotionZ(spr).a
            default:
                return 0
        }
    }

    /**
     * Check if 2 sprites overlaps each another in Z dimension
     * Best work together with sprites.onOverlap(kind1, kind2)
     * @param sprite1
     * @param sprite2
     */
    //% blockId=rcRender_isSpritesOverlapZ
    //% block="is sprites $sprite1=variables_get(mySprite) and $sprite2=variables_get(mySprite2) overlaps in Z dimension"
    //% group="Dimension Z"
    //% weight=71
    //% help=github:pxt-raycasting/docs/is-sprites-overlap-z
    export function isSpritesOverlapZ(sprite1: Sprite, sprite2: Sprite): boolean {
        return raycastingRender.isOverlapZ(sprite1, sprite2)
    }

    /**
     * Make sprite jump, with specific height and duration
     * Jump can only happened when sprite is standing, current height = its offset .
     * @param sprite
     * @param height jump height in pixel
     * @param duration hover time span, unit: ms
     */
    //% blockId=rcRender_jumpWithHeightAndDuration block="Sprite %spr=variables_get(mySprite) jump, with height $height duration $duration=timePicker|ms "
    //% height.min=0 height.max=100 height.defl=16
    //% duration.min=50 duration.max=5000 duration.defl=500
    //% group="Dimension Z"
    //% weight=70
    //% help=github:pxt-raycasting/docs/jump-with-height-and-duration
    export function jumpWithHeightAndDuration(sprite: Sprite, height: number, duration: number) {
        raycastingRender.jumpWithHeightAndDuration(sprite, height, duration)
    }

    /**
     * Make sprite jump, with specific speed and acceleration
     * Simular with Move block, but jump can only happened when sprite is standing, current height = its offset.
     * @param sprite
     * @param v vetical speed, unit: pixel/s
     * @param a vetical acceleration, unit: pixel/s²
     */
    //% blockId=rcRender_jump block="Sprite %spr=variables_get(mySprite) jump||, with speed $v=spriteSpeedPicker acceleration $a"
    //% v.min=-100 v.max=100 v.defl=60
    //% a.min=-1000 a.max=1000 a.defl=-250
    //% group="Dimension Z"
    //% weight=68
    //% help=github:pxt-raycasting/docs/jump
    export function jump(sprite: Sprite, v?: number, a?: number) {
        raycastingRender.jump(sprite, v, a)
    }

    /**
     * Make sprite jump, with specific speed and acceleration
     * @param sprite
     * @param v vetical speed, unit: pixel/s
     * @param a vetical acceleration, unit: pixel/s²
     */
    //% blockId=rcRender_move block="Sprite %spr=variables_get(mySprite) move, with speed $v=spriteSpeedPicker|| acceleration $a"
    //% v.min=-200 v.max=200 v.defl=60
    //% a.min=-1000 a.max=1000 a.defl=-250
    //% group="Dimension Z"
    //% weight=66
    //% help=github:pxt-raycasting/docs/move
    export function move(sprite: Sprite, v?: number, a?: number) {
        raycastingRender.move(sprite, v, a)
    }

    /**
     * Control the self sprite using the direction buttons from the controller. 
     * To stop controlling self sprite, pass 0 for v and va.
     *
     * @param v The velocity used for forward/backword movement when up/down is pressed, in pixel/s
     * @param va The angle velocity used for turn view direction when left/right is pressed, in radian/s.
     */
    //% blockId="rcRender_moveWithController" block="move with buttons velocity $v|| turn speed $va camera sway$cameraSway pixels"
    //% weight=60
    //% expandableArgumentMode="toggle"
    //% v.defl=2 va.defl=3
    //% group="Advanced"
    //% v.shadow="spriteSpeedPicker"
    //% va.shadow="spriteSpeedPicker"
    //% help=github:pxt-raycasting/docs/move-with-controller
    export function moveWithController(v: number = 2, va: number = 3, cameraSway?: number) {
        raycastingRender.velocity = v
        raycastingRender.velocityAngle = va
        if (cameraSway != undefined)
            raycastingRender.cameraSway = cameraSway | 0
    }

    /**
     * Render takeover all sprites in current scene
     * Render will call this automatically, but maybe not in time enough.
     * If you saw sprite draw at its tilemap position on screen, call this just after created the sprite.
     */
    //% blockId=rcRender_takeoverSceneSprites 
    //% block="takeover sprites in scene"
    //% group="Advanced"
    //% weight=49
    //% help=github:pxt-raycasting/docs/takeover-scene-sprites
    export function takeoverSceneSprites() {
        raycastingRender.takeoverSceneSprites()
    }

    /**
     * Run on sprite dirction updated, present view point to Sprite facing dirction, or which angle you see of the sprite.
     * Just using with other animation extensions, to set proper Image for sprite.
     * Not required, if you have used the set animations block provided.
     * @param dir It is a float number, 0~1 corresponds to 0~360°, suggest use Math.round(dir*dirAniTotalCount)%dirAniTotalCount to get index of direction
     */
    //% blockId=rcRender_registerOnSpriteDirectionUpdateHandler
    //% block="run code when sprite $spr dirction updated to $dir"
    //% draggableParameters
    //% group="Advanced"
    //% weight=48
    //% help=github:pxt-raycasting/docs/register-on-sprite-direction-update-handler
    export function registerOnSpriteDirectionUpdateHandler(handler: (spr: Sprite, dir: number) => void) {
        raycastingRender.registerOnSpriteDirectionUpdate(handler)
    }
}

//% shim=pxt::updateScreen
function updateScreen(img: Image) { }

enum ViewMode {
    //% block="TileMap Mode"
    tilemapView,
    //% block="Raycasting Mode"
    raycastingView,
}

namespace Render {
    const SH = screen.height, SHHalf = SH / 2
    const SW = screen.width, SWHalf = SW / 2
    const fpx = 8
    const fpx_scale = 2 ** fpx
    function tofpx(n: number) { return (n * fpx_scale) | 0 }
    const one = 1 << fpx
    const one2 = 1 << (fpx + fpx)
    const FPX_MAX = (1 << fpx) - 1

    class MotionSet1D {
        p: number
        v: number = 0
        a: number = 0
        constructor(public offset: number) {
            this.p = offset
        }
    }

    export const defaultFov = SW / SH / 2  //Wall just fill screen height when standing 1 tile away

    export class RayCastingRender {
        private tempScreen: Image = image.create(SW, SH)

        velocityAngle: number = 2
        velocity: number = 3
        protected _viewMode = ViewMode.raycastingView
        protected dirXFpx: number
        protected dirYFpx: number
        protected planeX: number
        protected planeY: number
        protected _angle: number
        protected _fov: number
        protected _wallZScale: number = 1
        cameraSway = 0
        protected isWalking = false
        protected cameraOffsetX = 0
        protected cameraOffsetZ_fpx = 0

        //sprites & accessories
        sprSelf: Sprite
        sprites: Sprite[] = []
        sprites2D: Sprite[] = []
        spriteParticles: particles.ParticleSource[] = []
        spriteLikes: SpriteLike[] = []
        spriteAnimations: Animations[] = []
        protected spriteMotionZ: MotionSet1D[] = []
        protected sayRederers: sprites.BaseSpriteSayRenderer[] = []
        protected sayEndTimes: number[] = []

        //reference
        protected tilemapScaleSize = 1 << TileScale.Sixteen
        map: tiles.TileMapData
        bg: Image
        textures: Image[]
        protected oldRender: scene.Renderable
        protected myRender: scene.Renderable

        //render
        protected wallHeightInView: number
        protected wallWidthInView: number
        protected dist: number[] = []
        //render perf const
        cameraRangeAngle: number
        viewZPos: number
        selfXFpx: number
        selfYFpx: number

        //for drawing sprites
        protected invDet: number //required for correct matrix multiplication
        camera: scene.Camera
        tempSprite: Sprite = sprites.create(img`0`)
        protected transformX: number[] = []
        protected transformY: number[] = []
        protected angleSelfToSpr: number[] = []

        onSpriteDirectionUpdateHandler: (spr: Sprite, dir: number) => void

        get xFpx(): number {
            return Fx.add(this.sprSelf._x, Fx.div(this.sprSelf._width, Fx.twoFx8)) as any as number / this.tilemapScaleSize
        }

        // set xFpx(v: number) {
        //     this.sprSelf._x = v * this.tilemapScaleSize as any as Fx8
        // }

        get yFpx(): number {
            return Fx.add(this.sprSelf._y, Fx.div(this.sprSelf._height, Fx.twoFx8)) as any as number / this.tilemapScaleSize
        }

        // set yFpx(v: number) {
        //     this.sprSelf._y = v * this.tilemapScaleSize as any as Fx8
        // }

        get dirX(): number {
            return this.dirXFpx / fpx_scale
        }

        get dirY(): number {
            return this.dirYFpx / fpx_scale
        }

        set dirX(v: number) {
            this.dirXFpx = v * fpx_scale
        }

        set dirY(v: number) {
            this.dirYFpx = v * fpx_scale
        }

        sprXFx8(spr: Sprite) {
            return Fx.add(spr._x, Fx.div(spr._width, Fx.twoFx8)) as any as number / this.tilemapScaleSize
        }

        sprYFx8(spr: Sprite) {
            return Fx.add(spr._y, Fx.div(spr._height, Fx.twoFx8)) as any as number / this.tilemapScaleSize
        }

        get fov(): number {
            return this._fov
        }

        set fov(fov: number) {
            this._fov = fov
            this.wallHeightInView = (SW << (fpx - 1)) / this._fov
            this.wallWidthInView = this.wallHeightInView >> fpx // not fpx  // wallSize / this.fov * 4 / 3 * 2
            this.cameraRangeAngle = Math.atan(this.fov) + .1 //tolerance for spr center just out of camera

            this.setVectors()
        }

        get viewAngle(): number {
            return this._angle
        }
        set viewAngle(angle: number) {
            this._angle = angle
            this.setVectors()
            this.updateSelfImage()
        }

        get wallZScale(): number {
            return this._wallZScale
        }
        set wallZScale(v: number) {
            this._wallZScale = v
        }

        getMotionZ(spr: Sprite, offsetZ: number = 0) {
            let motionZ = this.spriteMotionZ[spr.id]
            if (!motionZ) {
                motionZ = new MotionSet1D(tofpx(offsetZ))
                this.spriteMotionZ[spr.id] = motionZ
            }
            return motionZ
        }

        getZOffset(spr: Sprite) {
            return this.getMotionZ(spr).offset / fpx_scale
        }

        setZOffset(spr: Sprite, offsetZ: number, duration: number = 500) {
            const motionZ = this.getMotionZ(spr, offsetZ)

            motionZ.offset = tofpx(offsetZ)
            if (motionZ.p != motionZ.offset) {
                if (duration === 0)
                    motionZ.p = motionZ.offset
                else if (motionZ.v == 0)
                    this.move(spr, (motionZ.offset - motionZ.p) / fpx_scale * 1000 / duration, 0)
            }
        }

        getMotionZPosition(spr: Sprite) {
            return this.getMotionZ(spr).p / fpx_scale
        }

        //todo, use ZHeight(set from sprite.Height when takeover, then sprite.Height will be replace with width)
        isOverlapZ(sprite1: Sprite, sprite2: Sprite): boolean {
            const p1 = this.getMotionZPosition(sprite1)
            const p2 = this.getMotionZPosition(sprite2)
            if (p1 < p2) {
                if (p1 + sprite1.height > p2) return true
            } else {
                if (p2 + sprite2.height > p1) return true
            }
            return false
        }

        move(spr: Sprite, v: number, a: number) {
            const motionZ = this.getMotionZ(spr)

            motionZ.v = tofpx(v)
            motionZ.a = tofpx(a)
        }

        jump(spr: Sprite, v: number, a: number) {
            const motionZ = this.getMotionZ(spr)
            if (motionZ.p != motionZ.offset)
                return

            motionZ.v = tofpx(v)
            motionZ.a = tofpx(a)
        }

        jumpWithHeightAndDuration(spr: Sprite, height: number, duration: number) {
            const motionZ = this.getMotionZ(spr)
            if (motionZ.p != motionZ.offset)
                return

            // height= -v*v/a/2
            // duration = -v/a*2 *1000
            const v = height * 4000 / duration
            const a = -v * 2000 / duration
            motionZ.v = tofpx(v)
            motionZ.a = tofpx(a)
        }

        get viewMode(): ViewMode {
            return this._viewMode
        }

        set viewMode(v: ViewMode) {
            this._viewMode = v
        }

        updateViewZPos() {
            this.viewZPos = this.spriteMotionZ[this.sprSelf.id].p + (this.sprSelf._height as any as number) - (2 << fpx)
        }

        takeoverSceneSprites() {
            const sc_allSprites = game.currentScene().allSprites
            for (let i = 0; i < sc_allSprites.length;) {
                const spr = sc_allSprites[i]
                if (spr instanceof Sprite) {
                    const sprList = (spr.flags & sprites.Flag.RelativeToCamera) ? this.sprites2D : this.sprites
                    if (sprList.indexOf(spr) < 0) {
                        sprList.push(spr as Sprite)
                        this.getMotionZ(spr, 0)
                        spr.onDestroyed(() => {
                            this.sprites.removeElement(spr as Sprite)   //can be in one of 2 lists
                            this.sprites2D.removeElement(spr as Sprite) //can be in one of 2 lists
                            const sayRenderer = this.sayRederers[spr.id]
                            if (sayRenderer) {
                                this.sayRederers.removeElement(sayRenderer)
                                sayRenderer.destroy()
                            }
                        })
                    }
                } else if (spr instanceof particles.ParticleSource) {
                    const particle = (spr as particles.ParticleSource)
                    if (this.spriteParticles.indexOf(particle) < 0) {
                        this.spriteParticles[(particle.anchor as Sprite).id] = particle
                        particle.anchor = this.tempSprite
                    }
                } else {
                    if (this.spriteLikes.indexOf(spr) < 0)
                        this.spriteLikes.push(spr)
                }
                sc_allSprites.removeElement(spr)
            }
            this.sprites.forEach((spr) => {
                if (spr)
                    this.takeoverSayRenderOfSprite(spr)
            })
        }
        takeoverSayRenderOfSprite(sprite: Sprite) {
            const sprite_as_any = (sprite as any)
            if (sprite_as_any.sayRenderer) {
                this.sayRederers[sprite.id] = sprite_as_any.sayRenderer
                this.sayEndTimes[sprite.id] = sprite_as_any.sayEndTime;
                sprite_as_any.sayRenderer = undefined
                sprite_as_any.sayEndTime = undefined
            }
        }

        tilemapLoaded() {
            const sc = game.currentScene()
            this.map = sc.tileMap.data
            this.textures = sc.tileMap.data.getTileset()
            this.tilemapScaleSize = 1 << sc.tileMap.data.scale
            this.oldRender = sc.tileMap.renderable
            this.spriteLikes.removeElement(this.oldRender)
            sc.allSprites.removeElement(this.oldRender)

            let frameCallback_update = sc.eventContext.registerFrameHandler(scene.PRE_RENDER_UPDATE_PRIORITY + 1, () => {
                const dt = sc.eventContext.deltaTime;
                // sc.camera.update();  // already did in scene
                for (const s of this.sprites)
                    s.__update(sc.camera, dt);
                this.sprSelf.__update(sc.camera, dt)
            })

            let frameCallback_draw = sc.eventContext.registerFrameHandler(scene.RENDER_SPRITES_PRIORITY + 1, () => {
                if (this._viewMode == ViewMode.tilemapView) {
                   // screen.drawImage(sc.background.image, 0, 0)
                    this.oldRender.__drawCore(sc.camera)
                    this.sprites.forEach(spr => spr.__draw(sc.camera))
                    this.sprSelf.__draw(sc.camera)
                } else {
                 //   this.tempScreen.drawImage(sc.background.image, 0, 0)
                    //debug
                    // const ms=control.micros()
                    this.render()
                    // info.setScore(control.micros()-ms)
                    screen.fill(0)
                }
                this.sprites2D.forEach(spr => spr.__draw(sc.camera))
                this.spriteLikes.forEach(spr => spr.__draw(sc.camera))
                if (this._viewMode == ViewMode.raycastingView)
                    this.tempScreen.drawTransparentImage(screen, 0, 0)
            })

            sc.tileMap.addEventListener(tiles.TileMapEvent.Unloaded, data => {
                sc.eventContext.unregisterFrameHandler(frameCallback_update)
                sc.eventContext.unregisterFrameHandler(frameCallback_draw)
            })

            // this.myRender = scene.createRenderable(
            //     scene.TILE_MAP_Z,
            //     (t, c) => this.trace(t, c)
            // )

        }

        constructor() {
            this._angle = 0
            this.fov = defaultFov
            this.camera = new scene.Camera()

            const sc = game.currentScene()
            if (!sc.tileMap) {
                sc.tileMap = new tiles.TileMap();
            } else {
                this.tilemapLoaded()
            }
            game.currentScene().tileMap.addEventListener(tiles.TileMapEvent.Loaded, data => this.tilemapLoaded())

            //self sprite
            this.sprSelf = sprites.create(image.create(this.tilemapScaleSize >> 1, this.tilemapScaleSize >> 1), SpriteKind.Player)
            this.takeoverSceneSprites()
            this.sprites.removeElement(this.sprSelf)
            this.updateViewZPos()
            scene.cameraFollowSprite(this.sprSelf)
            this.updateSelfImage()

            game.onUpdate(function () {
                this.updateControls()
            })

            game.onUpdateInterval(400, () => {
                for (let i = 0; i < this.sprites.length;) {
                    const spr = this.sprites[i]
                    if (spr.flags & sprites.Flag.RelativeToCamera) {
                        this.sprites.removeElement(spr)
                        this.sprites2D.push(spr)
                    } else { i++ }
                }
                for (let i = 0; i < this.sprites2D.length;) {
                    const spr = this.sprites2D[i]
                    if (!(spr.flags & sprites.Flag.RelativeToCamera)) {
                        this.sprites2D.removeElement(spr)
                        this.sprites.push(spr)
                    } else { i++ }
                }
                this.takeoverSceneSprites() // in case some one new
            })


            game.onUpdateInterval(25, () => {
                if (this.cameraSway && this.isWalking) {
                    this.cameraOffsetX = (Math.sin(control.millis() / 150) * this.cameraSway * 3) | 0
                    this.cameraOffsetZ_fpx = tofpx(Math.cos(control.millis() / 75) * this.cameraSway) | 0
                }
            });
            control.__screen.setupUpdate(() => {
                if (this.viewMode == ViewMode.raycastingView)
                    updateScreen(this.tempScreen)
                else
                    updateScreen(screen)
            })

            game.addScenePushHandler((oldScene) => {
                control.__screen.setupUpdate(() => { updateScreen(screen) })
            })
            game.addScenePopHandler((oldScene) => {
                control.__screen.setupUpdate(() => {
                    if (this.viewMode == ViewMode.raycastingView)
                        updateScreen(this.tempScreen)
                    else
                        updateScreen(screen)
                })
            })
        }

        private setVectors() {
            const sin = Math.sin(this._angle)
            const cos = Math.cos(this._angle)
            this.dirXFpx = tofpx(cos)
            this.dirYFpx = tofpx(sin)
            this.planeX = tofpx(sin * this._fov)
            this.planeY = tofpx(cos * -this._fov)
        }

        //todo, pre-drawn dirctional image
        public updateSelfImage() {
            const img = this.sprSelf.image
            img.fill(6)
            const arrowLength = img.width / 2
            img.drawLine(arrowLength, arrowLength, arrowLength + this.dirX * arrowLength, arrowLength + this.dirY * arrowLength, 2)
            img.fillRect(arrowLength - 1, arrowLength - 1, 2, 2, 2)
        }

        updateControls() {
            if (this.velocityAngle !== 0) {
                const dx = controller.dx(this.velocityAngle)
                if (dx) {
                    this.viewAngle += dx
                }
            }
            if (this.velocity !== 0) {
                this.isWalking = true
                const dy = controller.dy(this.velocity)
                if (dy) {
                    const nx = this.xFpx - Math.round(this.dirXFpx * dy)
                    const ny = this.yFpx - Math.round(this.dirYFpx * dy)
                    this.sprSelf.setPosition((nx * this.tilemapScaleSize / fpx_scale), (ny * this.tilemapScaleSize / fpx_scale))
                } else {
                    this.isWalking = false
                }
            }

            for (const spr of this.sprites) {
                this.updateMotionZ(spr)
            }
            this.updateMotionZ(this.sprSelf)
        }

        updateMotionZ(spr: Sprite) {
            const dt = game.eventContext().deltaTime
            const motionZ = this.spriteMotionZ[spr.id]
            //if (!motionZ) continue

            if (motionZ.v != 0 || motionZ.p != motionZ.offset) {
                motionZ.v += motionZ.a * dt, motionZ.p += motionZ.v * dt
                //landing
                if ((motionZ.a >= 0 && motionZ.v > 0 && motionZ.p > motionZ.offset) ||
                    (motionZ.a <= 0 && motionZ.v < 0 && motionZ.p < motionZ.offset)) { motionZ.p = motionZ.offset, motionZ.v = 0 }
                if (spr === this.sprSelf)
                    this.updateViewZPos()
            }

        }


        blitRowBreak(screenX: number, screenUp: number, screenDown: number, source: Image, sourceX: number, sourceYBreak: number) {

            let stepY = (sourceYBreak) / (SHHalf - screenUp )
            let sourceY = sourceYBreak - stepY
            let y = SHHalf -1
            if (screenUp < 0)
                screenUp = 0
            while (y  >= Math.ceil(screenUp)-1) {
                if (sourceY < 0) 
                    sourceY = 0
                const c = source.getPixel(sourceX, sourceY)
                this.tempScreen.setPixel(screenX, y, c)
                y--
                sourceY -= stepY
            }
            // from screen half  going down
            stepY = (source.height - sourceYBreak) / (screenDown - SHHalf)
            sourceY = sourceYBreak 
            y = SHHalf
            if (screenDown > SH)
                screenDown = SH
            while (y < Math.round(screenDown)) {
                const c = source.getPixel(sourceX, sourceY)
                this.tempScreen.setPixel(screenX, y, c)
                y++
                sourceY += stepY
            }

        }
        
        render() {
            // based on https://lodev.org/cgtutor/raycasting.html
            this.selfXFpx = this.xFpx
            this.selfYFpx = this.yFpx

            let drawStart = 0
            let drawHeight = 0
            let lastDist = -1, lastTexX = -1, lastMapX = -1, lastMapY = -1
            this.viewZPos = this.spriteMotionZ[this.sprSelf.id].p + (this.sprSelf._height as any as number) - (2 << fpx) + this.cameraOffsetZ_fpx
            let cameraRangeAngle = Math.atan(this.fov) + .1 //tolerance for spr center just out of camera
            //debug
            // const ms=control.millis()

            


            const tex = this.textures[1]
            let rayDirX0 = this.dirXFpx / fpx_scale + (this.planeX / fpx_scale)
            let rayDirY0 = this.dirYFpx / fpx_scale + (this.planeY / fpx_scale)
            let rayDirX1 = this.dirXFpx / fpx_scale - (this.planeX / fpx_scale)
            let rayDirY1 = this.dirYFpx / fpx_scale - (this.planeY / fpx_scale)
            let fmapX = this.selfXFpx / fpx_scale
            let fmapY = this.selfYFpx / fpx_scale

            const sc = game.currentScene() 
           // background
            const speed = 2 // 2: normal speed
            let backgroundOffset = (this._angle / Math.PI * speed ) % 1  // range -1..1
            if (backgroundOffset < 0) backgroundOffset++  // range 0..1
            backgroundOffset *= SW    // range 0..screenwidth
            
            //floor
            for (let y = 60; y < SH; y++) {
                let p = y - SHHalf
                let posZ = SH * this.viewZPos / this.tilemapScaleSize / fpx_scale
                let rowDistance = posZ / p
                let floorStepX = rowDistance * (rayDirX1 - rayDirX0) / SW
                let floorStepY = rowDistance * (rayDirY1 - rayDirY0) / SW



                let floorX = fmapX + rowDistance * rayDirX0
                let floorY = fmapY + rowDistance * rayDirY0
                for (let x = 0; x < SW; x++) {
                      let cellX = Math.floor(floorX)
                     let cellY = Math.floor(floorY)
                    let tx =  (16 * (floorX - cellX)) & 15
                      let ty = (16 * (floorY - cellY)) & (15)
                    let mapX = Math.round(floorX - 0.5) % 16
                    let mapY = Math.round(floorY - 0.5) % 16
                    let tileType = this.map.getTile(mapX, mapY)
                    let floorTex = this.textures[tileType]
                    floorX += floorStepX
                    floorY += floorStepY
                    let c = floorTex.getPixel(tx, ty)
                    this.tempScreen.setPixel(x, y, c)

                }



            }
            // walls

            for (let x = 0; x < SW; x++) {
                const cameraX: number = one - Math.idiv(((x + this.cameraOffsetX) << fpx) << 1, SW)
                let rayDirX = this.dirXFpx + (this.planeX * cameraX >> fpx)
                let rayDirY = this.dirYFpx + (this.planeY * cameraX >> fpx)

                // avoid division by zero
                if (rayDirX == 0) rayDirX = 1
                if (rayDirY == 0) rayDirY = 1

                let mapX = this.selfXFpx >> fpx
                let mapY = this.selfYFpx >> fpx

                // length of ray from current position to next x or y-side
                let sideDistX = 0, sideDistY = 0

                // length of ray from one x or y-side to next x or y-side
                const deltaDistX = Math.abs(Math.idiv(one2, rayDirX));
                const deltaDistY = Math.abs(Math.idiv(one2, rayDirY));

                let mapStepX = 0, mapStepY = 0

                let sideWallHit = false;

                //calculate step and initial sideDist
                if (rayDirX < 0) {
                    mapStepX = -1;
                    sideDistX = ((this.selfXFpx - (mapX << fpx)) * deltaDistX) >> fpx;
                } else {
                    mapStepX = 1;
                    sideDistX = (((mapX << fpx) + one - this.selfXFpx) * deltaDistX) >> fpx;
                }
                if (rayDirY < 0) {
                    mapStepY = -1;
                    sideDistY = ((this.selfYFpx - (mapY << fpx)) * deltaDistY) >> fpx;
                } else {
                    mapStepY = 1;
                    sideDistY = (((mapY << fpx) + one - this.selfYFpx) * deltaDistY) >> fpx;
                }

                let color = 0

                while (true) {
                    //jump to next map square, OR in x-direction, OR in y-direction
                    if (sideDistX < sideDistY) {
                        sideDistX += deltaDistX;
                        mapX += mapStepX;
                        sideWallHit = false;
                    } else {
                        sideDistY += deltaDistY;
                        mapY += mapStepY;
                        sideWallHit = true;
                    }

                    if (this.map.isOutsideMap(mapX, mapY))
                        break
                    color = this.map.getTile(mapX, mapY)
                    if  (this.map.isWall(mapX, mapY))
                        break; // hit!
                }

                if (this.map.isOutsideMap(mapX, mapY))
                    continue

                let perpWallDist = 0
                let wallX = 0
                if (!sideWallHit) {
                    perpWallDist = Math.idiv(((mapX << fpx) - this.selfXFpx + (1 - mapStepX << fpx - 1)) << fpx, rayDirX)
                    wallX = this.selfYFpx + (perpWallDist * rayDirY >> fpx);
                } else {
                    perpWallDist = Math.idiv(((mapY << fpx) - this.selfYFpx + (1 - mapStepY << fpx - 1)) << fpx, rayDirY)
                    wallX = this.selfXFpx + (perpWallDist * rayDirX >> fpx);
                }
                wallX &= FPX_MAX

                // color = (color - 1) * 2
                // if (sideWallHit) color++

                const tex = this.textures[color]
                if (!tex)
                    continue

                let texX = (wallX * tex.width) >> fpx;
                // if ((!sideWallHit && rayDirX > 0) || (sideWallHit && rayDirY < 0))
                //     texX = tex.width - texX - 1;

                const lineHeight = (this.wallHeightInView / perpWallDist)
                const drawEnd = lineHeight * this.viewZPos / this.tilemapScaleSize / fpx_scale;
                const horizontBreak = 1 - this.viewZPos / this.tilemapScaleSize / fpx_scale;
                if (perpWallDist !== lastDist && (texX !== lastTexX || mapX !== lastMapX || mapY !== lastMapY)) {//neighbor line of tex share same parameters
                     
                    drawStart = drawEnd - lineHeight * (this._wallZScale) ;
                    drawHeight = (Math.ceil(drawEnd) - Math.ceil(drawStart) )
                    drawStart += (SH >> 1)

                    lastDist = perpWallDist
                    lastTexX = texX
                    lastMapX = mapX
                    lastMapY = mapY
                }
                //fix start&end points to avoid regmatic between lines
               

                //if (x < SWHalf)
                //    this.tempScreen.blitRow(x, drawStart, tex, texX, drawHeight)
                //else
                    this.blitRowBreak(x, SHHalf + drawEnd - lineHeight, SHHalf + drawEnd, tex, texX, tex.height * horizontBreak)

                this.dist[x] = perpWallDist

                // background 
                for (let y = 0; y < drawStart; y++ ){
                    let backX = (backgroundOffset + x) % SW
                    let c = sc.background.image.getPixel(backX,y)
                    this.tempScreen.setPixel(x,y,c)
                }
            }
            //debug
            // info.setScore(control.millis()-ms)
           // this.tempScreen.print(backgroundOffset.toString(), 0,0,7 )
           // this.tempScreen.print([Math.roundWithPrecision(this._angle, 3)].join(), 20, 5)

            this.drawSprites()
        }

        drawSprites() {
            //debug
            // let msSprs=control.millis()
            /////////////////// sprites ///////////////////

            //for sprite
            const invDet = one2 / (this.planeX * this.dirYFpx - this.dirXFpx * this.planeY); //required for correct matrix multiplication

            this.sprites
                .filter((spr, i) => {
                    const spriteX = this.sprXFx8(spr) - this.xFpx // this.selfXFpx
                    const spriteY = this.sprYFx8(spr) - this.yFpx // this.selfYFpx
                    this.angleSelfToSpr[spr.id] = Math.atan2(spriteX, spriteY)
                    this.transformX[spr.id] = invDet * (this.dirYFpx * spriteX - this.dirXFpx * spriteY) >> fpx;
                    this.transformY[spr.id] = invDet * (-this.planeY * spriteX + this.planeX * spriteY) >> fpx; //this is actually the depth inside the screen, that what Z is in 3D
                    const angleInCamera = Math.atan2(this.transformX[spr.id] * this.fov, this.transformY[spr.id])
                    return angleInCamera > -this.cameraRangeAngle && angleInCamera < this.cameraRangeAngle //(this.transformY[spr.id] > 0
                }).sort((spr1, spr2) => {   // far to near
                    return (this.transformY[spr2.id] - this.transformY[spr1.id])
                }).forEach((spr, index) => {
                    //debug
                    // this.tempScreen.print([spr.id,Math.roundWithPrecision(angle[spr.id],3)].join(), 0, index * 10 + 10,9)
                    this.drawSprite(spr, index, this.transformX[spr.id], this.transformY[spr.id], this.angleSelfToSpr[spr.id])
                })

            //debug
            // info.setLife(control.millis() - msSprs+1)
             //this.tempScreen.print([Math.roundWithPrecision(this._angle,3)].join(), 20,  0)

        }

        registerOnSpriteDirectionUpdate(handler: (spr: Sprite, dir: number) => void) {
            this.onSpriteDirectionUpdateHandler = handler
        }

        drawSprite(spr: Sprite, index: number, transformX: number, transformY: number, myAngle: number) {
            const spriteScreenX = Math.ceil((SWHalf) * (1 - transformX / transformY)) - this.cameraOffsetX;
            const spriteScreenHalfWidth = Math.idiv((spr._width as any as number) / this.tilemapScaleSize / 2 * this.wallWidthInView, transformY)  //origin: (texSpr.width / 2 << fpx) / transformY / this.fov / 3 * 2 * 4
            const spriteScreenLeft = spriteScreenX - spriteScreenHalfWidth
            const spriteScreenRight = spriteScreenX + spriteScreenHalfWidth

            //calculate drawing range in X direction
            //assume there is one range only
            let blitX = 0, blitWidth = 0
            for (let sprX = 0; sprX < SW; sprX++) {
                if (this.dist[sprX] > transformY) {
                    if (blitWidth == 0)
                        blitX = sprX
                    blitWidth++
                } else if (blitWidth > 0) {
                    if (blitX <= spriteScreenRight && blitX + blitWidth >= spriteScreenLeft)
                        break
                    else
                        blitX = 0, blitWidth = 0;
                }
            }
            // this.tempScreen.print([this.getxFx8(spr), this.getyFx8(spr)].join(), 0,index*10+10)
            const blitXSpr = Math.max(blitX, spriteScreenLeft)
            const blitWidthSpr = Math.min(blitX + blitWidth, spriteScreenRight) - blitXSpr
            if (blitWidthSpr <= 0)
                return

            const lineHeight = Math.idiv(this.wallHeightInView, transformY)
            const drawStart = SHHalf + (lineHeight * ((this.viewZPos - this.spriteMotionZ[spr.id].p - (spr._height as any as number)) / this.tilemapScaleSize) >> fpx)

            //for textures=image[][], abandoned
            //    const texSpr = spr.getTexture(Math.floor(((Math.atan2(spr.vxFx8, spr.vyFx8) - myAngle) / Math.PI / 2 + 2-.25) * spr.textures.length +.5) % spr.textures.length)
            //for deal in user code
            if (this.onSpriteDirectionUpdateHandler)
                this.onSpriteDirectionUpdateHandler(spr, ((Math.atan2(spr._vx as any as number, spr._vy as any as number) - myAngle) / Math.PI / 2 + 2 - .25))
            //for CharacterAnimation ext.
            //     const iTexture = Math.floor(((Math.atan2(spr._vx as any as number, spr._vy as any as number) - myAngle) / Math.PI / 2 + 2 - .25) * 4 + .5) % 4
            //     const characterAniDirs = [Predicate.MovingLeft,Predicate.MovingDown, Predicate.MovingRight, Predicate.MovingUp]
            //     character.setCharacterState(spr, character.rule(characterAniDirs[iTexture]))
            //for this.spriteAnimations
            const texSpr = !this.spriteAnimations[spr.id] ? spr.image : this.spriteAnimations[spr.id].getFrameByDir(((Math.atan2(spr._vx as any as number, spr._vy as any as number) - myAngle) / Math.PI / 2 + 2 - .25))

            const sprTexRatio = texSpr.width / spriteScreenHalfWidth / 2
            helpers.imageBlit(
                this.tempScreen,
                blitXSpr,
                drawStart,
                blitWidthSpr,
                lineHeight * spr.height / this.tilemapScaleSize,
                texSpr,
                (blitXSpr - (spriteScreenX - spriteScreenHalfWidth)) * sprTexRatio
                ,
                0,
                blitWidthSpr * sprTexRatio, texSpr.height, true, false)

            screen.fill(0)
            const fpx_div_transformy = Math.roundWithPrecision(transformY / 4 / fpx_scale, 2)
            const height = (SH / fpx_div_transformy)
            const blitXSaySrc = ((blitX - spriteScreenX) * fpx_div_transformy) + SWHalf
            const blitWidthSaySrc = (blitWidth * fpx_div_transformy)

            //sprite
            // screen.drawImage(texSpr, SWHalf-texSpr.width/2, SHHalf)
            //sayText
            const sayRender = this.sayRederers[spr.id]
            if (sayRender) {
                if (this.sayEndTimes[spr.id] && control.millis() > this.sayEndTimes[spr.id]) {
                    this.sayRederers[spr.id] = undefined
                } else {
                    this.tempSprite.x = SWHalf
                    this.tempSprite.y = SHHalf + 2
                    this.camera.drawOffsetX = 0
                    this.camera.drawOffsetY = 0
                    sayRender.draw(screen, this.camera, this.tempSprite)
                }
            }
            //particle
            const particle = this.spriteParticles[spr.id]
            if (particle) {
                if (particle.lifespan) {
                    //debug
                    // this.tempScreen.print([spr.id].join(), 0,index*10+10)
                    this.tempSprite.x = SWHalf
                    this.tempSprite.y = SHHalf + spr.height
                    this.camera.drawOffsetX = 0//spr.x-SWHalf
                    this.camera.drawOffsetY = 0//spr.y-SH
                    particle.__draw(this.camera)
                } else {
                    this.spriteParticles[spr.id] = undefined
                }
            }
            //update screen for this spr
            // const sayTransformY = 
            if (blitXSaySrc <= 0) { //imageBlit considers negative value as 0
                helpers.imageBlit(
                    this.tempScreen,
                    spriteScreenX - SWHalf / fpx_div_transformy, drawStart - height / 2, (blitWidthSaySrc + blitXSaySrc) / fpx_div_transformy, height,
                    screen,
                    0, 0, blitWidthSaySrc + blitXSaySrc, SH, true, false)
            } else {
                helpers.imageBlit(
                    this.tempScreen,
                    // blitX, drawStart - height / 2 , blitWidth, height,
                    blitX, drawStart - height / 2, blitWidth, height,
                    screen,
                    blitXSaySrc, 0, blitWidthSaySrc, SH,
                    true, false)
            }
        }
    }

    //%fixedinstance
    export const raycastingRender = new Render.RayCastingRender()
}

