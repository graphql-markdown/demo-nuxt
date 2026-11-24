# folder



Fetch a single folder by its unique identifier.


```graphql
folder(
  id: ID!
): Folder
```


### Arguments

#### `folder.id` · [`ID!`](./scalars-id.md) **non-null** **scalar** 
The unique identifier of the folder to retrieve.




### Type

#### [`Folder`](./objects-folder.md) **object** 
A virtual folder used to organize workspace resources.




### Example Response

```graphql
{
  "data": {
    "folder": {
      "id": "folder_01",
      "name": "Product Planning",
      "parent": "folder_root",
      "createdAt": "2026-09-05T09:30:00Z"
    }
  }
}
```



### Example Variables

```json
{
  "id": "folder_01"
}
```



### Example


```graphql
query GetFolder($id: ID!) {
  folder(id: $id) {
    id
    name
    parent
    createdAt
  }
}
```