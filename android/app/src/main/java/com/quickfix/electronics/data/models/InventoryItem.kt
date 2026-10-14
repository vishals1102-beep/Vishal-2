package com.quickfix.electronics.data.models

data class InventoryItem(
    val id: String,
    val sku: String,
    val name: String,
    val category: String,
    val compatibleDevices: List<String> = emptyList(),
    val stockQuantity: Int,
    val minThreshold: Int = 3,
    val costPrice: Double,
    val sellingPrice: Double,
    val supplierName: String,
    val binLocation: String
)

data class B2BSparePart(
    val id: String,
    val title: String,
    val category: String,
    val price: Double,
    val stockAvailable: Int,
    val verifiedVendor: String,
    val deliveryDays: Int,
    val warrantyDays: Int
)
