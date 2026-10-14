package com.quickfix.electronics.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quickfix.electronics.data.models.RepairStatus
import com.quickfix.electronics.data.models.RepairTicket
import com.quickfix.electronics.ui.theme.EmeraldSuccess
import com.quickfix.electronics.ui.theme.SkyPrimary
import com.quickfix.electronics.ui.theme.SlateBackground
import com.quickfix.electronics.ui.theme.SlateCard
import com.quickfix.electronics.ui.theme.SlateSurface
import com.quickfix.electronics.ui.theme.WhiteText
import com.quickfix.electronics.viewmodel.QuickFixViewModel

@Composable
fun RepairHistoryScreen(
    viewModel: QuickFixViewModel
) {
    val tickets by viewModel.tickets.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedStatus by viewModel.selectedStatusFilter.collectAsState()

    val filteredTickets = tickets.filter { ticket ->
        val matchesQuery = searchQuery.isBlank() ||
                ticket.id.contains(searchQuery, ignoreCase = true) ||
                ticket.customerName.contains(searchQuery, ignoreCase = true) ||
                ticket.customerPhone.contains(searchQuery, ignoreCase = true) ||
                ticket.deviceModel.contains(searchQuery, ignoreCase = true)

        val matchesStatus = selectedStatus == null || ticket.status == selectedStatus

        matchesQuery && matchesStatus
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Text("Repair Jobs & Work Orders", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = WhiteText)
            Text("${filteredTickets.size} repair tickets recorded in system", fontSize = 12.sp, color = Color(0xFF94A3B8))
        }

        // Horizontal status filters
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // "All" filter
                val isAllSelected = selectedStatus == null
                Box(
                    modifier = Modifier
                        .background(if (isAllSelected) SkyPrimary else SlateCard, RoundedCornerShape(8.dp))
                        .clickable { viewModel.setStatusFilter(null) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("All (${tickets.size})", color = WhiteText, fontSize = 11.sp, fontWeight = if (isAllSelected) FontWeight.Bold else FontWeight.Normal)
                }

                RepairStatus.values().forEach { status ->
                    val isSelected = selectedStatus == status
                    val count = tickets.count { it.status == status }
                    Box(
                        modifier = Modifier
                            .background(if (isSelected) SkyPrimary else SlateCard, RoundedCornerShape(8.dp))
                            .clickable { viewModel.setStatusFilter(status) }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("${status.label} ($count)", color = WhiteText, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal)
                    }
                }
            }
        }

        // Ticket Items
        items(filteredTickets) { ticket ->
            DetailedRepairCard(
                ticket = ticket,
                onStatusChange = { newStatus -> viewModel.updateTicketStatus(ticket.id, newStatus) },
                onEditParts = { viewModel.setEditingTicket(ticket) },
                onViewInvoice = { viewModel.setInvoiceTicket(ticket) }
            )
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
fun DetailedRepairCard(
    ticket: RepairTicket,
    onStatusChange: (RepairStatus) -> Unit,
    onEditParts: () -> Unit,
    onViewInvoice: () -> Unit
) {
    var showStatusMenu by remember { mutableStateOf(false) }

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header Row: ID, Date, Status Chip
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(ticket.id, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, color = SkyPrimary)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("• Rec: ${ticket.dateReceived}", fontSize = 11.sp, color = Color(0xFF64748B))
                    }
                }

                // Clickable Status Chip to change status
                Box {
                    Box(
                        modifier = Modifier
                            .clickable { showStatusMenu = true }
                    ) {
                        StatusChip(status = ticket.status)
                    }

                    DropdownMenu(
                        expanded = showStatusMenu,
                        onDismissRequest = { showStatusMenu = false }
                    ) {
                        RepairStatus.values().forEach { st ->
                            DropdownMenuItem(
                                text = { Text(st.label) },
                                onClick = {
                                    onStatusChange(st)
                                    showStatusMenu = false
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Device & Customer Row
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text("${ticket.deviceBrand} ${ticket.deviceModel}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = WhiteText)
                    Text(ticket.customerName, fontSize = 12.sp, color = Color(0xFFCBD5E1))
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Phone, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(ticket.customerPhone, fontSize = 11.sp, color = EmeraldSuccess, fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Fault Description
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SlateBackground, RoundedCornerShape(8.dp))
                    .padding(8.dp)
            ) {
                Text(
                    text = "Fault: ${ticket.faultDescription}",
                    fontSize = 11.sp,
                    color = Color(0xFF94A3B8)
                )
            }

            // Parts used list preview
            if (ticket.partsUsed.isNotEmpty()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Parts Used: ${ticket.partsUsed.joinToString(", ")}",
                    fontSize = 11.sp,
                    color = SkyPrimary
                )
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp), color = Color(0xFF334155))

            // Pricing & Actions Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Parts: ₹${ticket.partsCost.toInt()} | Labour: ₹${ticket.laborCharges.toInt()}",
                        fontSize = 10.sp,
                        color = Color(0xFF94A3B8)
                    )
                    Text(
                        text = "Total: ₹${ticket.totalCharges.toInt()}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = EmeraldSuccess
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    // Edit Parts & Labour Button
                    Box(
                        modifier = Modifier
                            .background(SkyPrimary.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                            .clickable { onEditParts() }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Edit, contentDescription = null, tint = SkyPrimary, modifier = Modifier.size(13.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Edit Parts & Labour", fontSize = 11.sp, color = SkyPrimary, fontWeight = FontWeight.Bold)
                        }
                    }

                    // Invoice Button
                    Box(
                        modifier = Modifier
                            .background(SlateCard, RoundedCornerShape(8.dp))
                            .clickable { onViewInvoice() }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Receipt, contentDescription = null, tint = WhiteText, modifier = Modifier.size(13.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Invoice", fontSize = 11.sp, color = WhiteText)
                        }
                    }
                }
            }
        }
    }
}
