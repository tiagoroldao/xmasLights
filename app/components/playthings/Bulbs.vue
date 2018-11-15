
<template>
    <GridLayout 
        columns="*,*" 
        rows="*,70" 
        backgroundColor="lightgray" 
        ref="canvasGrid">
        <CameraPlus 
            v-if="mode == 'draw'"
            col="0" 
            colSpan="2"
            row="0" 
            debug="true" 
            autoFocus="false"
            showFlashIcon="false" 
            showToggleIcon="false"
            showCaptureIcon="false" 
            showGalleryIcon="false"
            ref="cameraPlus"
            @loaded="camLoaded">
        </CameraPlus>
        <Canvas 
            :active="active"
            class="canvas"
            @loaded="updateArray"
            @layoutChanged="updateArray"
            @render="render"
            @touch="touch"
            col="0" 
            colSpan="2"
            row="0"/>
        <Button 
            :text="mode === 'paint' ? 'Paint Bulbs' : 'Cancel'" 
            @tap="changeMode"
            col="0" 
            colSpan="1"
            row="1" />
        <Button 
            :text="disposition === 'grid' ? 'Painted' : 'Grid'" 
            @tap="changeDisposition"
            col="1" 
            colSpan="1"
            row="1" />
    </GridLayout>
</template>
<script lang="ts">
import * as platformModule from "tns-core-modules/platform";
import * as applicationModule from "tns-core-modules/application";
import { TouchGestureEventData } from "tns-core-modules/ui/gestures";
import * as Victor from "victor";
import Canvas from "~/components/common/Canvas.vue";
import { calcMinGrid, distToSegment } from "~/util/layoutBulbs.ts";
import { CameraPlus } from '@nstudio/nativescript-camera-plus';

declare type ModeType = 'draw' | 'paint';
declare type Disposition = 'grid' | 'painted';

