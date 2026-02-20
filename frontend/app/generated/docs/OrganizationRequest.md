
# OrganizationRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`priceIncreaseStep` | number
`priceDecreaseStep` | number

## Example

```typescript
import type { OrganizationRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "priceIncreaseStep": null,
  "priceDecreaseStep": null,
} satisfies OrganizationRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OrganizationRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


