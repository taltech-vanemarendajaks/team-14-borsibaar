
# CreateOrderRequest


## Properties

Name | Type
------------ | -------------
`desk` | string
`clientName` | string
`products` | [Array&lt;OrderProductRequest&gt;](OrderProductRequest.md)
`userId` | string
`state` | [OrderState](OrderState.md)
`total` | number

## Example

```typescript
import type { CreateOrderRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "desk": null,
  "clientName": null,
  "products": null,
  "userId": null,
  "state": null,
  "total": null,
} satisfies CreateOrderRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateOrderRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


