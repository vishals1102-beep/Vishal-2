package com.quickfix.electronics.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.quickfix.electronics.data.models.RepairTicket
import com.quickfix.electronics.data.models.TechnicianProfile
import com.quickfix.electronics.ui.theme.EmeraldSuccess
import com.quickfix.electronics.ui.theme.SkyDark
import com.quickfix.electronics.ui.theme.SkyPrimary

@Composable
fun InvoiceReceiptDialog(
    ticket: RepairTicket,
    profile: TechnicianProfile,
    onDismiss: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(16.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Modal Top Controls
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TAX INVOICE / SERVICE RECEIPT",
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A),
                        fontSize = 14.sp
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF64748B))
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Invoice Body Container
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                        .padding(16.dp)
                ) {
                    // Workshop Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = profile.shopName,
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 17.sp,
                                    color = Color(0xFF0C4A6E)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(
                                    imageVector = Icons.Default.Verified,
                                    contentDescription = "Verified",
                                    tint = EmeraldSuccess,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            Text(text = profile.address, fontSize = 11.sp, color = Color(0xFF64748B))
                            Text(text = "Tel: ${profile.mobileNumber}", fontSize = 11.sp, color = Color(0xFF64748B))
                            Text(text = "GSTIN: ${profile.gstin}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF0F172A))
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(text = "INVOICE #", fontSize = 10.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Bold)
                            Text(text = "INV-${ticket.id.replace("QF-", "")}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SkyDark)
                            Text(text = "Date: ${ticket.dateReceived}", fontSize = 11.sp, color = Color(0xFF64748B))
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = Color(0xFFE2E8F0))

                    // Customer & Device Info
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("BILLED TO", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8))
                            Text(ticket.customerName, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF0F172A))
                            Text(ticket.customerPhone, fontSize = 11.sp, color = Color(0xFF64748B))
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("DEVICE REPAIRED", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8))
                            Text("${ticket.deviceBrand} ${ticket.deviceModel}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF0F172A))
                            ticket.imeiOrSerial?.let { Text("IMEI: $it", fontSize = 11.sp, fontFamily = FontFamily.Monospace, color = Color(0xFF64748B)) }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Line Items Table Header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(6.dp))
                            .padding(8.dp)
                    ) {
                        Text("DESCRIPTION & SERVICE", modifier = Modifier.weight(1f), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF475569))
                        Text("AMOUNT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF475569), textAlign = TextAlign.End)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Parts line
                    if (ticket.partsUsed.isNotEmpty()) {
                        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp)) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Replacement Components", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF0F172A))
                                Text(ticket.partsUsed.joinToString(", "), fontSize = 11.sp, color = Color(0xFF64748B))
                            }
                            Text("₹ ${ticket.partsCost.toInt()}", fontWeight = FontWeight.SemiBold, fontSize = 12.sp, color = Color(0xFF0F172A))
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = Color(0xFFF1F5F9))
                    }

                    // Labour line
                    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp)) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Bench Diagnostics & Micro-Soldering", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF0F172A))
                            Text(ticket.repairDetailsNotes ?: "Component level board diagnostic & replacement labour", fontSize = 11.sp, color = Color(0xFF64748B))
                        }
                        Text("₹ ${ticket.laborCharges.toInt()}", fontWeight = FontWeight.SemiBold, fontSize = 12.sp, color = Color(0xFF0F172A))
                    }

                    if (ticket.discount > 0) {
                        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = Color(0xFFF1F5F9))
                        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)) {
                            Text("Discount Applied", modifier = Modifier.weight(1f), fontSize = 12.sp, color = EmeraldSuccess)
                            Text("- ₹ ${ticket.discount.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = EmeraldSuccess)
                        }
                    }

                    if (ticket.taxAmount > 0) {
                        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = Color(0xFFF1F5F9))
                        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)) {
                            Text("GST (${ticket.taxRate.toInt()}%) [CGST ${ticket.taxRate/2}% + SGST ${ticket.taxRate/2}%]", modifier = Modifier.weight(1f), fontSize = 11.sp, color = Color(0xFF64748B))
                            Text("+ ₹ ${ticket.taxAmount.toInt()}", fontSize = 12.sp, color = Color(0xFF0F172A))
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = Color(0xFFCBD5E1))

                    // Grand Total
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("TOTAL PAYABLE:", fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, color = Color(0xFF0F172A))
                        Text("₹ ${ticket.totalCharges.toInt()}", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = SkyDark)
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "Warranty: ${ticket.warrantyDays} Days on replaced components and craftsmanship.",
                        fontSize = 10.sp,
                        color = Color(0xFF64748B),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Action Buttons
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(
                        onClick = { /* Android Share Intent */ },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Share WhatsApp", fontSize = 12.sp)
                    }

                    Button(
                        onClick = { /* Android PrintManager */ },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = SkyPrimary),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Print, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Print PDF", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
