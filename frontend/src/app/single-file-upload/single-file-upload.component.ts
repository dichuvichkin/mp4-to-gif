import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../services/upload.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-single-file-upload',
  templateUrl: './single-file-upload.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class SingleFileUploadComponent {
  selectedFile: File | null = null;
  uploadStatus: string = 'waiting';
  pollingSubscription: Subscription | null = null;
  finalGifUrl: string | null = null;

  constructor(private uploadService: UploadService) {}

  get gifName() {
    return this.selectedFile?.name.replace('.mp4', '.gif');
  }

  handleFileSelection(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('Selected video:', this.selectedFile);
  }

  uploadFile() {
    if (this.selectedFile) {
      this.uploadStatus = 'loading';

      this.uploadService.uploadFile(this.selectedFile).subscribe({
        next: (data) => {
          this.uploadStatus = 'converting';
          this.startPolling(data.jobId)
        },
        error: () => {
          this.uploadStatus = 'error';
        }
      });
    } else {
      alert("Please select a file before uploading.");
    }
  }

  startPolling(jobId: string) {
    this.pollingSubscription = interval(2000).subscribe(() => {
      this.uploadService.getGif(jobId).subscribe({
        next: (blob) => {
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            this.finalGifUrl = objectUrl;
            this.uploadStatus = 'completed';
            this.stopPolling();
          }
        },
        error: () => {
          console.log('Polling error, retrying...');
        }
      });
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }
}