export default {
    components: {
        Canvas
    },
    props: {
        active: false,
    },
    watch: {
        active: {
            handler() {
                this.resetBulbs();
            },
            immediate: true,
        }
    },
    data() {
        return {
            scale: platformModule.screen.mainScreen.scale,
            bulbs: [],
            bulbLength: 100,
            touchRadius: 30,
            brushValue: null,
            prevFingerPos: null,
            fadeTime: 2000,
            bulbStyle: {
                outerStrokeColor: android.graphics.Color.argb(255,0,0,0),
                innerStrokeColor: android.graphics.Color.argb(255,255,255,255),
                innerStrokeWidth: 2,
                outerStrokeWidth: 2,
                size: 10,
                touchRadius: 15,
            },
            bulbDrawStyle: {
                outerStrokeColor: android.graphics.Color.argb(255,255,0,0),
                innerStrokeColor: android.graphics.Color.argb(0,0,0,0),
                innerStrokeWidth: 2,
                outerStrokeWidth: 2,
                size: 3,
                touchRadius: 15,
            },
            wireStyle: {
                strokeColor: android.graphics.Color.argb(255,38,150,94),
                strokeWidth: 4,
            },
            mode: 'paint' as ModeType,
            disposition: 'grid' as Disposition,
            currentBulb: 0,
            cam: null as CameraPlus,
        };
    },
    created() {
        (new CameraPlus()).requestCameraPermissions();

        for (let i = 0; i < this.bulbLength; i++) {
            this.bulbs.push({
                on: false,
                touched: false,
                pos: new Victor(0, 0),
                paintedPos: new Victor(0, 0),
                paintedPosTemp: new Victor(0, 0),
            })
        }
    },
    methods: {
        camLoaded(e) {
            this.cam = e.object as CameraPlus;
        },
        resetBulbs() {
            this.sendMessage('0');
            this.bulbs.forEach(bulb => {
                bulb.on = false;
                bulb.brightness = 0;
            });
        },
        changeMode() {
            if (this.mode === 'draw') {
                this.setMode('paint');
            } else {
                this.setMode('draw');
            }
        },
        changeDisposition() {
            if (this.disposition === 'grid') {
                this.disposition = 'painted';
            } else {
                this.disposition = 'grid';
            }
        },
        setBulb(index, on) {
            this.bulbs[index].on = on;
            this.bulbs[index].brightness = on ? 255 : 0;
            let message = `B${this.bulbs[index].on ? '1' : '0'}${index}`;
            this.sendMessage(message);
        },
        sendMessage(message) {
            this.$emit('message', message);
        },
        touch(event: TouchGestureEventData) {
            if (this.mode === 'paint') {
                this.touchPaint(event);
            } else if (this.mode === 'draw') {
                this.touchDraw(event);
            }
        },
        touchPaint(event: TouchGestureEventData) {
            if (event.action === 'up') {
                this.brushValue = null;
                this.bulbs.forEach(bulb => {
                    bulb.touched = false;
                });
                this.prevFingerPos = null;
            } else {
                const fingerPos = new Victor(
                    event.getX() * this.scale, 
                    event.getY() * this.scale);
                const maxDist = (this.bulbStyle.touchRadius + this.touchRadius) * this.scale;
                this.bulbs.forEach((bulb, index) => {
                    let bulbPos = this.getBulbPos(bulb);
                    if (fingerPos.distance(bulbPos) < maxDist ||
                        (this.prevFingerPos && distToSegment(bulbPos, fingerPos, this.prevFingerPos) < maxDist)) {
                        if (!bulb.touched) {
                            bulb.touched = true; 
                            this.setBulb(index, true);
                        }
                    } else {
                        bulb.touched = false;
                    }
                });
                this.prevFingerPos = fingerPos;
            }
        },
        touchDraw(event: TouchGestureEventData) {
            if (event.action === 'down') {
                this.bulbs[this.currentBulb].paintedPosTemp = new Victor(
                    event.getX() * this.scale, 
                    event.getY() * this.scale);
                this.currentBulb++;
                if (this.currentBulb >= this.bulbs.length) {
                    for (let i = 0; i < this.bulbs.length; i++) {
                        this.bulbs[i].paintedPos.x = this.bulbs[i].paintedPosTemp.x;
                        this.bulbs[i].paintedPos.y = this.bulbs[i].paintedPosTemp.y;
                    }
                    this.setMode('paint');
                    this.disposition = 'painted';
                } else {
                    this.sendMessage(`S${this.currentBulb}`);
                }
            }
        },
        setMode(mode) {
            this.mode = mode;
            if (mode === 'draw') {
                this.currentBulb = 0;
                this.sendMessage('S0');
            } else {
                this.sendMessage('0');
            }
        },
        updateArray(canvas) {
            const padding = 20 * platformModule.screen.mainScreen.scale;
            const grid = calcMinGrid(
                this.bulbs.length, 
                canvas.getWidth() - (padding * 2), 
                canvas.getHeight() - (padding * 2));
            let x = 0;
            let y = 0;
            
            this.bulbs[0].pos.x = padding;
            this.bulbs[0].pos.y = padding;
            for (let i = 1; i < this.bulbLength; i++) {
                y = Math.floor(i / grid.width);
                x = i % grid.width;
                if (y % 2) {
                    x = grid.width - 1 - x;
                }

                this.bulbs[i].pos.x = x * grid.cellWidth + padding;
                this.bulbs[i].pos.y = y * grid.cellHeight + padding;
            }
        },
        render({canvas, totalTime, deltaTime}: {canvas: android.graphics.Canvas, totalTime: number, deltaTime: number}) {
            canvas.drawColor(android.graphics.Color.TRANSPARENT, android.graphics.PorterDuff.Mode.CLEAR);
            const maxBulb = this.mode === 'draw' ? this.currentBulb : this.bulbs.length;
            
            if (this.mode === 'paint') {
                for (let i = 1; i < maxBulb; i++) {
                    this.drawWire(canvas, i - 1, i);
                }
            }

            for (let i = 0; i < maxBulb; i++) {
                this.updateBulb(i, deltaTime);
                this.drawBulb(canvas, i, deltaTime);
            }
        },
        drawBulb(canvas: android.graphics.Canvas, index: number, deltaTime: number) {
            let color = new android.graphics.Paint();
            const pos = this.getBulbPos(this.bulbs[index]);
            const bulbStyle = this.mode === 'paint' ? this.bulbStyle : this.bulbDrawStyle;

            color.setAntiAlias(true);
            color.setStrokeWidth(bulbStyle.outerStrokeWidth * this.scale);

            color.setColor(bulbStyle.outerStrokeColor);
            color.setStyle(android.graphics.Paint.Style.STROKE);
            canvas.drawCircle(
                pos.x,
                pos.y,
                (bulbStyle.size + bulbStyle.innerStrokeWidth) * this.scale,
                color
            );
            color.setColor(bulbStyle.innerStrokeColor);
            color.setStyle(android.graphics.Paint.Style.STROKE);
            canvas.drawCircle(
                pos.x,
                pos.y,
                bulbStyle.size * this.scale,
                color
            );
            
            if (this.mode === 'paint') {
                let brightness = Math.max(0, Math.floor(this.bulbs[index].brightness));
                color.setARGB(255, brightness, brightness, brightness);

                color.setStyle(android.graphics.Paint.Style.FILL);
                canvas.drawCircle(
                    pos.x,
                    pos.y,
                    bulbStyle.size * this.scale,
                    color
                );
            }
        },
        updateBulb(index: number, deltaTime: number) {
            this.bulbs[index].brightness = Math.max(0, this.bulbs[index].brightness - ((deltaTime/this.fadeTime) * 255));
            if (this.bulbs[index].brightness === 0) {
                this.bulbs[index].on = false;
            }
        },
        drawWire(canvas: android.graphics.Canvas, fromIndex, toIndex) {
            let color = new android.graphics.Paint();
            const fromPos = this.getBulbPos(this.bulbs[fromIndex]);
            const toPos = this.getBulbPos(this.bulbs[toIndex]);

            color.setAntiAlias(true);
            color.setStrokeWidth(this.wireStyle.strokeWidth * this.scale);
            color.setColor(this.wireStyle.strokeColor);
            color.setStyle(android.graphics.Paint.Style.STROKE);
            canvas.drawLine (
                fromPos.x,
                fromPos.y,
                toPos.x,
                toPos.y,
                color);
        },
        getBulbPos(bulb) {
            if (this.mode === 'draw') {
                return bulb.paintedPosTemp;
            } else if (this.disposition === 'painted') {
                return bulb.paintedPos;
            }
            return bulb.pos;
        }
    }
};
</script>

<style scoped lang="scss">
    .canvas {
        z-index: 10;
    }
    .bg-button {
        z-index: 0;
    }
</style>
