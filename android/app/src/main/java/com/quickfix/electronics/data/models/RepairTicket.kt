package com.quickfix.electronics.data.models

data class RepairTicket(
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val alternatePhone: String? = null,
    val deviceBrand: String,
    val deviceModel: String,
    val imeiOrSerial: String? = null,
    val faultDescription: String,
    val physicalCondition: String? = null,
    val passwordPattern: String? = null,
    val estimatedCost: Double = 0.0,
    val advanceReceived: Double = 0.0,
    val status: RepairStatus = RepairStatus.RECEIVED,
    val priority: Priority = Priority.NORMAL,
    val partsUsed: List<String> = emptyList(),
    val partsCost: Double = 0.0,
    val laborCharges: Double = 0.0,
    val discount: Double = 0.0,
    val taxRate: Double = 18.0,
    val taxAmount: Double = 0.0,
    val totalCharges: Double = 0.0,
    val repairDetailsNotes: String? = null,
    val assignedTech: String = "Vishal Sharma",
    val dateReceived: String = "",
    val expectedCompletion: String = "",
    val warrantyDays: Int = 90
)

enum class RepairStatus(val label: String) {
    RECEIVED("Received"),
    DIAGNOSING("Diagnosing"),
    WAITING_PARTS("Waiting Parts"),
    IN_REPAIR("In Repair"),
    READY("Ready for Pickup"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled")
}

enum class Priority(val label: String) {
    LOW("Low"),
    NORMAL("Normal"),
    HIGH("High"),
    URGENT("Urgent")
}
