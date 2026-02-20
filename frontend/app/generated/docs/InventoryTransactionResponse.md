
# InventoryTransactionResponse


## Properties

Name | Type
------------ | -------------
`id` | number
`inventoryId` | number
`transactionType` | string
`quantityChange` | number
`quantityBefore` | number
`quantityAfter` | number
`priceBefore` | number
`priceAfter` | number
`referenceId` | string
`notes` | string
`createdBy` | string
`createdByName` | string
`createdByEmail` | string
`createdAt` | Date

## Example

```typescript
import type { InventoryTransactionResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "inventoryId": null,
  "transactionType": null,
  "quantityChange": null,
  "quantityBefore": null,
  "quantityAfter": null,
  "priceBefore": null,
  "priceAfter": null,
  "referenceId": null,
  "notes": null,
  "createdBy": null,
  "createdByName": null,
  "createdByEmail": null,
  "createdAt": null,
} satisfies InventoryTransactionResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InventoryTransactionResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


