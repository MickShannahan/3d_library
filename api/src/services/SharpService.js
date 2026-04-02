import sharp from "sharp"



class SharpService {

  async processImageToWebP(imageData) {
    const sharpImage = sharp(imageData.data)
    const webpBuff = await sharpImage.png({ colors: 64, dither: 1 }).webp({ quality: 80 }).toBuffer()
    return {
      name: imageData.name,
      data: webpBuff,
      mimetype: 'image/webp',
      extension: '.webp',
      size: webpBuff.length
    }
  }

  async processImageSequenceToGif(images, imageName) {
    const gif = await sharp(images.map(image => image.data), { join: { animated: true } })
      .gif({ delay: 100, loop: 0, colors: 48, dither: 1 })
      .toBuffer()

    return {
      name: imageName,
      data: gif,
      mimetype: 'image/gif',
      extension: '.gif',
      size: gif.length
    }
  }

}

export const sharpService = new SharpService()