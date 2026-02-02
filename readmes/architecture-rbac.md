# Architecture Decision: Role-Based Access Control

## Overview

This document explains our approach to role separation in the MSME Loan Management System.

---

## The Three Roles

| Role | Purpose | Portal |
|------|---------|--------|
| **Super Admin** | System ownership & full control | `/admin` |
| **Admin** | Operations management | `/admin` |
| **Loan Officer** | Application processing | `/officer` |

---

## Why This Separation?

### Principle: Separation of Duties

In financial systems, **separation of duties** is critical to prevent fraud and errors:

| Role | Responsibility | Why Separate? |
|------|----------------|---------------|
| **Admin** | Manages the workforce | Shouldn't approve their own loans |
| **Loan Officer** | Approves/rejects loans | Shouldn't manage their own access |

If one person could both process loans AND manage user access, they could:
- Create fake officer accounts
- Approve fraudulent loans
- Delete audit trails

---

## Why Admins Don't See "Applications"

### The Confusion

> "Shouldn't admins see applications to assign them to officers?"

### The Answer

**Admins see applications, but through a different lens:**

| View | Purpose | Who Uses It |
|------|---------|-------------|
| **Applications List** | Review individual apps, approve/reject | Loan Officers |
| **Officer Workload** | See capacity, assign work | Admins |

### The Flow

```
Customer applies → Application created (unassigned)
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
   AUTO-ASSIGN                         ADMIN ASSIGNS
   (Round-robin)                    (From Workload page)
        ↓                                   ↓
        └─────────────────┬─────────────────┘
                          ↓
              Loan Officer sees in queue
                          ↓
              Review → Approve/Reject → Disburse
```

---

## Why Remove Granular Permissions?

### Original Design (Complex)
```javascript
permissions: ['create_loan_officer', 'manage_loan_officers', 'view_analytics', ...]
```

### Problem
- Too many permission combinations
- Hard to debug access issues
- Overkill for single organization

### Simplified Design
```javascript
// Super Admin → full access
super_admin: true

// Admin → standard access (everything except admin management)
super_admin: false
```

**The only distinction**: Can this admin manage OTHER admins?

---

## Summary Table

| Feature | Super Admin | Admin | Loan Officer |
|---------|-------------|-------|--------------|
| **Manage Admins** | ✅ | ❌ | ❌ |
| **Manage Officers** | ✅ | ✅ | ❌ |
| **Manage Products** | ✅ | ✅ | ❌ |
| **View Workload** | ✅ | ✅ | ❌ |
| **Assign Applications** | ✅ | ✅ | ❌ |
| **View Audit Logs** | ✅ | ✅ | ❌ |
| **Process Applications** | ❌ | ❌ | ✅ |
| **Approve/Reject** | ❌ | ❌ | ✅ |
| **Disburse Loans** | ❌ | ❌ | ✅ |
| **Record Payments** | ❌ | ❌ | ✅ |

---

## Real-World Analogy

| System Role | Real-World Equivalent |
|-------------|----------------------|
| Super Admin | IT Manager / Business Owner |
| Admin | Branch Manager / Operations Lead |
| Loan Officer | Bank Teller / Loan Processor |

The IT Manager sets up the system but doesn't process loans.  
The Branch Manager schedules staff but doesn't approve every loan.  
The Loan Officer handles customers directly.
