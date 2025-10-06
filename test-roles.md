# Role Management Testing Guide

## Test Cases for Role Management System

### 1. Create Custom Role
- Navigate to `/team/roles`
- Click "Create Role" button
- Fill in role name and description
- Select permissions from different categories
- Submit the form
- Verify role appears in the roles list

### 2. Edit Custom Role
- From the roles list, click the edit button on a custom role
- Modify the role name, description, or permissions
- Save changes
- Verify changes are reflected in the roles list

### 3. Delete Custom Role
- From the roles list, click the delete button on a custom role
- Confirm deletion
- Verify role is removed from the list
- Test that roles assigned to users cannot be deleted

### 4. Assign Custom Role to User
- Navigate to `/team/members`
- Click edit on a team member
- Select a custom role from the dropdown
- Save changes
- Verify the user now has the custom role assigned

### 5. Permission Integration
- Create a custom role with specific permissions
- Assign it to a user
- Verify the user has the combined permissions from their system role and custom role
- Test that permissions are properly enforced in the application

### 6. API Endpoints Testing

#### GET /api/roles
- Should return both system and custom roles
- Should include user counts for each role

#### POST /api/roles
- Should create a new custom role
- Should validate permissions
- Should prevent duplicate role names

#### PUT /api/roles/[id]
- Should update an existing custom role
- Should validate permissions
- Should prevent duplicate role names

#### DELETE /api/roles/[id]
- Should soft delete a custom role
- Should prevent deletion of roles assigned to users

#### PUT /api/users/[id]/role
- Should assign/remove custom roles from users
- Should validate that the custom role exists

## Expected Behavior

1. **Role Creation**: Users with appropriate permissions can create custom roles with specific permission sets
2. **Role Management**: Custom roles can be edited and deleted (if not in use)
3. **User Assignment**: Users can be assigned custom roles in addition to their system roles
4. **Permission Integration**: Custom role permissions are merged with system role permissions
5. **Data Integrity**: System roles cannot be modified, roles in use cannot be deleted
6. **UI/UX**: Intuitive interface for managing roles and permissions

## Notes

- System roles (admin, project_manager, etc.) cannot be edited or deleted
- Custom roles can only be deleted if no users are assigned to them
- Permission system properly integrates custom roles with existing permission checks
- All API endpoints include proper authentication and authorization
