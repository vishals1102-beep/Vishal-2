package com.quickfix.electronics.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import com.quickfix.electronics.data.models.Priority
import com.quickfix.electronics.data.models.RepairStatus
import com.quickfix.electronics.data.models.RepairTicket
import com.quickfix.electronics.ui.theme.EmeraldSuccess
import com.quickfix.electronics.ui.theme.SkyPrimary
import com.quickfix.electronics.ui.theme.SlateBackground
import com.quickfix.electronics.ui.theme.SlateCard
import com.quickfix.electronics.ui.theme.SlateSurface
import com.quickfix.electronics.ui.theme.WhiteText
import com.quickfix.electronics.viewmodel.QuickFixViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun NewRepairScreen(
    viewModel: QuickFixViewModel,
    onJobCreated: () -> Unit
) {
    var customerName by remember { mutableStateOf("") }
    var customerPhone by remember { mutableStateOf("") }
    var selectedBrand by remember { mutableStateOf("Apple") }
    var deviceModel by remember { mutableStateOf("") }
    var imeiOrSerial by remember { mutableStateOf("") }
    var faultDescription by remember { mutableStateOf("") }
    var estimatedCostInput by remember { mutableStateOf("") }
    var advanceInput by remember { mutableStateOf("") }
    var selectedPriority by remember { mutableStateOf(Priority.NORMAL) }

    val brands = listOf("Apple", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Oppo", "Realme", "Google", "Motorola", "Other")

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Text("Create New Repair Job Card", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = WhiteText)
            Text("Issue job ticket & customer warranty receipt", fontSize = 12.sp, color = Color(0xFF94A3B8))
        }

        // Customer Details Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("CUSTOMER DETAILS", color = SkyPrimary, fontWeight = FontWeight.Bold, fontSize = 11.sp)

                    OutlinedTextField(
                        value = customerName,
                        onValueChange = { customerName = it },
                        label = { Text("Customer Full Name *") },
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = SkyPrimary) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = SlateBackground,
                            unfocusedContainerColor = SlateBackground,
                            focusedTextColor = WhiteText,
                            unfocusedTextColor = WhiteText
                        )
                    )

                    OutlinedTextField(
                        value = customerPhone,
                        onValueChange = { customerPhone = it },
                        label = { Text("Mobile Phone (+91) *") },
                        leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = SkyPrimary) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = SlateBackground,
                            unfocusedContainerColor = SlateBackground,
                            focusedTextColor = WhiteText,
                            unfocusedTextColor = WhiteText
                        )
                    )
                }
            }
        }

        // Device Brand and Model Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("DEVICE INFORMATION", color = SkyPrimary, fontWeight = FontWeight.Bold, fontSize = 11.sp)

                    Text("Device Brand", color = Color(0xFF94A3B8), fontSize = 11.sp)
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        brands.forEach { brand ->
                            val isSelected = selectedBrand == brand
                            Box(
                                modifier = Modifier
                                    .background(if (isSelected) SkyPrimary else SlateCard, RoundedCornerShape(8.dp))
                                    .clickable { selectedBrand = brand }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text(brand, color = WhiteText, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                    }

                    OutlinedTextField(
                        value = deviceModel,
                        onValueChange = { deviceModel = it },
                        label = { Text("Device Model (e.g. iPhone 14 Pro, Galaxy S23) *") },
                        leadingIcon = { Icon(Icons.Default.Smartphone, contentDescription = null, tint = SkyPrimary) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = SlateBackground,
                            unfocusedContainerColor = SlateBackground,
                            focusedTextColor = WhiteText,
                            unfocusedTextColor = WhiteText
                        )
                    )

                    OutlinedTextField(
                        value = imeiOrSerial,
                        onValueChange = { imeiOrSerial = it },
                        label = { Text("IMEI or Serial Number (Optional)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = SlateBackground,
                            unfocusedContainerColor = SlateBackground,
                            focusedTextColor = WhiteText,
                            unfocusedTextColor = WhiteText
                        )
                    )
                }
            }
        }

        // Fault & Financial Estimates
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("FAULT DIAGNOSTIC & ESTIMATES", color = SkyPrimary, fontWeight = FontWeight.Bold, fontSize = 11.sp)

                    OutlinedTextField(
                        value = faultDescription,
                        onValueChange = { faultDescription = it },
                        label = { Text("Fault Symptom / Reported Issue *") },
                        maxLines = 3,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = SlateBackground,
                            unfocusedContainerColor = SlateBackground,
                            focusedTextColor = WhiteText,
                            unfocusedTextColor = WhiteText
                        )
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = estimatedCostInput,
                            onValueChange = { estimatedCostInput = it },
                            label = { Text("Estimate (₹)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = SlateBackground,
                                unfocusedContainerColor = SlateBackground,
                                focusedTextColor = WhiteText,
                                unfocusedTextColor = WhiteText
                            )
                        )

                        OutlinedTextField(
                            value = advanceInput,
                            onValueChange = { advanceInput = it },
                            label = { Text("Advance (₹)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = SlateBackground,
                                unfocusedContainerColor = SlateBackground,
                                focusedTextColor = WhiteText,
                                unfocusedTextColor = WhiteText
                            )
                        )
                    }

                    Text("Priority Level", color = Color(0xFF94A3B8), fontSize = 11.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Priority.values().forEach { priority ->
                            val isSelected = selectedPriority == priority
                            Box(
                                modifier = Modifier
                                    .background(if (isSelected) SkyPrimary else SlateCard, RoundedCornerShape(6.dp))
                                    .clickable { selectedPriority = priority }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text(priority.label, color = WhiteText, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                    }
                }
            }
        }

        // Submit Button
        item {
            val isFormValid = customerName.isNotBlank() && customerPhone.isNotBlank() && deviceModel.isNotBlank() && faultDescription.isNotBlank()

            Button(
                onClick = {
                    if (isFormValid) {
                        val est = estimatedCostInput.toDoubleOrNull() ?: 0.0
                        val adv = advanceInput.toDoubleOrNull() ?: 0.0
                        val randomNum = (1000..9999).random()
                        val newTicket = RepairTicket(
                            id = "QF-2026-$randomNum",
                            customerName = customerName.trim(),
                            customerPhone = customerPhone.trim(),
                            deviceBrand = selectedBrand,
                            deviceModel = deviceModel.trim(),
                            imeiOrSerial = imeiOrSerial.trim().ifEmpty { null },
                            faultDescription = faultDescription.trim(),
                            estimatedCost = est,
                            advanceReceived = adv,
                            status = RepairStatus.RECEIVED,
                            priority = selectedPriority,
                            laborCharges = est,
                            totalCharges = est,
                            dateReceived = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                        )
                        viewModel.addNewTicket(newTicket)
                        onJobCreated()
                    }
                },
                enabled = isFormValid,
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Generate Ticket & Print Job Card", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}
