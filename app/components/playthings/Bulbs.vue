
<template>
    <GridLayout 
        columns="*" 
        rows="*" 
        backgroundColor="lightgray" 
        ref="canvasGrid">
        <Canvas 
            :active="active"
            @loaded="updateArray"
            @layoutChanged="updateArray"
            @render="render"
            @touch="touch"
            col="0" 
            row="0"/>
    </GridLayout>
</template>
<script lang="ts">
import * as platformModule from "tns-core-modules/platform";
import * as applicationModule from "tns-core-modules/application";
import { TouchGestureEventData } from "tns-core-modules/ui/gestures";
import * as Victor from "victor";
import Canvas from "~/components/common/Canvas.vue";
import { calcMinGrid, distToSegment } from "~/util/layoutBulbs.ts";

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
            touchRadius: 15,
            brushValue: null,
            prevFingerPos: null,
            bulbStyle: {
                outerStrokeColor: android.graphics.Color.argb(255,0,0,0),
                innerStrokeColor: android.graphics.Color.argb(255,255,255,255),
                innerStrokeWidth: 2,
                outerStrokeWidth: 2,
                size: 10,
                touchRadius: 15,
            },
            wireStyle: {
                strokeColor: android.graphics.Color.argb(255,38,150,94),
                strokeWidth: 4,
            }
        };
    },
    created() {
        for (let i = 0; i < this.bulbLength; i++) {
            this.bulbs.push({
                on: false,
                touched: false,
                pos: new Victor(0, 0),
            })
        }
    },
    methods: {
        resetBulbs() {
            this.sendMessage('0');
            this.bulbs.forEach(bulb => {
                bulb.on = false;
            });
        },
        toggleBulb(index) {
            this.setBulb(index, !this.bulbs[index].on);
        },
        setBulb(index, on) {
            if (this.bulbs[index].on !== on) {
                this.bulbs[index].on = on;
                // this.sendMessage(`B${this.bulbs[index].on ? '1' : '0'}${String.fromCharCode(index + 20)}`);
                this.sendMessage(`B${this.bulbs[index].on ? '1' : '0'}${index}`);
            }
        },
        sendMessage(message) {
            this.$emit('message', message);
        },
        touch(event: TouchGestureEventData) {
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
                    if (!bulb.touched && 
                        fingerPos.distance(bulb.pos) < maxDist ||
                        (this.prevFingerPos && distToSegment(bulb.pos, fingerPos, this.prevFingerPos) < maxDist)) {
                        if (this.brushValue === null) {
                            this.brushValue = !bulb.on;
                        }
                        bulb.touched = true; 
                        this.setBulb(index, this.brushValue);
                    }
                });
                this.prevFingerPos = fingerPos;
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
            for (let i = 1; i < this.bulbs.length; i++) {
                this.drawWire(canvas, i - 1, i);
            }

            for (let i = 0; i < this.bulbs.length; i++) {
                this.drawBulb(canvas, i);
            }
        },
        drawBulb(canvas: android.graphics.Canvas, index) {
            let color = new android.graphics.Paint();
            color.setAntiAlias(true);
            color.setStrokeWidth(this.bulbStyle.outerStrokeWidth * this.scale);

            color.setColor(this.bulbStyle.outerStrokeColor);
            color.setStyle(android.graphics.Paint.Style.STROKE);
            canvas.drawCircle(
                this.bulbs[index].pos.x,
                this.bulbs[index].pos.y,
                (this.bulbStyle.size + this.bulbStyle.innerStrokeWidth) * this.scale,
                color
            );
            color.setColor(this.bulbStyle.innerStrokeColor);
            color.setStyle(android.graphics.Paint.Style.STROKE);
            canvas.drawCircle(
                this.bulbs[index].pos.x,
                this.bulbs[index].pos.y,
                this.bulbStyle.size * this.scale,
                color
            );
            if (this.bulbs[index].on) {
                color.setARGB(255, 255, 255, 255);
            } else {
                color.setARGB(255, 0, 0, 0);
            }
            color.setStyle(android.graphics.Paint.Style.FILL);
            canvas.drawCircle(
                this.bulbs[index].pos.x,
                this.bulbs[index].pos.y,
                this.bulbStyle.size * this.scale,
                color
            );
        },
        drawWire(canvas: android.graphics.Canvas, fromIndex, toIndex) {
            let color = new android.graphics.Paint();
            color.setAntiAlias(true);
            color.setStrokeWidth(this.wireStyle.strokeWidth * this.scale);
            color.setColor(this.wireStyle.strokeColor);
            color.setStyle(android.graphics.Paint.Style.STROKE);
            canvas.drawLine (
                this.bulbs[fromIndex].pos.x,
                this.bulbs[fromIndex].pos.y,
                this.bulbs[toIndex].pos.x,
                this.bulbs[toIndex].pos.y,
                color);
        }
    }
};
</script>

<style scoped lang="scss">
</style>
