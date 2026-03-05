
# OrganizationResponse


## Properties

Name | Type
------------ | -------------
`id` | number
`name` | string
`createdAt` | Date
`updatedAt` | Date
`priceIncreaseStep` | number
`priceDecreaseStep` | number

## Example

```typescript
import type { OrganizationResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "createdAt": null,
  "updatedAt": null,
  "priceIncreaseStep": null,
  "priceDecreaseStep": null,
} satisfies OrganizationResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OrganizationResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


