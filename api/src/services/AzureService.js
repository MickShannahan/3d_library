import { BlobServiceClient } from "@azure/storage-blob"


const azureClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION)

const config = {
  blobHTTPHeaders: {
    blobCacheControl: 'max-age=36000'
  }
}

class AzureService {

  async uploadFile(file, folder = '', containerName = '3dmodels') {
    const blobName = `${folder ? folder + '/' : ''}${file.name}${file.extension}`
    console.log('upload', blobName, folder, containerName, file)
    const container = azureClient.getContainerClient(containerName)
    const blockBlob = container.getBlockBlobClient(blobName)
    const blobOptions = {
      blobHTTPHeaders: {
        ...config.blobHTTPHeaders,
        blobContentType: file.mimetype
      }
    }
    const response = await blockBlob.upload(file.data, file.size, blobOptions)
    if (response.errorCode) throw new Error(response.errorCode)
    return blockBlob.url
  }

  async uploadBulkFiles(files, folder = '', containerName = '3dmodels') {
    const urls = []
    for (const file of files) {
      const url = await this.uploadFile(file, folder, containerName)
      urls.push(url)
    }
    return urls
  }

}

export const azureService = new AzureService()