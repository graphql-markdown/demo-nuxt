# folders



List folders available in the current workspace.


```graphql
folders(
  limit: Int
  offset: Int
): [Folder!]!
```


### Arguments

#### `folders.limit` · [`Int`](./scalars-int.md) **scalar** 
Maximum number of folders to return.


#### `folders.offset` · [`Int`](./scalars-int.md) **scalar** 
Number of folders to skip before returning results.




### Type

#### [`Folder`](./objects-folder.md) **object** 
A virtual folder used to organize workspace resources.




### Example Response

```graphql
{
  "data": {
    "folders": [
      {
        "id": "folder_root",
        "name": "Workspace",
        "parent": null,
        "createdAt": "2026-09-05T08:00:00Z"
      },
      {
        "id": "folder_01",
        "name": "Product Planning",
        "parent": "folder_root",
        "createdAt": "2026-09-05T09:30:00Z"
      },
      {
        "id": "folder_02",
        "name": "Design Reviews",
        "parent": "folder_01",
        "createdAt": "2026-09-05T11:45:00Z"
      },
      {
        "id": "folder_03",
        "name": "Mobile Assets",
        "parent": "folder_root",
        "createdAt": "2026-09-05T12:30:00Z"
      }
    ]
  }
}
```



### Example


```graphql
query ListFolders {
  folders {
    id
    name
    parent
    createdAt
  }
}
```