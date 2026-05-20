# 決済API 500 bug

## Ticket

本番環境でカード決済を実行すると 500 エラーが発生します。
ユーザーからは「支払いボタンを押すと失敗する」と報告されています。

## Vietnamese notes

- Current: checkout submit xong thì API trả `500 Internal Server Error`
- Expected: thanh toán thành công và order được tạo
- Impact: user không thể hoàn tất payment flow

## Reproduction

1. Open checkout page
2. Add a valid card
3. Submit payment
4. Observe 500 response from `POST /api/payments`

## Logs

```text
[error] POST /api/payments 500 Internal Server Error
NullPointerException at src/payment/service.rs:42
request_id=pay_12345 user_id=usr_001
```

## Suspected references

- `src/payment/service.rs`
- `src/payment/controller.rs`
- DB table: `payments`
