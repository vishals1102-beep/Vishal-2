package com.quickfix.electronics.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Shield
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quickfix.electronics.data.models.B2BSparePart
import com.quickfix.electronics.ui.theme.EmeraldSuccess
import com.quickfix.electronics.ui.theme.SkyPrimary
import com.quickfix.electronics.ui.theme.SlateBackground
import com.quickfix.electronics.ui.theme.SlateSurface
import com.quickfix.electronics.ui.theme.WhiteText
import com.quickfix.electronics.viewmodel.QuickFixViewModel

@Composable
fun PartsMarketplaceScreen(
    viewModel: QuickFixViewModel
) {
    val spares by viewModel.b2bSpares.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Text("B2B Spares & Wholesale Sourcing", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = WhiteText)
            Text("Verified distributors across Karol Bagh Delhi & Lamington Rd Mumbai", fontSize = 12.sp, color = Color(0xFF94A3B8))
        }

        items(spares) { part ->
            B2BPartCard(part = part)
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
fun B2BPartCard(part: B2BSparePart) {
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
                    Text(part.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = WhiteText)
                    Text("Category: ${part.category}", fontSize = 11.sp, color = SkyPrimary)
                    Text("Vendor: ${part.verifiedVendor}", fontSize = 11.sp, color = Color(0xFFCBD5E1))
                }

                Text(
                    text = "₹ ${part.price.toInt()}",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 17.sp,
                    color = EmeraldSuccess
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocalShipping, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${part.deliveryDays} Day Express", fontSize = 11.sp, color = Color(0xFF94A3B8))
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Shield, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${part.warrantyDays}d Warranty", fontSize = 11.sp, color = EmeraldSuccess)
                    }
                }

                Button(
                    onClick = { /* Order requisition */ },
                    colors = ButtonDefaults.buttonColors(containerColor = SkyPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Order Now", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
