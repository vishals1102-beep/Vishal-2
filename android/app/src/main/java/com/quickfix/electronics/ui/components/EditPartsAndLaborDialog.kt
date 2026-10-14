package com.quickfix.electronics.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import com.quickfix.electronics.ui.theme.EmeraldSuccess
import com.quickfix.electronics.ui.theme.SkyDark
import com.quickfix.electronics.ui.theme.SkyPrimary
import com.quickfix.electronics.ui.theme.SlateBackground
import com.quickfix.electronics.ui.theme.SlateCard
import com.quickfix.electronics.ui.theme.SlateSurface
import com.quickfix.electronics.ui.theme.WhiteText

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun EditPartsAndLaborDialog(
    ticket: RepairTicket,
    inventory: List<InventoryItem>,
    onDismiss: () -> Unit,
    onSave: (
        partsUsed: List<String>,
        partsCost: Double,
        laborCharges: Double,
        discount: Double,
        taxRate: Double,
        notes: String
    ) -> Unit,
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

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .padding(vertical = 20.dp),
            shape = RoundedCornerShape(20.dp),
            color = SlateSurface
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(SkyPrimary, RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Build, contentDescription = null, tint = WhiteText, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text("Edit Parts & Labour", color = WhiteText, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("${ticket.id} • ${ticket.customerName}", color = Color(0xFF94A3B8), fontSize = 12.sp)
                        }
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF94A3B8))
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 1. Replacement Parts Used
                Text("REPLACEMENT PARTS INSTALLED", color = SkyPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(6.dp))

                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    partsList.forEachIndexed { index, part ->
                        Box(
                            modifier = Modifier
                                .background(SlateCard, RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(part, color = WhiteText, fontSize = 12.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Remove",
                                    tint = Color(0xFFF87171),
                                    modifier = Modifier
                                        .size(14.dp)
                                        .clickable { partsList.removeAt(index) }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = newPartText,
                        onValueChange = { newPartText = it },
                        placeholder = { Text("Add part item name...", color = Color(0xFF64748B), fontSize = 12.sp) },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = SlateBackground,
                            unfocusedContainerColor = SlateBackground,
                            focusedTextColor = WhiteText,
                            unfocusedTextColor = WhiteText
                        )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (newPartText.isNotBlank()) {
                                partsList.add(newPartText.trim())
                                newPartText = ""
                            }
                        },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = SkyPrimary)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Add")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 2. Financials & Labour
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Parts Cost (₹)", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        OutlinedTextField(
                            value = partsCostInput,
                            onValueChange = { partsCostInput = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = SlateBackground,
                                unfocusedContainerColor = SlateBackground,
                                focusedTextColor = WhiteText,
                                unfocusedTextColor = WhiteText
                            )
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text("Labour Charge (₹)", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        OutlinedTextField(
                            value = laborCostInput,
                            onValueChange = { laborCostInput = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = SlateBackground,
                                unfocusedContainerColor = SlateBackground,
                                focusedTextColor = WhiteText,
                                unfocusedTextColor = WhiteText
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Quick presets for Labour
                Text("Labour Quick Presets", color = Color(0xFF64748B), fontSize = 11.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Diag: ₹350" to "350", "Screen: ₹650" to "650", "Motherboard: ₹1200" to "1200").forEach { (label, amount) ->
                        Box(
                            modifier = Modifier
                                .background(SlateCard, RoundedCornerShape(6.dp))
                                .clickable { laborCostInput = amount }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(label, color = SkyPrimary, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Discount (₹)", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        OutlinedTextField(
                            value = discountInput,
                            onValueChange = { discountInput = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = SlateBackground,
                                unfocusedContainerColor = SlateBackground,
                                focusedTextColor = WhiteText,
                                unfocusedTextColor = WhiteText
                            )
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text("GST Tax Rate", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.padding(top = 8.dp)) {
                            listOf(0.0, 5.0, 12.0, 18.0).forEach { rate ->
                                val isSelected = selectedTaxRate == rate
                                Box(
                                    modifier = Modifier
                                        .background(if (isSelected) SkyPrimary else SlateCard, RoundedCornerShape(6.dp))
                                        .clickable { selectedTaxRate = rate }
                                        .padding(horizontal = 8.dp, vertical = 6.dp)
                                ) {
                                    Text("${rate.toInt()}%", color = WhiteText, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Repair Details Notes
                Text("Technician Service Notes", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                OutlinedTextField(
                    value = repairNotes,
                    onValueChange = { repairNotes = it },
                    placeholder = { Text("E.g. Chip re-balled, thermal paste applied...", color = Color(0xFF64748B), fontSize = 12.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3,
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = SlateBackground,
                        unfocusedContainerColor = SlateBackground,
                        focusedTextColor = WhiteText,
                        unfocusedTextColor = WhiteText
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Real-time calculation summary card
                Card(
                    colors = CardDefaults.cardColors(containerColor = SlateBackground),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Taxable Subtotal (Parts + Labour - Disc):", color = Color(0xFF94A3B8), fontSize = 12.sp)
                            Text("₹ ${taxableSubtotal.toInt()}", color = WhiteText, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                        }
                        if (selectedTaxRate > 0) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("GST (${selectedTaxRate.toInt()}%):", color = Color(0xFF94A3B8), fontSize = 12.sp)
                                Text("+₹ ${taxAmount.toInt()}", color = WhiteText, fontSize = 12.sp)
                            }
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = Color(0xFF334155))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("New Grand Total:", color = EmeraldSuccess, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("₹ ${grandTotal.toInt()}", color = EmeraldSuccess, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Action buttons
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(
                        onClick = {
                            val updatedTicket = ticket.copy(
                                partsUsed = partsList.toList(),
                                partsCost = partsNum,
                                laborCharges = laborNum,
                                discount = discountNum,
                                taxRate = selectedTaxRate,
                                taxAmount = taxAmount,
                                totalCharges = grandTotal,
                                repairDetailsNotes = repairNotes
                            )
                            onSave(partsList.toList(), partsNum, laborNum, discountNum, selectedTaxRate, repairNotes)
                            onOpenInvoice(updatedTicket)
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Receipt, contentDescription = null, modifier = Modifier.size(16.dp), tint = SkyPrimary)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Save & Invoice", color = SkyPrimary, fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            onSave(partsList.toList(), partsNum, laborNum, discountNum, selectedTaxRate, repairNotes)
                        },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp), tint = WhiteText)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Apply Changes", color = WhiteText, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
