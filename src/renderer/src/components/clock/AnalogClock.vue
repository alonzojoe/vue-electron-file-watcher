<template>
  <div class="clock" :style="clockStyle">
    <img class="file-icon" :src="props.icon" height="80px" width="100px" alt="file-icon" />
    <div class="clock-circle"></div>
    <div class="clock-hour" :style="{ transform: hourRotate }"></div>
    <div class="clock-minute" :style="{ transform: minuteRotate }"></div>
    <div class="clock-second" :style="{ transform: secondRotate }"></div>
    <b class="hour" v-for="h in timeList" :key="h">
      <span>
        <i :style="{ transform: transform }">{{ h }}</i>
      </span>
    </b>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export default {
  props: ['time', 'color', 'border', 'bg', 'size', 'icon'],
  setup(props) {
    const timeList = ref([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    const transform = ref('scale(1)')
    const hourRotate = ref('rotatez(0deg)')
    const minuteRotate = ref('rotatez(0deg)')
    const secondRotate = ref('rotatez(0deg)')
    let _timer

    const clockStyle = ref({
      height: props.size,
      width: props.size,
      color: props.color,
      border: props.border,
      background: props.bg
    })

    const showTime = () => {
      let times
      if (props.time) {
        times = props.time.split(':')
      } else {
        const now = new Date()
        times = [now.getHours(), now.getMinutes(), now.getSeconds()]
      }

      let hour = +times[0]
      hour = hour > 11 ? hour - 12 : hour
      let minute = +times[1]
      let second = +times[2] || 0
      let hourAngle = hour * 30 + ((minute * 6) / 360) * 30
      let minuteAngle = minute * 6
      let secondAngle = second * 6
      hourRotate.value = `rotatez(${hourAngle}deg)`
      minuteRotate.value = `rotatez(${minuteAngle}deg)`
      secondRotate.value = `rotatez(${secondAngle}deg)`
    }

    const show = () => {
      showTime()
      if (_timer) clearInterval(_timer)
      if (!props.time) {
        _timer = setInterval(() => {
          showTime()
        }, 1000)
      }
    }

    watch(
      () => props.time,
      () => {
        show()
      }
    )

    onMounted(() => {
      let scale = props.size / 120
      scale = scale > 3 ? 3 : scale
      transform.value = `scale(${scale})`
      show()
    })

    onBeforeUnmount(() => {
      if (_timer) clearInterval(_timer)
    })

    return {
      timeList,
      transform,
      hourRotate,
      minuteRotate,
      secondRotate,
      clockStyle,
      props
    }
  }
}
</script>

<style lang="scss" scoped>
$angle: 30deg;

.clock {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: 150px;
  height: 150px;
  border: 5px solid;
  border-radius: 100%;
  text-align: center;
  font-size: 14px;

  .file-icon {
    position: absolute;
    top: 43.5%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.23;
  }
  .hour {
    position: absolute;
    top: 0px;
    left: 50%;
    display: block;
    width: 20px;
    height: 50%;
    margin-left: -10px;
    padding-top: 4%;
    font-weight: 400;
    transform-origin: bottom;
    user-select: none;
    box-sizing: border-box;
    > span {
      display: block;

      > i {
        display: block;
        font-style: normal;
      }
    }
  }

  @for $i from 2 through 12 {
    .hour:nth-of-type(#{$i}) {
      transform: rotatez(#{$angle * ($i - 1)});
      > span {
        transform: rotatez(#{-$angle * ($i - 1)});
      }
    }
  }

  .clock-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    transform: translate(-50%, -50%);
    border: 2px solid #666666;
    border-radius: 100%;
    background-color: #9feaf9;
    z-index: 1;
    box-sizing: border-box;

    &:before {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
      content: '';
      width: 4px;
      height: 4px;
      border-radius: 100%;
      background-color: #666666;
    }
  }

  .clock-hour,
  .clock-minute,
  .clock-second {
    position: absolute;
    top: 15%;
    left: 50%;
    display: block;
    width: 2px;
    height: 35%;
    margin-left: -1px;
    border-radius: 5px;
    transform-origin: bottom;
    background-color: #666666;
  }

  .clock-hour {
    top: 30%;
    width: 4px;
    height: 20%;
    margin-left: -2px;
  }

  .clock-second {
    width: 1px;
  }
}

.clock.is-small {
  width: 80px;
  height: 80px;
  border-width: 1px;
  font-size: 12px;

  .clock-circle {
    width: 10px;
    height: 10px;
    border-width: 1px;
    &:before {
      width: 2px;
      height: 2px;
    }
  }
}
</style>
