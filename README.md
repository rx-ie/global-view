# SGX Portfolio Dashboard Utilities

Google Apps Script utilities for retrieving:
- SGX ETF NAV
- SGX Trust Book Value
- SGX P/E Ratios
- Live SGX Prices

Uses Yahoo Finance API endpoints with layered fallback protection.

---

## Features

- SGX_NAV()
- SGX_PE()
- SGX_PRICE()

Supports:
- REITs
- ETFs
- Trusts
- Standard SGX equities

---

## Installation

1. Open Google Sheets
2. Extensions → Apps Script
3. Paste `sgx-dashboard.gs`
4. Save project
5. Reload spreadsheet

---

## Usage

### Live Price

```excel
=SGX_PRICE("SGX:ES3", $E$1)
