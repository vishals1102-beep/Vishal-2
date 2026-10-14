package com.quickfix.electronics.data.models

data class TechnicianProfile(
    val id: String = "TECH-IND-8821",
    val fullName: String = "Vishal Sharma",
    val shopName: String = "Quick Fix Electronics",
    val roleTitle: String = "Master SMD & Logic Board Specialist",
    val mobileNumber: String = "+91 95413 71468",
    val email: String = "vishals1102@gmail.com",
    val address: String = "Shop #4, Main Market, Electronics Lane",
    val city: String = "New Delhi, Delhi",
    val gstin: String = "07AAAAQ1234A1Z5",
    val verificationStatus: String = "Verified",
    val experienceYears: Int = 8,
    val joinedDate: String = "Aug 2021",
    val rating: Double = 4.9,
    val completedRepairsCount: Int = 1420
)

data class Customer(
    val id: String,
    val name: String,
    val phone: String,
    val email: String? = null,
    val totalRepairs: Int = 1,
    val totalSpent: Double = 0.0
)
