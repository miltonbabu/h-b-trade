import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const BD_TZ = 'Asia/Dhaka';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    timeZone: BD_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    timeZone: BD_TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDateTime(date: string | Date): string {
  const d = new Date(date);
  const month = d.toLocaleString('en-US', { timeZone: BD_TZ, month: 'short' });
  const day = d.toLocaleString('en-US', { timeZone: BD_TZ, day: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { timeZone: BD_TZ, hour: '2-digit', minute: '2-digit' });
  return `${month} ${day} · ${time}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    guangzhou_warehouse: 'bg-purple-100 text-purple-800',
    in_transit: 'bg-indigo-100 text-indigo-800',
    'in-transit': 'bg-indigo-100 text-indigo-800',
    dhaka_customs: 'bg-orange-100 text-orange-800',
    dhaka_office: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    shipped: 'bg-purple-100 text-purple-800',
    custom: 'bg-violet-100 text-violet-800',
    confirmed: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    new: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-indigo-100 text-indigo-800',
  }
  return colors[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    guangzhou_warehouse: 'Guangzhou Warehouse',
    in_transit: 'In Transit',
    'in-transit': 'In Transit',
    dhaka_customs: 'Dhaka Customs',
    dhaka_office: 'Dhaka Office',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    completed: 'Completed',
    active: 'Active',
    inactive: 'Inactive',
    shipped: 'Shipped',
    custom: 'Custom',
    confirmed: 'Confirmed',
    approved: 'Approved',
    new: 'New',
    reviewing: 'Reviewing',
    quoted: 'Quoted',
  }
  return labels[(status || '').toLowerCase()] || status
}
