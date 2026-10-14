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
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quickfix.electronics.data.models.InventoryItem
import com.quickfix.electronics.ui.theme.AmberWarning
import com.quickfix.electronics.ui.theme.EmeraldSuccess
import com.quickfix.electronics.ui.theme.SkyPrimary
import com.quickfix.electronics.ui.theme.SlateBackground
import com.quickfix.electronics.ui.theme.SlateCard
import com.quickfix.electronics.ui.theme.SlateSurface
import com.quickfix.electronics.ui.theme.WhiteText
import com.quickfix.electronics.viewmodel.QuickFixViewModel

@Composable
fun InventoryScreen(
    viewModel: QuickFixViewModel
) {
    val inventory by viewModel.inventory.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Inventory & Spares Catalog", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = WhiteText)
                    Text("${inventory.size} items in workshop storage", fontSize = 12.sp, color = Color(0xFF94A3B8))
                }
            }
        }

        // Inventory Items List
        items(inventory) { item ->
            InventoryItemCard(
                item = item,
                onAdjust = { delta -> viewModel.adjustInventory(item.id, delta) }
            )
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
fun InventoryItemCard(
    item: InventoryItem,
    onAdjust: (Int) -> Unit
) {
    val isLowStock = item.stockQuantity <= item.minThreshold

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(item.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = WhiteText)
                    Text("SKU: ${item.sku} • Bin: ${item.binLocation}", fontSize = 11.sp, color = Color(0xFF94A3B8))
                    Text("Category: ${item.category}", fontSize = 11.sp, color = SkyPrimary)
                }

                if (isLowStock) {
                    Box(
                        modifier = Modifier
                            .background(AmberWarning.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Low Stock", color = AmberWarning, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Pricing and Stock Controls Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Cost: ₹${item.costPrice.toInt()} | Sell: ₹${item.sellingPrice.toInt()}", fontSize = 11.sp, color = Color(0xFF94A3B8))
                    Text("Supplier: ${item.supplierName}", fontSize = 10.sp, color = Color(0xFF64748B))
                }

                // Plus / Minus Quantity Adjuster
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .background(SlateBackground, RoundedCornerShape(10.dp))
                        .padding(horizontal = 4.dp, vertical = 2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .background(SlateCard, RoundedCornerShape(6.dp))
                            .clickable { onAdjust(-1) },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("-", color = WhiteText, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }

                    Text(
                        text = "${item.stockQuantity} pcs",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = if (isLowStock) AmberWarning else EmeraldSuccess,
                        modifier = Modifier.padding(horizontal = 10.dp)
                    )

                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .background(SkyPrimary, RoundedCornerShape(6.dp))
                            .clickable { onAdjust(1) },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("+", color = WhiteText, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}
