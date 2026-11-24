# folderCreated



Receive folders as they are created in the workspace.


```graphql
folderCreated(
  parentId: ID
): Folder!
```


### Arguments

#### `folderCreated.parentId` · [`ID`](./scalars-id.md) **scalar** 
Limit events to folders created under this parent.




### Type

#### [`Folder`](./objects-folder.md) **object** 
A virtual folder used to organize workspace resources.




### Example Response

```graphql
{
  "data": {
    "folderCreated": {
      "id": "folder_05",
      "name": "Q4 Planning",
      "parent": "folder_root",
      "createdAt": "2026-09-05T13:20:00Z"
    }
  }
}
```



### Example Variables

```json
{
  "parentId": "folder_root"
}
```



### Example


```graphql
subscription WatchFolders($parentId: ID) {
  folderCreated(parentId: $parentId) {
    id
    name
    parent
    createdAt
  }
}
```