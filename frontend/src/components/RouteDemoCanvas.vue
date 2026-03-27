<template>
  <div ref="rootRef" class="demo-shell" :class="{ fullscreen: isFullscreen }" :style="shellStyle">
    <div class="demo-toolbar">
      <div>
        <p class="demo-kicker">{{ title }}</p>
        <p v-if="subtitle" class="demo-caption">{{ subtitle }}</p>
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
          v-for="edge in renderedFinalBaseEdges"
          :key="`${edge.id}-base`"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          class="demo-edge final-base"
          :style="{ opacity: `${edge.opacity}`, strokeWidth: `${edge.strokeWidth}` }"
        />
        <line
          v-for="edge in renderedRejectedEdges"
          :key="edge.id"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          class="demo-edge rejected"
          :style="{
            opacity: `${edge.opacity}`,
            strokeWidth: `${edge.strokeWidth}`,
            strokeDasharray: edge.dashArray,
          }"
        />
        <text
          v-for="edge in renderedRejectedEdges"
          :key="`${edge.id}-label`"
          :x="edge.labelX"
          :y="edge.labelY"
          class="demo-edge-label rejected"
          :style="{ opacity: `${edge.labelOpacity}` }"
        >
          {{ edge.label }}
        </text>
        <line
          v-for="edge in renderedProbeEdges"
          :key="edge.id"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          class="demo-edge probe"
          :style="{
            opacity: `${edge.opacity}`,
            strokeWidth: `${edge.strokeWidth}`,
            strokeDasharray: edge.dashArray,
          }"
        />
        <text
          v-for="edge in renderedProbeEdges"
          :key="`${edge.id}-label`"
          :x="edge.labelX"
          :y="edge.labelY"
          class="demo-edge-label probe"
          :style="{ opacity: `${edge.labelOpacity}` }"
        >
          {{ edge.label }}
        </text>
        <line
          v-for="edge in renderedFinalEdges"
          :key="edge.id"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          class="demo-edge final"
          :style="{ opacity: `${edge.opacity}`, strokeWidth: `${edge.strokeWidth}` }"
          marker-end="url(#demo-arrow)"
        />
        <line
          v-for="edge in renderedFinalPulseEdges"
          :key="`${edge.id}-pulse`"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          class="demo-edge final-pulse"
          :style="{
            opacity: `${edge.opacity}`,
            strokeWidth: `${edge.strokeWidth}`,
            strokeDasharray: edge.dashArray,
            strokeDashoffset: `${edge.dashOffset ?? 0}`,
          }"
          :marker-end="edge.markerEnd ? 'url(#demo-arrow-glow)' : undefined"
        />
        <text
          v-for="edge in renderedFinalEdges"
          :key="`${edge.id}-label`"
          :x="edge.labelX"
          :y="edge.labelY"
          class="demo-edge-label final"
          :style="{ opacity: `${edge.labelOpacity}` }"
        >
          {{ edge.label }}
        </text>
        <defs>
          <marker
            id="demo-arrow"
            viewBox="0 0 10 10"
            :refX="Number((6.4 + visualScale * 0.8).toFixed(2))"
            refY="5"
            :markerWidth="Number((2.9 + visualScale * 0.8).toFixed(2))"
            :markerHeight="Number((2.9 + visualScale * 0.8).toFixed(2))"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a13f33" />
          </marker>
          <marker
            id="demo-arrow-glow"
            viewBox="0 0 10 10"
            :refX="Number((7 + visualScale).toFixed(2))"
            refY="5"
            :markerWidth="Number((3.4 + visualScale).toFixed(2))"
            :markerHeight="Number((3.4 + visualScale).toFixed(2))"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f0c88a" />
          </marker>
        </defs>
      </svg>

      <div
        v-for="node in renderedNodes"
        :key="node.id"
        class="demo-node"
        :class="[node.role, node.phase, { active: node.active }]"
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
import type { DemoEdge, DemoEvent, DemoNode, DemoScene } from '../utils/demo-visual'
import {
  renderFinalBaseEdge as renderFinalBaseLayer,
  renderFinalEdge as renderFinalLayer,
  renderFinalPulseEdge as renderFinalPulseLayer,
  renderProbeEdge as renderProbeLayer,
  renderRejectedEdge as renderRejectedLayer,
  type RenderedEdge,
} from '../utils/demo-edge-render'
import { resolveDemoNodeRenderState, type RenderedNodePhase } from '../utils/demo-playback'

