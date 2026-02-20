
# SaleRequest


## Properties

Name | Type
------------ | -------------
`items` | [Array&lt;SaleItemRequest&gt;](SaleItemRequest.md)
`notes` | string
`barStationId` | number

## Example

```typescript
import type { SaleRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "items": null,
  "notes": null,
  "barStationId": null,
} satisfies SaleRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SaleRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


