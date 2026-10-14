import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  QrCode, 
  Search, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Wrench, 
  Printer, 
  PlusCircle, 
  Coins, 
  Phone, 
  MessageSquare, 
  History, 
  Copy, 
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { RepairTicket, Customer, InventoryItem, TechnicianProfile } from '../../types';
import { TechnicianVisitingCard } from '../common/TechnicianVisitingCard';

export const QrCodeScannerView: React.FC = () => {
  const { 
    findTicketOrDevice, 
    setActiveInvoiceTicket, 
    setActiveTab, 
    awardCustomerCoins, 
    currentTech, 
    formatINR, 
    tickets 
  } = useApp();

  // Mode: Live Camera Scanner or My Technician Visiting Card
  const [activeMode, setActiveMode] = useState<'scanner' | 'visiting_card'>('scanner');

  // Scanner state
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualQuery, setManualQuery] = useState<string>('');

  // Results
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedTicket, setMatchedTicket] = useState<RepairTicket | undefined>(undefined);
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | undefined>(undefined);
  const [matchedInventory, setMatchedInventory] = useState<InventoryItem | undefined>(undefined);
  const [matchedTechnician, setMatchedTechnician] = useState<TechnicianProfile | undefined>(undefined);
  const [allRelatedTickets, setAllRelatedTickets] = useState<RepairTicket[]>([]);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);

  // Coin Award Modal inside Scanner
  const [showCoinModal, setShowCoinModal] = useState<boolean>(false);
  const [coinAmount, setCoinAmount] = useState<number>(50);
  const [coinReason, setCoinReason] = useState<string>('Quick turn-around pickup reward');
  const [coinSuccessMsg, setCoinSuccessMsg] = useState<string | null>(null);

  // Label Print Modal
  const [showLabelModal, setShowLabelModal] = useState<boolean>(false);
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');
  const [labelTicket, setLabelTicket] = useState<RepairTicket | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play audio beep on successful scan
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.13);
    } catch (e) {
      // AudioContext unavailable or blocked by browser policy
    }
    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }
  };

  // Start camera stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported by your current browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as { torch?: boolean };
        setHasTorch(Boolean(capabilities.torch));

        // Start scanning loop
        startScanLoop();
      }
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const msg = err instanceof Error ? err.message : 'Camera access permission denied or unavailable.';
      setCameraError(msg);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const next = !torchOn;
      await (track as unknown as { applyConstraints: (c: { advanced: { torch: boolean }[] }) => Promise<void> }).applyConstraints({
        advanced: [{ torch: next }]
      });
      setTorchOn(next);
    } catch (e) {
      console.error('Torch toggle failed', e);
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Continuous frame analysis
  const startScanLoop = () => {
    const scanFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data && code.data.trim()) {
            handleCodeDetected(code.data);
            return; // Pause scanning loop until user continues
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  // Handle scanned/found code
  const handleCodeDetected = (codeString: string) => {
    playScanBeep();
    setLastScannedCode(codeString);
    setIsScanning(false);
    executeLookup(codeString);
  };

  const executeLookup = (query: string) => {
    setSearchAttempted(true);
    const result = findTicketOrDevice(query);
    setMatchedTicket(result.ticket);
    setMatchedCustomer(result.customer);
    setMatchedInventory(result.matchedInventory);
    setMatchedTechnician(result.matchedTechnician);
    setAllRelatedTickets(result.allMatchingTickets);
  };

  // Handle image file upload decoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            handleCodeDetected(code.data);
          } else {
            alert('No legible QR code or barcode found in this photo. Please try a clearer picture or enter the ticket number / IMEI manually.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Generate Printable Label QR
  const handleGenerateLabel = async (ticket: RepairTicket) => {
    setLabelTicket(ticket);
    try {
      const qrPayload = JSON.stringify({
        ticketId: ticket.id,
        imei: ticket.imeiSerialNumber,
        device: `${ticket.deviceBrand} ${ticket.deviceModel}`,
        customer: ticket.customerName,
        phone: ticket.customerMobile
      });
      const dataUrl = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setGeneratedQrDataUrl(dataUrl);
      setShowLabelModal(true);
    } catch (err) {
      console.error('Failed to generate QR sticker', err);
    }
  };

  // Award Coins logic
  const handleAwardCoinsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedCustomer) return;
    const res = awardCustomerCoins(matchedCustomer.id, coinAmount, coinReason, matchedTicket?.id);
    if (res.success) {
      setCoinSuccessMsg(res.message);
      // Update local state customer balance
      setMatchedCustomer(prev => prev ? { ...prev, coinsBalance: res.newBalance } : undefined);
      setTimeout(() => {
        setShowCoinModal(false);
        setCoinSuccessMsg(null);
      }, 1800);
    }
  };

  // Restart scanning
  const handleScanAgain = () => {
    setLastScannedCode(null);
    setMatchedTicket(undefined);
    setMatchedCustomer(undefined);
    setMatchedInventory(undefined);
    setMatchedTechnician(undefined);
    setAllRelatedTickets([]);
    setSearchAttempted(false);
    setIsScanning(true);
    startScanLoop();
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [cameraFacing]);

  // Sample quick barcodes for demo/testing
  const sampleBarcodes = [
    { label: '🪪 Rajesh Sharma (Visiting Card)', code: 'BEGIN:VCARD\nVERSION:3.0\nFN:Rajesh Sharma\nORG:Quick Fix Micro Lab & Mobile Care\nTEL:+91 98201 44521\nEND:VCARD', type: 'Visiting Card' },
    { label: '🪪 Amit Patel (Visiting Card)', code: 'BEGIN:VCARD\nVERSION:3.0\nFN:Amit Patel\nORG:Patel Mobile Hub & Spares\nTEL:+91 97123 88410\nEND:VCARD', type: 'Visiting Card' },
    { label: 'iPhone 15 Pro (Sunil)', code: 'QF-REP-202609-4109', type: 'Ticket ID' },
    { label: 'IMEI 358941092837461', code: '358941092837461', type: 'IMEI Tag' },
    { label: 'Samsung S24 Ultra (Pooja)', code: 'QF-REP-202609-4110', type: 'Ticket ID' },
    { label: 'OLED Display (Spare)', code: '8901004128912', type: 'Barcode' },
    { label: 'Battery 5000mAh (Spare)', code: '8902008341905', type: 'Barcode' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-slate-900">
                Camera QR & Barcode Device Scanner
              </h1>
              <p className="text-xs text-slate-500">
                Scan job labels, back-cover stickers, IMEI barcodes, or spare parts to retrieve instant repair histories & warranty status
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastScannedCode && (
            <button
              data-testid="btn-scan-again-header"
              onClick={handleScanAgain}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Another Device</span>
            </button>
          )}

          <button
            data-testid="btn-upload-label-photo"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200 transition-colors"
            title="Upload photo of barcode/QR label"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      {/* Mode Switcher: Camera Scanner vs Technician Visiting Card */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          data-testid="tab-qr-camera-mode"
          onClick={() => setActiveMode('scanner')}
          className={`py-2.5 px-4 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'scanner'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4 text-sky-600" />
          <span>Camera QR & Barcode Scanner</span>
        </button>

        <button
          data-testid="tab-technician-visiting-card-mode"
          onClick={() => setActiveMode('visiting_card')}
          className={`py-2.5 px-4 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'visiting_card'
              ? 'bg-slate-900 text-amber-400 shadow-xs border border-slate-800'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4 text-amber-500" />
          <span>Technician Visiting Card (VC)</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono">
            vCard & Own UPI Barcode
          </span>
        </button>
      </div>

      {activeMode === 'visiting_card' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
              <span>🇮🇳 Make in India Certified</span>
              <span>•</span>
              <span>Verified Workshop</span>
            </div>
            <h2 className="font-heading font-black text-2xl text-slate-900">
              Technician Visiting Card & Own UPI Barcode
            </h2>
            <p className="text-xs text-slate-600">
              Your official workshop business card with embedded vCard 3.0 and own direct UPI payment barcode. Add your shop's own UPI barcode so customers and technicians can scan your card to pay directly or save your contact.
            </p>
          </div>

          <TechnicianVisitingCard technician={currentTech} />
        </div>
      ) : (
        /* Main Scanner Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 cols: Live Camera Feed / Scanning Reticle */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative aspect-4/3 flex items-center justify-center">
            {/* Live Video Element */}
            <video
              ref={videoRef}
              data-testid="camera-video-stream"
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Laser Line and Scanner Reticle (Visible when scanning) */}
            {isScanning && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                {/* Dark Vignette Overlay */}
                <div className="relative w-64 h-64 border-2 border-sky-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] flex flex-col justify-between p-3">
                  {/* Target Corners */}
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-3 border-l-3 border-sky-400 rounded-tl-sm -mt-1 -ml-1" />
                    <span className="w-4 h-4 border-t-3 border-r-3 border-sky-400 rounded-tr-sm -mt-1 -mr-1" />
                  </div>

                  {/* Animated Sweeping Laser */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" />

                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-3 border-l-3 border-sky-400 rounded-bl-sm -mb-1 -ml-1" />
                    <span className="w-4 h-4 border-b-3 border-r-3 border-sky-400 rounded-br-sm -mb-1 -mr-1" />
                  </div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-mono tracking-wide backdrop-blur-md border border-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Align device QR or barcode in box</span>
                </div>
              </div>
            )}

            {/* Camera Error Message */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center text-white space-y-3 z-20">
                <AlertCircle className="w-10 h-10 text-rose-400" />
                <h3 className="font-heading font-bold text-base">Camera Stream Inactive</h3>
                <p className="text-xs text-slate-300 max-w-sm">
                  {cameraError}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    data-testid="btn-retry-camera"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Reconnecting</span>
                  </button>
                  <button
                    data-testid="btn-trigger-file-input"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                  </button>
                </div>
              </div>
            )}

            {/* In-feed camera controls overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {hasTorch && (
                <button
                  data-testid="btn-toggle-torch"
                  onClick={toggleTorch}
                  className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                    torchOn ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900/70 text-white hover:bg-slate-900'
                  }`}
                  title="Toggle Flashlight"
                >
                  <Zap className="w-4 h-4" />
                </button>
              )}

              <button
                data-testid="btn-switch-camera"
                onClick={toggleCameraFacing}
                className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
                title="Switch Camera (Front/Back)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Scan Frozen State Overlay */}
            {!isScanning && lastScannedCode && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white mb-1">Code Decoded Successfully</h3>
                <p className="text-xs font-mono text-emerald-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-emerald-500/30 mb-4 max-w-xs truncate">
                  {lastScannedCode}
                </p>
                <button
                  data-testid="btn-resume-scanner"
                  onClick={handleScanAgain}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-heading rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                  <span>Resume Live Scanner</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Manual Keypad Entry fallback */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Manual Barcode / Ticket ID / IMEI Keypad
            </span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  data-testid="input-manual-barcode"
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualQuery.trim()) {
                      handleCodeDetected(manualQuery.trim());
                    }
                  }}
                  placeholder="e.g. QF-REP-202609-4109 or 358941092837461..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none font-mono"
                />
              </div>
              <button
                data-testid="btn-search-manual-barcode"
                onClick={() => {
                  if (manualQuery.trim()) {
                    handleCodeDetected(manualQuery.trim());
                  }
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Quick Sample Test Buttons */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">Quick Test Barcodes (Click to simulate instant scan):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sampleBarcodes.map((item) => (
                  <button
                    key={item.code}
                    data-testid={`btn-sample-code-${item.code}`}
                    onClick={() => {
                      setManualQuery(item.code);
                      handleCodeDetected(item.code);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-700 transition-colors flex items-center gap-1"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Instant Retrieval Result Card */}
        <div className="lg:col-span-5 space-y-4">
          {searchAttempted ? (
            matchedTechnician ? (
              <div data-testid="card-scan-matched-technician" className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>🪪</span>
                    <span>Technician Visiting Card Identified!</span>
                  </span>
                  <button
                    data-testid="btn-scan-another-tech"
                    onClick={handleScanAgain}
                    className="text-emerald-700 hover:text-emerald-900 underline font-bold"
                  >
                    Scan Another
                  </button>
                </div>
                <TechnicianVisitingCard 
                  technician={matchedTechnician} 
                  isScanned={true} 
                  onScanAnother={handleScanAgain} 
                />
              </div>
            ) : matchedTicket ? (
              <div 
                data-testid="card-scan-matched-ticket" 
                className="bg-white rounded-2xl border border-sky-200 shadow-md overflow-hidden transition-all"
              >
                {/* Header with status */}
                <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider bg-sky-500/20 border border-sky-400/30 text-sky-200 px-2 py-0.5 rounded-full">
                      Matched Device Record
                    </span>
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full font-heading ${
                      matchedTicket.repairStatus === 'delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                      matchedTicket.repairStatus === 'completed' ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30' :
                      'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                    }`}>
                      {matchedTicket.repairStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="font-heading font-bold text-lg text-white">
                    {matchedTicket.deviceBrand} {matchedTicket.deviceModel}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-mono mt-0.5">
                    <span>ID: {matchedTicket.id}</span>
                    <span>•</span>
                    <span>IMEI: {matchedTicket.imeiSerialNumber}</span>
                  </div>
                </div>

                {/* Body Specs */}
                <div className="p-5 space-y-4 text-xs">
                  {/* Customer Information with Coin Balance */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">
                        {matchedTicket.customerName}
                      </span>
                      {matchedCustomer && (
                        <div 
                          data-testid="badge-customer-coins-balance"
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200 text-[11px] font-bold"
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-600" />
                          <span>{matchedCustomer.coinsBalance || 0} Coins (₹{matchedCustomer.coinsBalance || 0})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span className="font-mono">{matchedTicket.customerMobile}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => window.open(`tel:${matchedTicket.customerMobile}`, '_self')}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          title="Call Customer"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => {
                            const raw = matchedTicket.customerMobile.replace(/\D/g, '');
                            window.open(`https://wa.me/${raw}?text=Hello%20${encodeURIComponent(matchedTicket.customerName)},%20regarding%20your%20device%20${encodeURIComponent(matchedTicket.deviceBrand + ' ' + matchedTicket.deviceModel)}...`, '_blank');
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                        {matchedCustomer && (
                          <button
                            data-testid="btn-open-award-coin-modal"
                            onClick={() => setShowCoinModal(true)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Coins className="w-3 h-3" />
                            <span>Award Coins</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Device Problem & Technical Details */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Diagnosis & Problem Statement
                    </span>
                    <p className="p-2.5 bg-sky-50/50 rounded-xl border border-sky-100 text-slate-800 italic">
                      "{matchedTicket.problemDescription}"
                    </p>
                  </div>

                  {/* Warranty & Charges Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">Warranty Status</span>
                      <div className="flex items-center gap-1 text-emerald-700 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{matchedTicket.warrantyPeriodDays ? `${matchedTicket.warrantyPeriodDays} Days Guarantee` : '90 Days Guarantee'}</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block mb-0.5">Invoice Amount</span>
                      <span className="font-bold text-slate-900 font-mono text-xs">
                        {formatINR(matchedTicket.totalCharges)} ({matchedTicket.paymentStatus.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  {/* Lifetime Repair Timeline for this device */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <History className="w-3 h-3 text-sky-600" />
                        <span>Repair History ({allRelatedTickets.length} Jobs)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Logged: {matchedTicket.createdAt}</span>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {allRelatedTickets.map((t) => (
                        <div 
                          key={t.id} 
                          className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between gap-2 ${
                            t.id === matchedTicket.id ? 'bg-sky-50/80 border-sky-200' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{t.id}</span>
                              {t.id === matchedTicket.id && (
                                <span className="text-[9px] bg-sky-600 text-white px-1.5 py-0.2 rounded font-sans">Current</span>
                              )}
                            </div>
                            <span className="text-slate-600 line-clamp-1">{t.problemDescription}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-semibold text-slate-900 block">₹{t.totalCharges}</span>
                            <span className="text-[10px] text-slate-400">{t.createdAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                    <button
                      data-testid="btn-view-invoice-sheet"
                      onClick={() => setActiveInvoiceTicket(matchedTicket)}
                      className="flex-1 min-w-[120px] py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Job Sheet & Invoice</span>
                    </button>

                    <button
                      data-testid="btn-print-qr-sticker"
                      onClick={() => handleGenerateLabel(matchedTicket)}
                      className="py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-600" />
                      <span>Print Label</span>
                    </button>

                    <button
                      data-testid="btn-nav-warranty-upload"
                      onClick={() => setActiveTab('warranty_upload')}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Part Photo & Remarks</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : matchedInventory ? (
              /* Matched Spares Inventory Item */
              <div 
                data-testid="card-scan-matched-inventory" 
                className="bg-white rounded-2xl border border-emerald-200 shadow-md p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                      Spare Part In Inventory
                    </span>
                    <h2 className="font-heading font-bold text-base text-slate-900 mt-1">
                      {matchedInventory.name}
                    </h2>
                    <span className="text-xs font-mono text-slate-400">
                      SKU: {matchedInventory.sku} • Barcode: {matchedInventory.barcode}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    matchedInventory.stockQuantity <= matchedInventory.lowStockThreshold
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {matchedInventory.stockQuantity} in Stock
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Retail Price</span>
                    <span className="font-bold text-slate-900 font-mono">{formatINR(matchedInventory.sellingPrice)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Shelf Bin Location</span>
                    <span className="font-semibold text-slate-800">{matchedInventory.locationBin}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Compatible Models: </span>
                  {(matchedInventory.compatibleModels || matchedInventory.compatibleBrands || []).join(', ')}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <span>Manage in Spares Inventory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* No match found */
              <div 
                data-testid="card-scan-not-found"
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900">No Existing Ticket or Device Found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Scanned code <span className="font-mono font-semibold text-slate-700">"{lastScannedCode}"</span> is not currently registered in your workshop database.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    data-testid="btn-create-repair-from-scan"
                    onClick={() => setActiveTab('new_repair')}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create New Repair Ticket for this Device</span>
                  </button>
                  <button
                    onClick={handleScanAgain}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Scan Another Device
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Idle Placeholder instructions */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <h2 className="font-heading font-bold text-base">Instant Device Identification</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a customer returns for pickup or warranty verification, aim your device camera at their:
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>QuickFix printable job QR sticker stuck on back glass/cover.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Physical barcode from SIM tray or device settings (IMEI / Serial).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Component spare part packaging barcode for stock verification.</span>
                </li>
              </ul>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <Coins className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Loyalty Coins:</strong> After scanning, technicians can immediately award QuickFix Coins to the customer as reward points or redeem them toward invoice balances!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* MODAL: Award Coins to Customer */}
      {showCoinModal && matchedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-200" />
                <h3 className="font-heading font-bold text-base">Award QuickFix Customer Coins</h3>
              </div>
              <button 
                onClick={() => setShowCoinModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAwardCoinsSubmit} className="p-5 space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950 block">{matchedCustomer.fullName}</span>
                  <span className="text-[11px] font-mono text-amber-800">{matchedCustomer.mobileNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-amber-700 font-bold block">Current Balance</span>
                  <span className="font-mono font-bold text-sm text-amber-900">{matchedCustomer.coinsBalance || 0} Coins</span>
                </div>
              </div>

              {coinSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{coinSuccessMsg}</span>
                </div>
              )}

              {/* Amount presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Coin Reward Amount (1 Coin = ₹1 Discount)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[25, 50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCoinAmount(amt)}
                      className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                        coinAmount === amt
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Occasion for Coins
                </label>
                <select
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-none mb-2"
                >
                  <option value="Quick turn-around pickup reward">Quick turn-around pickup reward</option>
                  <option value="Repeat customer loyalty bonus">Repeat customer loyalty bonus</option>
                  <option value="Friend/Family referral reward">Friend/Family referral reward</option>
                  <option value="High-value repair goodwill points">High-value repair goodwill points</option>
                  <option value="Customer review / rating feedback bonus">Customer review / rating feedback bonus</option>
                  <option value="Festive promotion gift points">Festive promotion gift points</option>
                </select>
                <input
                  type="text"
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  placeholder="Or enter custom reason..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoinModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  data-testid="btn-submit-award-coins"
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Confirm & Award {coinAmount} Coins</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Printable QR Sticker / Label */}
      {showLabelModal && labelTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-sky-400" />
                <h3 className="font-heading font-bold text-sm">Print Device QR Label</h3>
              </div>
              <button 
                onClick={() => setShowLabelModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col items-center text-center space-y-4">
              {/* Thermal Label Preview Card */}
              <div 
                id="printable-device-label"
                className="w-64 p-4 bg-white border-2 border-dashed border-slate-400 rounded-xl shadow-xs text-left text-slate-900 font-mono space-y-2"
              >
                <div className="flex items-center justify-between border-b pb-1.5 border-slate-300">
                  <div>
                    <span className="font-heading font-bold text-xs block text-slate-900 tracking-tight">
                      {currentTech.shopName}
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans flex items-center gap-1">
                      <span>🇮🇳</span> Make in India • QuickFix Lab
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-800">{labelTicket.createdAt}</span>
                </div>

                <div className="flex items-center gap-3">
                  {generatedQrDataUrl ? (
                    <img 
                      src={generatedQrDataUrl} 
                      alt="Device QR" 
                      className="w-24 h-24 rounded border border-slate-200 p-0.5" 
                    />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 animate-pulse rounded" />
                  )}

                  <div className="text-[10px] space-y-1 overflow-hidden">
                    <div className="font-bold text-slate-900 text-[11px] truncate">
                      {labelTicket.deviceBrand} {labelTicket.deviceModel}
                    </div>
                    <div className="text-slate-700 truncate">
                      Cust: {labelTicket.customerName}
                    </div>
                    <div className="text-slate-600 font-mono text-[9px] truncate">
                      IMEI: {labelTicket.imeiSerialNumber}
                    </div>
                    <div className="font-bold text-sky-700 text-[10px] pt-1">
                      {labelTicket.id}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-center pt-1 text-slate-400 border-t border-slate-200 font-sans">
                  Scan with camera to retrieve complete repair status
                </div>
              </div>

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  data-testid="btn-print-thermal-sticker"
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sticker</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
