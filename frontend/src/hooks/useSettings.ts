import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface SiteSettings {
  company_name: string;
  phone: string;
  email: string;
  whatsapp_link: string;
  facebook_page: string;
  facebook_group: string;
  office_address: string;
  bkash: string;
  nagad: string;
  bank_account: string;
  wechat: string;
  alipay: string;
  wechat_qr: string;
  alipay_qr: string;
}

const defaultSettings: SiteSettings = {
  company_name: 'H&B Trade',
  phone: '+880 1835220729',
  email: 'helpandbenefit30@gmail.com',
  whatsapp_link: 'https://wa.me/8801835220729',
  facebook_page: 'https://facebook.com/hbtradebd',
  facebook_group: '',
  office_address: 'Guangzhou, China | Dhaka, Bangladesh',
  bkash: '0183522072',
  nagad: '0183522072',
  bank_account: '',
  wechat: '',
  alipay: '',
  wechat_qr: '',
  alipay_qr: '',
};

let cachedSettings: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || defaultSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      return;
    }

    const load = async () => {
      if (!fetchPromise) {
        fetchPromise = api.get('/settings').then((res) => {
          const data = res.data.data;
          const mapped: SiteSettings = {
            company_name: data.company_name || defaultSettings.company_name,
            phone: data.phone || defaultSettings.phone,
            email: data.email || defaultSettings.email,
            whatsapp_link: data.whatsapp_link || defaultSettings.whatsapp_link,
            facebook_page: data.facebook_page || defaultSettings.facebook_page,
            facebook_group: data.facebook_group || '',
            office_address: data.office_address || defaultSettings.office_address,
            bkash: data.bkash || defaultSettings.bkash,
            nagad: data.nagad || defaultSettings.nagad,
            bank_account: data.bank_account || data.bankAccount || '',
            wechat: data.wechat || '',
            alipay: data.alipay || '',
            wechat_qr: data.wechat_qr || data.wechatQr || '',
            alipay_qr: data.alipay_qr || data.alipayQr || '',
          };
          cachedSettings = mapped;
          return mapped;
        }).catch(() => {
          return defaultSettings;
        }).finally(() => {
          fetchPromise = null;
        });
      }
      const result = await fetchPromise;
      setSettings(result);
    };

    load();
  }, []);

  return settings;
}

export function clearSettingsCache() {
  cachedSettings = null;
  fetchPromise = null;
}
