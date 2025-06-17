export type InstallationDto = {
    id: string
    htmlUrl: string
    targetId: number
    targetType: string
    account: InstallationAccount
    walletAddress: string
    subscriptionPackageId: string | null
    createdAt: string
    updatedAt: string
}

export type InstallationAccount = {
    login: string 
    nodeId: string 
    avatarUrl: string 
    htmlUrl: string
}

export type QueryInstallationDto = {
    page?: string
    limit?: string
}