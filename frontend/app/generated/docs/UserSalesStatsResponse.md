
# UserSalesStatsResponse


## Properties

Name | Type
------------ | -------------
`userId` | string
`userName` | string
`userEmail` | string
`salesCount` | number
`totalRevenue` | number
`barStationId` | number
`barStationName` | string

## Example

```typescript
import type { UserSalesStatsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "userId": null,
  "userName": null,
  "userEmail": null,
  "salesCount": null,
  "totalRevenue": null,
  "barStationId": null,
  "barStationName": null,
} satisfies UserSalesStatsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserSalesStatsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


