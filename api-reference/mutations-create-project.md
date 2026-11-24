# createProject



Create a project and assign its initial owner.


```graphql
createProject(
  input: CreateProjectInput!
): Project!
```


### Arguments

#### `createProject.input` · [`CreateProjectInput!`](./inputs-create-project-input.md) **non-null** **input** 
The project attributes to create.




### Type

#### [`Project`](./objects-project.md) **object** 
A unit of work tracked in the workspace.




### Example Response

```graphql
{
  "data": {
    "createProject": {
      "id": "project_03",
      "name": "Design System",
      "status": "DRAFT",
      "folder": {
        "id": "folder_01",
        "name": "Product Planning"
      }
    }
  }
}
```



### Example Variables

```json
{
  "input": {
    "name": "Design System",
    "ownerId": "user_01",
    "folderId": "folder_01"
  }
}
```



### Example


```graphql
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id
    name
    status
    folder {
      id
      name
    }
  }
}
```