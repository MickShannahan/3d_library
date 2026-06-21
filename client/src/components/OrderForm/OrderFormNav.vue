<script setup lang="ts">
defineProps<{
  stepLabels: string[]
  currentStep: number
  orderTotal: number
  modelCount: number
  loading: boolean
  isEditMode: boolean
  canAddModel: boolean
}>()

defineEmits<{
  (e: 'go', step: number): void
  (e: 'add-model'): void
  (e: 'submit'): void
}>()
</script>

<template>
  <div class="order-form-nav border-top pt-2">

    <!-- Step pills -->
    <div class="step-pills">
      <button
        v-for="(label, i) in stepLabels"
        :key="i"
        type="button"
        class="step-pill"
        :class="{ active: currentStep === i, 'text-muted': currentStep !== i }"
        @click="$emit('go', i)"
        :title="label"
      >
        <i class="mdi me-1" :class="i === 0 ? 'mdi-account-outline' : 'mdi-cube-outline'"></i>
        <span class="step-pill-label">{{ label }}</span>
      </button>

      <!-- Add Model button (as a step pill) -->
      <button
        v-if="canAddModel"
        type="button"
        class="step-pill step-pill--add"
        @click="$emit('add-model')"
        title="Add another model"
      >
        <i class="mdi mdi-plus-circle-outline me-1"></i>
        <span class="step-pill-label">Add Model</span>
      </button>
    </div>

    <!-- Summary + Submit row -->
    <div class="d-flex align-items-center justify-content-between mt-2 gap-3 flex-wrap">
      <div class="summary d-flex align-items-center gap-3">
        <span class="text-muted small">
          <i class="mdi mdi-cube-outline me-1"></i>
          {{ modelCount }} model{{ modelCount !== 1 ? 's' : '' }}
        </span>
        <span v-if="orderTotal > 0" class="fw-semibold small">
          <i class="mdi mdi-currency-usd"></i>{{ orderTotal.toFixed(2) }} total
        </span>
      </div>

      <div class="d-flex gap-2 ms-auto">
        <button type="button" class="btn text-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-normal-grad px-4"
          :disabled="loading" @click="$emit('submit')">
          <span v-if="!loading">
            {{ isEditMode ? 'Save Changes' : 'Create Order' }}
            <i class="mdi ms-1" :class="isEditMode ? 'mdi-content-save' : 'mdi-check'"></i>
          </span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isEditMode ? 'Saving...' : 'Creating...' }}
          </span>
        </button>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.order-form-nav {
  border-color: rgba(var(--bs-border-color-rgb), 0.3) !important;
}

.step-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
}

.step-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--bs-border-color-rgb), 0.4);
  background: transparent;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  color: inherit;
  white-space: nowrap;

  &:hover {
    background: rgba(var(--bs-primary-rgb), .1);
    border-color: rgba(var(--bs-primary-rgb), .4);
    color: var(--bs-primary);
  }

  &.active {
    background: rgba(var(--bs-primary-rgb), .2);
    border-color: rgba(var(--bs-primary-rgb), .6);
    color: var(--bs-primary);
    font-weight: 600;
  }

  &--add {
    border-style: dashed;
    color: var(--bs-success);
    border-color: rgba(var(--bs-success-rgb), .5);
    &:hover {
      background: rgba(var(--bs-success-rgb), .1);
      border-color: var(--bs-success);
      color: var(--bs-success);
    }
  }
}

.step-pill-label {
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
