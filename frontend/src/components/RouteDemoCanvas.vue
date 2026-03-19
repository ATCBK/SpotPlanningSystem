<template>
  <div ref="rootRef" class="demo-shell" :class="{ fullscreen: isFullscreen }">
    <div class="demo-toolbar">
      <div>
        <p class="demo-kicker">{{ title }}</p>
        <p class="demo-caption">{{ subtitle }}</p>
      </div>
      <div class="demo-actions">
        <button type="button" class="demo-btn" @click="togglePlay">{{ isPlaying ? '暂停' : '继续' }}</button>
        <button type="button" class="demo-btn" @click="replay">重播</button>
        <button type="button" class="demo-btn" @click="toggleFinalOnly">
          {{ showFinalOnly ? '恢复演示' : '只看最终结果' }}
        </button>
        <button type="button" class="demo-btn strong" @click="toggleFullscreen">
          {{ isFullscreen ? '退出全屏' : '全屏演示' }}
        </button>
      </div>
    </div>

    <div class="demo-stage" :style="{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }">
      <div class="demo-stage-mask"></div>
      <svg class="demo-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line
          v-for="edge in renderedRejectedEdges"
          :key="edge.id"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          class="demo-edge rejected"
          :style="{ opacity: `${edge.opacity}` }"
        />
        <line
          v-for="edge in renderedProbeEdges"
          :key="edge.id"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          class="demo-edge probe"
          :style="{ opacity: `${edge.opacity}` }"
        />
        <line
          v-for="edge in renderedFinalEdges"
          :key="edge.id"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          class="demo-edge final"
          :style="{ opacity: `${edge.opacity}` }"
          marker-end="url(#demo-arrow)"
        />
        <defs>
          <marker id="demo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#b33a3a" />
          </marker>
        </defs>
      </svg>

      <div
        v-for="node in renderedNodes"
        :key="node.id"
        class="demo-node"
        :class="[node.role, { active: node.active }]"
        :style="{ left: `${node.x}%`, top: `${node.y}%`, opacity: `${node.opacity}`, transform: `translate(-50%, -50%) scale(${node.scale})` }"
      >
        <div class="demo-node-icon">
          <ScenicNodeIcon :name="node.iconName" />
        </div>
        <div class="demo-node-label" :style="{ opacity: `${node.labelOpacity}` }">{{ node.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ScenicNodeIcon from './ScenicNodeIcon.vue'
import type { DemoEdge, DemoNode, DemoScene } from '../utils/demo-visual'

const props = defineProps<{
  scene: DemoScene
  title: string
  subtitle: string
  backgroundImage?: string
}>()

const rootRef = ref<HTMLElement | null>(null)
const playhead = ref(0)
const isPlaying = ref(true)
const showFinalOnly = ref(false)
const isFullscreen = ref(false)

let frameHandle = 0
let lastTimestamp = 0

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function mix(a: number, b: number, ratio: number) {
  return Number((a + (b - a) * ratio).toFixed(2))
}

function edgeProgress(edge: DemoEdge) {
  if (showFinalOnly.value) {
    return 1
  }
  return clamp((playhead.value - edge.start) / Math.max(edge.end - edge.start, 0.01))
}

function nodeProgress(node: DemoNode) {
  if (showFinalOnly.value) {
    return node.active ? 1 : 0
  }
  if (!node.active) {
    return clamp((playhead.value - 7.2) / 1.4)
  }
  return clamp((playhead.value - 5.8) / 2.2)
}

const renderedNodes = computed(() =>
  props.scene.nodes.map((node) => {
    const progress = nodeProgress(node)
    const fadeOut = node.active || showFinalOnly.value ? 1 : 1 - progress * 0.78
    return {
      ...node,
      x: mix(node.scatterX, node.x, progress),
      y: mix(node.scatterY, node.y, progress),
      opacity: Number((node.active ? 0.55 + progress * 0.45 : fadeOut).toFixed(2)),
      scale: Number((node.active ? 0.72 + progress * 0.38 : 0.5 + (1 - progress) * 0.08).toFixed(2)),
      labelOpacity: Number((node.active || showFinalOnly.value ? clamp((playhead.value - 7.5) / 1.3) : 0.35).toFixed(2)),
    }
  }),
)

const nodeMap = computed(() => new Map(renderedNodes.value.map((node) => [node.id, node])))

function renderEdges(edges: DemoEdge[], mode: 'probe' | 'rejected' | 'final') {
  return edges
    .map((edge) => {
      const from = nodeMap.value.get(edge.from)
      const to = nodeMap.value.get(edge.to)
      if (!from || !to) {
        return null
      }
      const progress = edgeProgress(edge)
      if (progress <= 0) {
        return null
      }
      const x2 = mix(from.x, to.x, progress)
      const y2 = mix(from.y, to.y, progress)
      const opacity =
        mode === 'rejected'
          ? Number((progress < 0.72 ? 0.5 : 0.5 * (1 - (progress - 0.72) / 0.28)).toFixed(2))
          : mode === 'probe'
            ? Number((0.2 + progress * 0.35).toFixed(2))
            : Number((0.35 + progress * 0.65).toFixed(2))
      return {
        id: edge.id,
        x1: from.x,
        y1: from.y,
        x2,
        y2,
        opacity: clamp(opacity),
      }
    })
    .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge))
}

const renderedProbeEdges = computed(() => renderEdges(props.scene.probeEdges, 'probe'))
const renderedRejectedEdges = computed(() => renderEdges(props.scene.rejectedEdges, 'rejected'))
const renderedFinalEdges = computed(() => renderEdges(props.scene.finalEdges, 'final'))

function tick(timestamp: number) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp
  }
  if (isPlaying.value && !showFinalOnly.value) {
    const delta = (timestamp - lastTimestamp) / 1000
    playhead.value = Math.min(props.scene.totalDuration, playhead.value + delta)
    if (playhead.value >= props.scene.totalDuration) {
      isPlaying.value = false
    }
  }
  lastTimestamp = timestamp
  frameHandle = requestAnimationFrame(tick)
}

function replay() {
  showFinalOnly.value = false
  playhead.value = 0
  isPlaying.value = true
}

function togglePlay() {
  if (showFinalOnly.value) {
    showFinalOnly.value = false
  }
  if (playhead.value >= props.scene.totalDuration) {
    playhead.value = 0
  }
  isPlaying.value = !isPlaying.value
}

function toggleFinalOnly() {
  showFinalOnly.value = !showFinalOnly.value
  if (showFinalOnly.value) {
    playhead.value = props.scene.totalDuration
    isPlaying.value = false
  } else {
    replay()
  }
}

async function toggleFullscreen() {
  const root = rootRef.value
  if (!root) {
    return
  }
  if (document.fullscreenElement) {
    await document.exitFullscreen()
  } else {
    await root.requestFullscreen()
  }
}

function syncFullscreenState() {
  isFullscreen.value = Boolean(document.fullscreenElement === rootRef.value)
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenState)
  frameHandle = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameHandle)
  document.removeEventListener('fullscreenchange', syncFullscreenState)
})
</script>