const props = defineProps<{
  scene: DemoScene
  title: string
  subtitle?: string
  backgroundImage?: string
}>()

const rootRef = ref<HTMLElement | null>(null)
const playhead = ref(0)
const isPlaying = ref(true)
const showFinalOnly = ref(false)
const isFullscreen = ref(false)
const stageWidth = ref(1200)

let frameHandle = 0
let lastTimestamp = 0
let resizeObserver: ResizeObserver | null = null

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

const visualScale = computed(() => {
  const ratio = stageWidth.value / 1200
  return Number(clamp(ratio, 0.78, 1.18).toFixed(2))
})

const shellStyle = computed(() => ({
  '--demo-node-width': `${Math.round(96 * visualScale.value)}px`,
  '--demo-icon-size': `${Math.round(78 * visualScale.value)}px`,
  '--demo-node-font': `${Number((13 * visualScale.value).toFixed(2))}px`,
  '--demo-edge-label-font': `${Number((2.35 * visualScale.value).toFixed(2))}px`,
} as Record<string, string>))

function isEventActive(event: DemoEvent) {
  return playhead.value >= event.start && playhead.value <= event.end
}

function isEventPast(event: DemoEvent) {
  return playhead.value > event.end
}

const nodeEventsMap = computed(() => {
  const grouped = new Map<string, DemoEvent[]>()
  props.scene.events.forEach((event) => {
    if (!event.nodeId) {
      return
    }
    grouped.set(event.nodeId, [...(grouped.get(event.nodeId) ?? []), event])
  })
  return grouped
})

const probeEventsByEdgeId = computed(() => {
  const map = new Map<string, DemoEvent>()
  props.scene.events.forEach((event) => {
    if (event.type === 'probe-edge' && event.edgeId) {
      map.set(event.edgeId, event)
    }
  })
  return map
})

const rejectEventsByEdgeId = computed(() => {
  const map = new Map<string, DemoEvent>()
  props.scene.events.forEach((event) => {
    if (event.type === 'reject-edge' && event.edgeId) {
      map.set(event.edgeId, event)
    }
  })
  return map
})

const chooseEventsByStep = computed(() => {
  const map = new Map<string, DemoEvent>()
  props.scene.events.forEach((event) => {
    if (event.type === 'choose-edge') {
      map.set(`${event.segmentIndex}-${event.stepIndex}`, event)
    }
  })
  return map
})

const activeFocusOrSettleEvent = computed(() => {
  const activeEvents = props.scene.events.filter(
    (event) => (event.type === 'focus-node' || event.type === 'settle-node') && isEventActive(event),
  )
  return activeEvents.sort((a, b) => b.start - a.start)[0] ?? null
})

const activeProbeEvent = computed(
  () => props.scene.events.find((event) => event.type === 'probe-edge' && isEventActive(event)) ?? null,
)

const activeRejectEvent = computed(
  () => props.scene.events.find((event) => event.type === 'reject-edge' && isEventActive(event)) ?? null,
)

const activeChooseEvent = computed(
  () => props.scene.events.find((event) => event.type === 'choose-edge' && isEventActive(event)) ?? null,
)

function findNodePhase(node: DemoNode): RenderedNodePhase {
  if (showFinalOnly.value) {
    return node.active ? 'visited' : 'ambient'
  }

  const nodeEvents = nodeEventsMap.value.get(node.id) ?? []
  if (activeFocusOrSettleEvent.value?.nodeId === node.id) {
    return 'current'
  }
  if (activeProbeEvent.value?.nodeId === node.id) {
    return 'candidate'
  }
  if (activeRejectEvent.value?.nodeId === node.id) {
    return 'rejected'
  }
  if (node.active && nodeEvents.some((event) => (event.type === 'settle-node' || event.type === 'focus-node') && isEventPast(event))) {
    return 'visited'
  }
  if (node.active) {
    return 'queued'
  }
  return 'ambient'
}

function getNodeIntroStart(node: DemoNode) {
  if (showFinalOnly.value) {
    return 0
  }
  const nodeEvents = nodeEventsMap.value.get(node.id) ?? []
  if (nodeEvents.length === 0) {
    return node.active ? 5.8 : 6.8
  }
  return Math.max(0, Math.min(...nodeEvents.map((event) => event.start)) - 0.24)
}

