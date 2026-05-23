'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import { InvoiceData } from '@/types';

const COLORS = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  secondary: '#f97316',
  dark: '#1e293b',
  gray600: '#4b5563',
  gray400: '#9ca3af',
  gray200: '#e5e7eb',
  gray100: '#f3f4f6',
  white: '#ffffff',
  teal50: '#f0fdfa',
  teal100: '#ccfbf1',
};

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 0,
    color: COLORS.dark,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.04,
    zIndex: 0,
  },
  watermarkImage: {
    width: 300,
    height: 300,
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  headerSection: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: COLORS.teal100,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  invoiceLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.teal100,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.white,
    marginTop: 2,
  },
  bodySection: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  infoBoxTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoField: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 9,
    color: COLORS.gray400,
    width: 70,
  },
  infoValue: {
    fontSize: 9,
    color: COLORS.dark,
    flex: 1,
    fontWeight: 500,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.primaryDark,
    marginBottom: 10,
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.teal50,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.dark,
  },
  tableCellBold: {
    fontSize: 9,
    color: COLORS.dark,
    fontWeight: 600,
  },
  colItem: { width: '28%' },
  colCode: { width: '12%' },
  colQty: { width: '8%', textAlign: 'center' },
  colPrice: { width: '13%', textAlign: 'right' },
  colPiece: { width: '13%', textAlign: 'right' },
  colWeight: { width: '10%', textAlign: 'center' },
  colTotal: { width: '16%', textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  totalsBox: {
    width: 220,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: COLORS.gray600,
  },
  totalsValue: {
    fontSize: 10,
    color: COLORS.dark,
    fontWeight: 500,
  },
  totalsRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    marginTop: 4,
  },
  totalsLabelFinal: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.primaryDark,
  },
  totalsValueFinal: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.primary,
  },
  footerSection: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: COLORS.gray400,
  },
  signatureSection: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signatureBox: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 160,
  },
  signatureImage: {
    width: 120,
    height: 50,
    marginBottom: 4,
  },
  signatureLine: {
    width: 140,
    height: 1,
    backgroundColor: COLORS.dark,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.gray400,
  },
  notesSection: {
    paddingHorizontal: 40,
    paddingVertical: 8,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.gray600,
    lineHeight: 1.4,
  },
  accentBar: {
    height: 4,
    backgroundColor: COLORS.secondary,
  },
});

interface InvoicePDFProps {
  data: InvoiceData;
  logoUrl?: string;
}

export default function InvoicePDF({ data, logoUrl }: InvoicePDFProps) {
  const fmt = (n: number) => `৳${n.toFixed(2)}`;
  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {logoUrl && (
          <View style={styles.watermarkContainer} fixed>
            <Image src={logoUrl} style={styles.watermarkImage} />
          </View>
        )}

        <View style={styles.contentWrapper}>
          <View style={styles.headerSection} fixed>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>H&B Trade</Text>
              <Text style={styles.headerSubtitle}>China to Bangladesh Product Sourcing & Shipping</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.invoiceLabel}>Invoice</Text>
              <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            </View>
          </View>

          <View style={styles.accentBar} fixed />

          <View style={styles.bodySection}>
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Invoice Details</Text>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Invoice Date</Text>
                  <Text style={styles.infoValue}>{fmtDate(data.invoiceDate)}</Text>
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Order Date</Text>
                  <Text style={styles.infoValue}>{fmtDate(data.orderDate)}</Text>
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Due Date</Text>
                  <Text style={styles.infoValue}>{fmtDate(data.dueDate)}</Text>
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Order No.</Text>
                  <Text style={styles.infoValue}>{data.orderNumber}</Text>
                </View>
                {data.trackingNumber && (
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Tracking</Text>
                    <Text style={styles.infoValue}>{data.trackingNumber}</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Bill To</Text>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{data.customerName}</Text>
                </View>
                {data.customerEmail && (
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{data.customerEmail}</Text>
                  </View>
                )}
                {data.customerPhone && (
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{data.customerPhone}</Text>
                  </View>
                )}
                {data.customerWhatsapp && (
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>WhatsApp</Text>
                    <Text style={styles.infoValue}>{data.customerWhatsapp}</Text>
                  </View>
                )}
                {data.customerAddress && (
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{data.customerAddress}</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Ship To</Text>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{data.customerName}</Text>
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{data.deliveryAddress || data.customerAddress || 'N/A'}</Text>
                </View>
                {data.shippingMethod && (
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Method</Text>
                    <Text style={styles.infoValue}>{data.shippingMethod}</Text>
                  </View>
                )}
                {data.netWeight && (
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Net Weight</Text>
                    <Text style={styles.infoValue}>{data.netWeight} kg</Text>
                  </View>
                )}
                {data.paymentInfo && (
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Payment</Text>
                    <Text style={styles.infoValue}>{data.paymentInfo}</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.tableHeader} fixed>
              <Text style={[styles.tableHeaderCell, styles.colItem]}>Item</Text>
              <Text style={[styles.tableHeaderCell, styles.colCode]}>Code</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colPiece]}>Per Pc</Text>
              <Text style={[styles.tableHeaderCell, styles.colWeight]}>Weight</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>
            {data.items.map((item, i) => (
              <View style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} key={i}>
                <Text style={[styles.tableCellBold, styles.colItem]}>{item.productName}</Text>
                <Text style={[styles.tableCell, styles.colCode]}>{item.productCode || '-'}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{fmt(item.unitPrice)}</Text>
                <Text style={[styles.tableCell, styles.colPiece]}>{item.perPiecePrice ? fmt(item.perPiecePrice) : '-'}</Text>
                <Text style={[styles.tableCell, styles.colWeight]}>{item.weight || '-'}</Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>{fmt(item.total)}</Text>
              </View>
            ))}

            <View style={styles.totalsSection}>
              <View style={styles.totalsBox}>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal</Text>
                  <Text style={styles.totalsValue}>{fmt(data.subtotal)}</Text>
                </View>
                {data.shippingCost !== undefined && data.shippingCost > 0 && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Shipping</Text>
                    <Text style={styles.totalsValue}>{fmt(data.shippingCost)}</Text>
                  </View>
                )}
                {data.discount !== undefined && data.discount > 0 && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Discount</Text>
                    <Text style={styles.totalsValue}>-{fmt(data.discount)}</Text>
                  </View>
                )}
                <View style={styles.totalsRowFinal}>
                  <Text style={styles.totalsLabelFinal}>Total</Text>
                  <Text style={styles.totalsValueFinal}>{fmt(data.totalAmount)}</Text>
                </View>
              </View>
            </View>
          </View>

          {data.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.infoBoxTitle}>Notes</Text>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          )}

          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              {(data.signatureUrl || data.useLogoAsSignature) && (
                <Image
                  src={data.useLogoAsSignature ? (logoUrl || '') : (data.signatureUrl || '')}
                  style={styles.signatureImage}
                />
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Authorized Signature</Text>
            </View>
          </View>

          <View style={styles.accentBar} fixed />
          <View style={styles.footerSection} fixed>
            <Text style={styles.footerText}>H&B Trade - Your Trusted Sourcing Partner</Text>
            <Text style={styles.footerText}>Generated on {fmtDate(new Date().toISOString())}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
