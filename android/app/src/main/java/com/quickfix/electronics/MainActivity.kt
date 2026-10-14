package com.quickfix.electronics

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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import com.quickfix.electronics.ui.screens.DashboardScreen
import com.quickfix.electronics.ui.screens.InventoryScreen
import com.quickfix.electronics.ui.screens.NewRepairScreen
import com.quickfix.electronics.ui.screens.PartsMarketplaceScreen
import com.quickfix.electronics.ui.screens.ProfileScreen
import com.quickfix.electronics.ui.screens.RepairHistoryScreen
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
                    DashboardScreen(
                        viewModel = viewModel,
                        onNavigate = { route -> navController.navigate(route) }
                    )
                }

                composable(Screen.Repairs.route) {
                    RepairHistoryScreen(viewModel = viewModel)
                }

                composable(Screen.NewRepair.route) {
                    NewRepairScreen(
                        viewModel = viewModel,
                        onJobCreated = { navController.navigate(Screen.Repairs.route) }
                    )
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
}
