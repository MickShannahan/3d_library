<script setup lang="ts">
import { inject, ref } from 'vue'
import { CustomerContact } from '@/models/Order'

const STATUS_OPTIONS = ['pending', 'hold', 'printing', 'shipped', 'completed', 'archived'] as const
const CONTACT_TYPES = ['phone', 'email', 'discord', 'etsy', 'twitter', 'bluesky'] as const

const CONTACT_ICONS: Record<string, string> = {
  phone: 'mdi-phone', email: 'mdi-email-outline', discord: 'mdi-discord',
  etsy: 'mdi-shopping-outline', twitter: 'mdi-twitter', bluesky: 'mdi-cloud-outline',
}
const STATUS_ICONS: Record<string, string> = {
  pending: 'mdi-clock-outline', hold: 'mdi-pause-circle-outline', printing: 'mdi-printer-outline',
  shipped: 'mdi-truck-outline', completed: 'mdi-check-circle-outline', archived: 'mdi-archive-outline',
}

const formData = inject<any>('orderFormData')
const openDropdowns = ref<Set<string>>(new Set())

function addContact() {
  formData.customerContacts.push(new CustomerContact({ type: 'email', value: '' }))
}
function removeContact(index: number) {
  formData.customerContacts.splice(index, 1)
}
function toggleDropdown(id: string) {
  if (openDropdowns.value.has(id)) openDropdowns.value.delete(id)
  else openDropdowns.value.add(id)
}
function closeDropdown(id: string) {
  openDropdowns.value.delete(id)
}
function addFileAttachment(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  formData.attachmentImg = { name: file.name, url: URL.createObjectURL(file), file }
  ;(event.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="container-fluid px-2 py-1">
    <div class="row g-3">

      <!-- Customer Name -->
      <div class="col-12 col-md-6">
        <label class="form-label">
          <i class="mdi mdi-card-account-details me-1"></i>Customer Name
          <span class="text-danger ms-1">*</span>
        </label>
        <input v-model="formData.customerName" type="text" class="form-control"
          placeholder="Enter customer name" required />
      </div>

      <!-- Customer Price -->
      <div class="col-6 col-md-3">
        <label class="form-label">Customer Price</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input v-model.number="formData.customerPrice" type="number" class="form-control"
            placeholder="0.00" step="0.01" min="0" />
        </div>
      </div>

      <!-- Status -->
      <div class="col-6 col-md-3">
        <label class="form-label">Status</label>
        <div class="dropdown w-100">
          <button type="button" class="btn border w-100 text-start d-flex align-items-center gap-2"
            :class="{ show: openDropdowns.has('status') }" @click="toggleDropdown('status')">
            <i class="mdi" :class="STATUS_ICONS[formData.status]"></i>
            {{ formData.status.charAt(0).toUpperCase() + formData.status.slice(1) }}
            <i class="mdi mdi-chevron-down ms-auto"></i>
          </button>
          <ul class="dropdown-menu w-100" :class="{ show: openDropdowns.has('status') }">
            <li v-for="s in STATUS_OPTIONS" :key="s">
              <a href="#" class="dropdown-item d-flex align-items-center gap-2"
                :class="{ active: formData.status === s }"
                @click.prevent="formData.status = s; closeDropdown('status')">
                <i class="mdi" :class="STATUS_ICONS[s]"></i>
                {{ s.charAt(0).toUpperCase() + s.slice(1) }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="col-12">
        <label class="form-label"><i class="mdi mdi-map-marker me-1"></i>Shipping Address</label>
        <textarea v-model="formData.customerAddress" class="form-control" rows="2"
          placeholder="Street, City, State, Zip"></textarea>
      </div>

      <!-- Contacts -->
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label mb-0"><i class="mdi mdi-comment-account me-1"></i>Contacts</label>
          <button type="button" class="btn btn-sm btn-outline-light" @click="addContact">
            <i class="mdi mdi-plus"></i> Add
          </button>
        </div>
        <div v-for="(contact, index) in formData.customerContacts" :key="`c-${index}`"
          class="row g-2 mb-2 align-items-center">
          <div class="col-auto">
            <div class="dropdown">
              <button type="button" class="btn border"
                :class="{ show: openDropdowns.has(`c-${index}`) }"
                @click="toggleDropdown(`c-${index}`)">
                <i class="mdi" :class="CONTACT_ICONS[contact.type]"></i>
                <i class="mdi mdi-chevron-down"></i>
              </button>
              <ul class="dropdown-menu" :class="{ show: openDropdowns.has(`c-${index}`) }">
                <li v-for="type in CONTACT_TYPES" :key="type">
                  <a href="#" class="dropdown-item d-flex align-items-center gap-2"
                    @click.prevent="contact.type = type; closeDropdown(`c-${index}`)">
                    <i class="mdi" :class="CONTACT_ICONS[type]"></i>
                    {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="col">
            <input v-model="contact.value" type="text" class="form-control form-control-sm"
              :placeholder="`${contact.type} handle`" />
          </div>
          <div class="col-auto">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="removeContact(index)">
              <i class="mdi mdi-trash-can"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Payment toggles -->
      <div class="col-12 d-flex gap-4 mt-1">
        <div class="form-check form-switch">
          <input id="od-customerPaid" v-model="formData.customerPaid" type="checkbox"
            class="form-check-input" role="switch" />
          <label for="od-customerPaid" class="form-check-label">Customer Paid</label>
        </div>
        <div class="form-check form-switch">
          <input id="od-paid" v-model="formData.paid" type="checkbox"
            class="form-check-input" role="switch" />
          <label for="od-paid" class="form-check-label">Paid Out</label>
        </div>
      </div>

      <!-- Initial Note -->
      <div class="col-12">
        <label class="form-label">
          Order Note <span class="text-muted fw-normal small">(optional)</span>
        </label>
        <div class="position-relative">
          <textarea v-model="formData.noteBody" class="form-control ps-2 pe-5" rows="3"
            placeholder="Any notes for this order..."></textarea>
          <input @change="addFileAttachment" type="file" accept="image/*" class="file-attachment" />
        </div>
        <div v-if="formData.attachmentImg" class="position-relative mt-2">
          <img class="img-fluid rounded" :src="formData.attachmentImg.url" />
          <span @click="formData.attachmentImg = null" class="btn cancel-btn">
            <i class="mdi mdi-cancel"></i>
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.dropdown-menu.show {
  background: rgba(var(--bs-dark-rgb), .5);
  backdrop-filter: blur(18px);
  border: 1px solid var(--bs-border-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.file-attachment {
  width: 0;
  &::after {
    cursor: pointer;
    border-radius: .5rem;
    padding: .2em .5em;
    color: rgba(var(--bs-primary-rgb), 1);
    background-color: var(--bs-tertiary-bg);
    right: 0rem;
    top: 2rem;
    position: absolute;
    font-family: "Material Design Icons";
    content: "\F1AC9";
    border: 1px solid var(--bs-primary);
    &:hover { filter: brightness(1.2) saturate(1.1); }
  }
}

.cancel-btn {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
