<template>
  <svg class="scenic-node-icon" viewBox="0 0 64 64" aria-hidden="true">
    <rect x="4" y="4" width="56" height="56" rx="20" :fill="spec.glow" />
    <g :stroke="spec.accent" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <template v-if="spec.variant === 'museum'">
        <path d="M12 24 32 14l20 10" />
        <path d="M16 26h32" />
        <path d="M18 26v18M28 26v18M36 26v18M46 26v18" />
        <path d="M14 46h36" />
      </template>
      <template v-else-if="spec.variant === 'gate'">
        <path d="M14 46h36" />
        <path d="M18 46V24h28v22" />
        <path d="M14 24h36" />
        <path d="M22 18h20l6 6H16z" />
        <path d="M28 46V32h8v14" />
      </template>
      <template v-else-if="spec.variant === 'academy'">
        <path d="M18 18h28v28H18z" />
        <path d="M22 24h20M22 30h20M22 36h14" />
        <path d="M18 46h28" />
      </template>
      <template v-else-if="spec.variant === 'buddha'">
        <path d="M24 22c0-4 3-8 8-8s8 4 8 8" />
        <path d="M22 30c3-4 6-6 10-6s7 2 10 6" />
        <path d="M24 46c1-7 3-11 8-11s7 4 8 11" />
      </template>
      <template v-else-if="spec.variant === 'monastery'">
        <path d="M16 46h32" />
        <path d="M18 46V26h28v20" />
        <path d="M14 26h36" />
        <path d="M20 20h24l4 6H16z" />
        <path d="M28 32h8M24 38h16" />
      </template>
      <template v-else-if="spec.variant === 'mountain'">
        <path d="M12 46 26 24l8 11 6-8 12 19" />
        <path d="M20 46h28" />
        <path d="M38 18c3 1 5 3 6 6" />
      </template>
      <template v-else-if="spec.variant === 'garden'">
        <path d="M16 40c6-8 10-12 16-12s10 4 16 12" />
        <path d="M16 40h32" />
        <path d="M26 28l6-10 6 10" />
        <path d="M22 46h20" />
      </template>
      <template v-else-if="spec.variant === 'shrine'">
        <path d="M14 24h36" />
        <path d="M18 24v22M46 24v22" />
        <path d="M20 18h24l6 6H14z" />
        <path d="M28 46V34h8v12" />
      </template>
      <template v-else-if="spec.variant === 'relic'">
        <path d="M18 44c4-10 8-15 14-15s10 5 14 15" />
        <path d="M20 44h24" />
        <path d="M24 26c2-4 5-6 8-6s6 2 8 6" />
        <path d="M22 18h20" />
      </template>
      <template v-else-if="spec.variant === 'canal'">
        <path d="M14 24c8 0 8 8 16 8s8-8 16-8 8 8 16 8" />
        <path d="M14 36c8 0 8 8 16 8s8-8 16-8 8 8 16 8" />
        <path d="M20 18h24" />
      </template>
      <template v-else-if="spec.variant === 'tower'">
        <path d="M32 14 20 24h24z" />
        <path d="M22 24h20v22H22z" />
        <path d="M18 46h28" />
        <path d="M28 30h8M28 36h8" />
      </template>
      <template v-else-if="spec.variant === 'pagoda'">
        <path d="M32 14 22 20h20z" />
        <path d="M20 28h24" />
        <path d="M18 36h28" />
        <path d="M24 20v24h16V20" />
        <path d="M18 46h28" />
      </template>
      <template v-else-if="spec.variant === 'wuhou'">
        <path d="M16 46c4-12 9-18 16-18s12 6 16 18" />
        <path d="M24 24c2-6 5-9 8-9s6 3 8 9" />
        <path d="M20 46h24" />
        <path d="M32 15v9" />
      </template>
    </g>
    <circle cx="50" cy="16" r="8" :fill="spec.accent" opacity="0.14" />
    <text x="18" y="40" :fill="spec.accent">{{ spec.label }}</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { spotIconRegistry, type SpotIconSpec } from '../data/spot-icons'

const props = defineProps<{
  name: string
}>()

const fallbackSpec = spotIconRegistry['河南博物院'] as SpotIconSpec
const spec = computed<SpotIconSpec>(() => spotIconRegistry[props.name] ?? fallbackSpec)
</script>
