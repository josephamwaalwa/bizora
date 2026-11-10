# Bizora — Business Made Simpler.

> A modern, commercial-grade business management and invoicing platform designed for freelancers, entrepreneurs, and growing small businesses in Namibia and internationally.

![Bizora Banner](https://img.shields.io/badge/Status-Production%20Ready-0F9F8F?style=for-the-badge)
![Currency Support](https://img.shields.io/badge/Currency-NAD%20(N$)%20%7C%20Multi--Currency-4F46E5?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-101828?style=for-the-badge)

---

## 🌟 Executive Overview

**Bizora** simplifies operational workflows for small businesses. Rather than wrestling with complex enterprise ERPs or generic spreadsheet templates, Bizora delivers a focused, high-standard SaaS interface that handles:

- **Professional Quotations**: Create, customize, duplicate, and track client proposals.
- **1-Click Quotation-to-Invoice Conversion**: Automatically convert approved quotes into active commercial invoices.
- **Tax Invoices & Tracking**: Manage itemized charges, calculate configurable VAT/sales taxes, track due dates, and monitor overdue accounts.
- **Multi-Tranche Payment Tracking**: Record payments (EFT, Bank Transfer, Cash, Card, Mobile Money), track partial deposits, and compute real-time balances.
- **Client Relationship Directory**: Keep full contact dossiers, billing histories, and associated documents in one centralized place.
- **Pixel-Perfect Document Engine**: High-fidelity printable invoices and quotations styled with specialized `@media print` CSS for browser "Save to PDF" generation.
- **Namibian Dollars (NAD) Defaults**: First-class support for `N$` and `NAD` currency standards with configurable tax structures (not hardcoded).

---

## 🎨 Visual Identity & Architecture

Bizora is crafted with a design aesthetic influenced by products like **Linear, Stripe, and Notion**:
- **Primary Navy (`#101828`)**: Grounded, authoritative, and clean.
- **Indigo Accent (`#4F46E5`)**: Highlights interactive controls and brand focal points.
- **Teal Highlight (`#0F9F8F`)**: Represents financial clarity, settled accounts, and successful payments.
- **Background (`#F8FAFC`) & Surface White**: Crisp readability, generous whitespace, subtle borders, and soft shadows.

---

## 🚀 Key Features

### 1. Dynamic Business Dashboard
- **Live KPI Metrics**: Total Revenue Collected, Outstanding Payments, Total Invoiced, Pending Quotations, and Total Quotes.
- **Cash Flow Visualizer**: Interactive proportion bar highlighting paid revenue versus outstanding receivables.
- **Recent Activity Ledger**: Real-time notification feed tracking newly generated quotes, converted documents, and recorded payment tranches.
- **Smart Empty States**: Engaging guidance when starting with a fresh workspace.

### 2. Quotation Management
- Draft, Sent, Accepted, Declined, and Expired status lifecycle.
- Line items with dynamic description, quantity, unit price, and automated line totals.
- Configurable discounts (Percentage `%` or Fixed `N$`).
- Configurable Tax rates (e.g. 15% VAT, customizable label and rate).
- Full duplication engine and 1-click **Convert to Invoice** pipeline.

### 3. Commercial Invoice Management
- Invoice statuses: `Draft`, `Sent`, `Partially Paid`, `Paid`, and `Overdue`.
- Automatic overdue detection based on due dates and remaining balances.
- Record single or partial installment payments with receipt references and notes.
- Linked quotation references.

### 4. Client Directory
- Detailed client profiles: Name, Company, Email, Phone, Physical Address, VAT Number, and Internal Notes.
- Aggregated financial history per client (Total Invoiced, Total Settled, Balance Due).
- Quick actions: Create Quote for Client, Create Invoice for Client, and Document Dossier.

### 5. Document Generation & PDF Printing
- Commercial document templates with business logo, legal registration, banking instructions, and signature authorization blocks.
- Optimized for standard browser printing (`Ctrl + P` / `Cmd + P` or click **Print / Save PDF**).
- Background application chrome (sidebar, navbars, modals) are stripped away in print mode to yield a clean PDF document.

### 6. Business Preferences & Settings
- Custom Business Logo upload with instant base64 storage.
- Banking information block (Bank Name, Account Name, Account Number, Branch Code, SWIFT Code).
- Default document numbering presets (`QUO-0001`, `INV-0001`).
- Backup management: One-click JSON data export and import.
- Demo data restoration: Reset to sample Namibian agency data (*Kalahari Creative Studio*) for testing.

---

## 🔒 Data Storage & Supabase Cloud Readiness

> **Important Note on Data Persistence**:
> This initial version of Bizora uses browser **LocalStorage** for client-side persistence. All client profiles, quotations, invoices, payments, and settings remain saved between browser refreshes and sessions on your current device.
> 
> **Cloud Synchronisation Notice**:
> This version does **not** yet synchronize data to a remote cloud database. To back up your data or move to another computer, use the **Export JSON Backup** feature in **Settings**.
> 
> **Architected for Supabase**:
> The data layer is decoupled into a dedicated `StorageService` repository pattern (`src/services/storage.ts`). The entity models (`Client`, `Quotation`, `Invoice`, `BusinessProfile`) are strictly typed to mirror relational database schemas, allowing seamless plug-in replacement with a Supabase client (`@supabase/supabase-js`) in the next release.

---

## 🛠️ Project Structure

```
bizora/
├── index.html                   # HTML entry point with Inter font & favicon
├── package.json                 # Project dependencies & scripts
├── tailwind.config.js           # Brand color tokens & subtle SaaS elevation
├── vite.config.ts               # Vite bundler configuration
└── src/
    ├── types/                   # Domain entities (Business, Client, Document, Payment)
    │   └── index.ts
    ├── utils/                   # Calculations, currency & date formatters, ID generators
    │   ├── calculations.ts
    │   ├── formatters.ts
    │   └── idGenerator.ts
    ├── services/                # Repository storage layer & sample seed data
    │   ├── seedData.ts
    │   └── storage.ts
    ├── context/                 # Central React App Context & state management
    │   └── AppContext.tsx
    ├── components/
    │   ├── common/              # Reusable Button, Card, Input, Modal, Badge, Toast, EmptyState
    │   ├── layout/              # Collapsible Sidebar, Responsive TopBar, AppLayout
    │   └── documents/           # PrintableDocument, DocumentPreviewModal, RecordPaymentModal
    ├── pages/                   # Feature views
    │   ├── DashboardPage.tsx
    │   ├── QuotationsPage.tsx
    │   ├── QuotationFormPage.tsx
    │   ├── InvoicesPage.tsx
    │   ├── InvoiceFormPage.tsx
    │   ├── ClientsPage.tsx
    │   ├── ClientDetailPage.tsx
    │   └── SettingsPage.tsx
    ├── App.tsx                  # Root navigation & provider mounting
    └── main.tsx                 # React DOM mount point
```

---

## 💻 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/bizora.git
   cd bizora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

---

## 📋 Technology Stack

- **React 19**
- **TypeScript (strict configuration)**
- **Vite 6**
- **Tailwind CSS v3**
- **Lucide React** (icons)
- **HTML5 Web Storage API** (LocalStorage)

---

## 🗺️ Roadmap to Version 2.0

- [ ] Supabase Auth (Magic link / Email / Google OAuth).
- [ ] Multi-tenant Cloud PostgreSQL Database via Supabase.
- [ ] Automated client email dispatch with PDF attachments via Resend / SendGrid.
- [ ] WhatsApp invoice link and payment reminder dispatch via Twilio / Meta API.
- [ ] Multi-currency live exchange rate lookup (NAD / ZAR / USD / EUR).
- [ ] Payment gateway integration for online card and EFT payments (DPO PayGate / PayToday / Stripe).

---

## 📄 License

MIT License. Designed and built with ❤️ for Namibian and international entrepreneurs.
