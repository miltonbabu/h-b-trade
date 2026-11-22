/**
 * Central registry of human-readable status labels + email timelines.
 * Mirrors the status sequences used by admin routes and the frontend tracking pages.
 */

const ORDER_STATUS_SEQUENCE = [
  { value: 'pending', label: 'Pending', description: 'Order received, awaiting processing' },
  { value: 'processing', label: 'Processing', description: 'Order is being prepared' },
  { value: 'guangzhou_warehouse', label: 'Guangzhou Warehouse Received', description: 'Package received at Guangzhou warehouse' },
  { value: 'in_transit', label: 'Flying', description: 'Package is flying to Bangladesh' },
  { value: 'dhaka_customs', label: 'Dhaka Customs Clearance', description: 'Package is at Dhaka customs' },
  { value: 'dhaka_office', label: 'Dhaka Office', description: 'Package arrived at Dhaka office' },
  { value: 'delivered', label: 'Delivered To Customer', description: 'Package delivered to customer' },
  { value: 'cancelled', label: 'Cancelled', description: 'Order cancelled' },
];

const SEA_STATUS_SEQUENCE = [
  { value: 'sea_received_warehouse', label: 'Received at the warehouse', description: 'Shipment received at the warehouse' },
  { value: 'sea_container_loading', label: 'Container loading', description: 'Shipment is being loaded into a container' },
  { value: 'sea_in_transit', label: 'In transit', description: 'Shipment is in transit by sea' },
  { value: 'sea_chittagong_port', label: 'Chittagong port', description: 'Shipment arrived at Chittagong port' },
  { value: 'sea_chittagong_customs', label: 'Chittagong customs', description: 'Shipment is undergoing customs clearance' },
  { value: 'sea_customs_released', label: 'Customs released', description: 'Shipment has been released by customs' },
  { value: 'sea_dhaka_office', label: 'Dhaka office', description: 'Shipment arrived at the Dhaka office' },
  { value: 'sea_delivered', label: 'Delivered to customer', description: 'Shipment delivered to customer' },
  { value: 'cancelled', label: 'Cancelled', description: 'Order cancelled' },
];

const SERVICE_STATUS_MAP = {
  received: { label: 'Received', description: 'Your service request has been received. Our team will review it shortly.' },
  in_progress: { label: 'In Progress', description: 'Our team is working on your service request.' },
  quoted: { label: 'Quote Ready', description: 'We have prepared a quote for your request.' },
  confirmed: { label: 'Confirmed', description: 'Your request has been confirmed and processing will begin.' },
  completed: { label: 'Completed', description: 'Your service request has been completed successfully.' },
  cancelled: { label: 'Cancelled', description: 'This service request has been cancelled.' },
  converted: { label: 'Converted to Order', description: 'Your request has been converted into an order.' },
};

const PRODUCT_REQUEST_STATUS_MAP = {
  pending: { label: 'Pending', description: 'Your request has been received and is awaiting review.' },
  processing: { label: 'Processing', description: 'We are sourcing and preparing your quote.' },
  quoted: { label: 'Quote Ready', description: 'We have prepared a quote for your request.' },
  confirmed: { label: 'Confirmed', description: 'Your request has been confirmed.' },
  completed: { label: 'Completed', description: 'Your request has been completed successfully.' },
  cancelled: { label: 'Cancelled', description: 'This request has been cancelled.' },
  converted: { label: 'Converted to Order', description: 'Your request has been converted into an order.' },
};

const SERVICE_TYPE_LABELS = {
  product_sourcing: 'Product Sourcing',
  wholesale_supply: 'Wholesale Supply',
  air_cargo: 'Air Cargo',
  sea_shipping: 'Sea Shipping',
  hand_carry: 'Hand Carry',
  canton_fair: 'Canton Fair Support',
};

const isSeaShipping = (method) => /sea/i.test(String(method || ''));

const orderStatusLabel = (shippingMethod, status) => {
  const seq = isSeaShipping(shippingMethod) ? SEA_STATUS_SEQUENCE : ORDER_STATUS_SEQUENCE;
  const found = seq.find((s) => s.value === status);
  return found ? found.label : String(status || '').replace(/_/g, ' ');
};

const orderStatusDescription = (shippingMethod, status) => {
  const seq = isSeaShipping(shippingMethod) ? SEA_STATUS_SEQUENCE : ORDER_STATUS_SEQUENCE;
  const found = seq.find((s) => s.value === status);
  return found ? found.description : '';
};

/**
 * Build an email timeline for an order.
 * Returns [{ value, label, description, state: 'done'|'current'|'upcoming' }]
 */
const buildOrderTimeline = (shippingMethod, currentStatus) => {
  const seq = (isSeaShipping(shippingMethod) ? SEA_STATUS_SEQUENCE : ORDER_STATUS_SEQUENCE)
    .filter((s) => s.value !== 'cancelled');
  const currentIndex = seq.findIndex((s) => s.value === currentStatus);
  return seq.map((s, i) => ({
    value: s.value,
    label: s.label,
    description: s.description,
    state: currentIndex < 0 ? 'upcoming' : i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
};

/** Timeline for service/product requests (single-track statuses). */
const buildRequestTimeline = (statusMap, currentStatus) => {
  const order = ['pending', 'received', 'processing', 'in_progress', 'quoted', 'confirmed', 'completed'];
  const entries = order.filter((v) => statusMap[v]).map((v) => ({ value: v, ...statusMap[v] }));
  const currentIndex = entries.findIndex((s) => s.value === currentStatus);
  return entries.map((s, i) => ({
    value: s.value,
    label: s.label,
    description: s.description,
    state: currentIndex < 0 ? 'upcoming' : i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
};

const serviceStatusLabel = (status) =>
  (SERVICE_STATUS_MAP[status] && SERVICE_STATUS_MAP[status].label) || String(status || '').replace(/_/g, ' ');

const productRequestStatusLabel = (status) =>
  (PRODUCT_REQUEST_STATUS_MAP[status] && PRODUCT_REQUEST_STATUS_MAP[status].label) || String(status || '').replace(/_/g, ' ');

const serviceTypeLabel = (type) => SERVICE_TYPE_LABELS[type] || String(type || '').replace(/_/g, ' ');

module.exports = {
  ORDER_STATUS_SEQUENCE,
  SEA_STATUS_SEQUENCE,
  SERVICE_STATUS_MAP,
  PRODUCT_REQUEST_STATUS_MAP,
  SERVICE_TYPE_LABELS,
  isSeaShipping,
  orderStatusLabel,
  orderStatusDescription,
  buildOrderTimeline,
  buildRequestTimeline,
  serviceStatusLabel,
  productRequestStatusLabel,
  serviceTypeLabel,
};
