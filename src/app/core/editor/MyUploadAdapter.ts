
import { LocalService } from "app/core/user/local.service";
import { environment } from "environments/environment";


export class MyUploadAdapter {
  public loader: any;
  public url: string;
  public xhr: XMLHttpRequest;
  public token: string;

  constructor(loader, protected session: LocalService) {
    this.loader = loader;

    // change "environment.BASE_URL" key and API path
    this.url = `${environment.apiUrl}/files/uploadFile/ckeditor`;

    // change "token" value with your token
    this.token = this.session.token;
  }

  upload() {
    return new Promise(async (resolve, reject) => {
      this.loader.file.then((file) => {
        this._initRequest();
        this._initListeners(resolve, reject, file);
        this._sendRequest(file);
      });
    });
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());
    xhr.open('POST', this.url, true);

    // change "Authorization" header with your header
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);

    // xhr.responseType = "json";
  }

  _initListeners(resolve, reject, file: File) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = 'Couldn\'t upload file:' + ` ${file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());

    xhr.addEventListener('load', () => {
      const response = xhr.response;

      if (!response || response.error) {
        return reject(
          response && response.error ? response.error.message : genericErrorText
        );
      }

      // change "response.data.fullPaths[0]" with image URL
      resolve({
        default: `${environment.url}/ckeditor/${file.name}`,
      });
    });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  _sendRequest(file: File) {
    const data = new FormData();

    data.append('file', file, file.name);

    this.xhr.send(data);
  }
}
