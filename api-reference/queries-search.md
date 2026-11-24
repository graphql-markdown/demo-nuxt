# search



Search folders, projects, and users from a single endpoint.


```graphql
search(
  query: String!
): [SearchResult!]!
```


### Arguments

#### `search.query` · [`String!`](./scalars-string.md) **non-null** **scalar** 
Text matched against folder, project, and user names.




### Type

#### [`SearchResult`](./unions-search-result.md) **union** 
A result returned from global workspace search.




### Example Response

```graphql
{
  "data": {
    "search": [
      {
        "__typename": "Project",
        "id": "project_01",
        "name": "Mobile Refresh",
        "status": "ACTIVE"
      },
      {
        "__typename": "Folder",
        "id": "folder_03",
        "name": "Mobile Assets"
      }
    ]
  }
}
```



### Example Variables

```json
{
  "query": "mobile"
}
```



### Example


```graphql
query SearchWorkspace($query: String!) {
  search(query: $query) {
    __typename
    ... on Folder {
      id
      name
    }
    ... on Project {
      id
      name
      status
    }
    ... on User {
      id
      name
      email
    }
  }
}
```