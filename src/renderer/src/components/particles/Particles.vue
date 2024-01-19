<template>
  <vue-particles id="tsparticles" :particlesLoaded="particlesLoaded" />
  <vue-particles
    id="tsparticles"
    :particlesLoaded="particlesLoaded"
    :options="{
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: false,
            mode: 'push'
          },
          onHover: {
            enable: false,
            mode: 'repulse'
          }
        },
        modes: {
          bubble: {
            distance: 300,
            duration: 5,
            opacity: 0.9,
            size: 15
          },
          push: {
            quantity: 4
          },
          repulse: {
            distance: 100,
            duration: 0.4
          }
        }
      },
      particles: {
        color: {
          value: '#6c757d'
        },
        links: {
          color: '#6c757d',
          distance: 100,
          enable: true,
          opacity: 0.5,
          width: 1
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: 'bounce',
          random: false,
          speed: 6,
          straight: false
        },
        number: {
          density: {
            enable: true
          },
          value: 50
        },
        opacity: {
          value: 0.5
        },
        shape: {
          type: 'circle'
        },
        size: {
          value: { min: 1, max: 5 }
        }
      },
      detectRetina: true
    }"
  />
</template>

<script setup>
const particlesLoaded = async (container) => {
  console.log('Particles container loaded', container)
}
</script>

<style lang="scss" scoped></style>
