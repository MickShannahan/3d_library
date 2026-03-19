import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob'

class AzureBlobService {
  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
    this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY

    if (!this.connectionString && (!this.accountName || !this.accountKey)) {
      throw new Error('Azure Storage credentials not configured in environment variables')
    }

    if (this.connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString)
      // Extract account name from connection string
      const match = this.connectionString.match(/AccountName=([^;]+)/)
      if (match) {
        this.accountName = match[1]
      }
    } else {
      this.blobServiceClient = new BlobServiceClient(
        `https://${this.accountName}.blob.core.windows.net`
      )
    }
  }

  /**
   * Generate a SAS token for uploading a file to Azure Blob Storage
   * @param {string} containerName - Name of the container
   * @param {number} expiryMinutes - Token expiry time in minutes (default 30)
   * @returns {Promise<string>} SAS token URL
   */
  async generateSasToken(containerName, expiryMinutes = 30) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName)

      // Ensure container exists
      try {
        await containerClient.create({ access: 'container' })
      } catch (error) {
        if (error.code !== 'ContainerAlreadyExists') {
          throw error
        }
      }

      const expiryDate = new Date()
      expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes)

      // Generate SAS query parameters
      const sasQueryParameters = generateBlobSASQueryParameters(
        {
          containerName,
          permissions: BlobSASPermissions.parse('racwd'),
          expiresOn: expiryDate,
          protocol: 'https'
        },
        this.accountKey,
        this.accountName
      )

      // Construct the full SAS URL
      const baseUrl = `https://${this.accountName}.blob.core.windows.net/${containerName}`
      const sasUrl = `${baseUrl}?${sasQueryParameters.toString()}`

      return sasUrl
    } catch (error) {
      console.error('Error generating SAS token:', error)
      throw error
    }
  }

  /**
   * Delete a blob from Azure Blob Storage
   * @param {string} containerName - Name of the container
   * @param {string} blobName - Name of the blob to delete
   */
  async deleteBlob(containerName, blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName)
      const blockBlobClient = containerClient.getBlockBlobClient(blobName)
      await blockBlobClient.delete()
    } catch (error) {
      console.error('Error deleting blob:', error)
      throw error
    }
  }

  /**
   * Get a blob client for direct upload/download operations
   * @param {string} containerName - Name of the container
   * @param {string} blobName - Name of the blob
   */
  getBlockBlobClient(containerName, blobName) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName)
    return containerClient.getBlockBlobClient(blobName)
  }

  /**
   * Get container client
   * @param {string} containerName - Name of the container
   */
  getContainerClient(containerName) {
    return this.blobServiceClient.getContainerClient(containerName)
  }
}

export const azureBlobService = new AzureBlobService()
