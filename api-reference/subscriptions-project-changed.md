# projectChanged



Receive an event whenever a project changes in the workspace.


```graphql
projectChanged(
  projectId: ID
  types: [ProjectEventType!]
): ProjectEvent!
```


### Arguments

#### `projectChanged.projectId` · [`ID`](./scalars-id.md) **scalar** 
Limit events to a single project.


#### `projectChanged.types` · [`[ProjectEventType!]`](./enums-project-event-type.md) **list** **enum** 
Limit events to these change kinds.




### Type

#### [`ProjectEvent`](./objects-project-event.md) **object** 
A change delivered to subscribers watching a project.




### Example Response

```graphql
{
  "data": {
    "projectChanged": {
      "type": "UPDATED",
      "occurredAt": "2026-09-05T10:15:00Z",
      "project": {
        "id": "project_01",
        "name": "Mobile Refresh",
        "status": "ACTIVE"
      },
      "actor": {
        "name": "Avery Chen"
      }
    }
  }
}
```



### Example Variables

```json
{
  "projectId": "project_01",
  "types": ["UPDATED", "ARCHIVED"]
}
```



### Example


```graphql
subscription WatchProject($projectId: ID, $types: [ProjectEventType!]) {
  projectChanged(projectId: $projectId, types: $types) {
    type
    occurredAt
    project {
      id
      name
      status
    }
    actor {
      name
    }
  }
}
```