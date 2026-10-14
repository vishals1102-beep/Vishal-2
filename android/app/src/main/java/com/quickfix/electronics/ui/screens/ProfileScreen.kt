package com.quickfix.electronics.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quickfix.electronics.ui.theme.EmeraldSuccess
import com.quickfix.electronics.ui.theme.IndigoAccent
import com.quickfix.electronics.ui.theme.SkyDark
import com.quickfix.electronics.ui.theme.SkyPrimary
import com.quickfix.electronics.ui.theme.SlateBackground
import com.quickfix.electronics.ui.theme.SlateCard
import com.quickfix.electronics.ui.theme.SlateSurface
import com.quickfix.electronics.ui.theme.WhiteText
import com.quickfix.electronics.viewmodel.QuickFixViewModel

@Composable
fun ProfileScreen(
    viewModel: QuickFixViewModel
) {
    val profile by viewModel.techProfile.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Text("Technician Profile & ID Card", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = WhiteText)
            Text("Digital workshop badge and credentials", fontSize = 12.sp, color = Color(0xFF94A3B8))
        }

        // Digital Visiting Card (Premium Gradient)
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .background(
                            Brush.linearGradient(
                                colors = listOf(Color(0xFF0F172A), Color(0xFF0369A1), Color(0xFF1E1B4B))
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column {
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
                                        fontSize = 18.sp,
                                        color = WhiteText
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Icon(
                                        imageVector = Icons.Default.Verified,
                                        contentDescription = "Verified",
                                        tint = EmeraldSuccess,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                                Text("Electronics Workshop & Logic Board Lab", fontSize = 11.sp, color = Color(0xFF93C5FD))
                            }

                            Box(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(profile.id, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WhiteText)
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Text(profile.fullName, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = WhiteText)
                        Text(profile.roleTitle, fontSize = 12.sp, color = Color(0xFFBAE6FD))

                        Spacer(modifier = Modifier.height(14.dp))
                        HorizontalDivider(color = Color.White.copy(alpha = 0.2f))
                        Spacer(modifier = Modifier.height(14.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Phone, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(13.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(profile.mobileNumber, fontSize = 11.sp, color = WhiteText, fontWeight = FontWeight.Medium)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = SkyPrimary, modifier = Modifier.size(13.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(profile.city, fontSize = 11.sp, color = WhiteText)
                                }
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFFBBF24), modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text("${profile.rating} / 5.0", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WhiteText)
                                }
                                Text("GST: ${profile.gstin}", fontSize = 10.sp, color = Color(0xFF94A3B8))
                            }
                        }
                    }
                }
            }
        }

        // Workshop Performance Stats
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("WORKSHOP CERTIFICATION & REPUTATION", color = SkyPrimary, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Completed Repairs", fontSize = 11.sp, color = Color(0xFF94A3B8))
                            Text("${profile.completedRepairsCount}+ Units", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = WhiteText)
                        }
                        Column {
                            Text("Experience", fontSize = 11.sp, color = Color(0xFF94A3B8))
                            Text("${profile.experienceYears} Years", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = WhiteText)
                        }
                        Column {
                            Text("Status", fontSize = 11.sp, color = Color(0xFF94A3B8))
                            Text("Govt. Registered", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = EmeraldSuccess)
                        }
                    }
                }
            }
        }

        // Native App Architecture Info
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("NATIVE ANDROID SPECIFICATION", color = SkyPrimary, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Framework: Kotlin 2.1 + Jetpack Compose (Material 3)", fontSize = 12.sp, color = WhiteText)
                    Text("Target SDK: Android 35 (Vanilla Ice Cream / SDK 35)", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    Text("State Management: ViewModel + StateFlow Reactive Streams", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    Text("Local Persistence: Room SQLite & In-Memory Fallback", fontSize = 12.sp, color = Color(0xFF94A3B8))
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}
