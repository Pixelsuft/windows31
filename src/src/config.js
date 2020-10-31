"use strict";
var DEBUG = false;
var LOG_TO_FILE = false;
var LOG_ALL_IO = false;
var LOG_PAGE_FAULTS = false;
var LOG_LEVEL = LOG_ALL & ~LOG_PS2 & ~LOG_PIT & ~LOG_VIRTIO & ~LOG_9P & ~LOG_PIC &
                          ~LOG_DMA & ~LOG_SERIAL & ~LOG_NET & ~LOG_FLOPPY & ~LOG_DISK;
var DEBUG_SCREEN_LAYERS = false;
var ENABLE_HPET = false;
var ENABLE_ACPI = false;
var LOOP_COUNTER = 11001;
var TIME_PER_FRAME = 1;
var TSC_RATE = 8 * 1024;
var APIC_TIMER_FREQ = TSC_RATE;
var VMWARE_HYPERVISOR_PORT = true;
