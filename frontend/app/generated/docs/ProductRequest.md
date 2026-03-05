
# ProductRequest


## Properties

Name | Type
------------ | -------------
`id` | number
`name` | string
`description` | string
`currentPrice` | number
`minPrice` | number
`maxPrice` | number
`categoryId` | number
`categoryName` | string

## Example

```typescript
import type { ProductRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "description": null,
  "currentPrice": null,
  "minPrice": null,
  "maxPrice": null,
  "categoryId": null,
  "categoryName": null,
} satisfies ProductRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProductRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


