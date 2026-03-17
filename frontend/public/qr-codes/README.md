# QR Code Setup Instructions

## How to Add Your QR Codes:

1. **Place your QR code images in this folder:**
   - `frontend/public/qr-codes/`
   - Name them: `wechat-qr.png` and `alipay-qr.png`

2. **Or use online QR generators:**
   - WeChat: https://pay.weixin.qq.com/
   - Alipay: https://qr.alipay.com/

3. **Recommended QR code size:**
   - 300x300 pixels
   - PNG format (not JPEG)
   - File size: < 50KB

## Current Setup:

The system is configured to look for QR codes in:
`frontend/public/qr-codes/`

## Next Steps:

Once you add your QR codes here, they will automatically appear in:
- Cart order page (payment section)
- Admin dashboard
- Customer checkout

No database changes needed - this uses local file storage!