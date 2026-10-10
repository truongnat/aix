# XLSX golden-output and coverage evidence

| Area | Expected evidence |
|---|---|
| Coverage | `coverage.json` exists and `coverage_ratio == 1.0` before publish |
| Structure | Sheet names/order, hidden state, dimensions, merged cells and freeze panes match fixture |
| Values/formulas | Formula text, cached values policy, number formats and error cells are checked |
| Styling | Representative headers, widths, conditional formatting and print settings are preserved |
| Data integrity | Dates, currencies, blanks, Unicode and large numbers round-trip without silent coercion |
| Unsupported content | Macros, OLE, signatures and unsupported OOXML parts are inventoried and block publish |
| Reopen | Output reopens with the supported reader and a second inspection produces the same manifest |

Record fixture version, operation, supported/unsupported items, transformed items and skipped checks. Do not call a recalculation skip a pass.
