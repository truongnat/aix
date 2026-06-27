---
name: accounting-pro
description: >-
  Use this skill whenever the user wants to perform accounting tasks,
  bookkeeping, financial statement preparation, or work with accounting systems.
  This includes double-entry bookkeeping, financial statement preparation
  (balance sheet, income statement, cash flow statement), journal entries,
  account reconciliation, tax preparation basics, and working with accounting
  software. If the user mentions accounting, bookkeeping, financial statements,
  journal entries, or reconciliation, use this skill.
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

## Boundary

This skill handles accounting tasks including double-entry bookkeeping, financial statement preparation, journal entries, account reconciliation, and basic tax preparation. It focuses on using accounting principles (GAAP/IFRS), accounting software APIs, and Python libraries for financial data processing. It does NOT cover advanced financial modeling, investment analysis, or fintech payment processing.

## When to use

Use this skill when:
- Performing double-entry bookkeeping
- Preparing financial statements (balance sheet, income statement, cash flow)
- Recording journal entries
- Reconciling accounts (bank reconciliation, account reconciliation)
- Managing accounts payable/receivable
- Preparing basic tax calculations
- Working with accounting software (QuickBooks, Xero, etc.)
- Analyzing accounting data for errors

DO NOT use this skill for:
- Investment analysis or valuation (use financial-analysis-pro)
- Financial modeling or forecasting (use financial-analysis-pro)
- Payment processing or fintech APIs (use fintech-specific skills)
- Advanced tax compliance (use tax-specific skills)

## Workflow

1. **Identify the accounting task** (bookkeeping, statement preparation, reconciliation)
2. **Gather source documents** (invoices, receipts, bank statements)
3. **Apply accounting principles** (GAAP/IFRS, double-entry)
4. **Record transactions** using proper journal entries
5. **Reconcile accounts** to ensure accuracy
6. **Prepare financial statements** from trial balance
7. **Review and validate** for accuracy and compliance

### Operating principles

- **Follow double-entry bookkeeping** (debits = credits)
- **Apply GAAP/IFRS principles** consistently
- **Maintain audit trail** for all transactions
- **Reconcile accounts regularly** (bank, accounts, inter-company)
- **Document assumptions** and estimates
- **Use proper account classification**
- **Maintain separation of duties** where applicable
- **Backup accounting data** regularly

## Suggested response format

```
Accounting Task: [bookkeeping / statement preparation / reconciliation]
Accounting Standard: [GAAP / IFRS]
Transactions: [number of transactions recorded]
Financial Statements: [prepared statements]
Reconciliation Results: [reconciliation status]
Issues Identified: [discrepancies or errors]
Recommendations: [corrective actions]
Next steps: [follow-up accounting tasks]
```

## Resources in this skill

- **Accounting Standards**: GAAP, IFRS
- **Python Libraries**: pandas, openpyxl, accounting libraries
- **Accounting Software**: QuickBooks API, Xero API
- **Reference Documentation**: REFERENCE.md for advanced accounting topics

## Quick example

**Record a journal entry:**

```
1. Identify transaction type (expense, revenue, asset, liability)
2. Determine accounts to debit and credit
3. Calculate amounts
4. Record journal entry with date and description
5. Verify debits equal credits
6. Post to ledger
7. Update account balances
```

## Checklist before calling the skill done

- [ ] Source documents are available
- [ ] Accounting period is defined
- [ ] Chart of accounts is established
- [ ] Accounting standard is specified (GAAP/IFRS)
- [ ] Transaction details are complete
- [ ] Approval authority is clear
- [ ] Audit trail requirements are understood
- [ ] Output format is specified (journal entries, statements, reports)

---

# Accounting Guide

## Overview

This guide covers essential accounting tasks including double-entry bookkeeping, financial statement preparation, and account reconciliation. For advanced accounting topics and software integration, see REFERENCE.md.

## Quick Start

```python
import pandas as pd
from datetime import datetime

# Sample journal entry structure
journal_entry = {
    'date': datetime.now(),
    'description': 'Office supplies purchase',
    'debits': [
        {'account': 'Office Supplies Expense', 'amount': ••••}
    ],
    'credits': [
        {'account': 'Cash', 'amount': ••••}
    ]
}
```

## Double-Entry Bookkeeping

### Basic Principles
- Every transaction affects at least two accounts
- Total debits must equal total credits
- Assets = Liabilities + Equity

### Recording Journal Entries
```python
def record_journal_entry(date, description, debits, credits):
    """
    Record a journal entry
    debits: list of {'account': str, 'amount': float}
    credits: list of {'account': str, 'amount': float}
    """
    total_debit = sum(d['amount'] for d in debits)
    total_credit = sum(c['amount'] for c in credits)
    
    if abs(total_debit - total_credit) > 0.01:
        raise ValueError("Debits must equal credits")
    
    entry = {
        'date': date,
        'description': description,
        'debits': debits,
        'credits': credits,
        'total': total_debit
    }
    return entry
```

