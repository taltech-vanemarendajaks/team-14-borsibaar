
# InventoryResponse


## Properties

Name | Type
------------ | -------------
`id` | number
`organizationId` | number
`productId` | number
`productName` | string
`quantity` | number
`unitPrice` | number
`description` | string
`basePrice` | number
`minPrice` | number
`maxPrice` | number
`updatedAt` | Date

## Example

```typescript
import type { InventoryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "organizationId": null,
  "productId": null,
  "productName": null,
  "quantity": null,
  "unitPrice": null,
  "description": null,
  "basePrice": null,
  "minPrice": null,
  "maxPrice": null,
  "updatedAt": null,
} satisfies InventoryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InventoryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


