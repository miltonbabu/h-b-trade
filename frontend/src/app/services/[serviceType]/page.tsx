import ServiceRequestForm from './ServiceRequestForm';

export function generateStaticParams() {
  return [
    { serviceType: 'product-sourcing' },
    { serviceType: 'wholesale-supply' },
    { serviceType: 'air-cargo' },
    { serviceType: 'sea-shipping' },
    { serviceType: 'hand-carry' },
    { serviceType: 'canton-fair' },
  ];
}

export default async function ServiceRequestPage({ params }: { params: Promise<{ serviceType: string }> }) {
  const { serviceType } = await params;
  return <ServiceRequestForm serviceType={serviceType} />;
}
