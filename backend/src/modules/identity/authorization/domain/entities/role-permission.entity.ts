export class RolePermission {
    private constructor(
        private readonly roleId: string,
        private readonly permissionId: string,
    ) {}

    static create(roleId: string, permissionId: string): RolePermission {
        return new RolePermission(roleId, permissionId);
    }

    static restore(roleId: string, permissionId: string): RolePermission {
        return new RolePermission(roleId, permissionId);
    }

    getRoleId(): string {
        return this.roleId;
    }

    getPermissionId(): string {
        return this.permissionId;
    }
}
