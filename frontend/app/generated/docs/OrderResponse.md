
# OrderResponse


## Properties

Name | Type
------------ | -------------
`id` | number
`desk` | string
`clientName` | string
`assignedWorkerId` | string
`assignedWorkerName` | string
`products` | [Array&lt;OrderProductResponse&gt;](OrderProductResponse.md)
`userId` | string
`sessionId` | string
`state` | [OrderState](OrderState.md)
`total` | number
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { OrderResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "desk": null,
  "clientName": null,
  "assignedWorkerId": null,
  "assignedWorkerName": null,
  "products": null,
  "userId": null,
  "sessionId": null,
  "state": null,
  "total": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies OrderResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OrderResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


