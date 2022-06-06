<template>
    <div class="touch-slide" ref="root">
        <div class="left-slide" :displayed="state == OpenState.left" ref="left">
            <slot name="left"></slot>
        </div>
        <div class="core-slide" >
            <slot name="core"></slot>
        </div>
        <div class="right-slide" :displayed="state == OpenState.right" ref="right">
            <slot name="right"></slot>
        </div>
    </div>
</template>
<style lang="scss">
.touch-slide {
    display: grid;
    overflow: hidden;
    > * {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        max-width: 100%;
        max-height: 100%;

    }
    .right-slide {
        justify-self: end;
        &:not([displayed="true"]) {
            transform: translate3d(100%, 0, 0);
        }
    }
    .left-slide {
        &:not([displayed="true"]) {
            transform: translate3d(-100%, 0, 0);
        }
    }
    .left-slide, .right-slide {
        z-index: 1;
        &:not([displayed="true"]) {
            visibility: hidden;
        }
    }
}
</style>
<script lang="ts">
export enum OpenState {
    left = -1,
    nothing,
    right
}
</script>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, PropType } from "vue";



const props = defineProps({
    state: {
        type: Number as PropType<OpenState>,
        default: 0 // OpenState.nothing
    },
    threshold: {
        //minimum swipe amount of distance in % of the side menu targeted to snap
        type: Number,
        default: 0.25,
    },
    minSwipe: {
        //minimum swipe amount in px to start moving the side menu
        type: Number,
        default: 75,
    },
});

const state = ref(props.state);

const {
    threshold,
    minSwipe
} = props;

const emit = defineEmits(['update:state'])

// slot dom root
var leftElement: HTMLElement | undefined = undefined;
var rightElement: HTMLElement | undefined = undefined;

// the core slot dom root use as the touchsurface
var touchSurface: HTMLElement | undefined | null = undefined;

// The X position of the touch event on start in px
var startX = 0;

// The distance to the startX in px can be negative
const distX = ref(0);

function updateDistOnVue() {
    rightElement!.style.transform = `translate3d(clamp(0px, calc(100% + ${distX.value}px + ${minSwipe}px), 100%), 0, 0)`;
    leftElement!.style.transform = `translate3d(clamp(-100%, calc(-100% + ${distX.value}px + -${minSwipe}px), 0px), 0, 0)`;
}

// The distance remaining at the start of the touch event
var startDist = 0;
var isTouch = false;

const root = ref<HTMLElement>();
const right = ref<HTMLElement>();
const left = ref<HTMLElement>();

var cancel = new AbortController();

onMounted(() => {
    touchSurface = root.value;
    touchSurface?.addEventListener("touchstart", touchStart, {passive: true});
    touchSurface?.addEventListener("touchmove", touchMove, {passive: true});
    touchSurface?.addEventListener("touchend", touchEnd, {passive: true});
    leftElement = left.value;
    rightElement = right.value;
    changeState(state.value);
});

onBeforeUnmount(() => {
    touchSurface?.removeEventListener("touchstart", touchStart, false);
    touchSurface?.removeEventListener("touchmove", touchMove, false);
    touchSurface?.removeEventListener("touchend", touchEnd, false);
});

function changeState(s:OpenState) {
    cancel.abort();
    cancel = new AbortController();
    state.value = s;
    emit("update:state", s);
    switch (s) {
        case OpenState.left:
            return animateDistPromise(leftElement!.clientWidth+minSwipe*2, s);
        case OpenState.nothing:
            return animateDistPromise(0, s);
        case OpenState.right:
            return animateDistPromise(-rightElement!.clientWidth-minSwipe*2, s);
    }

}


function touchStart(e: TouchEvent) {
    if (isTouch) return; //TODO: handle multi touch
    cancel.abort();
    cancel = new AbortController();
    isTouch = true;
    const touchobj = e.changedTouches[0];
    startX = touchobj.pageX;
    startDist = distX.value;
}

function resolveNextOpenState():OpenState {
  if (state.value == OpenState.right) return   distX.value > -rightElement!.clientWidth*(1-threshold)-minSwipe ? OpenState.nothing : OpenState.right;
  if (state.value == OpenState.left ) return   distX.value < leftElement!.clientWidth  *(1-threshold)+minSwipe ? OpenState.nothing : OpenState.left;
  return  rightElement?.firstChild != null &&  distX.value < -rightElement!.clientWidth*   threshold -minSwipe ? OpenState.right   :
          leftElement?.firstChild  != null &&  distX.value >  leftElement!.clientWidth *   threshold +minSwipe ? OpenState.left    :
                                                                                                                 OpenState.nothing;
}

function handleswipe() {
    changeState(resolveNextOpenState());
}

function touchEnd(e: TouchEvent) {
  handleswipe();
  isTouch = false;
}

var lastFrameTimestamp = 0;

function animateDistPromise(goalDist:number, s:OpenState) {
    lastFrameTimestamp = performance.now();
    new Promise<void>((resolve, reject)=>{
        animateDist(goalDist, cancel, resolve, reject);
    }).catch(e=>{});
}

function animateDist(goalDist:number, control:AbortController, resolve:()=>void, reject:()=>void) {
  if (control.signal.aborted) return reject();
  const frameTimestamp = performance.now();
  const remain = goalDist - distX.value;
  const sign = Math.sign(remain);
  const dt = frameTimestamp - lastFrameTimestamp;
  console.log(dt)
  distX.value += (remain*0.02 + sign) * dt / 5;
  if((sign >= 0 && distX.value >= goalDist) ||
     (sign <= 0 && distX.value <= goalDist) ) {
      distX.value = goalDist;
      updateDistOnVue();
      return resolve();
  }
  updateDistOnVue();
  lastFrameTimestamp = frameTimestamp;
  requestAnimationFrame(()=>animateDist(goalDist, control, resolve, reject));
}

function touchMove(e: TouchEvent) {
    const clamp = (min:number, num:number, max:number) => Math.min(Math.max(num, min), max);
    const touchobj = e.changedTouches[0];
    const move = touchobj.pageX - startX;
    distX.value = startDist + move;
    distX.value = clamp(-rightElement!.clientWidth-minSwipe*2, distX.value, leftElement!.clientWidth+minSwipe*2);
    if      (distX.value < -minSwipe) rightElement!.style.visibility = "visible";
    else if (distX.value >  minSwipe)  leftElement!.style.visibility = "visible";
    else {
        rightElement!.style.visibility = "";
        leftElement!.style.visibility = "";
    }

    updateDistOnVue();
}

defineExpose({
    changeState,
    state
})

</script>
