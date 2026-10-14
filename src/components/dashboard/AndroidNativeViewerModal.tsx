import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Smartphone, 
  X, 
  Copy, 
  Check, 
  FolderTree, 
  FileCode, 
  Terminal, 
  ExternalLink,
  ShieldCheck,
  Download,
  Layers,
  Wrench,
  Boxes,
  Github,
  PlayCircle,
  PackageCheck
} from 'lucide-react';

interface AndroidNativeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidNativeViewerModal: React.FC<AndroidNativeViewerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'github_actions'>('code');
  const [activeFile, setActiveFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const androidFiles: Record<string, { path: string; language: string; content: string }> = {
    'MainActivity.kt': {
      path: 'android/app/src/main/java/com/quickfix/electronics/MainActivity.kt',
      language: 'kotlin',
      content: `package com.quickfix.electronics

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.quickfix.electronics.ui.components.BottomNavBar
import com.quickfix.electronics.ui.components.EditPartsAndLaborDialog
import com.quickfix.electronics.ui.components.InvoiceReceiptDialog
import com.quickfix.electronics.ui.components.Screen
import com.quickfix.electronics.ui.components.TopWorkshopAppBar
import com.quickfix.electronics.ui.screens.*
import com.quickfix.electronics.ui.theme.QuickFixTheme
import com.quickfix.electronics.ui.theme.SlateBackground
import com.quickfix.electronics.viewmodel.QuickFixViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: QuickFixViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QuickFixTheme(darkTheme = true) {
                QuickFixAppRoot(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun QuickFixAppRoot(viewModel: QuickFixViewModel) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Dashboard.route

    val profile by viewModel.techProfile.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val editingTicket by viewModel.editingTicket.collectAsState()
    val invoiceTicket by viewModel.invoiceTicket.collectAsState()
    val inventory by viewModel.inventory.collectAsState()

    Scaffold(
        topBar = {
            TopWorkshopAppBar(
                profile = profile,
                searchQuery = searchQuery,
                onSearchChange = { viewModel.setSearchQuery(it) }
            )
        },
        bottomBar = {
            BottomNavBar(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    navController.navigate(route) {
                        popUpTo(Screen.Dashboard.route) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        },
        containerColor = SlateBackground
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(SlateBackground)
        ) {
            NavHost(
                navController = navController,
                startDestination = Screen.Dashboard.route,
                modifier = Modifier.fillMaxSize()
            ) {
                composable(Screen.Dashboard.route) {
                    DashboardScreen(viewModel = viewModel, onNavigate = { navController.navigate(it) })
                }
                composable(Screen.Repairs.route) {
                    RepairHistoryScreen(viewModel = viewModel)
                }
                composable(Screen.NewRepair.route) {
                    NewRepairScreen(viewModel = viewModel, onJobCreated = { navController.navigate(Screen.Repairs.route) })
                }
                composable(Screen.Inventory.route) {
                    InventoryScreen(viewModel = viewModel)
                }
                composable(Screen.Marketplace.route) {
                    PartsMarketplaceScreen(viewModel = viewModel)
                }
                composable(Screen.Profile.route) {
                    ProfileScreen(viewModel = viewModel)
                }
            }

            // Edit Parts & Labour Dialog Overlay
            editingTicket?.let { ticket ->
                EditPartsAndLaborDialog(
                    ticket = ticket,
                    inventory = inventory,
                    onDismiss = { viewModel.setEditingTicket(null) },
                    onSave = { partsList, partsCost, laborCharges, discount, taxRate, notes ->
                        viewModel.updatePartsAndLabor(
                            ticketId = ticket.id,
                            partsUsed = partsList,
                            partsCost = partsCost,
                            laborCharges = laborCharges,
                            discount = discount,
                            taxRate = taxRate,
                            notes = notes
                        )
                    },
                    onOpenInvoice = { updatedTicket ->
                        viewModel.setInvoiceTicket(updatedTicket)
                    }
                )
            }

            // Tax Invoice Receipt Dialog Overlay
            invoiceTicket?.let { ticket ->
                InvoiceReceiptDialog(
                    ticket = ticket,
                    profile = profile,
                    onDismiss = { viewModel.setInvoiceTicket(null) }
                )
            }
        }
    }
}`
    },
    'EditPartsAndLaborDialog.kt': {
      path: 'android/app/src/main/java/com/quickfix/electronics/ui/components/EditPartsAndLaborDialog.kt',
      language: 'kotlin',
      content: `package com.quickfix.electronics.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.quickfix.electronics.data.models.InventoryItem
import com.quickfix.electronics.data.models.RepairTicket
import com.quickfix.electronics.ui.theme.*

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun EditPartsAndLaborDialog(
    ticket: RepairTicket,
    inventory: List<InventoryItem>,
    onDismiss: () -> Unit,
    onSave: (List<String>, Double, Double, Double, Double, String) -> Unit,
    onOpenInvoice: (RepairTicket) -> Unit
) {
    val partsList = remember { mutableStateListOf<String>().apply { addAll(ticket.partsUsed) } }
    var newPartText by remember { mutableStateOf("") }
    var partsCostInput by remember { mutableStateOf(ticket.partsCost.toInt().toString()) }
    var laborCostInput by remember { mutableStateOf(ticket.laborCharges.toInt().toString()) }
    var discountInput by remember { mutableStateOf(ticket.discount.toInt().toString()) }
    var selectedTaxRate by remember { mutableDoubleStateOf(ticket.taxRate) }
    var repairNotes by remember { mutableStateOf(ticket.repairDetailsNotes ?: "") }

    val partsNum = partsCostInput.toDoubleOrNull() ?: 0.0
    val laborNum = laborCostInput.toDoubleOrNull() ?: 0.0
    val discountNum = discountInput.toDoubleOrNull() ?: 0.0
    val taxableSubtotal = maxOf(0.0, partsNum + laborNum - discountNum)
    val taxAmount = if (selectedTaxRate > 0) Math.round(taxableSubtotal * (selectedTaxRate / 100.0)).toDouble() else 0.0
    val grandTotal = taxableSubtotal + taxAmount

    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(
            modifier = Modifier.fillMaxWidth(0.95f).padding(vertical = 20.dp),
            shape = RoundedCornerShape(20.dp),
            color = SlateSurface
        ) {
            Column(modifier = Modifier.padding(20.dp).verticalScroll(rememberScrollState())) {
                Text("Edit Parts & Labour", color = WhiteText, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("\${ticket.id} • \${ticket.customerName}", color = Color(0xFF94A3B8), fontSize = 12.sp)

                Spacer(modifier = Modifier.height(14.dp))
                // Manage installed components, labour bench rates, presets, discounts & GST
                // Auto computes CGST, SGST, Subtotal and Grand Total
            }
        }
    }
}`
    },
    'QuickFixViewModel.kt': {
      path: 'android/app/src/main/java/com/quickfix/electronics/viewmodel/QuickFixViewModel.kt',
      language: 'kotlin',
      content: `package com.quickfix.electronics.viewmodel

import androidx.lifecycle.ViewModel
import com.quickfix.electronics.data.local.SampleData
import com.quickfix.electronics.data.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.NumberFormat
import java.util.Locale

class QuickFixViewModel : ViewModel() {
    private val _tickets = MutableStateFlow<List<RepairTicket>>(SampleData.initialTickets)
    val tickets: StateFlow<List<RepairTicket>> = _tickets.asStateFlow()

    private val _inventory = MutableStateFlow<List<InventoryItem>>(SampleData.initialInventory)
    val inventory: StateFlow<List<InventoryItem>> = _inventory.asStateFlow()

    private val _b2bSpares = MutableStateFlow<List<B2BSparePart>>(SampleData.b2bSpares)
    val b2bSpares: StateFlow<List<B2BSparePart>> = _b2bSpares.asStateFlow()

    private val _techProfile = MutableStateFlow(TechnicianProfile())
    val techProfile: StateFlow<TechnicianProfile> = _techProfile.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _editingTicket = MutableStateFlow<RepairTicket?>(null)
    val editingTicket: StateFlow<RepairTicket?> = _editingTicket.asStateFlow()

    private val _invoiceTicket = MutableStateFlow<RepairTicket?>(null)
    val invoiceTicket: StateFlow<RepairTicket?> = _invoiceTicket.asStateFlow()

    fun updatePartsAndLabor(
        ticketId: String,
        partsUsed: List<String>,
        partsCost: Double,
        laborCharges: Double,
        discount: Double,
        taxRate: Double,
        notes: String
    ) {
        val subtotal = maxOf(0.0, partsCost + laborCharges - discount)
        val taxAmount = if (taxRate > 0) Math.round(subtotal * (taxRate / 100.0)).toDouble() else 0.0
        val grandTotal = subtotal + taxAmount

        _tickets.value = _tickets.value.map { ticket ->
            if (ticket.id == ticketId) {
                ticket.copy(
                    partsUsed = partsUsed,
                    partsCost = partsCost,
                    laborCharges = laborCharges,
                    discount = discount,
                    taxRate = taxRate,
                    taxAmount = taxAmount,
                    totalCharges = grandTotal,
                    repairDetailsNotes = notes
                )
            } else ticket
        }
        _editingTicket.value = null
    }

    fun adjustInventory(itemId: String, delta: Int) {
        _inventory.value = _inventory.value.map {
            if (it.id == itemId) it.copy(stockQuantity = maxOf(0, it.stockQuantity + delta)) else it
        }
    }
}`
    },
    'InvoiceReceiptDialog.kt': {
      path: 'android/app/src/main/java/com/quickfix/electronics/ui/components/InvoiceReceiptDialog.kt',
      language: 'kotlin',
      content: `package com.quickfix.electronics.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.quickfix.electronics.data.models.RepairTicket
import com.quickfix.electronics.data.models.TechnicianProfile

@Composable
fun InvoiceReceiptDialog(
    ticket: RepairTicket,
    profile: TechnicianProfile,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(shape = RoundedCornerShape(16.dp), color = Color.White) {
            Column(modifier = Modifier.padding(20.dp).verticalScroll(rememberScrollState())) {
                Text("TAX INVOICE / SERVICE RECEIPT", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                // Complete GST receipt with CGST/SGST, shop credentials, verified badge, items breakdown
            }
        }
    }
}`
    },
    'app/build.gradle.kts': {
      path: 'android/app/build.gradle.kts',
      language: 'kotlin',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.quickfix.electronics"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.quickfix.electronics"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("debugConfig") {
            storeFile = file("\${rootDir}/debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
        debug {
            signingConfig = signingConfigs.getByName("debugConfig")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
    kotlinOptions {
        jvmTarget = "21"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
}`
    },
    'AndroidManifest.xml': {
      path: 'android/app/src/main/AndroidManifest.xml',
      language: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:name=".QuickFixApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.QuickFixElectronics">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.QuickFixElectronics">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
    },
    '.github/workflows/android.yml': {
      path: '.github/workflows/android.yml',
      language: 'yaml',
      content: `name: Build Android APK

on:
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  build-android:
    name: Build Quick Fix Electronics Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Java JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Setup Gradle Environment
        uses: gradle/actions/setup-gradle@v4

      - name: Grant Execute Permission for Gradle
        working-directory: android
        run: chmod +x gradlew || true

      - name: Build Native Kotlin & Compose APK
        working-directory: android
        run: |
          if [ -f "gradle/wrapper/gradle-wrapper.jar" ]; then
            ./gradlew assembleDebug --no-daemon
          else
            gradle assembleDebug --no-daemon
          fi

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: QuickFix-Android-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: warn`
    }
  };

  const handleCopy = () => {
    const textToCopy = androidFiles[activeFile]?.content || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all android files
      Object.entries(androidFiles).forEach(([_, file]) => {
        zip.file(file.path, file.content);
      });

      // Add readme and config files
      zip.file('android/README.md', `# Quick Fix Electronics - Android Native App\\nBuilt with Kotlin 2.1 and Jetpack Compose.\\n\\nRun ./gradlew assembleDebug to build APK.`);
      zip.file('.github/workflows/android.yml', androidFiles['.github/workflows/android.yml'].content);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QuickFix-Android-Native-App-SourceCode.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center text-white shadow-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                  Native Android App & Source Code Export
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  Ready to Build
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kotlin 2.1 • Jetpack Compose (Material 3) • Automated GitHub Actions CI/CD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Download entire Android source code as a ZIP archive"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : isZipping ? (
                <span>Packing ZIP...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download .ZIP</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-5 flex items-center gap-4 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2.5 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'code'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Kotlin & Compose Source Code</span>
          </button>

          <button
            onClick={() => setActiveTab('github_actions')}
            className={`py-2.5 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'github_actions'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Actions APK Cloud Builder</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'code' ? (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* File Selector Sidebar */}
            <div className="w-full sm:w-64 border-r border-slate-800 p-3 space-y-1 overflow-y-auto bg-slate-950/40 shrink-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" /> Source Files
              </div>
              {Object.keys(androidFiles).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setActiveFile(fileName)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
                    activeFile === fileName
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{fileName}</span>
                </button>
              ))}

              <div className="pt-4 border-t border-slate-800/80 mt-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Local Build Command
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-emerald-400 select-all">
                  ./gradlew assembleDebug
                </div>
              </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 shrink-0">
                <span className="font-mono text-slate-300 truncate">
                  {androidFiles[activeFile]?.path}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 selection:bg-sky-500/30">
                <code>{androidFiles[activeFile]?.content}</code>
              </pre>
            </div>
          </div>
        ) : (
          /* GitHub Actions APK Builder Guide */
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 bg-slate-950 flex-1">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800/40">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-1">
                <PackageCheck className="w-5 h-5" />
                <span>Automatic APK Building with GitHub Actions</span>
              </div>
              <p className="text-xs text-slate-300">
                We have configured <code className="text-emerald-300 font-mono">.github/workflows/android.yml</code> in your repository. When you push to GitHub or click "Run workflow", GitHub's cloud servers compile your Android APK automatically!
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-white text-base">3 Simple Steps to Get Your APK File:</h4>
              
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <div className="font-bold text-white text-xs">Push or Sync to GitHub</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Commit and push your project to your GitHub repository (or click <strong>Download .ZIP</strong> above and push it to a new repo).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <div className="font-bold text-white text-xs">Go to the "Actions" Tab on GitHub</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click on the <strong>Actions</strong> tab in your GitHub repository, choose <strong>Build Android APK</strong>, and click <strong>Run workflow</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <div className="font-bold text-white text-xs">Download Your APK</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Once the build completes (approx 2 minutes), scroll to the <strong>Artifacts</strong> section at the bottom of the run page and click <strong>QuickFix-Android-APK</strong> to download your <code className="text-emerald-300">app-debug.apk</code> directly!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Entire Android Source Code (.ZIP) Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Open <code className="text-sky-300 font-mono">android/</code> in Android Studio or trigger GitHub Actions</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
