
# BarStationResponse


## Properties

Name | Type
------------ | -------------
`id` | number
`organizationId` | number
`name` | string
`description` | string
`isActive` | boolean
`assignedUsers` | [Array&lt;UserSummaryResponse&gt;](UserSummaryResponse.md)
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { BarStationResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "organizationId": null,
  "name": null,
  "description": null,
  "isActive": null,
  "assignedUsers": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies BarStationResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BarStationResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


