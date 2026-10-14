package com.quickfix.electronics.viewmodel

import androidx.lifecycle.ViewModel
import com.quickfix.electronics.data.local.SampleData
import com.quickfix.electronics.data.models.B2BSparePart
import com.quickfix.electronics.data.models.InventoryItem
import com.quickfix.electronics.data.models.Priority
import com.quickfix.electronics.data.models.RepairStatus
import com.quickfix.electronics.data.models.RepairTicket
import com.quickfix.electronics.data.models.TechnicianProfile
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

    private val _selectedStatusFilter = MutableStateFlow<RepairStatus?>(null)
    val selectedStatusFilter: StateFlow<RepairStatus?> = _selectedStatusFilter.asStateFlow()

    private val _editingTicket = MutableStateFlow<RepairTicket?>(null)
    val editingTicket: StateFlow<RepairTicket?> = _editingTicket.asStateFlow()

    private val _invoiceTicket = MutableStateFlow<RepairTicket?>(null)
    val invoiceTicket: StateFlow<RepairTicket?> = _invoiceTicket.asStateFlow()

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setStatusFilter(status: RepairStatus?) {
        _selectedStatusFilter.value = status
    }

    fun setEditingTicket(ticket: RepairTicket?) {
        _editingTicket.value = ticket
    }

    fun setInvoiceTicket(ticket: RepairTicket?) {
        _invoiceTicket.value = ticket
    }

    fun addNewTicket(ticket: RepairTicket) {
        _tickets.value = listOf(ticket) + _tickets.value
    }

    fun updateTicketStatus(ticketId: String, newStatus: RepairStatus) {
        _tickets.value = _tickets.value.map {
            if (it.id == ticketId) it.copy(status = newStatus) else it
        }
    }

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
            } else {
                ticket
            }
        }
        _editingTicket.value = null
    }

    fun adjustInventory(itemId: String, delta: Int) {
        _inventory.value = _inventory.value.map {
            if (it.id == itemId) it.copy(stockQuantity = maxOf(0, it.stockQuantity + delta)) else it
        }
    }

    fun addInventoryItem(item: InventoryItem) {
        _inventory.value = listOf(item) + _inventory.value
    }

    fun formatINR(amount: Double): String {
        val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
        return format.format(amount).replace("₹", "₹ ")
    }
}
