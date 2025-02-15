import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private uploadUrl = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', file);
    return this.httpClient.post(`${this.uploadUrl}/upload`, formData);
  }

  getGif(jobId: string): Observable<any> {
    return this.httpClient.get(`${this.uploadUrl}/gif/${jobId}`, { responseType: 'blob' });
  }
}
