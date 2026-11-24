# archiveProject



Archive a project that is no longer active.


```graphql
archiveProject(
  id: ID!
): Project!
```


### Arguments

#### `archiveProject.id` · [`ID!`](./scalars-id.md) **non-null** **scalar** 
The unique identifier of the project to archive.




### Type

#### [`Project`](./objects-project.md) **object** 
A unit of work tracked in the workspace.




### Example Response

```graphql
{
  "data": {
    "archiveProject": {
      "id": "project_01",
      "name": "Mobile Refresh",
      "status": "ARCHIVED",
      "updatedAt": "2026-09-05T12:00:00Z"
    }
  }
}
```



### Example Variables

```json
{
  "id": "project_01"
}
```



### Example


```graphql
mutation ArchiveProject($id: ID!) {
  archiveProject(id: $id) {
    id
    name
    status
    updatedAt
  }
}
```