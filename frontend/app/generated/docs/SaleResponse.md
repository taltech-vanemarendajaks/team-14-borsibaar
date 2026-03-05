
# SaleResponse


## Properties

Name | Type
------------ | -------------
`saleId` | string
`items` | [Array&lt;SaleItemResponse&gt;](SaleItemResponse.md)
`totalAmount` | number
`notes` | string
`timestamp` | Date

## Example

```typescript
import type { SaleResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "saleId": null,
  "items": null,
  "totalAmount": null,
  "notes": null,
  "timestamp": null,
} satisfies SaleResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SaleResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


