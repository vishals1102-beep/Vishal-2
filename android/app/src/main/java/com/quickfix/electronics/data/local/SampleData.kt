package com.quickfix.electronics.data.local

import com.quickfix.electronics.data.models.B2BSparePart
import com.quickfix.electronics.data.models.InventoryItem
import com.quickfix.electronics.data.models.Priority
import com.quickfix.electronics.data.models.RepairStatus
import com.quickfix.electronics.data.models.RepairTicket

object SampleData {
    val initialTickets = listOf(
        RepairTicket(
            id = "QF-2026-101",
            customerName = "Aakash Verma",
            customerPhone = "+91 98112 34567",
            deviceBrand = "Apple",
            deviceModel = "iPhone 13 Pro",
            imeiOrSerial = "356789104423190",
            faultDescription = "White screen flickering after drop, no touch response",
            physicalCondition = "Minor corner scuffs, glass intact",
            estimatedCost = 6500.0,
            advanceReceived = 1500.0,
            status = RepairStatus.IN_REPAIR,
            priority = Priority.URGENT,
            partsUsed = listOf("Original OLED Display Assembly (OEM)", "TrueTone EEPROM Transfer"),
            partsCost = 4800.0,
            laborCharges = 1200.0,
            discount = 200.0,
            taxRate = 18.0,
            taxAmount = 1044.0,
            totalCharges = 6844.0,
            repairDetailsNotes = "Micro-soldering TrueTone IC transfer complete, touch recalibrated.",
            dateReceived = "2026-10-04",
            expectedCompletion = "2026-10-06"
        ),
        RepairTicket(
            id = "QF-2026-102",
            customerName = "Priya Sharma",
            customerPhone = "+91 97234 56789",
            deviceBrand = "Samsung",
            deviceModel = "Galaxy S23 Ultra",
            faultDescription = "Not charging via Type-C port, moisture error showing",
            estimatedCost = 2800.0,
            advanceReceived = 500.0,
            status = RepairStatus.WAITING_PARTS,
            priority = Priority.NORMAL,
            partsUsed = listOf("Type-C Sub-Board Charging PCB Module"),
            partsCost = 1450.0,
            laborCharges = 850.0,
            discount = 100.0,
            taxRate = 18.0,
            taxAmount = 396.0,
            totalCharges = 2596.0,
            repairDetailsNotes = "Sub-board pin corrosion detected. Cleaning didn't restore 45W fast charge, replacing module.",
            dateReceived = "2026-10-05",
            expectedCompletion = "2026-10-07"
        ),
        RepairTicket(
            id = "QF-2026-103",
            customerName = "Rahul Mehta",
            customerPhone = "+91 98991 22334",
            deviceBrand = "OnePlus",
            deviceModel = "OnePlus 11 5G",
            faultDescription = "Battery draining fast, phone shuts down at 25%",
            estimatedCost = 2200.0,
            advanceReceived = 1000.0,
            status = RepairStatus.READY,
            priority = Priority.NORMAL,
            partsUsed = listOf("5000mAh Dual-Cell Li-Po Battery (Grade A)"),
            partsCost = 1350.0,
            laborCharges = 650.0,
            discount = 0.0,
            taxRate = 18.0,
            taxAmount = 360.0,
            totalCharges = 2360.0,
            repairDetailsNotes = "New battery tested 100% capacity with 80W SuperVOOC pass.",
            dateReceived = "2026-10-03",
            expectedCompletion = "2026-10-05"
        ),
        RepairTicket(
            id = "QF-2026-104",
            customerName = "Sunita Rao",
            customerPhone = "+91 91234 98765",
            deviceBrand = "Xiaomi",
            deviceModel = "Redmi Note 12 Pro+",
            faultDescription = "Rear camera glass shattered, main sensor blurry",
            estimatedCost = 1800.0,
            advanceReceived = 500.0,
            status = RepairStatus.DELIVERED,
            priority = Priority.NORMAL,
            partsUsed = listOf("200MP OIS Camera Module Lens Ring", "Sapphire Camera Glass"),
            partsCost = 950.0,
            laborCharges = 550.0,
            discount = 100.0,
            taxRate = 18.0,
            taxAmount = 252.0,
            totalCharges = 1652.0,
            repairDetailsNotes = "Lens replaced, sensor dusted and laser aligned.",
            dateReceived = "2026-10-01",
            expectedCompletion = "2026-10-02"
        )
    )