function nodeProgress(node: DemoNode) {
  if (showFinalOnly.value) {
    return node.active ? 1 : 0.3
  }
  return clamp((playhead.value - getNodeIntroStart(node)) / 0.7)
}

const renderedNodes = computed(() =>
  props.scene.nodes.map((node) =>
    resolveDemoNodeRenderState(node, findNodePhase(node), nodeProgress(node), showFinalOnly.value),
  ),
)

const nodeMap = computed(() => new Map(renderedNodes.value.map((node) => [node.id, node])))

function renderProbeEdge(edge: DemoEdge) {
  const probeEvent = probeEventsByEdgeId.value.get(edge.id)
  if (!probeEvent) {
    return null
  }

  const rejectEvent = rejectEventsByEdgeId.value.get(edge.id)
  const chooseEvent = chooseEventsByStep.value.get(`${probeEvent.segmentIndex}-${probeEvent.stepIndex}`)

  return renderProbeLayer(edge, nodeMap.value, {
    playhead: playhead.value,
    showFinalOnly: showFinalOnly.value,
    visualScale: visualScale.value,
    activeProbeEdgeId: activeProbeEvent.value?.edgeId,
    probeEvent,
    rejectEvent,
    chooseEvent,
  })
}

function renderRejectedEdge(edge: DemoEdge) {
  const rejectEvent = rejectEventsByEdgeId.value.get(edge.id)
  if (!rejectEvent) {
    return null
  }

  return renderRejectedLayer(edge, nodeMap.value, {
    playhead: playhead.value,
    showFinalOnly: showFinalOnly.value,
    visualScale: visualScale.value,
    activeRejectEdgeId: activeRejectEvent.value?.edgeId,
    rejectEvent,
  })
}

function renderFinalBase(edge: DemoEdge) {
  return renderFinalBaseLayer(edge, nodeMap.value, {
    playhead: playhead.value,
    showFinalOnly: showFinalOnly.value,
    visualScale: visualScale.value,
    activeChooseEdgeId: activeChooseEvent.value?.edgeId,
  })
}

function renderFinalEdge(edge: DemoEdge) {
  return renderFinalLayer(edge, nodeMap.value, {
    playhead: playhead.value,
    showFinalOnly: showFinalOnly.value,
    visualScale: visualScale.value,
    activeChooseEdgeId: activeChooseEvent.value?.edgeId,
    chooseEvent: activeChooseEvent.value,
  })
}

function renderFinalPulse(edge: DemoEdge) {
  return renderFinalPulseLayer(edge, nodeMap.value, {
    playhead: playhead.value,
    showFinalOnly: showFinalOnly.value,
    visualScale: visualScale.value,
    activeChooseEdgeId: activeChooseEvent.value?.edgeId,
    chooseEvent: activeChooseEvent.value,
  })
}

const renderedProbeEdges = computed<RenderedEdge[]>(() =>
  props.scene.probeEdges.map(renderProbeEdge).filter((edge) => edge !== null) as RenderedEdge[],
)
const renderedRejectedEdges = computed<RenderedEdge[]>(() =>
  props.scene.rejectedEdges.map(renderRejectedEdge).filter((edge) => edge !== null) as RenderedEdge[],
)
const renderedFinalEdges = computed<RenderedEdge[]>(() =>
  props.scene.finalEdges.map(renderFinalEdge).filter((edge) => edge !== null) as RenderedEdge[],
)
const renderedFinalBaseEdges = computed<RenderedEdge[]>(() =>
  props.scene.finalEdges.map(renderFinalBase).filter((edge) => edge !== null) as RenderedEdge[],
)
const renderedFinalPulseEdges = computed<RenderedEdge[]>(() =>
  props.scene.finalEdges.map(renderFinalPulse).filter((edge) => edge !== null) as RenderedEdge[],
)

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
  if (rootRef.value) {
    stageWidth.value = rootRef.value.clientWidth
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }
      stageWidth.value = entry.contentRect.width
    })
    resizeObserver.observe(rootRef.value)
  }
  document.addEventListener('fullscreenchange', syncFullscreenState)
  frameHandle = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameHandle)
  resizeObserver?.disconnect()
  document.removeEventListener('fullscreenchange', syncFullscreenState)
})
</script>
