<template>
    <GridLayout 
        columns="*" 
        rows="*" 
        backgroundColor="lightgray" 
        ref="canvasGrid"
        @layoutChanged="onLayoutChanged">
        <Placeholder @creatingView="createCanvasView"
                @touch="onTouchCanvas"
                col="0" 
                row="0"/>
    </GridLayout>
</template>
<script>
import * as platformModule from "tns-core-modules/platform";
import * as applicationModule from "tns-core-modules/application";

export default {
    props: {
        active: false,
    },
    data() {
        return {
            setupDone: false,
            canvasView: null,
            canvas: null,
            scale: 1
        };
    },
    watch: {
        active() {
            if (this.animator) {
                if (this.active) {
                    this.animator.start();
                } else {
                    this.animator.end();
                }
            }
        },
    },
    mounted() {
        this.animator = new android.animation.TimeAnimator();
        this.animator.setTimeListener(
            new android.animation.TimeAnimator.TimeListener({
                onTimeUpdate: (animation, totalTime, deltaTime) => {
                    this.render(animation, totalTime, deltaTime);
                }
            })
        );
        if (this.active) {
            this.animator.start();
        }
        this.suspendListener = applicationModule.on(applicationModule.suspendEvent, (args) => {
            this.animator.end();
        });
        this.resumeListener = applicationModule.on(applicationModule.resumeEvent, (args) => {
            if (this.active) {
                this.animator.start();
            }
        });

        setTimeout(() => this.tryLoad());
    },
    beforeDestroy() {
        applicationModule.off(applicationModule.resumeEvent, this.resumeListener);
        applicationModule.off(applicationModule.suspendEvent, this.suspendListener);
        this.animator.end();
    },
    methods: {
        onLayoutChanged() {
            this.tryLoad();
        },
        tryLoad() {
            const size = this.$refs.canvasGrid._nativeView.getActualSize();
            if (size.width > 0 && size.height > 0) {
                this.scale = platformModule.screen.mainScreen.scale;
                let bitmap = android.graphics.Bitmap.createBitmap(
                    size.width * this.scale,
                    size.height * this.scale,
                    android.graphics.Bitmap.Config.ARGB_8888
                );
                if (!this.setupDone) {
                    this.canvas = new android.graphics.Canvas(bitmap);
                    this.canvasView.setImageBitmap(bitmap);
                    this.$emit("loaded", this.canvas);
                } else {
                    this.canvas.setBitmap(bitmap);
                    this.canvasView.setImageBitmap(bitmap);
                    this.$emit("layoutChanged", this.canvas);
                }
            }
        },
        createCanvasView(event) {
            this.canvasView = new android.widget.ImageView(event.context);
            this.canvasView.setScaleType(android.widget.ImageView.ScaleType.FIT_XY);
            event.view = this.canvasView;
        },
        onTouchCanvas(event) {
            this.$emit("touch", event);
        },
        render(animation, totalTime, deltaTime) {
            if (this.canvas && this.canvasView) {
                this.$emit('render', { canvas: this.canvas, totalTime, deltaTime });
                this.canvasView.invalidate();
            }
        },
    }
};
</script>

<style scoped lang="scss">
</style>