    val initialInventory = listOf(
        InventoryItem(
            id = "INV-101",
            sku = "DSP-IP13P-OEM",
            name = "iPhone 13 Pro OLED Display OEM",
            category = "Displays & Touch",
            stockQuantity = 4,
            minThreshold = 2,
            costPrice = 3900.0,
            sellingPrice = 4800.0,
            supplierName = "Apex Mobile Spares Karol Bagh",
            binLocation = "Rack A-12"
        ),
        InventoryItem(
            id = "INV-102",
            sku = "BAT-OP11-5000",
            name = "OnePlus 11 5000mAh Original Cell Battery",
            category = "Batteries",
            stockQuantity = 8,
            minThreshold = 3,
            costPrice = 950.0,
            sellingPrice = 1350.0,
            supplierName = "Evergreen Tech Distributors",
            binLocation = "Rack B-03"
        ),
        InventoryItem(
            id = "INV-103",
            sku = "CC-S23U-SUB",
            name = "Samsung S23 Ultra Type-C PCB Board",
            category = "Charging Connectors",
            stockQuantity = 2,
            minThreshold = 3,
            costPrice = 1100.0,
            sellingPrice = 1450.0,
            supplierName = "Apex Mobile Spares Karol Bagh",
            binLocation = "Rack C-08"
        ),
        InventoryItem(
            id = "INV-104",
            sku = "IC-PMIC-SM8450",
            name = "Qualcomm Snapdragon Power IC SM8450",
            category = "Micro ICs & BGA",
            stockQuantity = 12,
            minThreshold = 5,
            costPrice = 380.0,
            sellingPrice = 650.0,
            supplierName = "Shenzhen Logic Parts Direct",
            binLocation = "Cabinet S-01"
        )
    )

    val b2bSpares = listOf(
        B2BSparePart(
            id = "B2B-01",
            title = "iPhone 15 Pro Max Ceramic Shield OLED",
            category = "Screens",
            price = 9200.0,
            stockAvailable = 15,
            verifiedVendor = "Prime Spares Karol Bagh (Verified ⭐ 4.9)",
            deliveryDays = 1,
            warrantyDays = 180
        ),
        B2BSparePart(
            id = "B2B-02",
            title = "Samsung Galaxy S24 Ultra Dynamic AMOLED 2X",
            category = "Screens",
            price = 11400.0,
            stockAvailable = 8,
            verifiedVendor = "Metro Cellular Hub Mumbai (Verified ⭐ 4.8)",
            deliveryDays = 2,
            warrantyDays = 180
        ),
        B2BSparePart(
            id = "B2B-03",
            title = "Universal Stencil Set for Android BGA ICs (50 Pcs)",
            category = "Tools & ICs",
            price = 1250.0,
            stockAvailable = 40,
            verifiedVendor = "QuickFix Tools Delhi (Verified ⭐ 5.0)",
            deliveryDays = 1,
            warrantyDays = 365
        ),
        B2BSparePart(
            id = "B2B-04",
            title = "Genuine 65W/80W SuperVOOC Fast Charging Flex Module",
            category = "Charging",
            price = 450.0,
            stockAvailable = 60,
            verifiedVendor = "Prime Spares Karol Bagh (Verified ⭐ 4.9)",
            deliveryDays = 1,
            warrantyDays = 90
        )
    )
}