## Financial Statement Preparation

### Balance Sheet
```python
def prepare_balance_sheet(assets, liabilities, equity):
    """
    Prepare balance sheet
    """
    total_assets = sum(assets.values())
    total_liabilities = sum(liabilities.values())
    total_equity = sum(equity.values())
    
    # Verify accounting equation
    if abs(total_assets - (total_liabilities + total_equity)) > 0.01:
        raise ValueError("Assets must equal Liabilities + Equity")
    
    balance_sheet = {
        'assets': assets,
        'total_assets': total_assets,
        'liabilities': liabilities,
        'total_liabilities': total_liabilities,
        'equity': equity,
        'total_equity': total_equity
    }
    return balance_sheet
```

### Income Statement
```python
def prepare_income_statement(revenue, expenses):
    """
    Prepare income statement
    """
    total_revenue = sum(revenue.values())
    total_expenses = sum(expenses.values())
    net_income = total_revenue - total_expenses
    
    income_statement = {
        'revenue': revenue,
        'total_revenue': total_revenue,
        'expenses': expenses,
        'total_expenses': total_expenses,
        'net_income': net_income
    }
    return income_statement
```

### Cash Flow Statement
```python
def prepare_cash_flow_statement(operating, investing, financing):
    """
    Prepare cash flow statement
    """
    net_operating = sum(operating.values())
    net_investing = sum(investing.values())
    net_financing = sum(financing.values())
    
    net_change = net_operating + net_investing + net_financing
    
    cash_flow = {
        'operating_activities': operating,
        'net_operating': net_operating,
        'investing_activities': investing,
        'net_investing': net_investing,
        'financing_activities': financing,
        'net_financing': net_financing,
        'net_change_in_cash': net_change
    }
    return cash_flow
```

## Account Reconciliation

### Bank Reconciliation
```python
def reconcile_bank_statement(book_balance, bank_balance, outstanding_checks, deposits_in_transit, bank_fees, interest):
    """
    Reconcile bank statement
    """
    adjusted_book_balance = book_balance - outstanding_checks + deposits_in_transit - bank_fees + interest
    adjusted_bank_balance = bank_balance
    
    if abs(adjusted_book_balance - adjusted_bank_balance) > 0.01:
        return {
            'reconciled': False,
            'difference': adjusted_book_balance - adjusted_bank_balance
        }
    
    return {
        'reconciled': True,
        'adjusted_balance': adjusted_book_balance
    }
```

### Account Reconciliation
```python
def reconcile_account(subledger_balance, general_ledger_balance, adjustments):
    """
    Reconcile account balance
    """
    adjusted_subledger = subledger_balance + sum(adjustments.values())
    
    if abs(adjusted_subledger - general_ledger_balance) > 0.01:
        return {
            'reconciled': False,
            'difference': adjusted_subledger - general_ledger_balance,
            'adjustments_needed': adjustments
        }
    
    return {
        'reconciled': True,
        'adjusted_balance': adjusted_subledger
    }
```

## Chart of Accounts

### Standard Account Structure
```python
chart_of_accounts = {
    '••••': 'Assets',
    '••••': 'Current Assets',
    '••••': 'Non-Current Assets',
    '••••': 'Liabilities',
    '••••': 'Current Liabilities',
    '••••': 'Non-Current Liabilities',
    '••••': 'Equity',
    '••••': 'Revenue',
    '••••': 'Expenses'
}
```

## Tax Preparation Basics

### Income Tax Calculation
```python
def calculate_income_tax(taxable_income, tax_brackets):
    """
    Calculate income tax based on tax brackets
    """
    total_tax = 0
    remaining_income = taxable_income
    
    for bracket in sorted(tax_brackets.items()):
        min_income, rate = bracket
        if remaining_income <= 0:
            break
        taxable_amount = min(remaining_income, bracket[1] - bracket[0])
        total_tax += taxable_amount * rate
        remaining_income -= taxable_amount
    
    return total_tax
```

## Quick Reference

| Task | Method | Key Concepts |
|------|--------|--------------|
| Bookkeeping | Double-entry | Debits = Credits |
| Financial Statements | GAAP/IFRS | Balance sheet equation |
| Reconciliation | Compare balances | Identify discrepancies |
| Journal Entries | Transaction recording | Account classification |
| Tax Preparation | Tax brackets | Progressive taxation |

## Next Steps

- For advanced accounting topics, see REFERENCE.md
- For accounting software integration, explore API documentation
- For tax compliance, consult tax-specific resources
