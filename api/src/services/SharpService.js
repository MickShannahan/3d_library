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

  async processImageSequenceToGif(images, imageName = 'sequence') {
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

  async applyTransparent(sharpImage, red = 0, green = 0, blue = 0) {
    const { data, info } = await sharpImage.raw().toBuffer({ resolveWithObject: true })
    const rgbaData = Buffer.alloc(info.width * info.height * 4)
    for (let i = 0; i < data.length; i += 3) {
      const outIdx = data[i]
      rgbaData[outIdx] = data[i]
      rgbaData[outIdx + 1] = data[i + 1]
      rgbaData[outIdx + 2] = data[i + 2]
      rgbaData[outIdx + 3] = (data[i] == red && data[i + 1] == green && data[i + 2] == blue) ? 0 : 255
    }
    return sharp(rgbaData, {
      raw: { width: info.width, height: info.height, channels: 4 }
    })
  }

}

export const sharpService = new SharpService()