<script setup lang="ts">
import gutsBg from '../assets/img/background-guts.webp'
import makiBg from '../assets/img/background-maki.webp'
import lokiBg from '../assets/img/background-loki.webp'
import blazerBg from '../assets/img/background-blazer.webp'
import plagueKnightBg from '../assets/img/background-plague-knight.webp'
import plagueSwordBg from '../assets/img/background-plague-sword.webp'
import { computed, ref } from 'vue'

const backgrounds = [gutsBg,makiBg,lokiBg,blazerBg,plagueKnightBg,plagueSwordBg]
const randomBg = computed(()=>{
let bg = backgrounds[Math.floor(Math.random()* backgrounds.length)]
return `url(${bg})`
}) 
const loadedImage = ref(false)

</script>

<template>
  <section class="home-split flex-grow-1 " :class="{load: loadedImage}">
    <img @load="loadedImage = true" height="1" width="1" loading="eager" :src="randomBg.slice(4, randomBg.length-1)" class="position-fixed no-click opacity-0">

    <section class="left d-none d-lg-block">

    </section>

    <section class="right d-flex-col justify-content-center align-items-center">
      <div class="glass-pane border rounded-5 d-flex-col align-items-center shadow-lg gap-2 fs-2">
        <div >
          <img class="logo" src="/NormalLibraryLogo.svg" alt="">
        </div>
        <h1 class="mb-0">
          Normal_Library
        </h1>
        <p class="text-center text-normal fs-5 mb-5 f-mono">Upload Download Print</p>
        <RouterLink :to="{name: 'create'}" class="text-light f-mono px-3 py-2 rounded-3 selectable-normal-x">
          <i class="bi bi-box text-normal-x"></i> Create
        </RouterLink>
        <RouterLink :to="{name: 'browse'}" class="text-light f-mono px-3 py-2 rounded-3 selectable-normal-y">
          <i class="bi bi-search text-normal-y"></i> Browse
        </RouterLink>
        <RouterLink :to="{name: 'orders'}" class="text-light f-mono px-3 py-2 rounded-3 selectable-normal-z">
          <i class="bi bi-box2-heart text-normal-z"></i> Order
        </RouterLink>
      </div>
    </section>

  </section>
</template>

<style lang="scss">

@property --bg-o{
  syntax: '<number>';
  initial-value: 1;
  inherits: false;
}

.logo{
  min-width: 100px;
  max-width: 200px;
}

.left{
}

.right{
  position: relative;
  z-index: 5;
  .glass-pane{
    max-width: 100dvw;
    position: relative;
    padding: calc(3em + 3dvw);
    background-color: rgba(var(--bs-black-rgb), .75);
    &::before{
      content: '';
      position: absolute;
      inset: 0;
      filter: url(#glass-distortion) blur(20px);
    }
  }
}

.home-split{
  position: relative;
  display: flex;
  justify-content: space-around;
  background-color: black;
  filter: brightness(1.1) saturate(1.5) ;
  background-image: linear-gradient(15deg, rgba(22, 22, 29, var(--bg-o)), rgba(0,0,0,var(--bg-o))), v-bind(randomBg), linear-gradient(15deg, #16161d, black);
  background-repeat: no-repeat;
  background-size: cover;
  background-position:  center;
  position: relative;
  z-index: 1;
  &.load{
  animation: fade-in 1.5s .1s ease forwards;
  }
}

@keyframes fade-in {
  from{
    --bg-o: 1;
  }
  to{
    --bg-o: 0;
  }
}

@media(max-width: 426px){

  .home-split{
  background-position: 40%;
    
    .left{
      display:none
    }
    .right{
      filter: drop-shadow(0px 0px 3px black);
      backdrop-filter: contrast(.8) brightness(.7);
      width: 100%;
      background-color: rgba(var(--bs-dark-rgb), .5);
      .glass-pane{
        padding: 0;
        background-color: transparent;
        box-shadow: unset !important;
        border: 0 !important;
        &::before{
          display: none;
        }
      }
    }
  }
}

</style>
