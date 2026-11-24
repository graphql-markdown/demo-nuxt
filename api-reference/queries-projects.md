# projects



List projects, optionally filtered by lifecycle status.


```graphql
projects(
  status: ProjectStatus
  limit: Int
): ProjectConnection!
```


### Arguments

#### `projects.status` · [`ProjectStatus`](./enums-project-status.md) **enum** 
Limit results to projects in this lifecycle stage.


#### `projects.limit` · [`Int`](./scalars-int.md) **scalar** 
Maximum number of projects to return. Defaults to 20.




### Type

#### [`ProjectConnection`](./objects-project-connection.md) **object** 
A paginated project result set.




### Example Response

```graphql
{
  "data": {
    "projects": {
      "totalCount": 2,
      "nodes": [
        {
          "id": "project_01",
          "name": "Mobile Refresh",
          "status": "ACTIVE",
          "owner": { "name": "Avery Chen" }
        },
        {
          "id": "project_02",
          "name": "Billing Migration",
          "status": "ACTIVE",
          "owner": { "name": "Sam Okafor" }
        }
      ]
    }
  }
}
```



### Example Variables

```json
{
  "status": "ACTIVE"
}
```



### Example


```graphql
query ListActiveProjects($status: ProjectStatus) {
  projects(status: $status) {
    totalCount
    nodes {
      id
      name
      status
      owner {
        name
      }
    }
  }
}
```