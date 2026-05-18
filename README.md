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
```
---

### NAV

```Excel Formula

=SGX_NAV("SGX:A7RU", $E$1)
```
---

### P/E Ratio

```Excel Formula
=SGX_PE("SGX:CLR", $E$1)
```
---

### Notes
Yahoo Finance APIs are unofficial and may change.
Refresh checkbox can force recalculation.
Intended for educational/personal dashboard use.
