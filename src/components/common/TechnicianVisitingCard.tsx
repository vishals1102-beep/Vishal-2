import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Download, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Wrench, 
  Sparkles,
  QrCode,
  ExternalLink,
  Award,
  Flame,
  CreditCard,
  Barcode,
  Plus,
  Edit3,
  Upload,
  X,
  IndianRupee,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { TechnicianProfile } from '../../types';
import { useApp } from '../../context/AppContext';

interface TechnicianVisitingCardProps {
  technician: TechnicianProfile;
  isScanned?: boolean;
  onScanAnother?: () => void;
  allowEdit?: boolean;
}

export const TechnicianVisitingCard: React.FC<TechnicianVisitingCardProps> = ({
  technician,
  isScanned = false,
  onScanAnother,
  allowEdit = true
}) => {
  const { currentTech, updateTechnicianProfile } = useApp();

  // Active display code on the Visiting Card: 'vcard' or 'upi_barcode'
  const [activeCodeMode, setActiveCodeMode] = useState<'vcard' | 'upi_barcode'>(
    technician.upiId ? 'upi_barcode' : 'vcard'
  );

  // QR URLs state
  const [vCardQrUrl, setVCardQrUrl] = useState<string>('');
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // Modal for "Add Own UPI Bar Code"
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [upiIdInput, setUpiIdInput] = useState<string>(technician.upiId || '');
  const [upiPayeeInput, setUpiPayeeInput] = useState<string>(technician.upiPayeeName || technician.shopName || technician.fullName);
  const [upiBarcodeTypeInput, setUpiBarcodeTypeInput] = useState<'qr' | 'barcode'>(technician.upiBarcodeType || 'qr');
  const [upiImageInput, setUpiImageInput] = useState<string>(technician.upiQrImageUrl || '');
  const [modalPreviewQr, setModalPreviewQr] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if viewing current logged-in technician
  const isOwner = currentTech.id === technician.id;

  // Construct standard vCard 3.0 payload
  const vCardString = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${technician.fullName}`,
    `ORG:${technician.shopName}`,
    'TITLE:Electronics & Micro-Soldering Specialist',
    `TEL;TYPE=CELL,VOICE:${technician.mobileNumber}`,
    `TEL;TYPE=WHATSAPP:${technician.whatsappNumber}`,
    `EMAIL:${technician.email}`,
    `ADR;TYPE=WORK:;;${technician.completeAddress};;;;`,
    technician.upiId ? `NOTE:Direct UPI: ${technician.upiId} • QuickFix Verified Workshop` : `NOTE:QuickFix Verified Workshop`,
    'END:VCARD'
  ].join('\n');

  // Construct standard NPCI UPI URI
  const currentUpiId = technician.upiId || '';
  const currentPayee = technician.upiPayeeName || technician.shopName || technician.fullName;
  const upiPaymentUri = currentUpiId 
    ? `upi://pay?pa=${encodeURIComponent(currentUpiId)}&pn=${encodeURIComponent(currentPayee)}&cu=INR`
    : '';

  // Generate vCard QR
  useEffect(() => {
    QRCode.toDataURL(vCardString, {
      width: 320,
      margin: 1,
      color: {
        dark: '#090d16',
        light: '#ffffff'
      }
    }).then(url => {
      setVCardQrUrl(url);
    }).catch(err => {
      console.error('Failed to generate vCard QR', err);
    });
  }, [technician, vCardString]);

  // Generate UPI QR
  useEffect(() => {
    if (currentUpiId) {
      QRCode.toDataURL(upiPaymentUri, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0a192f',
          light: '#ffffff'
        }
      }).then(url => {
        setUpiQrUrl(url);
      }).catch(err => {
        console.error('Failed to generate UPI QR', err);
      });
    } else {
      setUpiQrUrl('');
    }
  }, [currentUpiId, upiPaymentUri]);

  // Generate Preview QR in Modal
  useEffect(() => {
    if (upiIdInput.trim()) {
      const uri = `upi://pay?pa=${encodeURIComponent(upiIdInput.trim())}&pn=${encodeURIComponent(upiPayeeInput.trim() || 'Technician')}&cu=INR`;
      QRCode.toDataURL(uri, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => {
        setModalPreviewQr(url);
      }).catch(() => {
        setModalPreviewQr('');
      });
    } else {
      setModalPreviewQr('');
    }
  }, [upiIdInput, upiPayeeInput]);

  // Open modal with current technician data
  const handleOpenUpiModal = () => {
    setUpiIdInput(technician.upiId || '');
    setUpiPayeeInput(technician.upiPayeeName || technician.shopName || technician.fullName);
    setUpiBarcodeTypeInput(technician.upiBarcodeType || 'qr');
    setUpiImageInput(technician.upiQrImageUrl || '');
    setSaveSuccess(false);
    setIsUpiModalOpen(true);
  };

  // Save UPI details
  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiIdInput.trim()) return;

    updateTechnicianProfile({
      upiId: upiIdInput.trim(),
      upiPayeeName: upiPayeeInput.trim() || technician.shopName,
      upiBarcodeType: upiBarcodeTypeInput,
      upiQrImageUrl: upiImageInput || undefined
    });

    setSaveSuccess(true);
    setActiveCodeMode('upi_barcode');
    setTimeout(() => {
      setIsUpiModalOpen(false);
      setSaveSuccess(false);
    }, 900);
  };

  // Handle custom image upload for UPI barcode
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUpiImageInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download .vcf contact file
  const handleDownloadVCard = () => {
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${technician.fullName.replace(/\s+/g, '_')}_VisitingCard.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Active QR / Barcode Code PNG
  const handleDownloadCode = () => {
    const targetUrl = activeCodeMode === 'upi_barcode' ? (technician.upiQrImageUrl || upiQrUrl) : vCardQrUrl;
    if (!targetUrl) return;
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `${technician.fullName.replace(/\s+/g, '_')}_${activeCodeMode === 'upi_barcode' ? 'UPI_Barcode' : 'vCard_QR'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUpiId = () => {
    if (!technician.upiId) return;
    navigator.clipboard.writeText(technician.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyCardDetails = () => {
    const text = 
      `🪪 *TECHNICIAN VISITING CARD*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏢 *${technician.shopName}*\n` +
      `👨‍🔧 *${technician.fullName}* (ID: ${technician.id})\n` +
      `🛠️ *Specialist:* Micro-Soldering, CPU Reballing & Display Restoration\n` +
      `📞 *Phone:* ${technician.mobileNumber}\n` +
      `💬 *WhatsApp:* ${technician.whatsappNumber}\n` +
      (technician.upiId ? `💳 *Direct UPI ID:* ${technician.upiId} (Pay directly to workshop)\n` : '') +
      `📍 *Address:* ${technician.completeAddress}\n` +
      `⏰ *Hours:* ${technician.workingHours}\n` +
      `⭐ *Rating:* ${technician.rating} / 5.0 (${technician.totalRepairsCompleted}+ repairs)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Technician Visiting Card - ${technician.shopName}*\n\n` +
      `👨‍🔧 *Technician:* ${technician.fullName} (${technician.id})\n` +
      `📞 *Phone:* ${technician.mobileNumber}\n` +
      (technician.upiId ? `💳 *Pay via UPI:* ${technician.upiId} (Payee: ${technician.upiPayeeName || technician.shopName})\n` : '') +
      `📍 *Address:* ${technician.completeAddress}\n` +
      `⏰ *Working Hours:* ${technician.workingHours}\n` +
      `⭐ *Verified Rating:* ${technician.rating} ★\n\n` +
      `Save my digital contact card or visit our verified workshop for precision repairs!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Helper function to render a realistic linear barcode SVG for UPI VPA
  const renderLinearBarcode = (codeString: string) => {
    // Generate deterministic bar widths from string
    const bars: number[] = [];
    // Start guard
    bars.push(2, 1, 2);
    for (let i = 0; i < codeString.length; i++) {
      const charCode = codeString.charCodeAt(i);
      const w1 = (charCode % 3) + 1;
      const w2 = ((charCode >> 1) % 2) + 1;
      const w3 = ((charCode >> 2) % 3) + 1;
      bars.push(w1, w2, w3);
    }
    // Stop guard
    bars.push(2, 1, 2, 3);

    return (
      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-200 w-full">
        <svg className="w-full h-16 max-w-[220px]" viewBox={`0 0 ${bars.reduce((a, b) => a + b, 0) * 2} 50`}>
          {bars.map((w, idx) => {
            const isBlack = idx % 2 === 0;
            const x = bars.slice(0, idx).reduce((a, b) => a + b, 0) * 2;
            return isBlack ? (
              <rect key={idx} x={x} y={0} width={w * 2} height={50} fill="#0f172a" />
            ) : null;
          })}
        </svg>
        <div className="font-mono text-[10px] text-slate-900 tracking-wider font-bold mt-1 max-w-[200px] truncate text-center">
          {codeString}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* If scanned from camera, show success banner */}
      {isScanned && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-sm text-emerald-950">
                  Technician Visiting Card Scanned Successfully
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  Verified ID
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Official workshop credential verified with <strong>National QuickFix Network</strong> accreditation.
              </p>
            </div>
          </div>

          {onScanAnother && (
            <button
              onClick={onScanAnother}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              Scan Another Card / Label
            </button>
          )}
        </div>
      )}

      {/* Main Visiting Card Container (Interactive & Printable) */}
      <div className="flex flex-col items-center">
        {/* Top Control Bar: Toggle between vCard and Own UPI Barcode */}
        <div className="w-full max-w-xl mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              data-testid="tab-vc-vcard-code"
              onClick={() => setActiveCodeMode('vcard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                activeCodeMode === 'vcard'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-sky-600" />
              <span>Digital vCard QR</span>
            </button>

            <button
              data-testid="tab-vc-upi-barcode"
              onClick={() => setActiveCodeMode('upi_barcode')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                activeCodeMode === 'upi_barcode'
                  ? 'bg-slate-900 text-amber-400 shadow-xs border border-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              <span>Own UPI Barcode</span>
              {technician.upiId ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900">
                  New
                </span>
              )}
            </button>
          </div>

          {allowEdit && isOwner && (
            <button
              data-testid="btn-add-own-upi-barcode"
              onClick={handleOpenUpiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-heading font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 border border-amber-400"
              title="Add or configure your direct UPI Barcode / QR Code for this visiting card"
            >
              {technician.upiId ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Own UPI Barcode</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Own UPI Barcode</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* The Realistic Business Card */}
        <div 
          id="technician-visiting-card-print"
          className="w-full max-w-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-400/40 relative overflow-hidden print:m-0 print:shadow-none print:border print:w-full"
        >
          {/* Top Indian Tricolor Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#138808]" />
          </div>

          {/* Background subtle geometric circuits */}
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-56 h-56 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Top Header Strip: Make in India + Verified Workshop */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3.5 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block leading-tight">
                  DIGITAL VISITING CARD
                </span>
                <span className="font-heading font-black text-xs text-white tracking-wide">
                  QUICK FIX NETWORK
                </span>
              </div>
            </div>

            {/* Verified Workshop Insignia */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-emerald-500/10 border border-emerald-400/40 text-emerald-300">
              <span className="text-xs">🇮🇳</span>
              <span className="text-[10px] font-heading font-black uppercase tracking-wider text-emerald-300">
                VERIFIED WORKSHOP
              </span>
            </div>
          </div>

          {/* Middle Body: Technician & Workshop Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
            {/* Left 2 Cols: Profile & Info */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-start gap-3.5">
                <img 
                  src={technician.technicianPhoto} 
                  alt={technician.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-slate-800 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-heading font-black text-lg sm:text-xl text-white leading-tight">
                      {technician.fullName}
                    </h2>
                    {technician.verificationStatus === 'verified' && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-bold text-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-sky-400 mt-0.5">
                    {technician.shopName}
                  </p>
                  {/* Make in India and Indian flag down to shop name */}
                  <div className="flex items-center gap-1.5 mt-0.5 mb-0.5">
                    <span className="text-xs">🇮🇳</span>
                    <span className="text-[10px] font-bold text-orange-300 tracking-wide uppercase">
                      Make in India
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">
                    ID: {technician.id} • {technician.experienceYears}+ Years Lab Experience
                  </p>
                </div>
              </div>

              {/* Contact Information List */}
              <div className="space-y-1.5 text-xs text-slate-200 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <a href={`tel:${technician.mobileNumber}`} className="font-mono hover:text-amber-300 font-semibold">
                    {technician.mobileNumber}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-300">WhatsApp: {technician.whatsappNumber}</span>
                </div>

                {/* Direct UPI ID on Card Info */}
                {technician.upiId && (
                  <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-mono text-amber-300 font-bold truncate">
                      UPI: {technician.upiId}
                    </span>
                    <button
                      onClick={handleCopyUpiId}
                      className="ml-auto text-[10px] text-slate-400 hover:text-white"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-300 leading-tight">
                    {technician.completeAddress}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] text-slate-400">{technician.workingHours}</span>
                </div>
              </div>

              {/* Specialization Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {technician.servicesProvided.slice(0, 3).map((service, idx) => (
                  <span 
                    key={idx}
                    className="text-[9px] px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/10"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Col: High-Res Scannable Code Display */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-slate-900 border border-slate-200 text-center shadow-lg min-h-[170px]">
              {activeCodeMode === 'upi_barcode' ? (
                // OWN UPI BARCODE / QR DISPLAY
                technician.upiId ? (
                  <div className="flex flex-col items-center w-full">
                    {technician.upiQrImageUrl ? (
                      // Custom uploaded UPI image
                      <img 
                        src={technician.upiQrImageUrl} 
                        alt={`${technician.fullName} Custom UPI Barcode`}
                        className="w-28 h-28 object-contain rounded-lg border border-slate-200"
                      />
                    ) : technician.upiBarcodeType === 'barcode' ? (
                      // 1D Linear Barcode
                      renderLinearBarcode(technician.upiId)
                    ) : (
                      // Standard 2D UPI QR
                      upiQrUrl ? (
                        <img 
                          src={upiQrUrl} 
                          alt={`${technician.fullName} UPI QR`}
                          className="w-28 h-28 object-contain"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-slate-100 animate-pulse rounded-lg" />
                      )
                    )}

                    <div className="mt-1.5 space-y-0.5 text-center">
                      <span className="text-[9px] font-black uppercase text-amber-700 tracking-wider flex items-center justify-center gap-1 font-heading">
                        <IndianRupee className="w-3 h-3 text-amber-600" />
                        Technician's UPI Barcode
                      </span>
                      <p className="text-[9px] font-mono font-bold text-slate-800 max-w-[130px] truncate">
                        {technician.upiId}
                      </p>
                      <div className="flex items-center justify-center gap-1 pt-0.5">
                        <span className="text-[7px] font-bold px-1 py-0.2 rounded bg-sky-100 text-sky-800">GPay</span>
                        <span className="text-[7px] font-bold px-1 py-0.2 rounded bg-purple-100 text-purple-800">PhonePe</span>
                        <span className="text-[7px] font-bold px-1 py-0.2 rounded bg-cyan-100 text-cyan-800">Paytm</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // No UPI barcode configured yet
                  <div className="flex flex-col items-center justify-center p-2 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 leading-tight">
                      No UPI Barcode Added Yet
                    </p>
                    {allowEdit && isOwner ? (
                      <button
                        onClick={handleOpenUpiModal}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-bold rounded-lg shadow-2xs"
                      >
                        + Add Own Barcode
                      </button>
                    ) : (
                      <p className="text-[9px] text-slate-500">Contact technician for bank details</p>
                    )}
                  </div>
                )
              ) : (
                // DIGITAL VCARD 3.0 QR DISPLAY
                <div className="flex flex-col items-center w-full">
                  {vCardQrUrl ? (
                    <img 
                      src={vCardQrUrl} 
                      alt={`${technician.fullName} vCard QR`}
                      className="w-28 h-28 object-contain"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-slate-100 animate-pulse rounded-lg" />
                  )}
                  <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider mt-1.5 flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-sky-600" />
                    Scan to Save Contact
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">
                    vCard 3.0 Compatible
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card Footer Strip */}
          <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">★ {technician.rating} Rating</span>
              <span>•</span>
              <span>{technician.totalRepairsCompleted}+ Completed Repairs</span>
            </div>
            <div className="font-mono text-slate-400">
              National Electronics Technicians Council
            </div>
          </div>
        </div>

        {/* Action Controls (Hidden on Print) */}
        <div className="w-full max-w-xl mt-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button
              data-testid="btn-download-vcard"
              onClick={handleDownloadVCard}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-heading font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              title="Download contact file to save directly into phone address book"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Contact (.vcf)</span>
            </button>

            <button
              data-testid="btn-download-visiting-code"
              onClick={handleDownloadCode}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              title="Download currently active QR code or barcode image"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download {activeCodeMode === 'upi_barcode' ? 'UPI Code' : 'QR'}</span>
            </button>

            <button
              data-testid="btn-print-visiting-card"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              title="Print official visiting card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-testid="btn-share-card-whatsapp"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              title="Share card details via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>

            <button
              data-testid="btn-copy-card-details"
              onClick={handleCopyCardDetails}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              title="Copy card text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Add / Edit Own UPI Bar Code */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            data-testid="modal-add-own-upi-barcode"
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-slate-900 leading-tight">
                    Add Own UPI Bar Code to VC
                  </h3>
                  <p className="text-xs text-slate-500">
                    Display your workshop's direct UPI payment barcode on your digital visiting card
                  </p>
                </div>
              </div>
              <button
                data-testid="btn-close-upi-modal"
                onClick={() => setIsUpiModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>UPI Barcode Saved Successfully to your Visiting Card!</span>
              </div>
            )}

            <form onSubmit={handleSaveUpi} className="space-y-4">
              {/* UPI ID Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Your UPI ID / VPA <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-500 font-normal">e.g. name@okhdfcbank or 9820144521@paytm</span>
                </label>
                <div className="relative">
                  <input
                    data-testid="input-own-upi-id"
                    type="text"
                    required
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value.trim().toLowerCase())}
                    placeholder="e.g. rajesh.microtech@okhdfcbank"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {/* Popular Bank VPA suffixes quick chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['@okhdfcbank', '@okaxis', '@paytm', '@ybl', '@ibl', '@sbi'].map((suffix) => (
                    <button
                      key={suffix}
                      type="button"
                      onClick={() => {
                        const base = upiIdInput.includes('@') ? upiIdInput.split('@')[0] : upiIdInput;
                        setUpiIdInput((base || 'yourname') + suffix);
                      }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                    >
                      {suffix}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payee / Business Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Payee / Workshop Name on UPI
                </label>
                <input
                  data-testid="input-own-upi-payee"
                  type="text"
                  value={upiPayeeInput}
                  onChange={(e) => setUpiPayeeInput(e.target.value)}
                  placeholder="e.g. Quick Fix Micro Lab"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Barcode Style Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Code Format for Visiting Card
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label 
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      upiBarcodeTypeInput === 'qr'
                        ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="barcodeType"
                      checked={upiBarcodeTypeInput === 'qr'}
                      onChange={() => setUpiBarcodeTypeInput('qr')}
                      className="hidden"
                    />
                    <QrCode className="w-4 h-4 text-amber-600" />
                    <div className="text-xs">
                      <div>UPI 2D QR Code</div>
                      <div className="text-[10px] font-normal text-slate-500">Standard NPCI Mobile QR</div>
                    </div>
                  </label>

                  <label 
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      upiBarcodeTypeInput === 'barcode'
                        ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="barcodeType"
                      checked={upiBarcodeTypeInput === 'barcode'}
                      onChange={() => setUpiBarcodeTypeInput('barcode')}
                      className="hidden"
                    />
                    <Barcode className="w-4 h-4 text-amber-600" />
                    <div className="text-xs">
                      <div>Linear Barcode</div>
                      <div className="text-[10px] font-normal text-slate-500">1D Barcode Pattern</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Or Upload Custom UPI QR / Barcode Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Or Upload Custom Standee QR Image (Optional)</span>
                  {upiImageInput && (
                    <button
                      type="button"
                      onClick={() => setUpiImageInput('')}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      Remove Uploaded Image
                    </button>
                  )}
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl cursor-pointer flex items-center justify-between gap-3 bg-slate-50 hover:bg-amber-50/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">
                      {upiImageInput ? 'Custom QR image uploaded (Click to change)' : 'Upload PhonePe / GPay / Paytm QR standee photo'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-200 text-slate-700">
                    Browse
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Live Preview Box */}
              {upiIdInput && (
                <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-4">
                  <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                    {upiImageInput ? (
                      <img src={upiImageInput} alt="Custom UPI" className="w-full h-full object-contain rounded-lg" />
                    ) : upiBarcodeTypeInput === 'barcode' ? (
                      renderLinearBarcode(upiIdInput)
                    ) : modalPreviewQr ? (
                      <img src={modalPreviewQr} alt="Preview UPI QR" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 animate-pulse rounded" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase text-amber-700">Preview On Visiting Card</div>
                    <div className="text-xs font-mono font-black text-slate-900">{upiIdInput}</div>
                    <div className="text-[10px] text-slate-600">{upiPayeeInput || 'Workshop Account'}</div>
                    <div className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Zero commission direct bank transfer</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUpiModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  data-testid="btn-save-own-upi-barcode"
                  type="submit"
                  disabled={!upiIdInput.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 font-heading font-black text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Save UPI Barcode to VC</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
