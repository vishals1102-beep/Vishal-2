package com.quickfix.electronics.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quickfix.electronics.data.models.RepairStatus
import com.quickfix.electronics.data.models.RepairTicket
import com.quickfix.electronics.ui.theme.AmberWarning
import com.quickfix.electronics.ui.theme.EmeraldSuccess
import com.quickfix.electronics.ui.theme.IndigoAccent
import com.quickfix.electronics.ui.theme.SkyPrimary
import com.quickfix.electronics.ui.theme.SlateBackground
import com.quickfix.electronics.ui.theme.SlateCard
import com.quickfix.electronics.ui.theme.SlateSurface
import com.quickfix.electronics.ui.theme.WhiteText
import com.quickfix.electronics.viewmodel.QuickFixViewModel

@Composable
fun DashboardScreen(
    viewModel: QuickFixViewModel,
    onNavigate: (String) -> Unit
) {
    val tickets by viewModel.tickets.collectAsState()
    val inventory by viewModel.inventory.collectAsState()

    val activeCount = tickets.count { it.status != RepairStatus.DELIVERED && it.status != RepairStatus.CANCELLED }
    val readyCount = tickets.count { it.status == RepairStatus.READY }
    val totalRevenue = tickets.sumOf { it.totalCharges }
    val lowStockCount = inventory.count { it.stockQuantity <= it.minThreshold }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Workshop Command Center",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = WhiteText
            )
            Text(
                text = "Real-time repair queue & inventory control",
                fontSize = 12.sp,
                color = Color(0xFF94A3B8)
            )
        }

        // Metrics Grid
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(
                    title = "Active Jobs",
                    value = activeCount.toString(),
                    icon = Icons.Default.Build,
                    color = SkyPrimary,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Ready for Delivery",
                    value = readyCount.toString(),
                    icon = Icons.Default.CheckCircle,
                    color = EmeraldSuccess,
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(
                    title = "Total Billed",
                    value = "₹ ${totalRevenue.toInt()}",
                    icon = Icons.Default.CurrencyRupee,
                    color = IndigoAccent,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Low Stock Spares",
                    value = lowStockCount.toString(),
                    icon = Icons.Default.Inventory2,
                    color = AmberWarning,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Quick Actions Row
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { onNavigate("new_repair") },
                    colors = ButtonDefaults.buttonColors(containerColor = SkyPrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("New Job Card", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = { onNavigate("marketplace") },
                    colors = ButtonDefaults.buttonColors(containerColor = SlateSurface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(16.dp), tint = SkyPrimary)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Order Spares", fontSize = 12.sp, color = WhiteText, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // Recent Jobs Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Recent Repair Queue", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = WhiteText)
                Text(
                    text = "View All (${tickets.size})",
                    fontSize = 12.sp,
                    color = SkyPrimary,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onNavigate("repairs") }
                )
            }
        }

        // Tickets List
        items(tickets.take(5)) { ticket ->
            RepairTicketCard(
                ticket = ticket,
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
fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(color.copy(alpha = 0.2f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(value, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = WhiteText)
            Text(title, fontSize = 11.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
fun RepairTicketCard(
    ticket: RepairTicket,
    onEditParts: () -> Unit,
    onViewInvoice: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(ticket.id, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = SkyPrimary)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("• ${ticket.customerName}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = WhiteText)
                }

                StatusChip(status = ticket.status)
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "${ticket.deviceBrand} ${ticket.deviceModel}",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = WhiteText
            )
            Text(
                text = ticket.faultDescription,
                fontSize = 12.sp,
                color = Color(0xFF94A3B8),
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("Parts: ₹${ticket.partsCost.toInt()} | Labour: ₹${ticket.laborCharges.toInt()}", fontSize = 11.sp, color = Color(0xFF94A3B8))
                    Text("Total: ₹${ticket.totalCharges.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = EmeraldSuccess)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    // Edit Parts & Labour button
                    Box(
                        modifier = Modifier
                            .background(SkyPrimary.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                            .clickable { onEditParts() }
                            .padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Edit, contentDescription = null, tint = SkyPrimary, modifier = Modifier.size(13.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Parts & Labour", fontSize = 11.sp, color = SkyPrimary, fontWeight = FontWeight.Bold)
                        }
                    }

                    // Invoice button
                    Box(
                        modifier = Modifier
                            .background(SlateCard, RoundedCornerShape(8.dp))
                            .clickable { onViewInvoice() }
                            .padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Receipt, contentDescription = null, tint = WhiteText, modifier = Modifier.size(13.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Invoice", fontSize = 11.sp, color = WhiteText, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatusChip(status: RepairStatus) {
    val (bgColor, textColor) = when (status) {
        RepairStatus.RECEIVED -> Color(0xFF38BDF8).copy(alpha = 0.2f) to Color(0xFF38BDF8)
        RepairStatus.DIAGNOSING -> Color(0xFFA855F7).copy(alpha = 0.2f) to Color(0xFFA855F7)
        RepairStatus.WAITING_PARTS -> Color(0xFFF59E0B).copy(alpha = 0.2f) to Color(0xFFF59E0B)
        RepairStatus.IN_REPAIR -> Color(0xFF0284C7).copy(alpha = 0.2f) to Color(0xFF38BDF8)
        RepairStatus.READY -> Color(0xFF10B981).copy(alpha = 0.2f) to Color(0xFF10B981)
        RepairStatus.DELIVERED -> Color(0xFF64748B).copy(alpha = 0.2f) to Color(0xFF94A3B8)
        RepairStatus.CANCELLED -> Color(0xFFEF4444).copy(alpha = 0.2f) to Color(0xFFEF4444)
    }

    Box(
        modifier = Modifier
            .background(bgColor, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(status.label, color = textColor, fontSize = 10.sp, fontWeight = FontWeight.Bold)
    }
}
