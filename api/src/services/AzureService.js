import { BlobServiceClient } from "@azure/storage-blob"


const clients = {
  '3dmodels': BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION),
  images: BlobServiceClient.fromConnectionString(process.env.AZURE_IMAGE_CONNECTION)
}

const config = {
  blobHTTPHeaders: {
    blobCacheControl: 'max-age=36000'
  }
}

class AzureService {

  async uploadFile(file, folder = '', client = 'images') {
    const blobName = `${folder ? folder + '/' : ''}${file.name}${file.extension ? file.extension : ''}`
    console.log('upload', blobName, folder, client, file)
    const container = clients[client].getContainerClient(client)
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

  async uploadBulkFiles(files, folder = '', client = 'images') {
    const urls = []
    for (const file of files) {
      const url = await this.uploadFile(file, folder, client)
      urls.push(url)
    }
    return urls
  }

  async deleteFile(url = '') {
    const { hostname, pathname } = new URL(url)
    const [, containerName, ...blobParts] = pathname.split('/')
    const blobName = blobParts.join('/')
    const client = Object.values(clients).find(c => c.url.includes(hostname))
    if (!client) throw new Error(`No Azure client found for host: ${hostname}`)
    const container = client.getContainerClient(containerName)
    await container.deleteBlob(blobName)
  }

  async deleteBulkFiles(urls = []) {
    await Promise.all(urls.map(url => this.deleteFile(url)))
  }

}

export const azureService = new AzureService()