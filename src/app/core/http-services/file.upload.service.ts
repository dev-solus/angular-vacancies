import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment.development';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    readonly http = inject(HttpClient);

    uploadFiles2(folder: string, file: File) {
        const formData = new FormData();
        formData.append('file', file, file.name);

        return this.http.post<{code: number, msg: string}>(`${environment.apiUrl}/api/files/uploadFiles/${folder}`, formData);
      }

    uploadFiles(folder: string, file: FormData) {
        return this.http.post<{ code: number, msg: string }>(`${environment.apiUrl}/api/files/uploadFiles/${folder}`, file);
    }

    deleteFile(folder: string, filename: string) {
        if (filename.length === 0) {
            return of(null);
        }
        return this.http.post<{ code: number, msg: string }>(`${environment.apiUrl}/api/files/deleteFile/${folder}/${filename}`, {});
    }

    downloadFile(folder: string, filename: string) {
        return this.http.post(`${environment.apiUrl}/api/files/downloadFile/${folder.replace(/\//g, '_')}/${filename}`, {}, { responseType: 'blob' });
    }

}
