export class RenderedPreview {
  url: string
  title: string
  _file?: File

  constructor(data: any = {}) {
    this.url = data.url ?? ''
    this.title = data.title ?? ''
  }
}
